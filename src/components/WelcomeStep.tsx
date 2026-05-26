'use client';

// ============================================================
// IBCS Interview Tool — WelcomeStep
// The first screen participants see.
// Collects role, privacy consent, then initialises the session.
// ============================================================

import { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  assignReportOrder,
  generatePairOrder,
  generateSideOrder,
} from '@/lib/counterbalancing';
import { createSession } from '@/lib/supabase';

export default function WelcomeStep() {
  const initSession = useStore((s) => s.initSession);

  const [role, setRole] = useState('');
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = role.trim().length > 0 && privacyChecked && !isSubmitting;

  async function handleStart() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Determine counterbalancing values
      //    Placeholder counts — will be replaced with live Supabase query.
      const reportOrder = assignReportOrder({ native_first: 0, ibcs_first: 0 });
      const pairOrder = generatePairOrder();
      const pairSideOrder = generateSideOrder();

      // 2. Persist session row in Supabase
      const sessionId = await createSession({
        participant_role: role.trim(),
        report_order: reportOrder,
        pair_order: pairOrder,
        pair_side_order: pairSideOrder,
        current_step: 'stufe1',
      });

      // 3. Initialise Zustand store → wizard advances to 'stufe1'
      initSession(role.trim(), sessionId, reportOrder, pairOrder, pairSideOrder);
    } catch (err) {
      console.error('Session creation failed:', err);
      setError(
        'Die Sitzung konnte nicht gestartet werden. Bitte versuche es erneut.'
      );
      setIsSubmitting(false);
    }
  }

  // Allow Enter key to submit when form is complete
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && canSubmit) {
      handleStart();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-4 py-16">
      <div
        className="w-full max-w-xl rounded-2xl bg-white px-8 py-10 shadow-lg ring-1 ring-gray-100 sm:px-12 sm:py-14"
        onKeyDown={handleKeyDown}
      >

        {/* ── Heading ─────────────────────────────────────────── */}
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
          Herzlich willkommen
        </h1>
        <div className="mb-8 h-1 w-12 rounded-full bg-blue-500" />

        {/* ── Briefing text ────────────────────────────────────── */}
        <div className="mb-10 space-y-4 text-[15px] leading-7 text-gray-600">
          <p>
            Vielen Dank, dass du dir Zeit nimmst! Im Rahmen meiner Masterarbeit
            untersuche ich, wie die visuelle Gestaltung von
            Management-Berichten die Informationsaufnahme beeinflusst. Deine
            Einschätzung als Fachperson ist dabei besonders wertvoll.
          </p>
          <p>
            <strong className="text-gray-700">Wichtig:</strong> Wir testen
            nicht dich, sondern die Berichte. Es gibt keine falschen
            Antworten — wenn etwas schwer zu erkennen ist, ist genau das ein
            wichtiges Ergebnis.
          </p>
          <p className="font-medium text-gray-700">
            Das Interview besteht aus drei Teilen:
          </p>
          <ol className="list-decimal ml-5 space-y-1.5">
            <li>
              <strong>Bildpaare</strong> — Du siehst nacheinander zwei
              Diagramm-Varianten und beantwortest jeweils eine kurze
              Frage dazu.
            </li>
            <li>
              <strong>Berichtsanalyse</strong> — Du arbeitest mit einem
              Controlling-Bericht und beantwortest sechs Analysefragen.
            </li>
            <li>
              <strong>Bewertung</strong> — Abschließend ein paar kurze Fragen
              zu deinen Eindrücken.
            </li>
          </ol>
          <p className="text-sm text-gray-400">
            Geschätzte Dauer: ca. 15–20 Minuten
          </p>
        </div>

        {/* ── Role input ───────────────────────────────────────── */}
        <div className="mb-6">
          <label
            htmlFor="participant-role"
            className="mb-1.5 block text-sm font-semibold text-gray-700"
          >
            Deine Rolle im Unternehmen
          </label>
          <input
            id="participant-role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="z.B. Controller, Teamleiter Controlling"
            disabled={isSubmitting}
            autoComplete="off"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400
                       shadow-sm transition-shadow duration-150
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:shadow-md
                       disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {/* ── Privacy checkbox ─────────────────────────────────── */}
        <div className="mb-8">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition-colors hover:bg-blue-50 hover:border-blue-200">
            <input
              type="checkbox"
              checked={privacyChecked}
              onChange={(e) => setPrivacyChecked(e.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-gray-300 text-blue-600
                         focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed"
            />
            <span className="text-sm leading-6 text-gray-600">
              Ich habe die{' '}
              <a
                href="/datenschutz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
                onClick={(e) => e.stopPropagation()}
              >
                Datenschutzhinweise
              </a>{' '}
              gelesen und stimme der Teilnahme freiwillig zu. Ich kann
              jederzeit ohne Angabe von Gründen abbrechen.
            </span>
          </label>
        </div>

        {/* ── Error message ────────────────────────────────────── */}
        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* ── Submit button ────────────────────────────────────── */}
        <button
          onClick={handleStart}
          disabled={!canSubmit}
          className="w-full rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md
                     transition-all duration-150
                     hover:bg-blue-700 hover:shadow-lg active:scale-[0.99]
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
                     disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Starte …
            </span>
          ) : (
            'Interview starten'
          )}
        </button>

        {/* ── Legal link ──────────────────────────────────────── */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <a
            href="/datenschutz"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Datenschutz &amp; Impressum
          </a>
        </div>
      </div>
    </div>
  );
}
