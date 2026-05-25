'use client';

// ============================================================
// IBCS Interview Tool — FreeTextStep
// Open-ended question with a large textarea and submit button.
// ============================================================

import { useState } from 'react';
import { FeedbackQuestion } from '@/config/feedback';

interface FreeTextStepProps {
  question: FeedbackQuestion;
  onAnswer: (questionId: string, value: string) => void;
}

export default function FreeTextStep({ question, onAnswer }: FreeTextStepProps) {
  const [text, setText] = useState('');

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAnswer(question.id, trimmed);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">

        {/* Question text */}
        <div className="space-y-2 text-center">
          {question.hint && (
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">
              {question.hint}
            </p>
          )}
          <p className="text-xl font-semibold leading-snug text-gray-800">
            {question.questionText}
          </p>
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Deine Antwort …"
          className="
            w-full resize-y rounded-xl border-2 border-gray-200 bg-white
            p-4 text-gray-800 shadow-sm
            placeholder:text-gray-400
            focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200
          "
        />

        {/* Submit */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={text.trim().length === 0}
            className="
              rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white
              shadow transition
              hover:bg-blue-700 active:scale-95
              disabled:cursor-not-allowed disabled:opacity-40
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
            "
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  );
}
