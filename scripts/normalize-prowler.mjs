#!/usr/bin/env node
/**
 * Reduce a Prowler JSON-OCSF report to the shape the security page needs.
 *
 * The raw report is ~116 KB of OCSF for 18 findings, most of it schema
 * envelope. This keeps only what gets rendered and writes it to
 * src/data/scans/<provider>.json, which IS committed: it means the page has
 * real data in local development, and the files double as a versioned record
 * of how the posture changed over time. CI regenerates them from fresh scans.
 *
 * One file per provider rather than one combined file, so each scan can be
 * refreshed and committed on its own without two CI steps racing to write the
 * same path.
 *
 * Usage: node scripts/normalize-prowler.mjs <scan.ocsf.json> [out.json]
 *
 * The output path is derived from the provider in the report unless given.
 *
 * OCSF field mapping (per Prowler's own docs):
 *   metadata.event_code  -> check id
 *   finding_info.title   -> title
 *   status_code          -> PASS | FAIL | MANUAL
 *   status_detail        -> human-readable detail
 *   risk_details         -> why it matters
 *   remediation.desc     -> how to fix
 *   unmapped.categories  -> categories
 *   cloud.provider       -> which provider this report is for
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [, , inPath, outPathArg] = process.argv;

if (!inPath) {
  console.error('usage: normalize-prowler.mjs <scan.ocsf.json> [out.json]');
  process.exit(2);
}

const raw = JSON.parse(readFileSync(resolve(inPath), 'utf8'));
if (!Array.isArray(raw)) {
  console.error('expected a JSON array of OCSF findings');
  process.exit(1);
}
if (raw.length === 0) {
  console.error('the report contains no findings; refusing to write an empty scan');
  process.exit(1);
}

/**
 * Why a failing check is still failing, keyed by provider and then check id.
 *
 * Keeping this in the repo rather than inventing it at render time means every
 * accepted risk is a reviewed commit. A failure with no entry here renders
 * bare, and this script warns about it, so nothing fails silently and
 * unexplained.
 *
 *   blocked  — cannot be fixed on the current plan or setup
 *   accepted — deliberately not doing it, with a stated reason
 *   todo     — should be fixed, not done yet
 */
const DISPOSITION = {
  github: {
    repository_secret_scanning_enabled: {
      state: 'blocked',
      note: 'GitHub only offers secret scanning for public repositories or paid plans. The GitHub API rejects it here with a 422. Gitleaks runs on every pull request instead, which covers the same ground from CI.',
    },
    repository_default_branch_requires_multiple_approvals: {
      state: 'accepted',
      note: 'Requires two approving reviews. This is a one-person repository, so a second approver does not exist. Stated rather than hidden.',
    },
    repository_default_branch_requires_codeowners_review: {
      state: 'accepted',
      note: 'Code owner review means reviewing your own code on a solo repository. CODEOWNERS exists so ownership is explicit, but enforcing self-review would be theatre.',
    },
    repository_default_branch_dismisses_stale_reviews: {
      state: 'accepted',
      note: 'Depends on a pull-request review workflow, which a solo repository does not run.',
    },
    repository_default_branch_requires_conversation_resolution: {
      state: 'accepted',
      note: 'Depends on a pull-request review workflow, which a solo repository does not run.',
    },
    repository_default_branch_status_checks_required: {
      state: 'todo',
      note: 'CI already runs lint, typecheck, build, audit, gitleaks and a SHA-pin check on every push. Making them a merge gate requires moving to a pull-request workflow.',
    },
  },
  cloudflare: {
    dns_record_cname_target_valid: {
      state: 'accepted',
      note: 'A false positive, and acting on it would make things worse. The flagged target is the null MX from RFC 7505: an MX record pointing at "." is the standard way to declare that a domain receives no mail at all. The check reads that "." as a dangling hostname and warns about mail interception, which is precisely what the null MX prevents. Removing the record to turn this green would reopen the risk it is warning about.',
    },
    zone_record_dkim_exists: {
      state: 'accepted',
      note: 'This domain sends no mail, so there is no key to publish. The record is *._domainkey with an empty p=, which RFC 6376 defines as a revoked key, and alongside SPF -all, DMARC p=reject and a null MX it is the recommended way to say "nothing here signs mail". The check looks for a valid public key and finds none, which is correct and also the point.',
    },
    dns_record_no_internal_ip: {
      state: 'accepted',
      note: 'A false positive, and worth stating plainly. The address is 100::, the IPv6 discard prefix from RFC 6666, which is what Cloudflare writes for a record that exists only to be proxied. It is not an internal address and it never leaves the account: externally the zone answers with Cloudflare anycast addresses, and a public AAAA lookup returns 2606:4700 addresses, never this one.',
    },
    zone_bot_fight_mode_enabled: {
      state: 'accepted',
      note: 'Mutually exclusive with the Content-Security-Policy on this site. Bot Fight Mode injects an inline challenge script whose r and t parameters change on every request, so no hash and no nonce can ever match it. Turning it on would mean adding unsafe-inline to script-src. Trading a real CSP for bot noise on a static site with no login and no forms is the wrong way round.',
    },
    zone_waf_enabled: {
      state: 'blocked',
      note: 'The Web Application Firewall is not available on the Cloudflare free plan. Prowler says so itself in the finding. The site is static files with no origin server, no database and no user input, so the attack classes a WAF blocks have nothing here to reach.',
    },
    zone_waf_owasp_ruleset_enabled: {
      state: 'blocked',
      note: 'The OWASP Core Ruleset cannot be deployed on the free plan; only paid plans can. Same reasoning as the WAF check above.',
    },
    zone_rate_limiting_enabled: {
      state: 'accepted',
      note: 'Available on the free plan, which allows one rule, so this is a choice rather than a limit. Rate limiting protects an origin from being overwhelmed, and there is no origin: every response is a static asset served from Cloudflare edge cache on unmetered bandwidth. The only free action is a challenge, which would put an interstitial in front of real readers to defend against nothing.',
    },
    zone_firewall_blocking_rules_configured: {
      state: 'accepted',
      note: 'Custom firewall rules are available on the free plan. Nothing here is worth blocking: the entire site is public static content meant to be read, there is no authenticated surface, and no path that changes state. A blocking rule written only to satisfy a check would be configuration theatre.',
    },
    zone_hotlink_protection_enabled: {
      state: 'accepted',
      note: 'A bandwidth control rather than a security control, and static bandwidth on Workers is unmetered, so it protects nothing here. It also blocks other sites from loading images by referer, which is how link previews on social platforms fetch the portrait. Real cost, no benefit.',
    },
  },
};

const severityRank = { Critical: 0, High: 1, Medium: 2, Low: 3, Informational: 4 };

const first = raw[0] ?? {};
const provider = first?.cloud?.provider ?? 'unknown';
const dispositions = DISPOSITION[provider] ?? {};

const findings = raw
  .map((f) => {
    const id = f?.metadata?.event_code ?? 'unknown';
    const status = f?.status_code ?? 'UNKNOWN';
    const disposition = status === 'FAIL' ? (dispositions[id] ?? null) : null;
    return {
      id,
      title: f?.finding_info?.title ?? id,
      status,
      severity: f?.severity ?? 'Informational',
      detail: f?.status_detail ?? '',
      risk: f?.risk_details ?? '',
      remediation: f?.remediation?.desc ?? '',
      service: f?.resources?.[0]?.group?.name ?? '',
      categories: f?.unmapped?.categories ?? [],
      disposition,
    };
  })
  .sort((a, b) => {
    // Failures first, then by severity, then alphabetically — so the page
    // leads with what matters rather than with whatever Prowler emitted first.
    if (a.status !== b.status) return a.status === 'FAIL' ? -1 : 1;
    const s = (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9);
    return s !== 0 ? s : a.id.localeCompare(b.id);
  });

/**
 * What was scanned, in the terms that provider uses.
 *
 * GitHub reports a repository under resources[].data.metadata.full_name;
 * Cloudflare reports one resource per zone, named plainly. Rather than special
 * casing every provider, collect the distinct resource names and use them when
 * there is a small, nameable set, falling back to the account.
 */
function describeTarget(records) {
  const names = new Set();
  for (const r of records) {
    const res = r?.resources?.[0];
    const name = res?.data?.metadata?.full_name ?? res?.name ?? null;
    if (name) names.add(name);
  }
  if (names.size >= 1 && names.size <= 3) return [...names].sort().join(', ');
  const account = first?.cloud?.account?.name ?? first?.cloud?.account?.uid ?? '';
  return names.size > 3 ? `${account} (${names.size} zones)` : account;
}

const counts = findings.reduce((acc, f) => {
  acc[f.status] = (acc[f.status] ?? 0) + 1;
  return acc;
}, {});
const failBySeverity = findings
  .filter((f) => f.status === 'FAIL')
  .reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] ?? 0) + 1;
    return acc;
  }, {});

const pass = counts.PASS ?? 0;
const fail = counts.FAIL ?? 0;

const out = {
  generatedAt: first?.finding_info?.created_time_dt ?? new Date().toISOString(),
  prowlerVersion: first?.metadata?.product?.version ?? 'unknown',
  provider,
  target: describeTarget(raw),
  total: findings.length,
  pass,
  fail,
  passRate: pass + fail ? Math.round((pass / (pass + fail)) * 100) : 0,
  failBySeverity,
  findings,
};

const outPath = outPathArg ?? `src/data/scans/${provider}.json`;
const dest = resolve(outPath);
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);

console.log(
  `normalized ${findings.length} ${provider} findings (${pass} pass, ${fail} fail, ${out.passRate}%) -> ${outPath}`,
);

// A failure nobody has explained is the one thing this file should not ship
// quietly. Warn rather than exit non-zero: a brand new check appearing
// upstream should not break the scan that discovered it.
const unexplained = findings.filter((f) => f.status === 'FAIL' && !f.disposition);
if (unexplained.length) {
  console.warn(
    `\n::warning::${unexplained.length} failing ${provider} check(s) have no disposition in scripts/normalize-prowler.mjs:`,
  );
  for (const f of unexplained) console.warn(`  ${f.id} [${f.severity}] ${f.title}`);
  console.warn('Add an entry for each, then commit. They render without a reason until you do.');
}
