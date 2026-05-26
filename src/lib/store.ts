// ============================================================
// IBCS Interview Tool — Zustand Store
// Single-page wizard state. No back-navigation.
// Each browser tab is its own isolated session.
// ============================================================

import { create } from 'zustand';
import {
  Phase,
  PHASE_ORDER,
  PairSideOrder,
  ReportOrder,
  Store,
  StoreState,
} from '@/types/store';

// ── Step-count constants ──────────────────────────────────────
// These reflect the wizard design spec (between-subjects redesign):
//   Welcome                                       = 0 (not tracked)
//   Onboarding (3 info pages, no tasks)            = 0 (not tracked)
//   Stufe 1 : 8 pairs × 1 step each               = 8
//   Stufe 2 Tasks : 6 tasks, ONE report            = 6
//   Stufe 2 Alt-Preview : 1 step                   = 1
//   Stufe 3 : 14 questions on sequential screens,  = 1
//             counted as 1 step in global counter;
//             Stage3Controller shows its own
//             sub-counter "Frage X / 14"
//   Completed                                      = 0 (not tracked)
//
// Total trackable steps: 8 + 6 + 1 + 1 = 16
// Adjust these if the task-config changes.

const STEPS_PER_PHASE: Record<Phase, number> = {
  welcome:             0,  // not tracked in progress bar
  onboarding:          0,  // informational screens, not tracked
  stufe1:              8,
  stufe2_tasks:        6,
  stufe2_alt_preview:  1,
  stufe3:              1,
  completed:           0,  // not tracked
};

const TOTAL_STEPS = Object.values(STEPS_PER_PHASE).reduce((a, b) => a + b, 0);

// ── localStorage key ──────────────────────────────────────────

const SESSION_STORAGE_KEY = 'ibcs_interview_sessionId';

// ── Initial state ─────────────────────────────────────────────

const initialState: StoreState = {
  sessionId:       null,
  participantRole: '',
  currentPhase:    'welcome',
  currentStepIndex: 0,
  reportOrder:     null,
  pairOrder:       [],
  pairSideOrder:   {},
  totalSteps:      TOTAL_STEPS,
  completedSteps:  0,
};

// ── Store ─────────────────────────────────────────────────────

export const useStore = create<Store>()((set, get) => ({
  ...initialState,

  // ── initSession ────────────────────────────────────────────

  initSession(
    role: string,
    sessionId: string,
    reportOrder: ReportOrder,
    pairOrder: string[],
    pairSideOrder: PairSideOrder,
  ): void {
    // Persist for crash-recovery (tab reload)
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }

    set({
      sessionId,
      participantRole:  role,
      reportOrder,
      pairOrder,
      pairSideOrder,
      currentPhase:     'onboarding',  // show convention briefing before stufe1
      currentStepIndex: 0,
      completedSteps:   0,
    });
  },

  // ── nextStep ───────────────────────────────────────────────

  nextStep(): void {
    const { currentPhase, currentStepIndex, completedSteps } = get();

    const stepsInPhase = STEPS_PER_PHASE[currentPhase];
    const nextStepIndex = currentStepIndex + 1;

    // Increment completed steps (but never exceed total)
    const newCompleted = Math.min(completedSteps + 1, TOTAL_STEPS);

    if (nextStepIndex < stepsInPhase) {
      // Remaining steps in this phase
      set({ currentStepIndex: nextStepIndex, completedSteps: newCompleted });
    } else {
      // Phase exhausted → advance to next phase
      const currentPhaseIdx = PHASE_ORDER.indexOf(currentPhase);
      const nextPhase: Phase =
        currentPhaseIdx < PHASE_ORDER.length - 1
          ? PHASE_ORDER[currentPhaseIdx + 1]
          : 'completed';

      set({
        currentPhase:     nextPhase,
        currentStepIndex: 0,
        completedSteps:   newCompleted,
      });

      // Clear localStorage when the session finishes
      if (nextPhase === 'completed' && typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
  },

  // ── setPhase ───────────────────────────────────────────────

  setPhase(phase: Phase): void {
    set({ currentPhase: phase, currentStepIndex: 0 });

    if (phase === 'completed' && typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  },

  // ── getProgress ────────────────────────────────────────────

  getProgress(): { current: number; total: number } {
    const { completedSteps, totalSteps } = get();
    return { current: completedSteps, total: totalSteps };
  },

  // ── reset ──────────────────────────────────────────────────

  reset(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    set({ ...initialState });
  },
}));

// ── Session Recovery Helper ───────────────────────────────────

/**
 * On application boot, check whether a previous sessionId was saved.
 * Returns the recovered ID (or null if none exists / SSR).
 *
 * Usage (in a top-level layout or provider component):
 *   const recovered = recoverSession();
 *   if (recovered) { ...reload session from Supabase... }
 */
export function recoverSession(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

// ── Step count accessor ───────────────────────────────────────

/**
 * Returns the number of steps configured for a given phase.
 * Exported so the task-config layer can validate against it.
 */
export function getStepsPerPhase(phase: Phase): number {
  return STEPS_PER_PHASE[phase];
}
