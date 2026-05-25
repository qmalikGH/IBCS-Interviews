'use client';

// ============================================================
// IBCS Interview Tool — AltReportPreview
// Shown between stufe2_tasks and stufe3.
//
// Displays the ALTERNATIVE report (the one the participant did
// NOT work with during the timed tasks) so they can form a
// preference before answering the Stufe 3 feedback questions.
//
// Full-screen layout, no timer, no tasks — just the iframe
// and a "Weiter" button.
// ============================================================

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { buildPbiPageUrl, stripPageName } from '@/config/pairs';

// ── Power BI base URLs (Stufe 2 reports) ────────────────────

const NATIVE_REPORT_BASE = stripPageName(
  process.env.NEXT_PUBLIC_PBI_NATIVE_URL ||
    'https://app.powerbi.com/view?r=PLACEHOLDER_NATIVE',
);

const IBCS_REPORT_BASE = stripPageName(
  process.env.NEXT_PUBLIC_PBI_IBCS_URL ||
    'https://app.powerbi.com/view?r=PLACEHOLDER_IBCS',
);

// Page name for overview — default landing page for the preview.
// Native report has a single page; IBCS shows B1 (Überblick).
const ALT_OVERVIEW_PAGE: Record<'native' | 'ibcs', string> = {
  native: 'f5b1b0517e69b4e06d1e',   // "AC vs Plan" — only page
  ibcs:   '124f63ba66aafec5c3d2',    // B1 — Überblick (PC-Ebene)
};

// ── Component ─────────────────────────────────────────────────

export default function AltReportPreview() {
  const reportOrder = useStore((s) => s.reportOrder);
  const nextStep    = useStore((s) => s.nextStep);

  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Show the OTHER report (opposite of the assigned one)
  const isNativeAssigned =
    reportOrder === 'native_first' || reportOrder === null;

  const altBaseUrl: string =
    isNativeAssigned ? IBCS_REPORT_BASE : NATIVE_REPORT_BASE;

  const altType: 'native' | 'ibcs' =
    isNativeAssigned ? 'ibcs' : 'native';

  const altPageName = ALT_OVERVIEW_PAGE[altType];
  const iframeUrl   = buildPbiPageUrl(altBaseUrl, altPageName);

  return (
    <div className="flex h-screen w-full flex-col bg-[#f8f9fa]">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-8 py-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">
          Zum Vergleich: So sieht der alternative Bericht aus
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {altType === 'ibcs'
            ? 'Dies ist die IBCS-konforme Version des Berichts.'
            : 'Dies ist die native Power-BI-Version des Berichts.'}
          {' '}Schaue dir den Bericht in Ruhe an — es gibt keine Aufgaben und keine Zeitmessung.
        </p>
      </div>

      {/* ── PBI iframe (fills remaining space) ────────────── */}
      <div className="flex-1 relative bg-gray-200">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-100 z-10">
            <svg
              className="h-8 w-8 animate-spin text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <p className="text-sm text-gray-400">
              Alternativer Bericht wird geladen …
            </p>
          </div>
        )}
        <iframe
          src={iframeUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          title={`Alternative Report — ${altType}`}
          onLoad={() => setIframeLoaded(true)}
          className="absolute inset-0 h-full w-full"
        />
      </div>

      {/* ── Footer with "Weiter" button ──────────────────── */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-8 py-5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex justify-end">
          <button
            onClick={nextStep}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-md
                       transition-all duration-150 hover:bg-blue-700 hover:shadow-lg active:scale-95
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
          >
            Weiter zu den Bewertungsfragen
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
