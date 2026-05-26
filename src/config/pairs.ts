// ============================================================
// IBCS Interview Tool — Stufe 1: Element Pair Configurations
// 8 Pairs (P1–P8), each comparing a native vs. IBCS visual
//
// Visuals are shown as Power BI iframe embeds. All 16 pages
// live in ONE Publish-to-Web report. Each page is addressed
// via the `pageName` URL parameter (hex objectName from PBI).
//
// Page names were extracted via Puppeteer from the PBI
// modelsAndExploration API endpoint (see scripts/extract-pbi-pages.mjs).
// ============================================================

export interface PairOption {
  id: string;
  label: string;
}

export interface PairConfig {
  id: string;                    // 'P1', 'P2', ...
  rule: string;                  // 'D-06', 'D-03', ...
  questionText: string;          // The question shown to participant
  questionType: 'mc' | 'preference' | 'estimation';
  options?: PairOption[];        // MC options (undefined for preference/estimation)
  optionsBySide?: { native: PairOption[]; ibcs: PairOption[] };  // side-specific MC options (overrides options)
  correctAnswer?: string;        // correct option id (undefined for preference)
  nativePageName: string;        // Power BI page name for native visual
  ibcsPageName: string;          // Power BI page name for IBCS visual
  hasTimer: boolean;             // false only for P2
  nativeDataSlice: string;       // e.g. "alle Märkte 2022"
  ibcsDataSlice: string;         // e.g. "alle Märkte 2023"
  specialInstructions?: string;  // e.g. scenario notation explanation for P3
}

// ── Power BI report base URL (Stufe 1) ──────────────────────
// ONE report with 16 pages (P1–P8, each native + IBCS).
// Stufe 2 uses two separate reports (native / IBCS) — those
// are configured in tasks.ts / the store.

export const PBI_STUFE1_BASE =
  process.env.NEXT_PUBLIC_PBI_STUFE1_URL ||
  'https://app.powerbi.com/view?r=eyJrIjoiNzMyOTgxZmYtYmUzOC00MzBlLThlNWYtMzVlNTRjMDhkODFkIiwidCI6IjY2ODRlOGQ2LWFlMDItNDk2OS1hZjZiLTcyZDU4MzNjZmQ3OSJ9';

/**
 * Build a Power BI embed URL for a specific page.
 * Hides navigation pane, filter pane, and action bar so the
 * participant sees only the single visual.
 */
export function buildPbiPageUrl(baseUrl: string, pageName: string): string {
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}pageName=${encodeURIComponent(pageName)}&navContentPaneEnabled=false&filterPaneEnabled=false&actionBarEnabled=false`;
}

/**
 * Strip any existing `pageName` parameter from a PBI URL.
 * Useful when the env-configured base URL already contains a
 * default pageName that needs to be replaced per-task.
 */
export function stripPageName(url: string): string {
  return url.replace(/[&?]pageName=[^&]*/g, '');
}

export const pairs: PairConfig[] = [
  // ── P1: D-06 — Kreisdiagramm vs. sortiertes Ranking ─────────
  {
    id: 'P1',
    rule: 'D-06',
    questionText: 'Welche Kostenstelle hat die zweithöchsten Ist-Kosten?',
    questionType: 'mc',
    options: [
      { id: 'P1_A', label: 'Vertrieb' },
      { id: 'P1_B', label: 'Marketing' },
      { id: 'P1_C', label: 'Logistik' },
      { id: 'P1_D', label: 'Finanzen' },
      { id: 'P1_E', label: 'Forschung und Entwicklung' },
    ],
    correctAnswer: 'P1_B',  // overridden per side in session logic
    nativePageName: '4c2a70080acd11ff91ca',  // P1 Nativ
    ibcsPageName:   '957fd5a114a40fe1f886',  // P1 IBCS
    hasTimer: true,
    nativeDataSlice: 'alle Märkte 2022',
    ibcsDataSlice: 'alle Märkte 2023',
  },

  // ── P2: D-03 — Farbsemantik (türkis/blau vs. blau/rot) ──────
  {
    id: 'P2',
    rule: 'D-03',
    questionText:
      'Welche Farbcodierung erkennst du schneller als gut/schlecht?',
    questionType: 'preference',
    nativePageName: 'f9751b77db465041e777',  // P2 Nativ
    ibcsPageName:   '0757c919640c86fec536',  // P2 IBCS
    hasTimer: false,
    nativeDataSlice: 'alle Märkte 2022',
    ibcsDataSlice: 'alle Märkte 2022',
  },

  // ── P3: D-08 — Vollfarben vs. Szenarionotation ───────────────
  {
    id: 'P3',
    rule: 'D-08',
    questionText:
      'Bei welcher Kostenstelle liegt der Ist am weitesten über Plan?',
    questionType: 'mc',
    options: [
      { id: 'P3_A', label: 'Marketing' },
      { id: 'P3_B', label: 'Finanzen' },
      { id: 'P3_C', label: 'Logistik' },
      { id: 'P3_D', label: 'Vertrieb' },
      { id: 'P3_E', label: 'Personal' },
      { id: 'P3_F', label: 'Forschung und Entwicklung' },
    ],
    correctAnswer: 'P3_A',  // overridden per side in session logic
    nativePageName: '6aae964700b7bd4c7d38',  // P3 Nativ
    ibcsPageName:   '1da800e529237f76448a',  // P3 IBCS
    hasTimer: true,
    nativeDataSlice: 'North America 2023',
    ibcsDataSlice: 'Europe 2023',
    specialInstructions:
      'Legende zur Szenarionotation: Gefüllt = Ist, Umrandet = Plan, Schraffiert = Forecast',
  },

  // ── P4: D-02 — Zahlenmatrix vs. grafische Tabelle ────────────
  {
    id: 'P4',
    rule: 'D-02',
    questionText:
      'Wie hoch ist die Abweichung von Versorgungskosten gegenüber Plan?',
    questionType: 'mc',
    options: [
      { id: 'P4_A', label: '−7,6 M' },
      { id: 'P4_B', label: '+0,3 M' },
      { id: 'P4_C', label: '+2,7 M' },
      { id: 'P4_D', label: '−1,6 M' },
      { id: 'P4_E', label: '−0,4 M' },
    ],
    correctAnswer: 'P4_A',  // overridden per side in session logic
    nativePageName: '7cfae543781bbc1d9a04',  // P4 Nativ
    ibcsPageName:   '587771a088697b72c87d',  // P4 IBCS
    hasTimer: true,
    nativeDataSlice: 'alle Märkte 2022',
    ibcsDataSlice: 'alle Märkte 2023',
  },

  // ── P5: D-11 — Abgeschnittene Achse vs. Nullbasislinie ───────
  {
    id: 'P5',
    rule: 'D-11',
    questionText:
      'Um wie viel Prozent höher liegen die Kosten des führenden Marktes gegenüber dem zweiten?',
    questionType: 'estimation',
    nativePageName: '454573bc82a0321f1454',  // P5 Nativ
    ibcsPageName:   '36670bf17b0c522b368a',  // P5 IBCS
    hasTimer: true,
    nativeDataSlice: 'Europe vs. North America 2022',
    ibcsDataSlice: 'North America vs. Africa 2023',
  },

  // ── P6: D-04 — Ohne vs. mit Kommentarfeld ───────────────────
  {
    id: 'P6',
    rule: 'D-04',
    questionText:
      'Welche Kostenstelle weicht am stärksten vom Plan ab — und wie groß ist die Abweichung?',
    questionType: 'mc',
    optionsBySide: {
      native: [
        { id: 'P6_native_1', label: 'Marketing, −72,3 M' },
        { id: 'P6_native_2', label: 'Vertrieb, −56,9 M' },
        { id: 'P6_native_3', label: 'Finanzen, −54,5 M' },
        { id: 'P6_native_4', label: 'Logistik, −9,6 M' },
        { id: 'P6_native_5', label: 'Personal, −5,6 M' },
      ],
      ibcs: [
        { id: 'P6_ibcs_1', label: 'Vertrieb, −20,2 M' },
        { id: 'P6_ibcs_2', label: 'Finanzen, +5,4 M' },
        { id: 'P6_ibcs_3', label: 'Marketing, +3,1 M' },
        { id: 'P6_ibcs_4', label: 'F&E, −0,3 M' },
        { id: 'P6_ibcs_5', label: 'Logistik, +0,2 M' },
      ],
    },
    correctAnswer: 'P6_native_1',  // overridden per side in session logic
    nativePageName: '8cd2da11605414f1ddf2',  // P6 Nativ
    ibcsPageName:   '5798cd9d5def45edb15e',  // P6 IBCS
    hasTimer: true,
    nativeDataSlice: 'North America 2023',
    ibcsDataSlice: 'alle Märkte 2023',
  },

  // ── P7: D-06 — Tacho vs. Karte/Bullet Chart ─────────────────
  {
    id: 'P7',
    rule: 'D-06',
    questionText:
      'Liegt der Aufwand über oder unter Plan — und wie deutlich?',
    questionType: 'mc',
    options: [
      { id: 'P7_A', label: '+2,4 % über Plan' },
      { id: 'P7_B', label: '−2,6 % unter Plan' },
      { id: 'P7_C', label: '+5,1 % über Plan' },
      { id: 'P7_D', label: '−0,8 % unter Plan' },
      { id: 'P7_E', label: 'Exakt auf Plan (±0 %)' },
    ],
    correctAnswer: 'P7_A',  // overridden per side in session logic
    nativePageName: 'b9c1d6e06ce42a38d992',  // P7 Nativ
    ibcsPageName:   '9953a3d870efb0214c05',  // P7 IBCS
    hasTimer: true,
    nativeDataSlice: 'Marketing 2023',
    ibcsDataSlice: 'F&E 2023',
  },

  // ── P8: D-13 — Spaghetti-Linie vs. Small Multiples ──────────
  {
    id: 'P8',
    rule: 'D-13',
    questionText:
      'Welche Kostenstelle senkt ihren Aufwand über das Jahr am deutlichsten?',
    questionType: 'mc',
    options: [
      { id: 'P8_A', label: 'Marketing' },
      { id: 'P8_B', label: 'Logistik' },
      { id: 'P8_C', label: 'Vertrieb' },
      { id: 'P8_D', label: 'Finanzen' },
      { id: 'P8_E', label: 'Forschung und Entwicklung' },
    ],
    correctAnswer: 'P8_A',  // overridden per side in session logic
    nativePageName: 'edc0d9bda398024ee3ee',  // P8 Nativ
    ibcsPageName:   'cf853cfce0c73ae538bd',  // P8 IBCS
    hasTimer: true,
    nativeDataSlice: 'alle Märkte 2022',
    ibcsDataSlice: 'alle Märkte 2023',
  },
];

// ── Per-side correct answers ──────────────────────────────────

export interface SideAnswers {
  native: string;
  ibcs: string;
}

export const pairSideAnswers: Record<string, SideAnswers> = {
  P1: { native: 'P1_B', ibcs: 'P1_A' },
  P2: { native: 'preference', ibcs: 'preference' },
  P3: { native: 'P3_A', ibcs: 'P3_B' },
  P4: { native: 'P4_A', ibcs: 'P4_B' },
  P5: { native: 'estimation', ibcs: 'estimation' },
  P6: { native: 'P6_native_1', ibcs: 'P6_ibcs_1' },
  P7: { native: 'P7_A', ibcs: 'P7_B' },
  P8: { native: 'P8_A', ibcs: 'P8_B' },
};

// ── Helper: get pair by id ─────────────────────────────────────
export function getPairById(id: string): PairConfig | undefined {
  return pairs.find((p) => p.id === id);
}
