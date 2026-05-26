'use client';

// ============================================================
// IBCS Interview Tool — ProgressBar
// Fixed bar at top showing "Schritt X von Y".
// Hidden on 'welcome' and 'completed' phases.
// ============================================================

import { useStore } from '@/lib/store';

export default function ProgressBar() {
  const currentPhase   = useStore((s) => s.currentPhase);
  const completedSteps = useStore((s) => s.completedSteps);
  const totalSteps     = useStore((s) => s.totalSteps);

  // Not visible on the first and last screens
  if (currentPhase === 'welcome' || currentPhase === 'onboarding' || currentPhase === 'completed') {
    return null;
  }

  const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      {/* Filled track */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-blue-500 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={completedSteps}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-label={`Fortschritt: Schritt ${completedSteps} von ${totalSteps}`}
        />
      </div>

      {/* Text label */}
      <div className="flex justify-end px-6 py-1.5">
        <span className="text-[11px] font-medium text-gray-400 tabular-nums tracking-wide">
          Schritt {Math.min(completedSteps + 1, totalSteps)} von {totalSteps}
        </span>
      </div>
    </div>
  );
}
