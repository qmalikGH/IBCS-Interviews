// ============================================================
// IBCS Interview Tool — Randomization & Counterbalancing
// Fisher-Yates shuffle, pair order, side order, report order
// ============================================================

import { pairs } from '@/config/pairs';

// ── Fisher-Yates (Knuth) shuffle — in-place on a copy ────────
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap result[i] and result[j]
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

// ── Generate randomized pair order ────────────────────────────
// Returns all 8 pair IDs in a random sequence for this session.
// P2 (the no-timer preference pair) has no order constraints
// and is included in the shuffle like any other pair.
export function generatePairOrder(): string[] {
  const ids = pairs.map((p) => p.id);   // ['P1', 'P2', ..., 'P8']
  return shuffleArray(ids);
}

// ── Generate random side order per pair ───────────────────────
// For each pair, randomly decide whether the native or IBCS
// visual is shown first. Returns a record keyed by pair ID.
export function generateSideOrder(): Record<string, 'native_first' | 'ibcs_first'> {
  const result: Record<string, 'native_first' | 'ibcs_first'> = {};
  for (const pair of pairs) {
    result[pair.id] = Math.random() < 0.5 ? 'native_first' : 'ibcs_first';
  }
  return result;
}

// ── Assign report order using simple balancing ─────────────────
// Takes the existing distribution from the DB (passed in by
// the caller so this function stays pure / testable) and
// returns the assignment that keeps the two groups balanced.
//
// Tie-breaking: if equal, assign randomly.
export function assignReportOrder(
  existingCounts: { native_first: number; ibcs_first: number },
): 'native_first' | 'ibcs_first' {
  const { native_first, ibcs_first } = existingCounts;

  if (native_first < ibcs_first) return 'native_first';
  if (ibcs_first < native_first) return 'ibcs_first';
  // Equal counts → random assignment
  return Math.random() < 0.5 ? 'native_first' : 'ibcs_first';
}

// ── Convenience: build complete session randomization ─────────
// Returns everything the session creation step needs in one call.
export interface SessionRandomization {
  pairOrder: string[];
  pairSideOrder: Record<string, 'native_first' | 'ibcs_first'>;
  reportOrder: 'native_first' | 'ibcs_first';
}

export function buildSessionRandomization(
  existingCounts: { native_first: number; ibcs_first: number },
): SessionRandomization {
  return {
    pairOrder: generatePairOrder(),
    pairSideOrder: generateSideOrder(),
    reportOrder: assignReportOrder(existingCounts),
  };
}
