// ============================================================
// IBCS Interview Tool — Timer Service
// Completely invisible to the participant — no UI component.
// Uses performance.now() for high-resolution, monotonic timing.
// ============================================================

/**
 * Record the current high-resolution timestamp.
 * Call this when the participant first sees a task stimulus.
 *
 * @returns Start timestamp (ms since page load, monotonic).
 */
export function startTimer(): number {
  return performance.now();
}

/**
 * Calculate elapsed time since startTimer() was called.
 * Call this when the participant submits their answer.
 *
 * @param startTime  The value returned by startTimer().
 * @returns Elapsed time in milliseconds (rounded to nearest ms).
 */
export function stopTimer(startTime: number): number {
  return Math.round(performance.now() - startTime);
}
