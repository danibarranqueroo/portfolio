import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

/**
 * Load the normalized Prowler scan, if one has been generated.
 *
 * Resolved from process.cwd() rather than import.meta.url: Vite rewrites this
 * module during the build and import.meta.url stops pointing at src/lib, which
 * silently broke the audit module once already. See docs/DECISIONS.md.
 *
 * Returns null when no scan exists, so the page can say so plainly instead of
 * rendering an empty table or, worse, invented numbers.
 */
export function loadScan(): SecurityScan | null {
  const path = resolve(process.cwd(), 'src/data/security-scan.json');
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as SecurityScan;
  } catch {
    return null;
  }
}
