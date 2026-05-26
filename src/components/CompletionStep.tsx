'use client';

// ============================================================
// IBCS Interview Tool — CompletionStep
// Final thank-you screen. Stamps completed_at via Supabase
// on mount and shows the session ID for follow-up reference.
// Shows a retry button if the completion call fails.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { completeSession } from '@/lib/supabase';

export default function CompletionStep() {
  const sessionId = useStore((s) => s.sessionId);
  const [done, setDone]     = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Complete session call ──────────────────────────────────
  const doComplete = useCallback(async () => {
    if (!sessionId || saving) return;

    setSaving(true);
    setError(null);

    try {
      await completeSession(sessionId);
      setDone(true);
    } catch (err: unknown) {
      console.error('completeSession error:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      // Do NOT set done=true — keep showing retry option
    } finally {
      setSaving(false);
    }
  }, [sessionId, saving]);

  // Run on mount
  useEffect(() => {
    doComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-4 py-12">
      <div className="w-full max-w-lg space-y-8 text-center">

        {/* Large animated checkmark */}
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50 shadow-lg">
          <svg
            className="h-14 w-14 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-label="Abgeschlossen"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Vielen Dank!
          </h1>
          <p className="text-lg text-gray-600">
            Deine Antworten wurden gespeichert.
          </p>
        </div>

        {/* Save status */}
        {saving && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Speichere Sitzungsdaten …
          </div>
        )}
        {done && !error && (
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            Sitzung erfolgreich abgeschlossen.
          </div>
        )}
        {error && !saving && (
          <div className="space-y-3">
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3">
              <p className="text-sm text-red-700">
                Sitzung konnte nicht abgeschlossen werden: {error}
              </p>
            </div>
            <button
              onClick={doComplete}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white
                         transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Erneut versuchen
            </button>
          </div>
        )}

        {/* Session ID */}
        {sessionId && (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm text-left">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Sitzungs-ID (für Rückfragen)
            </p>
            <p className="mt-2 break-all rounded-lg bg-gray-50 px-3 py-2 font-mono text-sm text-gray-600 border border-gray-100">
              {sessionId}
            </p>
          </div>
        )}

        {/* Legal link */}
        <div className="text-xs text-gray-400">
          <a
            href="/datenschutz"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Datenschutz &amp; Impressum
          </a>
        </div>

        {/* Closing note */}
        <p className="text-sm text-gray-400 italic">
          Du kannst dieses Fenster nun schließen.
        </p>
      </div>
    </div>
  );
}
