import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export type CheckStatus = 'PASS' | 'FAIL' | 'MANUAL' | 'UNKNOWN';
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
export type DispositionState = 'blocked' | 'accepted' | 'todo';

export interface Disposition {
  state: DispositionState;
  note: string;
}

export interface Finding {
  id: string;
  title: string;
  status: CheckStatus;
  severity: Severity;
  detail: string;
  risk: string;
  remediation: string;
  service: string;
  categories: string[];
  disposition: Disposition | null;
}

export interface SecurityScan {
  generatedAt: string;
  prowlerVersion: string;
  provider: string;
  target: string;
  total: number;
  pass: number;
  fail: number;
  passRate: number;
  failBySeverity: Partial<Record<Severity, number>>;
  findings: Finding[];
}

const SCAN_DIR = 'src/data/scans';

/** The order providers are presented in, rather than whatever readdir returns. */
const PROVIDER_ORDER = ['github', 'cloudflare'];

/**
 * Load every normalized Prowler scan that has been generated.
 *
 * Resolved from process.cwd() rather than import.meta.url: Vite rewrites this
 * module during the build and import.meta.url stops pointing at src/lib, which
 * silently broke the audit module once already. See docs/DECISIONS.md.
 *
 * Returns an empty array when no scan exists, so the page can say so plainly
 * instead of rendering an empty table or, worse, invented numbers. A single
 * unreadable file is skipped rather than taking the whole page down with it.
 */
export function loadScans(): SecurityScan[] {
  const dir = resolve(process.cwd(), SCAN_DIR);
  if (!existsSync(dir)) return [];

  const scans: SecurityScan[] = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.json')) continue;
    try {
      scans.push(JSON.parse(readFileSync(join(dir, name), 'utf8')) as SecurityScan);
    } catch {
      // A malformed file is skipped. The page renders the scans that do parse.
    }
  }

  return scans.sort((a, b) => {
    const ai = PROVIDER_ORDER.indexOf(a.provider);
    const bi = PROVIDER_ORDER.indexOf(b.provider);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.provider.localeCompare(b.provider);
  });
}

/** Totals across every provider, for the page's summary line. */
export function combinedTotals(scans: SecurityScan[]) {
  const pass = scans.reduce((n, s) => n + s.pass, 0);
  const fail = scans.reduce((n, s) => n + s.fail, 0);
  return {
    pass,
    fail,
    total: pass + fail,
    passRate: pass + fail ? Math.round((pass / (pass + fail)) * 100) : 0,
  };
}
