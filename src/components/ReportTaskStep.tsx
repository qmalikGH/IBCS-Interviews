'use client';

// ============================================================
// IBCS Interview Tool — ReportTaskStep
// Split-screen: Power BI iframe (left) + task panel (right).
//
// Per-task navigation: the iframe URL is updated whenever the
// active task's pageName differs from the previous one (e.g.
// K1→K2 keeps the same page; K2→V2 switches to overview_fc).
//
// Flow per task:
//   1. Show question → "Aufgabe starten" button
//   2. Click starts hidden timer; MC options appear
//   3. Participant selects answer → timer stops → save to DB → next task
//   4. After last task → onComplete() is called
// ============================================================

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { startTimer, stopTimer } from '@/lib/timer';
import { saveResponse } from '@/lib/supabase';
import { buildPbiPageUrl } from '@/config/pairs';
import type { TaskConfig } from '@/config/tasks';

// ── Types ─────────────────────────────────────────────────────

interface ReportTaskStepProps {
  reportBaseUrl: string;
  reportType: 'native' | 'ibcs';
  tasks: TaskConfig[];
  stage: 'stufe2_tasks';
  onComplete: () => void;
}

type TaskPhase = 'intro' | 'answering';

// ── Component ─────────────────────────────────────────────────

export default function ReportTaskStep({
  reportBaseUrl,
  reportType,
  tasks,
  stage,
  onComplete,
}: ReportTaskStepProps) {
  const sessionId = useStore((s) => s.sessionId);
  const nextStep  = useStore((s) => s.nextStep);

  // Track which task is currently displayed (0-indexed)
  const [taskIndex, setTaskIndex]              = useState(0);
  const [taskPhase, setTaskPhase]              = useState<TaskPhase>('intro');
  const [selectedOption, setSelectedOption]    = useState<string | null>(null);
  const [isSaving, setIsSaving]                = useState(false);
  const [error, setError]                      = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded]        = useState(false);

  const timerStart = useRef<number | null>(null);

  const currentTask = tasks[taskIndex];

  // ── Per-task iframe URL ──────────────────────────────────
  const iframeUrl = useMemo(() => {
    const pageName =
      reportType === 'native'
        ? currentTask.nativePageName
        : currentTask.ibcsPageName;
    return buildPbiPageUrl(reportBaseUrl, pageName);
  }, [reportBaseUrl, reportType, currentTask]);

  // Reset loading state when the iframe URL changes
  // (e.g. switching from overview_pl → overview_fc)
  const prevUrlRef = useRef(iframeUrl);
  useEffect(() => {
    if (iframeUrl !== prevUrlRef.current) {
      setIframeLoaded(false);
      prevUrlRef.current = iframeUrl;
    }
  }, [iframeUrl]);

  // ── Handlers ──────────────────────────────────────────────

  /** "Aufgabe starten" clicked — start timer and show options */
  const handleStartTask = useCallback(() => {
    timerStart.current = startTimer();
    setTaskPhase('answering');
    setSelectedOption(null);
    setError(null);
  }, []);

  /** Participant selects an MC option — save immediately and advance */
  const handleSelectOption = useCallback(
    async (optionId: string) => {
      if (taskPhase !== 'answering' || isSaving) return;

      const elapsedMs = timerStart.current !== null
        ? stopTimer(timerStart.current)
        : null;

      setSelectedOption(optionId);
      setIsSaving(true);
      setError(null);

      try {
        await saveResponse({
          session_id:  sessionId ?? '',
          stage,
          task_id:     currentTask.id,
          report_type: reportType,
          answer:      optionId,
          is_correct:  optionId === currentTask.correctAnswer ? 2 : 0,
          time_ms:     elapsedMs,
          seq_score:   null,
          preference:  null,
        });
      } catch (err) {
        console.error('saveResponse failed:', err);
        setError('Antwort konnte nicht gespeichert werden. Bitte versuche es erneut.');
        setIsSaving(false);
        return;
      }

      setIsSaving(false);

      // Advance to next task or complete block
      const isLastTask = taskIndex === tasks.length - 1;
      if (isLastTask) {
        onComplete();
      } else {
        nextStep();
        setTaskIndex((prev) => prev + 1);
        setTaskPhase('intro');
        setSelectedOption(null);
        timerStart.current = null;
      }
    },
    [taskPhase, isSaving, sessionId, stage, currentTask, reportType, taskIndex, tasks.length, nextStep, onComplete],
  );

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-36px)] mt-[36px] w-full overflow-hidden bg-[#f8f9fa]">

      {/* ── Left: Power BI iframe (70%) ──────────────────────── */}
      <div className="flex-[7] relative bg-gray-200 border-r border-gray-300">
        {/* Loading skeleton while iframe loads */}
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-100 z-10">
            <svg className="h-8 w-8 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm text-gray-400">Bericht wird geladen …</p>
          </div>
        )}
        <iframe
          src={iframeUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          title={`Power BI Report — ${reportType}`}
          onLoad={() => setIframeLoaded(true)}
          className="absolute inset-0 h-full w-full border border-gray-200 shadow-inner"
        />
      </div>

      {/* ── Right: Task panel (30%) ───────────────────────────── */}
      <aside className="flex-[3] flex flex-col overflow-y-auto bg-white shadow-[-4px_0_16px_rgba(0,0,0,0.06)]">

        {/* Panel header */}
        <div className="flex-shrink-0 border-b border-gray-100 bg-gray-50 px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Stufe 2 — Berichtsanalyse
          </p>
          <p className="mt-1 text-base font-semibold text-gray-800">
            Aufgabe {taskIndex + 1} von {tasks.length}
          </p>
          {/* Mini progress dots */}
          <div className="mt-3 flex gap-1.5">
            {tasks.map((_, i) => (
              <div
                key={i}
                className={[
                  'h-1.5 flex-1 rounded-full transition-colors duration-300',
                  i < taskIndex
                    ? 'bg-green-400'
                    : i === taskIndex
                    ? 'bg-blue-500'
                    : 'bg-gray-200',
                ].join(' ')}
              />
            ))}
          </div>
        </div>

        {/* Panel body */}
        <div className="flex flex-1 flex-col px-6 py-6">

          {/* Question text */}
          <p className="mb-6 text-[15px] font-semibold leading-7 text-gray-800">
            {currentTask.questionText}
          </p>

          {/* ── INTRO phase ─────────────────────────────────── */}
          {taskPhase === 'intro' && (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center">
              <p className="mb-4 text-sm text-gray-500">
                Sieh dir den Bericht an und klicke dann auf &ldquo;Aufgabe starten&rdquo;, wenn du bereit bist.
              </p>
              <button
                onClick={handleStartTask}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md
                           transition-all duration-150 hover:bg-blue-700 hover:shadow-lg active:scale-95
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
                Aufgabe starten
              </button>
            </div>
          )}

          {/* ── ANSWERING phase — MC options ────────────────── */}
          {taskPhase === 'answering' && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Deine Antwort
              </p>
              {currentTask.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-left text-sm text-gray-700 shadow-sm
                             transition-all duration-100 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md
                             focus:outline-none focus:ring-2 focus:ring-blue-500/40
                             disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Saving indicator ──────────────────────────────── */}
          {isSaving && (
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Speichert…
            </div>
          )}

          {/* ── Error message ─────────────────────────────────── */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
              {selectedOption && (
                <button
                  onClick={() => handleSelectOption(selectedOption)}
                  className="mt-2 text-sm font-semibold text-red-600 underline hover:text-red-800"
                >
                  Erneut versuchen
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
