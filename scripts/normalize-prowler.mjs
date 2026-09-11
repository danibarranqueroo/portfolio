#!/usr/bin/env node
/**
 * Reduce a Prowler JSON-OCSF report to the shape the security page needs.
 *
 * The raw report is ~116 KB of OCSF for 18 findings, most of it schema
 * envelope. This keeps only what gets rendered and writes it to
 * src/data/security-scan.json, which IS committed: it means the page has real
 * data in local development, and the file doubles as a versioned record of how
 * the posture changed over time. CI regenerates it from a fresh scan before
 * every build, so what ships is never stale.
 *
 * Usage: node scripts/normalize-prowler.mjs <scan.ocsf.json> [out.json]
 *
 * OCSF field mapping (per Prowler's own docs):
 *   metadata.event_code  -> check id
 *   finding_info.title   -> title
 *   status_code          -> PASS | FAIL | MANUAL
 *   status_detail        -> human-readable detail
 *   risk_details         -> why it matters
 *   remediation.desc     -> how to fix
 *   unmapped.categories  -> categories
 *   unmapped.compliance  -> framework mappings
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [, , inPath, outPath = 'src/data/security-scan.json'] = process.argv;

if (!inPath) {
  console.error('usage: normalize-prowler.mjs <scan.ocsf.json> [out.json]');
  process.exit(2);
}

const raw = JSON.parse(readFileSync(resolve(inPath), 'utf8'));
if (!Array.isArray(raw)) {
  console.error('expected a JSON array of OCSF findings');
  process.exit(1);
}

/**
 * Why a failing check is still failing. Keeping this in the repo rather than
 * inventing it at render time means every accepted risk is a reviewed commit.
 *
 *   blocked  — cannot be fixed on the current plan or setup
 *   accepted — deliberately not doing it, with a stated reason
 *   todo     — should be fixed, not done yet
 */
const DISPOSITION = {
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
  repository_immutable_releases_enabled: {
    state: 'todo',
    note: 'This repository publishes no releases yet, so there is nothing to make immutable.',
  },
  repository_has_codeowners_file: {
    state: 'todo',
    note: 'A CODEOWNERS file was added; this result predates it or the scan has not rerun.',
  },
};

const severityRank = { Critical: 0, High: 1, Medium: 2, Low: 3, Informational: 4 };

const findings = raw
  .map((f) => {
    const id = f?.metadata?.event_code ?? 'unknown';
    const status = f?.status_code ?? 'UNKNOWN';
    const disposition = status === 'FAIL' ? (DISPOSITION[id] ?? null) : null;
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

const first = raw[0] ?? {};
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
  provider: first?.cloud?.provider ?? 'github',
  target: first?.resources?.[0]?.data?.metadata?.full_name ?? '',
  total: findings.length,
  pass,
  fail,
  passRate: findings.length ? Math.round((pass / (pass + fail)) * 100) : 0,
  failBySeverity,
  findings,
};

const dest = resolve(outPath);
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);

console.log(
  `normalized ${findings.length} findings (${pass} pass, ${fail} fail, ${out.passRate}%) -> ${outPath}`,
);
