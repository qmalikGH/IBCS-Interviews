'use client';

// ============================================================
// IBCS Interview Tool — TransitionStep
// Brief screen shown between Stufe 2 Block 1 and Block 2.
// Confirms completion of the first report and announces the
// second before the participant continues.
// ============================================================

import { useStore } from '@/lib/store';

export default function TransitionStep() {
  const nextStep = useStore((s) => s.nextStep);

  // Enter key advances
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') nextStep();
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white px-8 py-12 shadow-lg ring-1 ring-gray-100 text-center sm:px-12 sm:py-16">

        {/* ── Success indicator ─────────────────────────────── */}
        <div className="mb-6 flex items-center justify-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50 shadow-sm">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </span>
        </div>

        {/* ── Heading ───────────────────────────────────────── */}
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-900">
          Gut gemacht!
        </h1>

        {/* ── Instruction text ──────────────────────────────── */}
        <p className="mb-10 text-base leading-7 text-gray-600">
          Jetzt bekommst du einen zweiten Bericht mit den gleichen Daten, aber
          einem anderen Design. Bitte bearbeite die gleichen Aufgaben erneut.
        </p>

        {/* ── Continue button ───────────────────────────────── */}
        <button
          onClick={nextStep}
          autoFocus
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md
                     transition-all duration-150
                     hover:bg-blue-700 hover:shadow-lg active:scale-[0.99]
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
        >
          Weiter
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
