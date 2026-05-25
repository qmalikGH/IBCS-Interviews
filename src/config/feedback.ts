// ============================================================
// IBCS Interview Tool — Stufe 3: Feedback Question Configurations
// Qualitative questions, Likert battery, preference, and open text
// ============================================================

export interface FeedbackOption {
  value: string;
  label: string;
}

export type FeedbackQuestionType =
  | 'likert5'
  | 'likert7'
  | 'preference'
  | 'freetext';

export interface FeedbackQuestion {
  id: string;
  questionText: string;
  type: FeedbackQuestionType;
  options?: FeedbackOption[];  // for likert scales and preference
  relatedRule?: string;        // D-01, D-03, etc.
  hint?: string;               // optional interviewer prompt or sub-label
}

// ── Standard Likert-5 scale (reusable) ───────────────────────
export const likert5Options: FeedbackOption[] = [
  { value: '1', label: '1 — Stimme überhaupt nicht zu' },
  { value: '2', label: '2 — Stimme eher nicht zu' },
  { value: '3', label: '3 — Neutral' },
  { value: '4', label: '4 — Stimme eher zu' },
  { value: '5', label: '5 — Stimme voll zu' },
];

// ── Standard Likert-7 scale (reusable) ───────────────────────
export const likert7Options: FeedbackOption[] = [
  { value: '1', label: '1 — Stimme überhaupt nicht zu' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4 — Neutral' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7 — Stimme voll zu' },
];

export const feedbackQuestions: FeedbackQuestion[] = [
  // ── Block A: Qualitative Einzelfragen (Likert 1–5) ───────────

  {
    id: 'FQ1',
    questionText:
      'Die Farbcodierung im IBCS-Bericht (Rot = über Plan, Grün = unter Plan) war für mich intuitiv verständlich.',
    type: 'likert5',
    options: likert5Options,
    relatedRule: 'D-03',
    hint: 'Farbsemantik',
  },

  {
    id: 'FQ2',
    questionText:
      'Das Botschaftsfeld (Kommentarzeile oben im Bericht) hat mir geholfen, die wichtigste Information sofort zu erfassen.',
    type: 'likert5',
    options: likert5Options,
    relatedRule: 'D-04',
    hint: 'Botschaftsfeld',
  },

  {
    id: 'FQ3',
    questionText:
      'Die Szenarionotation (gefüllt = Ist, umrandet = Plan, schraffiert = Forecast) war nach kurzer Erklärung leicht zu lesen.',
    type: 'likert5',
    options: likert5Options,
    relatedRule: 'D-08',
    hint: 'Szenarionotation',
  },

  {
    id: 'FQ4',
    questionText:
      'Das Hochformat des IBCS-Berichts (Porträt, A4) empfinde ich als angemessen für einen Monatsbericht.',
    type: 'likert5',
    options: likert5Options,
    relatedRule: 'A-08',
    hint: 'Folienformat',
  },

  {
    id: 'FQ5',
    questionText:
      'Ich konnte im IBCS-Bericht intuitiv von der Übersichtsseite in die Detailauswertungen navigieren (Drill-Pfad).',
    type: 'likert5',
    options: likert5Options,
    relatedRule: 'D-14',
    hint: 'Drill-Pfad / Navigation',
  },

  {
    id: 'FQ6',
    questionText:
      'Die klare Trennung zwischen "Was ist passiert?" (Ist-Welt) und "Was hätte passieren sollen?" (Plan-Welt) hat mir das Lesen erleichtert.',
    type: 'likert5',
    options: likert5Options,
    relatedRule: 'D-01',
    hint: 'Two-World-Prinzip',
  },

  // ── Block B: Likert-Batterie (5 Items, 1–5) ─────────────────

  {
    id: 'FB1',
    questionText:
      'Abweichungen vom Plan waren im IBCS-Bericht schneller erfassbar als im herkömmlichen Bericht.',
    type: 'likert5',
    options: likert5Options,
  },

  {
    id: 'FB2',
    questionText:
      'Die Farbsemantik im IBCS-Bericht war eindeutig und widerspruchsfrei.',
    type: 'likert5',
    options: likert5Options,
    relatedRule: 'D-03',
  },

  {
    id: 'FB3',
    questionText:
      'Das Botschaftsfeld hat den Kern der monatlichen Aussage gut getroffen.',
    type: 'likert5',
    options: likert5Options,
    relatedRule: 'D-04',
  },

  {
    id: 'FB4',
    questionText:
      'Ich konnte den IBCS-Bericht ohne fremde Hilfe selbstständig navigieren und lesen.',
    type: 'likert5',
    options: likert5Options,
  },

  {
    id: 'FB5',
    questionText:
      'Den IBCS-Bericht würde ich in meiner täglichen Arbeit nutzen wollen.',
    type: 'likert5',
    options: likert5Options,
  },

  // ── Block C: Präferenz-Frage ──────────────────────────────────

  {
    id: 'FP1',
    questionText:
      'Wenn du nur einen der beiden Berichte behalten könntest — welchen würdest du wählen?',
    type: 'preference',
    options: [
      { value: 'native', label: 'Den herkömmlichen Bericht (A)' },
      { value: 'ibcs',   label: 'Den IBCS-Bericht (B)' },
    ],
  },

  {
    id: 'FP1_reason',
    questionText: 'Warum hast du dich für diesen Bericht entschieden?',
    type: 'freetext',
    hint: 'Offene Begründung zur Präferenzentscheidung',
  },

  // ── Block D: Offene Abschlussfrage ────────────────────────────

  {
    id: 'FO1',
    questionText:
      'Was würdest du als Erstes am IBCS-Bericht ändern oder verbessern?',
    type: 'freetext',
    hint: 'Offene Abschlussfrage — keine Vorgaben',
  },
];

// ── Grouped views ─────────────────────────────────────────────
export const qualitativeFragen: FeedbackQuestion[] = feedbackQuestions.filter(
  (q) => q.id.startsWith('FQ'),
);
export const likertBatterie: FeedbackQuestion[] = feedbackQuestions.filter(
  (q) => q.id.startsWith('FB'),
);
export const praeferenzFragen: FeedbackQuestion[] = feedbackQuestions.filter(
  (q) => q.id.startsWith('FP'),
);
export const offeneFragen: FeedbackQuestion[] = feedbackQuestions.filter(
  (q) => q.id.startsWith('FO'),
);

// ── Helper: get question by id ────────────────────────────────
export function getFeedbackQuestionById(
  id: string,
): FeedbackQuestion | undefined {
  return feedbackQuestions.find((q) => q.id === id);
}
