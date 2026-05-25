'use client';

// ============================================================
// IBCS Interview Tool — LikertStep
// Renders a single Likert question (scale 1–5 or 1–7) with
// clickable buttons in a row.
// ============================================================

import { FeedbackQuestion, FeedbackOption } from '@/config/feedback';

interface LikertStepProps {
  question: FeedbackQuestion;
  onAnswer: (questionId: string, value: string) => void;
}

export default function LikertStep({ question, onAnswer }: LikertStepProps) {
  const options: FeedbackOption[] = question.options ?? [];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">

        {/* Question card */}
        <div className="rounded-2xl bg-white px-8 py-8 shadow-md ring-1 ring-gray-100 space-y-3 text-center">
          {question.relatedRule && (
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">
              IBCS {question.relatedRule}
              {question.hint ? ` — ${question.hint}` : ''}
            </p>
          )}
          {!question.relatedRule && question.hint && (
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">
              {question.hint}
            </p>
          )}
          <p className="text-xl font-semibold leading-relaxed text-gray-900">
            {question.questionText}
          </p>
        </div>

        {/* Scale card */}
        <div className="rounded-2xl bg-white px-8 py-7 shadow-md ring-1 ring-gray-100 space-y-5">
          {/* Anchor labels */}
          <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            <span>Stimme nicht zu</span>
            <span>Stimme voll zu</span>
          </div>

          {/* Scale buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onAnswer(question.id, opt.value)}
                className="
                  flex min-w-[72px] flex-col items-center gap-1.5 rounded-xl
                  border-2 border-gray-200 bg-white px-4 py-4 shadow-sm
                  transition-all duration-150
                  hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:scale-105
                  active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                "
              >
                <span className="text-2xl font-bold text-gray-800">{opt.value}</span>
                <span className="text-center text-[10px] leading-tight text-gray-400 font-medium">
                  {opt.label.replace(/^\d+ — /, '')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
