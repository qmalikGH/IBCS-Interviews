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
// PRELOADING: Both iframes are mounted from component init
// and load in the background. Visual A preloads while the
// question screen is shown; Visual B preloads while the user
// answers Visual A. The "Darstellung anzeigen" button stays
// disabled until iframe A is ready.
//
// Special cases:
//   P2  — no MC, no timer; pure preference (skip visual MC)
//   P3  — scenario-notation hint before the IBCS visual
//   P5  — number-input estimation instead of MC
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
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

  // Resolve per-side options (optionsBySide takes precedence over options)
  const optionsA = pair.optionsBySide ? pair.optionsBySide[typeA] : pair.options;
  const optionsB = pair.optionsBySide ? pair.optionsBySide[typeB] : pair.options;

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

  // Separate loading states for both iframes (preload in parallel)
  const [iframeLoadedA, setIframeLoadedA] = useState(false);
  const [iframeLoadedB, setIframeLoadedB] = useState(false);

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

  /** User clicks "Darstellung anzeigen" — show visual A */
  function handleShowVisualA() {
    setSubStep('visual_a');
  }

  /** Visual B becomes active */
  function activateVisualB() {
    setSubStep('visual_b');
  }

  // ── Timer fairness: start only when iframe is loaded AND visible ──
  useEffect(() => {
    if (subStep === 'visual_a' && iframeLoadedA && pair.hasTimer && timerStartRef.current === null) {
      timerStartRef.current = startTimer();
    }
  }, [subStep, iframeLoadedA, pair.hasTimer]);

  useEffect(() => {
    if (subStep === 'visual_b' && iframeLoadedB && pair.hasTimer && timerStartRef.current === null) {
      timerStartRef.current = startTimer();
    }
  }, [subStep, iframeLoadedB, pair.hasTimer]);

  /** MC answer selected on visual A */
  async function handleMcSelectA(optionId: string) {
    if (selectedA !== null) return;
    setSelectedA(optionId);

    const timeMs = pair.hasTimer && timerStartRef.current !== null
      ? stopTimer(timerStartRef.current)
      : null;

    const isCorrect: 0 | 2 = optionId === correctA ? 2 : 0;
    await saveVisualResponse(typeA, optionId, isCorrect, timeMs);

    // Advance to visual B after short delay
    setTimeout(() => {
      timerStartRef.current = null;
      activateVisualB();
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
    timerStartRef.current = null;
    activateVisualB();
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

  // ── Which iframe is currently the "active" one? ───────────
  const activeIframeLoaded =
    subStep === 'visual_a' ? iframeLoadedA :
    subStep === 'visual_b' ? iframeLoadedB :
    true;

  // ── Main render ───────────────────────────────────────────

  return (
    <div className="relative">

      {/* ═══════════════════════════════════════════════════════ */}
      {/* PRELOADED IFRAMES — always in DOM, visibility via CSS  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div
        style={{
          display: (subStep === 'visual_a' || subStep === 'visual_b') ? 'flex' : 'none',
        }}
        className="h-[calc(100vh-36px)] mt-[36px] w-full overflow-hidden bg-[#f8f9fa]"
      >
        {/* ── Left: Iframe area (70%) ──────────────────────── */}
        <div className="flex-[7] relative bg-gray-200 border-r border-gray-300">

          {/* Loading spinner — only for the ACTIVE iframe */}
          {!activeIframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-100 z-10">
              <svg className="h-8 w-8 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-sm text-gray-400">Darstellung wird geladen …</p>
            </div>
          )}

          {/* Iframe A — visible only during visual_a */}
          <iframe
            src={iframeUrlA}
            width="100%"
            height="100%"
            frameBorder="0"
            title="Darstellung A"
            onLoad={() => setIframeLoadedA(true)}
            style={{ display: subStep === 'visual_a' ? 'block' : 'none' }}
            className="absolute inset-0 h-full w-full"
          />

          {/* Iframe B — visible only during visual_b */}
          <iframe
            src={iframeUrlB}
            width="100%"
            height="100%"
            frameBorder="0"
            title="Darstellung B"
            onLoad={() => setIframeLoadedB(true)}
            style={{ display: subStep === 'visual_b' ? 'block' : 'none' }}
            className="absolute inset-0 h-full w-full"
          />
        </div>

        {/* ── Right: Task panel (30%) ──────────────────────── */}
        <aside className="flex-[3] flex flex-col overflow-y-auto bg-white shadow-[-4px_0_16px_rgba(0,0,0,0.06)]">

          {/* Panel header */}
          <div className="flex-shrink-0 border-b border-gray-100 bg-gray-50 px-6 py-5">
            <div className="flex items-center justify-between">
              {renderProgress()}
              <span className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-200">
                Darstellung {subStep === 'visual_a' ? 'A' : 'B'}
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
            {((subStep === 'visual_a' && typeA === 'ibcs') ||
              (subStep === 'visual_b' && typeB === 'ibcs')) &&
              pair.specialInstructions && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <span className="font-semibold">Hinweis: </span>
                {pair.specialInstructions}
              </div>
            )}

            {/* MC options (not for P2) — Visual A */}
            {subStep === 'visual_a' && !isP2 && pair.questionType === 'mc' && optionsA && (
              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Deine Antwort
                </p>
                {optionsA.map((opt) => {
                  const isSelected = selectedA === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleMcSelectA(opt.id)}
                      disabled={selectedA !== null}
                      className={[
                        'w-full rounded-lg border px-4 py-3.5 text-left text-sm font-medium transition-all duration-150',
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm'
                          : selectedA !== null
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

            {/* MC options (not for P2) — Visual B */}
            {subStep === 'visual_b' && !isP2 && pair.questionType === 'mc' && optionsB && (
              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Deine Antwort
                </p>
                {optionsB.map((opt) => {
                  const isSelected = selectedB === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleMcSelectB(opt.id)}
                      disabled={selectedB !== null}
                      className={[
                        'w-full rounded-lg border px-4 py-3.5 text-left text-sm font-medium transition-all duration-150',
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm'
                          : selectedB !== null
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

            {/* Estimation input (P5) — Visual A */}
            {subStep === 'visual_a' && !isP2 && pair.questionType === 'estimation' && (
              <div className="space-y-4">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Schätzung in %
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={estimationA}
                    onChange={(e) => setEstimationA(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEstimationSubmitA()}
                    placeholder="z. B. 25"
                    autoFocus
                    className="w-36 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-lg text-gray-800 shadow-sm
                               focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                  />
                  <span className="text-lg text-gray-400 font-medium">%</span>
                  <button
                    onClick={handleEstimationSubmitA}
                    disabled={!estimationA.trim()}
                    className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg
                               disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
                  >
                    Bestätigen
                  </button>
                </div>
              </div>
            )}

            {/* Estimation input (P5) — Visual B */}
            {subStep === 'visual_b' && !isP2 && pair.questionType === 'estimation' && (
              <div className="space-y-4">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Schätzung in %
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={estimationB}
                    onChange={(e) => setEstimationB(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEstimationSubmitB()}
                    placeholder="z. B. 25"
                    autoFocus
                    className="w-36 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-lg text-gray-800 shadow-sm
                               focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                  />
                  <span className="text-lg text-gray-400 font-medium">%</span>
                  <button
                    onClick={handleEstimationSubmitB}
                    disabled={!estimationB.trim()}
                    className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg
                               disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
                  >
                    Bestätigen
                  </button>
                </div>
              </div>
            )}

            {/* P2: just a next button */}
            {subStep === 'visual_a' && isP2 && (
              <button
                onClick={() => activateVisualB()}
                className="mt-4 rounded-xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all duration-150"
              >
                Weiter
              </button>
            )}
            {subStep === 'visual_b' && isP2 && (
              <button
                onClick={() => setSubStep('preference')}
                className="mt-4 rounded-xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all duration-150"
              >
                Weiter
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* QUESTION SCREEN                                        */}
      {/* ═══════════════════════════════════════════════════════ */}
      {subStep === 'question' && (
        <div
          className="flex min-h-[calc(100vh-36px)] mt-[36px] flex-col items-center justify-center gap-8 bg-[#f8f9fa] px-6 py-12"
          tabIndex={-1}
          onKeyDown={(e) => e.key === 'Enter' && handleShowVisualA()}
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
              onClick={handleShowVisualA}
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
            {!iframeLoadedA && (
              <p className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-400">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Darstellung wird vorbereitet …
              </p>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* PREFERENCE SCREEN                                      */}
      {/* ═══════════════════════════════════════════════════════ */}
      {subStep === 'preference' && (
        <div className="flex min-h-[calc(100vh-36px)] mt-[36px] flex-col items-center justify-center gap-8 bg-[#f8f9fa] px-6 py-12">
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
      )}
    </div>
  );
}
