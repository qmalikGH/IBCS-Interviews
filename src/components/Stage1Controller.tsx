'use client';

// ============================================================
// IBCS Interview Tool — Stage1Controller
// Controls the flow of 8 randomised element-pair comparisons.
// Reads pairOrder and pairSideOrder from the store and passes
// the current pair config + side order down to DuelStep.
// ============================================================

import { useStore } from '@/lib/store';
import { getPairById } from '@/config/pairs';
import DuelStep from '@/components/DuelStep';

export default function Stage1Controller() {
  const pairOrder       = useStore((s) => s.pairOrder);
  const pairSideOrder   = useStore((s) => s.pairSideOrder);
  const currentStepIndex = useStore((s) => s.currentStepIndex);
  const nextStep        = useStore((s) => s.nextStep);

  // Guard: store not yet initialised
  if (!pairOrder || pairOrder.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Lade Aufgaben…</p>
      </div>
    );
  }

  const pairId   = pairOrder[currentStepIndex];
  const pairConfig = getPairById(pairId);

  if (!pairConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Fehler: Paar-Konfiguration nicht gefunden ({pairId}).</p>
      </div>
    );
  }

  const sideOrder = pairSideOrder[pairId] ?? 'native_first';

  return (
    <DuelStep
      key={pairId}                  // re-mount completely for each new pair
      pair={pairConfig}
      sideOrder={sideOrder}
      onComplete={nextStep}
      pairIndex={currentStepIndex}
      totalPairs={pairOrder.length}
    />
  );
}
