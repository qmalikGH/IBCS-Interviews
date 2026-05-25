'use client';

// ============================================================
// IBCS Interview Tool — ProgressBar
// Fixed bar at top showing "Schritt X von Y".
// Hidden on 'welcome' and 'completed' phases.
// ============================================================

import { useStore } from '@/lib/store';

export default function ProgressBar() {
  const currentPhase = useStore((s) => s.currentPhase);
  const getProgress = useStore((s) => s.getProgress);

  // Not visible on the first and last screens
  if (currentPhase === 'welcome' || currentPhase === 'completed') {
    return null;
  }

  const { current, total } = getProgress();
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      {/* Filled track */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-blue-500 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`Fortschritt: Schritt ${current} von ${total}`}
        />
      </div>

      {/* Text label */}
      <div className="flex justify-end px-6 py-1.5">
        <span className="text-[11px] font-medium text-gray-400 tabular-nums tracking-wide">
          Schritt {current} von {total}
        </span>
      </div>
    </div>
  );
}
