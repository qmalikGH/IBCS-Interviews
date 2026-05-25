// ============================================================
// IBCS Interview Tool — Stufe 2: Report Task Configurations
// 6 Tasks in fixed order: K1, K2, V2, K3, V1, V3
//
// Between-subjects design: each participant sees ONE report
// (native OR IBCS). The tool auto-navigates to the correct
// PBI page per task via the pageName URL parameter.
//
// Task ordering rationale:
//   K1  overview   — identify top deviations
//   K2  overview   — extract key message (same view)
//   V2  overview   — forecast accuracy (same view, FC data visible)
//   K3  pc_detail  — drill into cost position detail
//   V1  pc_detail  — temporal pattern recognition (same view)
//   V3  costcentre — cost-centre localisation
//
// PBI page mapping (extracted via Puppeteer):
//   Native report: 1 page  → f5b1b0517e69b4e06d1e ("AC vs Plan")
//   IBCS report:   3 pages → B1 (overview), B2 (PC-Aufriss), B3 (Detail)
//   A1/A2 in IBCS report are not used.
// ============================================================

export interface TaskOption {
  id: string;
  label: string;
}

export interface TaskConfig {
  id: string;                  // 'K1', 'K2', 'V2', 'K3', 'V1', 'V3'
  questionText: string;
  questionType: 'mc';
  options: TaskOption[];
  correctAnswer: string;
  hasTimer: boolean;
  viewId: string;              // logical view name (for debugging / grouping)
  nativePageName: string;      // hex pageName in native PBI report
  ibcsPageName: string;        // hex pageName in IBCS PBI report
}

// ── PBI page names (hex objectNames) ─────────────────────────
// Native report has a single page for all tasks.
// IBCS report has 3 relevant pages (B1, B2, B3).

const NATIVE_PAGE = 'f5b1b0517e69b4e06d1e';   // "AC vs Plan" — only page

const IBCS_B1 = '124f63ba66aafec5c3d2';        // Überblick (PC-Ebene)
const IBCS_B2 = '253c4d393b7f849fe6bc';        // PC-Aufriss (Positionen + Zeitlinie)
const IBCS_B3 = '44ddca7ff7b50a355f09';        // Detailanalyse (Kostenstellen)

// ── Fixed task order (no shuffle) ────────────────────────────

export const stufe2Tasks: TaskConfig[] = [
  // ── K1 → overview (B1) ────────────────────────────────────
  {
    id: 'K1',
    questionText:
      'Welche zwei Profit-Center belasten das Ergebnis am stärksten gegenüber Plan, und wie hoch ist die Gesamtabweichung?',
    questionType: 'mc',
    options: [
      {
        id: 'K1_A',
        label:
          'Kundenservice (+1.894 TEUR) und Zahlungsverkehr (+498 TEUR); gesamt +1.573 TEUR (+4,8 %)',
      },
      {
        id: 'K1_B',
        label:
          'Kreditbearbeitung (−19,2 %) und Kundenservice (+4,8 %); gesamt −14,4 %',
      },
      {
        id: 'K1_C',
        label:
          'Zahlungsverkehr (+498 TEUR) und Kreditbearbeitung (−1.819 TEUR); gesamt −1.321 TEUR',
      },
      {
        id: 'K1_D',
        label:
          'Kundenservice (+1.894 TEUR) und Privatkundengeschäft (+320 TEUR); gesamt +2.214 TEUR',
      },
      {
        id: 'K1_E',
        label:
          'Zahlungsverkehr (+498 TEUR) und Privatkundengeschäft (+320 TEUR); gesamt +818 TEUR',
      },
    ],
    correctAnswer: 'K1_A',
    hasTimer: true,
    viewId: 'overview',
    nativePageName: NATIVE_PAGE,
    ibcsPageName: IBCS_B1,
  },

  // ── K2 → overview (B1, same page — no iframe reload) ──────
  {
    id: 'K2',
    questionText:
      '20 Sekunden in der Vorstandssitzung — was ist die Kernbotschaft dieses Monatsberichts?',
    questionType: 'mc',
    options: [
      {
        id: 'K2_A',
        label:
          'Aufwand +4,8 % über Plan, getrieben von Kundenservice (Personal); Kreditbearbeitung entlastet (−19,2 %)',
      },
      {
        id: 'K2_B',
        label:
          'Kreditbearbeitung stark unter Plan; alle anderen Profit-Center im grünen Bereich',
      },
      {
        id: 'K2_C',
        label:
          'Gesamtkosten gestiegen, Forecast für Q4 optimistisch, kein Handlungsbedarf',
      },
      {
        id: 'K2_D',
        label:
          'Zahlungsverkehr und Privatkundengeschäft übersteigen Plan; Kreditbearbeitung kompensiert teilweise',
      },
      {
        id: 'K2_E',
        label:
          'Personalaufwand insgesamt +8,4 % über Plan; Sachaufwand leicht unter Plan',
      },
    ],
    correctAnswer: 'K2_A',
    hasTimer: true,
    viewId: 'overview',
    nativePageName: NATIVE_PAGE,
    ibcsPageName: IBCS_B1,
  },

  // ── V2 → overview (B1, FC data on same page) ─────────────
  {
    id: 'V2',
    questionText:
      'Wie treffsicher war der Forecast — bei welchem Profit-Center lag er am weitesten daneben?',
    questionType: 'mc',
    options: [
      {
        id: 'V2_A',
        label:
          'Kundenservice (+1.181 TEUR über FC); Kreditbearbeitung am treffsichersten',
      },
      {
        id: 'V2_B',
        label:
          'Zahlungsverkehr (+742 TEUR über FC); Privatkundengeschäft am treffsichersten',
      },
      {
        id: 'V2_C',
        label:
          'Kreditbearbeitung (−890 TEUR unter FC); Kundenservice am treffsichersten',
      },
      {
        id: 'V2_D',
        label:
          'Privatkundengeschäft (+530 TEUR über FC); Zahlungsverkehr am treffsichersten',
      },
      {
        id: 'V2_E',
        label:
          'Alle Profit-Center lagen innerhalb von ±200 TEUR zum Forecast',
      },
    ],
    correctAnswer: 'V2_A',
    hasTimer: true,
    viewId: 'overview',
    nativePageName: NATIVE_PAGE,
    ibcsPageName: IBCS_B1,
  },

  // ── K3 → pc_detail (B2, UPDATED: zweitgrößter Treiber) ───
  {
    id: 'K3',
    questionText:
      'Personalaufwand ist der größte Treiber der Planüberschreitung bei Kundenservice. Welche Aufwandsposition ist der zweitgrößte Treiber?',
    questionType: 'mc',
    options: [
      { id: 'K3_A', label: 'Sachaufwand IT (+397 TEUR)' },
      { id: 'K3_B', label: 'Abschreibungen (+235 TEUR)' },
      { id: 'K3_C', label: 'Sonstige Sachaufwendungen (+189 TEUR)' },
      { id: 'K3_D', label: 'Raumkosten (+142 TEUR)' },
      { id: 'K3_E', label: 'Fremdleistungen (+98 TEUR)' },
    ],
    correctAnswer: 'K3_A',
    hasTimer: true,
    viewId: 'pc_detail',
    nativePageName: NATIVE_PAGE,
    ibcsPageName: IBCS_B2,
  },

  // ── V1 → pc_detail (B2, temporal pattern — same view) ─────
  {
    id: 'V1',
    questionText:
      'Ist die Überschreitung bei Kundenservice über das Jahr konstant oder baut sie sich auf — ab wann?',
    questionType: 'mc',
    options: [
      {
        id: 'V1_A',
        label: 'Aufbau ab Juni, dauerhaft hoch ab September',
      },
      {
        id: 'V1_B',
        label: 'Konstant hoch das gesamte Jahr über',
      },
      {
        id: 'V1_C',
        label: 'Sprunghafter Anstieg im Oktober, danach konstant',
      },
      {
        id: 'V1_D',
        label: 'Aufbau ab März, kurze Entspannung im Sommer',
      },
      {
        id: 'V1_E',
        label: 'Erst in Q4 signifikant über Plan',
      },
    ],
    correctAnswer: 'V1_A',
    hasTimer: true,
    viewId: 'pc_detail',
    nativePageName: NATIVE_PAGE,
    ibcsPageName: IBCS_B2,
  },

  // ── V3 → costcentre (B3, cost-centre localisation) ────────
  {
    id: 'V3',
    questionText:
      'Lokalisiere die Kostenstelle hinter der Personalüberschreitung bei Kundenservice.',
    questionType: 'mc',
    options: [
      {
        id: 'V3_A',
        label: 'Inbound (KS-110) +495 TEUR, dann Backoffice (KS-112) +294 TEUR',
      },
      {
        id: 'V3_B',
        label: 'Backoffice (KS-112) +612 TEUR, Inbound (KS-110) ausgeglichen',
      },
      {
        id: 'V3_C',
        label: 'Reklamationsbearbeitung (KS-115) +781 TEUR dominiert',
      },
      {
        id: 'V3_D',
        label: 'Gleichmäßig verteilt über alle Kostenstellen im Kundenservice',
      },
      {
        id: 'V3_E',
        label: 'Outbound (KS-111) +490 TEUR und Inbound (KS-110) +394 TEUR',
      },
    ],
    correctAnswer: 'V3_A',
    hasTimer: true,
    viewId: 'costcentre',
    nativePageName: NATIVE_PAGE,
    ibcsPageName: IBCS_B3,
  },
];

// ── Helper: get task by id ─────────────────────────────────────
export function getTaskById(id: string): TaskConfig | undefined {
  return stufe2Tasks.find((t) => t.id === id);
}
