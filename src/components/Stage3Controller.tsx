'use client';

// ============================================================
// IBCS Interview Tool — Stage3Controller
// Orchestrates all Stufe 3 feedback questions in sequence.
// Dispatches to LikertStep / PreferenceStep / FreeTextStep
// based on question.type, persists each answer to Supabase,
// then calls store.nextStep() when all questions are done.
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { feedbackQuestions, FeedbackQuestion } from '@/config/feedback';
import { useStore } from '@/lib/store';
import { saveFeedback } from '@/lib/supabase';
import type { FeedbackInsert } from '@/types/database';

import LikertStep from '@/components/LikertStep';
import PreferenceStep from '@/components/PreferenceStep';
import FreeTextStep from '@/components/FreeTextStep';

// Map question type to the FeedbackInsert answer_type column
function toAnswerType(
  type: FeedbackQuestion['type'],
): FeedbackInsert['answer_type'] {
  if (type === 'likert5' || type === 'likert7') return 'likert';
  // 'preference' and 'freetext' both stored as freetext
  return 'freetext';
}

export default function Stage3Controller() {
  const sessionId = useStore((s) => s.sessionId);
  const nextStep  = useStore((s) => s.nextStep);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Store the last failed payload for retry
  const pendingRetry = useRef<{
    questionId: string;
    value: string;
  } | null>(null);

  const currentQuestion = feedbackQuestions[questionIndex];

  // ── Handle answer ──────────────────────────────────────────
  const handleAnswer = useCallback(
    async (questionId: string, value: string) => {
      if (saving || !sessionId) return;

      setSaving(true);
      setError(null);
      pendingRetry.current = { questionId, value };

      try {
        const payload: FeedbackInsert = {
          session_id:  sessionId,
          question_id: questionId,
          answer_type: toAnswerType(currentQuestion.type),
          value,
        };
        await saveFeedback(payload);
      } catch (err) {
        console.error('saveFeedback error:', err);
        setError('Antwort konnte nicht gespeichert werden. Bitte versuche es erneut.');
        setSaving(false);
        return; // ← Block progression — user must retry
      }

      setSaving(false);
      pendingRetry.current = null;

      // Only advance on success
      const nextIndex = questionIndex + 1;
      if (nextIndex < feedbackQuestions.length) {
        setQuestionIndex(nextIndex);
      } else {
        nextStep();
      }
    },
    [saving, sessionId, currentQuestion, questionIndex, feedbackQuestions.length, nextStep],
  );

  // ── Retry handler ──────────────────────────────────────────
  const handleRetry = useCallback(() => {
    if (!pendingRetry.current) return;
    handleAnswer(pendingRetry.current.questionId, pendingRetry.current.value);
  }, [handleAnswer]);

  // ── Progress indicator ─────────────────────────────────────
  const total   = feedbackQuestions.length;
  const current = questionIndex + 1;

  // ── Render ─────────────────────────────────────────────────
  if (!currentQuestion) return null;

  return (
    <div className="relative">
      {/* Mini progress indicator for this stage */}
      <div className="fixed right-4 top-20 z-10 rounded-lg bg-white px-3 py-1.5 text-xs text-gray-400 shadow">
        Frage {current} / {total}
      </div>

      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3 shadow-lg">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={handleRetry}
              className="whitespace-nowrap rounded-lg bg-red-600 px-4 py-1.5 text-sm font-semibold text-white
                         transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      )}

      {/* Dispatch to the right question component */}
      {(currentQuestion.type === 'likert5' ||
        currentQuestion.type === 'likert7') && (
        <LikertStep
          key={currentQuestion.id}
          question={currentQuestion}
          onAnswer={handleAnswer}
        />
      )}

      {currentQuestion.type === 'preference' && (
        <PreferenceStep
          key={currentQuestion.id}
          question={currentQuestion}
          onAnswer={handleAnswer}
        />
      )}

      {currentQuestion.type === 'freetext' && (
        <FreeTextStep
          key={currentQuestion.id}
          question={currentQuestion}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
}
