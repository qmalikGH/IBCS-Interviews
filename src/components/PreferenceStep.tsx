'use client';

// ============================================================
// IBCS Interview Tool — PreferenceStep
// Report preference question: participant picks Report A or B
// and optionally provides a reason (reason handled separately
// by FreeTextStep for FP1_reason).
// ============================================================

import { FeedbackQuestion } from '@/config/feedback';

interface PreferenceStepProps {
  question: FeedbackQuestion;
  onAnswer: (questionId: string, value: string) => void;
}

export default function PreferenceStep({ question, onAnswer }: PreferenceStepProps) {
  const options = question.options ?? [];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-2xl space-y-10">

        {/* Question text */}
        <div className="space-y-2 text-center">
          <p className="text-xl font-semibold leading-snug text-gray-800">
            {question.questionText}
          </p>
          {question.hint && (
            <p className="text-sm text-gray-500">{question.hint}</p>
          )}
        </div>

        {/* Report cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onAnswer(question.id, opt.value)}
              className="
                group flex flex-col items-center justify-center gap-3 rounded-2xl
                border-2 border-gray-200 bg-white px-8 py-10
                shadow-sm transition
                hover:border-blue-400 hover:bg-blue-50 hover:shadow-md
                active:scale-95
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
              "
            >
              {/* Large card icon */}
              <span className="text-5xl">
                {opt.value === 'native' ? '📄' : '📊'}
              </span>
              <span className="text-center text-lg font-semibold text-gray-700 group-hover:text-blue-700">
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400">
          Klicke auf den Bericht, den du bevorzugst.
        </p>
      </div>
    </div>
  );
}
