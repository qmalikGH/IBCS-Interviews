'use client';

// ============================================================
// IBCS Interview Tool — OnboardingStep
// Three-page briefing between Welcome and Stufe 1.
// Explains the study format and IBCS reading conventions.
// ============================================================

import { useState } from 'react';
import { useStore } from '@/lib/store';

type OnboardingPage = 1 | 2 | 3;

export default function OnboardingStep() {
  const setPhase = useStore((s) => s.setPhase);
  const [page, setPage] = useState<OnboardingPage>(1);

  function handleNext() {
    if (page < 3) {
      setPage((page + 1) as OnboardingPage);
    } else {
      setPhase('stufe1');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-4 py-16">
      <div className="w-full max-w-2xl rounded-2xl bg-white px-8 py-10 shadow-lg ring-1 ring-gray-100 sm:px-12 sm:py-14">

        {/* ── Page dots ──────────────────────────────────────── */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={[
                'h-2 rounded-full transition-all duration-300',
                n === page ? 'w-8 bg-blue-500' : 'w-2 bg-gray-200',
              ].join(' ')}
            />
          ))}
        </div>

        {/* ── Page 1 — Was dich erwartet ─────────────────────── */}
        {page === 1 && (
          <>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
              Was dich erwartet
            </h2>
            <div className="mb-6 h-1 w-10 rounded-full bg-blue-500" />

            <div className="space-y-4 text-[15px] leading-7 text-gray-600">
              <p>
                Diese Studie vergleicht zwei Berichtsformate aus dem
                Cost-Controlling miteinander. Du arbeitest in drei kurzen
                Abschnitten:
              </p>
              <ol className="list-decimal ml-5 space-y-1.5">
                <li>
                  <strong className="text-gray-700">Acht Vergleichspaare</strong> —
                  jeweils dieselbe Information in zwei unterschiedlichen
                  Darstellungen.
                </li>
                <li>
                  <strong className="text-gray-700">Ein vollständiger Bericht</strong> mit
                  sechs Analyseaufgaben.
                </li>
                <li>
                  <strong className="text-gray-700">Ein paar Abschlussfragen</strong> zu
                  deinem Eindruck.
                </li>
              </ol>
              <p>
                Beantworte jede Frage nach bestem Wissen. Wenn dir eine
                Antwort nicht eindeutig erscheint, entscheide dich nach
                Bauchgefühl — genau dieser Eindruck ist Teil dessen, was
                wir untersuchen.
              </p>
              <p className="font-medium text-gray-700">
                Wichtig: Es geht nicht um deine Person, sondern um die
                Berichte.
              </p>
            </div>
          </>
        )}

        {/* ── Page 2 — Die beiden Formate ────────────────────── */}
        {page === 2 && (
          <>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
              Die beiden Formate
            </h2>
            <div className="mb-6 h-1 w-10 rounded-full bg-blue-500" />

            <div className="space-y-4 text-[15px] leading-7 text-gray-600">
              <p>
                In den Vergleichen siehst du zwei unterschiedliche
                Darstellungswelten. Sie tragen jeweils nur die Bezeichnung
                &ldquo;Darstellung A&rdquo; und &ldquo;Darstellung B&rdquo; —
                welche Welt sich dahinter verbirgt, ist für die Beantwortung
                egal.
              </p>

              {/* Format card: Native */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                  Die herkömmliche Darstellung
                </p>
                <p className="text-sm leading-6 text-gray-600">
                  Klassische Power-BI-Visualisierungen, wie du sie aus
                  alltäglichen Dashboards kennst: Donut-Diagramme,
                  Tacho-Anzeigen, KPI-Kacheln, Linien- und Säulendiagramme
                  mit Default-Farben.
                </p>
              </div>

              {/* Format card: IBCS */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-400">
                  Die IBCS-konforme Darstellung
                </p>
                <p className="text-sm leading-6 text-gray-600">
                  Eine Darstellung nach den International Business
                  Communication Standards (Hichert). Sie nutzt einige
                  besondere Lesekonventionen, die du auf der nächsten Seite
                  kurz kennenlernst — auch wenn du sie noch nie gesehen hast,
                  reicht die kurze Einführung aus.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── Page 3 — IBCS-Lesehilfen ───────────────────────── */}
        {page === 3 && (
          <>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
              IBCS-Lesehilfen
            </h2>
            <div className="mb-6 h-1 w-10 rounded-full bg-blue-500" />

            <p className="mb-5 text-[15px] leading-7 text-gray-600">
              In den IBCS-Visuals gelten vier Konventionen, die du im
              Hinterkopf behalten solltest:
            </p>

            <div className="space-y-4">
              {/* Convention 1: Szenarionotation */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-gray-500">
                  ▸ Szenarionotation
                </p>
                <ul className="space-y-1 text-sm leading-6 text-gray-600">
                  <li><strong className="text-gray-700">Volle Füllung</strong> → Ist (was tatsächlich passiert ist)</li>
                  <li><strong className="text-gray-700">Umrandung</strong> → Plan</li>
                  <li><strong className="text-gray-700">Schraffur</strong> → Forecast / Hochrechnung</li>
                </ul>
              </div>

              {/* Convention 2: Abweichungsfarben */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-gray-500">
                  ▸ Abweichungsfarben
                </p>
                <ul className="space-y-1 text-sm leading-6 text-gray-600">
                  <li><span className="inline-block h-3 w-3 rounded-sm bg-red-500 mr-2 align-middle" /><strong className="text-gray-700">Rot</strong> → ungünstige Abweichung (bei Kosten: über Plan)</li>
                  <li><span className="inline-block h-3 w-3 rounded-sm bg-blue-500 mr-2 align-middle" /><strong className="text-gray-700">Blau</strong> → günstige Abweichung (bei Kosten: unter Plan)</li>
                </ul>
              </div>

              {/* Convention 3: Grafische Tabellen */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-gray-500">
                  ▸ Grafische Tabellen
                </p>
                <p className="text-sm leading-6 text-gray-600">
                  Eine Tabellenzeile zeigt nicht nur Zahlen, sondern auch
                  kleine Balken, die die Größe und Richtung der Abweichung
                  auf einen Blick sichtbar machen.
                </p>
              </div>

              {/* Convention 4: Botschaftsfeld */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-gray-500">
                  ▸ Botschaftsfeld
                </p>
                <p className="text-sm leading-6 text-gray-600">
                  Manche Berichte beginnen mit einem kurzen Satz, der die
                  wichtigste Aussage des Monats zusammenfasst.
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm text-gray-400 italic">
              Bei einem der Vergleichspaare wird die Szenarionotation noch
              einmal kurz wiederholt — du musst sie also jetzt nicht
              auswendig lernen.
            </p>
          </>
        )}

        {/* ── Navigation button ──────────────────────────────── */}
        <button
          onClick={handleNext}
          className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md
                     transition-all duration-150
                     hover:bg-blue-700 hover:shadow-lg active:scale-[0.99]
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
        >
          {page < 3 ? (
            <span className="flex items-center justify-center gap-2">
              Weiter
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Vergleiche starten
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
