'use client';

// ============================================================
// IBCS Interview Tool — Stage1Controller
// Controls the flow of 8 randomised element-pair comparisons.
// Reads pairOrder and pairSideOrder from the store and passes
// the current pair config + side order down to DuelStep.
//
// PRELOADING: Renders hidden iframes for the NEXT pair so the
// browser has the PBI resources cached when the next DuelStep
// mounts (which triggers a fresh iframe load for its own URLs).
// ============================================================

import { useStore } from '@/lib/store';
import { getPairById, PBI_STUFE1_BASE, buildPbiPageUrl } from '@/config/pairs';
import DuelStep from '@/components/DuelStep';
import type { ReportOrder } from '@/types/store';

function getPageNames(
  pairId: string,
  sideOrder: ReportOrder,
) {
  const config = getPairById(pairId);
  if (!config) return null;
  const isNativeFirst = sideOrder === 'native_first';
  return {
    pageA: isNativeFirst ? config.nativePageName : config.ibcsPageName,
    pageB: isNativeFirst ? config.ibcsPageName : config.nativePageName,
  };
}

export default function Stage1Controller() {
  const pairOrder        = useStore((s) => s.pairOrder);
  const pairSideOrder    = useStore((s) => s.pairSideOrder);
  const currentStepIndex = useStore((s) => s.currentStepIndex);
  const nextStep         = useStore((s) => s.nextStep);

  // Guard: store not yet initialised
  if (!pairOrder || pairOrder.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Lade Aufgaben…</p>
      </div>
    );
  }

  const pairId     = pairOrder[currentStepIndex];
  const pairConfig = getPairById(pairId);

  if (!pairConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Fehler: Paar-Konfiguration nicht gefunden ({pairId}).</p>
      </div>
    );
  }

  const sideOrder = pairSideOrder[pairId] ?? 'native_first';

  // ── Next-pair preloading ────────────────────────────────
  const nextIndex  = currentStepIndex + 1;
  const nextPairId = nextIndex < pairOrder.length ? pairOrder[nextIndex] : null;
  const nextPages  = nextPairId
    ? getPageNames(nextPairId, pairSideOrder[nextPairId] ?? 'native_first')
    : null;

  return (
    <>
      <DuelStep
        key={pairId}                  // re-mount completely for each new pair
        pair={pairConfig}
        sideOrder={sideOrder}
        onComplete={nextStep}
        pairIndex={currentStepIndex}
        totalPairs={pairOrder.length}
      />

      {/* Preload next pair's iframes in the background */}
      {nextPages && (
        <div className="hidden" aria-hidden="true">
          <iframe
            src={buildPbiPageUrl(PBI_STUFE1_BASE, nextPages.pageA)}
            title="preload-next-a"
            tabIndex={-1}
          />
          <iframe
            src={buildPbiPageUrl(PBI_STUFE1_BASE, nextPages.pageB)}
            title="preload-next-b"
            tabIndex={-1}
          />
        </div>
      )}
    </>
  );
}
