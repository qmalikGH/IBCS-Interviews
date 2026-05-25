// ============================================================
// IBCS Interview Tool — Store Types
// ============================================================

// ── Phase ────────────────────────────────────────────────────

/**
 * Each string literal matches the wizard page the participant is on.
 *
 * Flow:
 *   welcome
 *   → stufe1              (8 element-pair comparisons, timed)
 *   → stufe2_tasks        (6 report tasks, between-subjects: ONE report)
 *   → stufe2_alt_preview  (brief view of the OTHER report for preference)
 *   → stufe3              (feedback / Likert / ranking)
 *   → completed           (thank-you screen)
 */
export type Phase =
  | 'welcome'
  | 'stufe1'
  | 'stufe2_tasks'
  | 'stufe2_alt_preview'
  | 'stufe3'
  | 'completed';

/** Ordered list of phases for sequential navigation. */
export const PHASE_ORDER: Phase[] = [
  'welcome',
  'stufe1',
  'stufe2_tasks',
  'stufe2_alt_preview',
  'stufe3',
  'completed',
];

// ── Report / pair ordering ────────────────────────────────────

/** Which version of a report the participant sees first. */
export type ReportOrder = 'native_first' | 'ibcs_first';

/** Per pair: which visual (native vs. IBCS) appears on the left. */
export type PairSideOrder = Record<string, ReportOrder>;

// ── State ─────────────────────────────────────────────────────

export interface StoreState {
  /** Supabase session UUID — null until the session is created in the DB. */
  sessionId: string | null;

  /** Free-text role the participant entered on the welcome screen. */
  participantRole: string;

  /** The wizard screen the participant is currently on. */
  currentPhase: Phase;

  /**
   * Zero-based index of the active step *within* the current phase.
   * For example, during stufe1 this tracks which pair (0–7) is shown.
   */
  currentStepIndex: number;

  /**
   * Whether the session shows the native report before or after IBCS
   * at the top-level (stufe2 block assignment).
   * Null before initSession() is called.
   */
  reportOrder: ReportOrder | null;

  /**
   * Randomised order of the 8 pair IDs, e.g. ["P3","P7","P1","P5",…].
   * Determined once at session start and stored for consistent replay.
   */
  pairOrder: string[];

  /**
   * Per-pair random assignment of which side (left/right) shows native.
   * e.g. { P1: 'native_first', P2: 'ibcs_first', … }
   */
  pairSideOrder: PairSideOrder;

  /** Total number of steps across all phases (used for the progress bar). */
  totalSteps: number;

  /** Number of steps the participant has completed so far. */
  completedSteps: number;
}

// ── Actions ───────────────────────────────────────────────────

export interface StoreActions {
  /**
   * Populate the store once the Supabase session row has been created.
   * Also persists sessionId to localStorage for crash recovery.
   */
  initSession(
    role: string,
    sessionId: string,
    reportOrder: ReportOrder,
    pairOrder: string[],
    pairSideOrder: PairSideOrder,
  ): void;

  /**
   * Advance to the next step.
   * - If more steps remain in the current phase → increment currentStepIndex.
   * - If the current phase is exhausted → move to the next phase and reset
   *   currentStepIndex to 0.
   * Also increments completedSteps.
   */
  nextStep(): void;

  /**
   * Jump directly to a specific phase (resets currentStepIndex to 0).
   * Intended for the transition screen's explicit "Continue" button and
   * for error-recovery flows.
   */
  setPhase(phase: Phase): void;

  /**
   * Returns the current progress ratio for rendering a progress bar.
   * { current: completedSteps, total: totalSteps }
   */
  getProgress(): { current: number; total: number };

  /**
   * Reset all state to initial values and clear localStorage.
   * Called when the researcher starts a new session or after completion.
   */
  reset(): void;
}

/** Combined type consumed by components and hooks. */
export type Store = StoreState & StoreActions;
