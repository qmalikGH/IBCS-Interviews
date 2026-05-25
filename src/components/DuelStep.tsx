'use client';

// ============================================================
// IBCS Interview Tool — DuelStep
// Handles the complete flow for ONE element pair.
// Parent (Stage1Controller) passes pair config + side-order;
// when done we call onComplete().
//
// Sub-step machine:
//   question → visual_a → visual_b → preference
//
// Special cases:
//   P2  — no MC, no timer; pure preference (skip visual MC)
//   P3  — scenario-notation hint before the IBCS visual
//   P5  — number-input estimation instead of MC
// ============================================================

import { useState, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { startTimer, stopTimer } from '@/lib/timer';
import { saveResponse } from '@/lib/supabase';
import {
  pairSideAnswers,
  PBI_STUFE1_BASE,
  buildPbiPageUrl,
  type PairConfig,
} from '@/config/pairs';
import type { ReportOrder } from '@/types/store';

// ── Types ─────────────────────────────────────────────────────

type SubStep = 'question' | 'visual_a' | 'visual_b' | 'preference';

interface DuelStepProps {
  pair: PairConfig;
  sideOrder: ReportOrder;       // 'native_first' | 'ibcs_first'
  onComplete: () => void;
  pairIndex: number;
  totalPairs: number;
}

// ── Helpers ───────────────────────────────────────────────────

function getSides(sideOrder: ReportOrder): {
  typeA: 'native' | 'ibcs';
  typeB: 'native' | 'ibcs';
} {
  return sideOrder === 'native_first'
    ? { typeA: 'native', typeB: 'ibcs' }
    : { typeA: 'ibcs', typeB: 'native' };
}

// ── Component ─────────────────────────────────────────────────

export default function DuelStep({
  pair,
  sideOrder,
  onComplete,
  pairIndex,
  totalPairs,
}: DuelStepProps) {
  const sessionId = useStore((s) => s.sessionId);

  // ── Derived side mapping ──────────────────────────────────
  const { typeA, typeB } = getSides(sideOrder);

  // Build PBI iframe URLs — all pages live in ONE Stufe 1 report
  const pageA = typeA === 'native' ? pair.nativePageName : pair.ibcsPageName;
  const pageB = typeB === 'native' ? pair.nativePageName : pair.ibcsPageName;
  const iframeUrlA = buildPbiPageUrl(PBI_STUFE1_BASE, pageA);
  const iframeUrlB = buildPbiPageUrl(PBI_STUFE1_BASE, pageB);

  const correctA = pairSideAnswers[pair.id]?.[typeA] ?? '';
  const correctB = pairSideAnswers[pair.id]?.[typeB] ?? '';

  // ── Sub-step state ────────────────────────────────────────
  const isP2 = pair.id === 'P2';
  const [subStep, setSubStep] = useState<SubStep>('question');

  // Timer ref (invisible to participant)
  const timerStartRef = useRef<number | null>(null);

  // User selections
  const [selectedA, setSelectedA]       = useState<string | null>(null);
  const [selectedB, setSelectedB]       = useState<string | null>(null);
  const [estimationA, setEstimationA]   = useState<string>('');
  const [estimationB, setEstimationB]   = useState<string>('');
  const [preference, setPreference]     = useState<'a' | 'b' | null>(null);

  // iframe loading state
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // ── Save helpers ──────────────────────────────────────────

  const saveVisualResponse = useCallback(
    async (
      reportType: 'native' | 'ibcs',
      answer: string,
      isCorrect: 0 | 1 | 2,
      timeMs: number | null,
    ) => {
      if (!sessionId) return;
      try {
        await saveResponse({
          session_id:  sessionId,
          stage:       'stufe1',
          task_id:     `${pair.id}_${reportType}`,
          report_type: reportType,
          answer,
          is_correct:  isCorrect,
          time_ms:     timeMs,
          seq_score:   null,
          preference:  null,
        });
      } catch (err) {
        console.error('saveResponse error:', err);
      }
    },
    [sessionId, pair.id],
  );

  const savePreferenceResponse = useCallback(
    async (pref: 'a' | 'b') => {
      if (!sessionId) return;
      try {
        await saveResponse({
          session_id:  sessionId,
          stage:       'stufe1',
          task_id:     `${pair.id}_preference`,
          report_type: 'native',
          answer:      pref,
          is_correct:  1,
          time_ms:     null,
          seq_score:   null,
          preference:  pref,
        });
      } catch (err) {
        console.error('savePreference error:', err);
      }
    },
    [sessionId, pair.id],
  );

  // ── Advance helpers ───────────────────────────────────────

  /** iframe finished loading → start timer */
  function handleIframeLoad() {
    setIframeLoaded(true);
    if (pair.hasTimer) {
      timerStartRef.current = startTimer();
    }
  }

  /** MC answer selected on visual A */
  async function handleMcSelectA(optionId: string) {
    if (selectedA !== null) return;
    setSelectedA(optionId);

    const timeMs = pair.hasTimer && timerStartRef.current !== null
      ? stopTimer(timerStartRef.current)
      : null;

    const isCorrect: 0 | 2 = optionId === correctA ? 2 : 0;
    await saveVisualResponse(typeA, optionId, isCorrect, timeMs);

    // Reset iframe state for visual B, then advance
    setTimeout(() => {
      setIframeLoaded(false);
      timerStartRef.current = null;
      setSubStep('visual_b');
    }, 400);
  }

  /** MC answer selected on visual B */
  async function handleMcSelectB(optionId: string) {
    if (selectedB !== null) return;
    setSelectedB(optionId);

    const timeMs = pair.hasTimer && timerStartRef.current !== null
      ? stopTimer(timerStartRef.current)
      : null;

    const isCorrect: 0 | 2 = optionId === correctB ? 2 : 0;
    await saveVisualResponse(typeB, optionId, isCorrect, timeMs);

    setTimeout(() => setSubStep('preference'), 400);
  }

  /** P5 estimation submit for visual A */
  async function handleEstimationSubmitA() {
    const val = estimationA.trim();
    if (!val) return;

    const timeMs = pair.hasTimer && timerStartRef.current !== null
      ? stopTimer(timerStartRef.current)
      : null;

    await saveVisualResponse(typeA, val, 1, timeMs);
    setIframeLoaded(false);
    timerStartRef.current = null;
    setSubStep('visual_b');
  }

  /** P5 estimation submit for visual B */
  async function handleEstimationSubmitB() {
    const val = estimationB.trim();
    if (!val) return;

    const timeMs = pair.hasTimer && timerStartRef.current !== null
      ? stopTimer(timerStartRef.current)
      : null;

    await saveVisualResponse(typeB, val, 1, timeMs);
    setSubStep('preference');
  }

  /** Preference selected → done with this pair */
  async function handlePreference(pref: 'a' | 'b') {
    setPreference(pref);
    await savePreferenceResponse(pref);
    onComplete();
  }

  // ── Render helpers ────────────────────────────────────────

  function renderProgress() {
    return (
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Aufgabe {pairIndex + 1} von {totalPairs}
      </p>
    );
  }

  function renderQuestion() {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#f8f9fa] px-6 py-12"
        tabIndex={-1}
        onKeyDown={(e) => e.key === 'Enter' && setSubStep('visual_a')}
      >
        <div className="w-full max-w-2xl space-y-6 text-center">
          {renderProgress()}
          <h2 className="text-3xl font-bold text-gray-900 leading-snug">
            {pair.questionText}
          </h2>
          {pair.questionType === 'estimation' && (
            <p className="text-base text-gray-500">
              Bitte schätze den Wert in Prozent.
            </p>
          )}
          <button
            onClick={() => setSubStep('visual_a')}
            autoFocus
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white shadow-md
                       transition-all duration-150 hover:bg-blue-700 hover:shadow-lg active:scale-95
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
          >
            Darstellung anzeigen
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  function renderVisual(
    visual: 'a' | 'b',
    iframeUrl: string,
    reportType: 'native' | 'ibcs',
    selected: string | null,
    onMcSelect: (id: string) => void,
    estimationValue: string,
    onEstimationChange: (v: string) => void,
    onEstimationSubmit: () => void,
  ) {
    const label = visual === 'a' ? 'A' : 'B';
    const isIbcs = reportType === 'ibcs';
    const showHint = isIbcs && !!pair.specialInstructions;

    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#f8f9fa]">

        {/* ── Left: Power BI iframe (70%) ──────────────────────── */}
        <div className="flex-[7] relative bg-gray-200 border-r border-gray-300">
          {/* Loading skeleton */}
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-100 z-10">
              <svg className="h-8 w-8 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-sm text-gray-400">Darstellung wird geladen …</p>
            </div>
          )}

          <iframe
            src={iframeUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            title={`Darstellung ${label}`}
            onLoad={handleIframeLoad}
            className="absolute inset-0 h-full w-full"
          />
        </div>

        {/* ── Right: Task panel (30%) ───────────────────────────── */}
        <aside className="flex-[3] flex flex-col overflow-y-auto bg-white shadow-[-4px_0_16px_rgba(0,0,0,0.06)]">

          {/* Panel header */}
          <div className="flex-shrink-0 border-b border-gray-100 bg-gray-50 px-6 py-5">
            <div className="flex items-center justify-between">
              {renderProgress()}
              <span className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-200">
                Darstellung {label}
              </span>
            </div>
          </div>

          {/* Panel body */}
          <div className="flex flex-1 flex-col px-6 py-6">

            {/* Question */}
            <p className="mb-4 text-[15px] font-semibold leading-7 text-gray-800">
              {pair.questionText}
            </p>

            {/* Scenario-notation hint (P3, IBCS visual only) */}
            {showHint && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <span className="font-semibold">Hinweis: </span>
                {pair.specialInstructions}
              </div>
            )}

            {/* MC options (not for P2) */}
            {!isP2 && pair.questionType === 'mc' && pair.options && (
              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Deine Antwort
                </p>
                {pair.options.map((opt) => {
                  const isSelected = selected === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onMcSelect(opt.id)}
                      disabled={selected !== null}
                      className={[
                        'w-full rounded-lg border px-4 py-3.5 text-left text-sm font-medium transition-all duration-150',
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm'
                          : selected !== null
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 bg-white text-gray-700 shadow-sm hover:border-blue-400 hover:bg-blue-50 hover:shadow-md active:scale-[0.99]',
                      ].join(' ')}
                    >
                      <span className="flex items-center gap-3">
                        {isSelected && (
                          <svg className="h-5 w-5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                        )}
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Estimation input (P5) */}
            {!isP2 && pair.questionType === 'estimation' && (
              <div className="space-y-4">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Schätzung in %
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={estimationValue}
                    onChange={(e) => onEstimationChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onEstimationSubmit()}
                    placeholder="z. B. 25"
                    autoFocus
                    className="w-36 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-lg text-gray-800 shadow-sm
                               focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                  />
                  <span className="text-lg text-gray-400 font-medium">%</span>
                  <button
                    onClick={onEstimationSubmit}
                    disabled={!estimationValue.trim()}
                    className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg
                               disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
                  >
                    Bestätigen
                  </button>
                </div>
              </div>
            )}

            {/* P2: just a next button */}
            {isP2 && (
              <button
                onClick={() => {
                  setIframeLoaded(false);
                  setSubStep(visual === 'a' ? 'visual_b' : 'preference');
                }}
                className="mt-4 rounded-xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all duration-150"
              >
                Weiter
              </button>
            )}
          </div>
        </aside>
      </div>
    );
  }

  function renderPreference() {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#f8f9fa] px-6 py-12">
        <div className="w-full max-w-2xl space-y-8 text-center">
          {renderProgress()}
          <h2 className="text-3xl font-bold text-gray-900">
            Welche Darstellung war für dich eindeutiger?
          </h2>
          <div className="flex justify-center gap-6">
            {(['a', 'b'] as const).map((pref) => (
              <button
                key={pref}
                onClick={() => handlePreference(pref)}
                disabled={preference !== null}
                className={[
                  'w-52 rounded-2xl border-2 py-8 text-xl font-bold transition-all duration-150 shadow-sm',
                  preference === pref
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                    : preference !== null
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md active:scale-[0.98]',
                ].join(' ')}
              >
                Darstellung {pref.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main render switch ────────────────────────────────────

  switch (subStep) {
    case 'question':
      return renderQuestion();

    case 'visual_a':
      return renderVisual(
        'a', iframeUrlA, typeA, selectedA,
        handleMcSelectA, estimationA, setEstimationA, handleEstimationSubmitA,
      );

    case 'visual_b':
      return renderVisual(
        'b', iframeUrlB, typeB, selectedB,
        handleMcSelectB, estimationB, setEstimationB, handleEstimationSubmitB,
      );

    case 'preference':
      return renderPreference();

    default:
      return null;
  }
}
