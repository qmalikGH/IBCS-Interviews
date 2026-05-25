# Design Spec: IBCS Interview-Tool

**Datum:** 2026-05-24
**Projekt:** Masterarbeit — IBCS-konforme Design-Richtlinien für Business Reports in Power BI
**Zweck:** Unmoderiertes Web-Tool zur summativen Evaluation der Designlinie (D-01…D-15)

---

## 1. Kontext & Ziel

Die Masterarbeit definiert 15 Design-Regeln (D-01–D-15) für IBCS-konforme Power BI-Berichte. Kapitel 6 (Evaluation) vergleicht einen linientreuen Bericht (Artefakt, Zebra BI) mit einer nativen Power BI-Baseline.

Das Interview-Tool automatisiert die Durchführung der Evaluation: Es führt Teilnehmer selbstständig durch alle Stufen, misst unsichtbar die Antwortzeiten, erfasst Antworten und speichert alles in einer Datenbank. Mehrere Teilnehmer können gleichzeitig arbeiten (z.B. Team-Event).

**Keine Moderation nötig.** Das Tool ersetzt den mündlichen Interview-Leitfaden vollständig.

---

## 2. Tech Stack

| Komponente | Technologie | Begründung |
|---|---|---|
| Frontend | **Next.js + React + TypeScript** | SPA-Wizard-Flow, einfaches Deployment |
| State Management | **Zustand** | Leichtgewichtig, kein Boilerplate |
| Datenbank | **Supabase (PostgreSQL)** | Kostenlos, Web-UI, CSV-Export, parallele Schreibzugriffe |
| Hosting | **Vercel** | Ein-Klick-Deployment, kostenloser Tier reicht |
| Styling | **Tailwind CSS** | Schnelles UI-Prototyping |

---

## 3. Architektur: Single-Page Wizard

Eine durchgehende Web-App mit linearem Flow. Ein Link, alle Phasen in einer Seite, kein Seitenwechsel. Der Teilnehmer kann nicht zurücknavigieren.

### 3.1 Phasenablauf

```
Willkommen → Stufe 1 (8 Duelle) → Stufe 2a (Bericht A) → Übergang → Stufe 2b (Bericht B) → Stufe 2c (Vertiefung) → Stufe 3 (Feedback) → Abschluss
```

### 3.2 Komponentenstruktur

```
App
├── WelcomeStep          — Begrüßung, Rollenangabe, Einverständnis
├── Stage1Controller     — Steuert 8 Duelle in randomisierter Reihenfolge
│   └── DuelStep         — Flow pro Paar: Frage → Visual A → Antwort → Visual B → Antwort → Präferenz → SEQ
├── TransitionStep       — Übergangsbildschirm zwischen Stufen/Berichten
├── Stage2Controller     — Steuert Bericht-Aufgaben
│   └── ReportTaskStep   — Layout: PBI-iframe links + Aufgabenpanel rechts
├── Stage3Controller     — Likert-Batterien, Präferenz, Freitext
│   └── LikertStep       — 5-Punkt-Skala pro Aussage
│   └── PreferenceStep   — "Welchen Bericht behalten?"
│   └── FreeTextStep     — Offene Fragen
├── CompletionStep       — Danke-Bildschirm
├── ProgressBar          — "Schritt X von Y" (global oben)
└── TimerService         — Unsichtbare Zeitmessung (kein UI)
```

---

## 4. Stufe 0: Willkommen

- Begrüßungstext (adaptiert aus dem Einführungsskript des Leitfadens, für Selbstlese-Format)
- **Rolle eingeben** (Freitextfeld, z.B. "Controller", "Teamleiter Controlling")
- Erklärung des Ablaufs (ohne Hinweis auf Zeitmessung)
- Datenschutzhinweis + Einverständnis-Checkbox
- Kein Timer, keine Datenerfassung außer Rolle

**Beim Absenden:**
- Session in Supabase anlegen
- Counterbalancing zuweisen (balanced random: prüft aktuelle Verteilung in DB)
- Paarreihenfolge + Visual-Seitenreihenfolge generieren und speichern

---

## 5. Stufe 1: Element-Duelle (P1–P8)

### 5.1 Datengrundlage

**Neutrale Cost-Management-Daten** (synthetisches Zebra-Datenmodell). Nicht die echten DKB-Daten — vermeidet Wiedererkennungs-/Spoiler-Effekt für Stufe 2.

### 5.2 Visual-Einbettung

**Screenshots (PNG)**. Keine iframes. Vorteile:
- Sofortige Anzeige (0ms Ladezeit)
- Keine Verzerrung der Zeitmessung durch Ladezeiten
- Gleiche Bedingungen für alle Teilnehmer
- Upgrade auf iframes jederzeit möglich (die URL-Struktur wird vorbereitet)

Bilder liegen in `/public/visuals/P1_native.png`, `/public/visuals/P1_ibcs.png` etc.

### 5.3 Randomisierung (doppelt)

1. **Paarreihenfolge:** P1–P8 werden pro Teilnehmer zufällig gemischt
2. **Visual-Seite:** Pro Paar wird zufällig entschieden, ob zuerst das native oder linientreue Visual gezeigt wird

Beides wird in der Session gespeichert (`pair_order`, `pair_side_order`).

### 5.4 Flow pro Paar (Standard: P1, P3, P4, P6, P7, P8)

1. **Frage anzeigen** — Teilnehmer liest die Aufgabe
2. Teilnehmer klickt "Visual anzeigen"
3. **Visual A erscheint** → Timer startet unsichtbar
4. **Multiple-Choice-Antwort** auswählen → Timer stoppt, Korrektheit automatisch bewertet
5. **Visual B erscheint** (gleiches Paar, anderer Datenschnitt) → Timer startet neu
6. **Multiple-Choice-Antwort** auswählen → Timer stoppt
7. **Präferenzfrage:** "Welche Darstellung war für dich eindeutiger?" → A / B
8. **SEQ** (1–7): "Wie einfach war es, die Aufgabe zu lösen?" (pro Visual, also 2× SEQ)

### 5.5 Sonderfälle

| Paar | Abweichung | Umsetzung im Tool |
|---|---|---|
| **P2** (D-03, Farbsemantik) | Nur Präferenz, kein Richtig/Falsch | Kein MC, kein Timer. Nur: "Welche Farbcodierung erkennst du schneller als gut/schlecht?" → A/B + SEQ |
| **P3** (D-08, Szenarionotation) | Vor linientreuem Visual Notation erklären | Einblendung: "Gefüllt = Ist, Umrandet = Plan, Schraffiert = Forecast" bevor das linientreue Visual gezeigt wird |
| **P5** (D-11, Nullachse) | Schätzung statt MC | Zahleneingabe (Slider oder Input): "Um wie viel % höher?" → Schätzwert wird gegen Sollwert verglichen |
| **P6** (D-04, Kommentare) | Faktenfrage + Präferenz | MC für Kostenstelle+Wert, dann zusätzlich Präferenz |

### 5.6 Neutrale Benennung

Dem Teilnehmer wird nie "nativ" oder "linientreu/IBCS" gezeigt. Die Visuals heißen "Darstellung A" und "Darstellung B". Welches A oder B ist, wird randomisiert und intern in der DB gemappt.

---

## 6. Stufe 2: Holistische Aufgaben (head-to-head)

### 6.1 Datengrundlage

**Echte DKB-Service-Daten**, GJ 2025, kumuliert (YTD Jan–Dez), TEUR. Zwei Power BI-Berichte:
- `Artefakt.pbix` (IBCS-konform, Zebra BI)
- `Evaluation_Standard.pbix` (native Power BI Baseline)

### 6.2 Einbettung

**Power BI iframe** via "Im Web veröffentlichen". Volle Interaktion: Seitenwechsel, Filter, Drill-Down, Tooltips. Der iframe nimmt ~70% der Bildschirmbreite ein, das Aufgabenpanel ~30% rechts daneben.

### 6.3 Counterbalancing

Zufällige Zuweisung mit Balancierung: Das Tool prüft die aktuelle Verteilung in der DB (`SELECT report_order, COUNT(*) FROM sessions GROUP BY report_order`) und weist die unterrepräsentierte Variante zu.

- Gruppe A: Standard zuerst → Artefakt
- Gruppe B: Artefakt zuerst → Standard

Dem Teilnehmer werden die Berichte als "Bericht A" / "Bericht B" gezeigt.

### 6.4 Aufgaben

**Block 1 + Block 2** (gleiche Aufgaben, anderer Bericht):

| Aufgabe | Frage (gekürzt) | Korrekte Antwort | Gemessen |
|---|---|---|---|
| K1 | Welche zwei Profit-Center belasten am stärksten ggü. Plan? | Kundenservice (+1.894) + Zahlungsverkehr (+498) | ⏱ + ✓ + SEQ |
| K2 | Kernbotschaft in 20 Sekunden? | Aufwand +4,8% über Plan, getrieben von Kundenservice (Personal) | ⏱ + ✓ + SEQ |
| K3 | Hauptursache der Überschreitung bei Kundenservice? | Personalaufwand (+884 TEUR) | ⏱ + ✓ + SEQ |
| V2 | Forecast-Genauigkeit — wo lag er am weitesten daneben? | Kundenservice (+1.181 über FC) | ⏱ + ✓ + SEQ |

**Vertiefung** (nur Artefakt):

| Aufgabe | Frage (gekürzt) | Korrekte Antwort | Gemessen |
|---|---|---|---|
| V1 | Überschreitung Kundenservice — konstant oder aufbauend? | Aufbau ab Juni, dauerhaft hoch ab September | ⏱ + ✓ + SEQ |
| V3 | Kostenstelle hinter Personalüberschreitung? | Inbound (KS-110) +495, Backoffice (KS-112) +294 | ⏱ + ✓ + SEQ |
| V4 | Optional (Gegensteuerung / Preis-Menge) | variabel | ⏱ + ✓ + SEQ |

### 6.5 Flow pro Aufgabe

1. **Aufgabe im Panel anzeigen** (Bericht bleibt sichtbar)
2. Teilnehmer klickt "Aufgabe starten" → Timer startet unsichtbar
3. Teilnehmer interagiert mit dem Bericht (Navigation, Filter, Drill-Down)
4. **Multiple-Choice-Antwort** im Panel auswählen → Timer stoppt
5. **SEQ** (1–7)
6. Nächste Aufgabe erscheint im Panel (Bericht bleibt)

### 6.6 Übergang zwischen Berichten

Nach Block 1 erscheint ein Übergangsbildschirm:
> "Gut gemacht! Jetzt bekommst du einen zweiten Bericht mit den gleichen Daten, aber einem anderen Design. Bitte bearbeite die gleichen Aufgaben erneut."

Der iframe-Quell-URL wird automatisch ausgetauscht. Der Teilnehmer klickt "Weiter" um Block 2 zu starten.

---

## 7. Stufe 3: Akzeptanz & Feedback

Kein Timer. Keine Korrektheitsbewertung.

### 7.1 Qualitative Einzelfragen (Skala oder Freitext)

Aus dem Leitfaden, je auf eine Design-Regel gemappt:

1. **Farbsemantik (D-03):** "Blau = Einsparung, Rot = Überschreitung — intuitiv?" → Likert 1–5
2. **Botschaftsfeld (D-04):** "Kernbotschaft als Text — hilfreich?" → Likert 1–5
3. **Szenarionotation (D-08):** "Ist/Plan/Forecast/Vorjahr auf einen Blick unterscheidbar?" → Likert 1–5
4. **Folienformat (A-08/A-17):** "Statische Seiten als Ersatz für PowerPoint?" → Likert 1–5
5. **Drill-Pfad (D-14):** "B1 → B2 → B3 — Kontext erhalten?" → Likert 1–5
6. **Two-World (D-01):** "Welcher Bericht für Vorstandssitzung, welcher für eigene Analyse?" → Freitext

### 7.2 Likert-Batterie (1–5)

| Aussage | Skala |
|---|---|
| Abweichungen schneller erfassbar als im heutigen Bericht | 1–5 |
| Farbsemantik eindeutig | 1–5 |
| Botschaftsfeld traf den Kern | 1–5 |
| Konnte ohne Hilfe bis zur Kostenstelle navigieren | 1–5 |
| Würde den Bericht in der Praxis nutzen | 1–5 |

### 7.3 Präferenz

"Wenn du nur einen Bericht behalten dürftest — welchen und warum?"
→ Auswahl (Bericht A / Bericht B) + Freitext-Begründung

### 7.4 Offene Schlussfrage

"Was würdest du als Erstes ändern?"
→ Freitext

---

## 8. Datenmodell (Supabase)

### 8.1 Tabelle: `sessions`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID (PK) | Auto-generiert |
| `participant_role` | TEXT | Rolle des Teilnehmers |
| `started_at` | TIMESTAMPTZ | Interview-Start |
| `completed_at` | TIMESTAMPTZ | Interview-Ende (NULL = abgebrochen) |
| `report_order` | TEXT | "native_first" / "ibcs_first" |
| `pair_order` | JSONB | Randomisierte Reihenfolge, z.B. ["P3","P1","P8",...] |
| `pair_side_order` | JSONB | Pro Paar: welches Visual zuerst, z.B. {"P1":"native_first",...} |
| `current_step` | TEXT | Aktueller Schritt (Session-Recovery) |

### 8.2 Tabelle: `responses`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID (PK) | Auto-generiert |
| `session_id` | UUID (FK → sessions) | |
| `stage` | TEXT | "stufe1" / "stufe2_block1" / "stufe2_block2" / "stufe2_depth" |
| `task_id` | TEXT | "P1_native", "P1_ibcs", "K1", "V2" etc. |
| `report_type` | TEXT | "native" / "ibcs" |
| `answer` | TEXT | Gewählte MC-Option oder Schätzwert |
| `is_correct` | INT | 0 = falsch, 1 = teilweise, 2 = korrekt |
| `time_ms` | INT | Antwortzeit in ms (NULL wenn nicht getimed) |
| `seq_score` | INT | SEQ 1–7 (NULL wenn nicht abgefragt) |
| `preference` | TEXT | "a" / "b" (NULL wenn keine Präferenz-Frage) |
| `answered_at` | TIMESTAMPTZ | |

### 8.3 Tabelle: `feedback`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID (PK) | Auto-generiert |
| `session_id` | UUID (FK → sessions) | |
| `question_id` | TEXT | "likert_color", "preference_report", "open_change" etc. |
| `answer_type` | TEXT | "likert" / "ranking" / "freetext" |
| `value` | TEXT | Likert-Wert, Ranking-Position, oder Freitext |

---

## 9. Zeitmessung

- Timer ist **komplett unsichtbar** für den Teilnehmer
- Implementiert als `performance.now()` im Browser (Sub-Millisekunden-Genauigkeit)
- **Start:** Wenn das Visual/der Bericht eingeblendet wird
- **Stop:** Wenn der Teilnehmer eine Antwort auswählt
- **Nicht getimed:** P2 (nur Präferenz), Stufe 3 (Feedback)
- Gespeichert als `time_ms` (Integer, Millisekunden)

---

## 10. Multi-User / Parallelbetrieb

- Jeder Teilnehmer öffnet denselben URL-Link
- Beim Start wird eine eigene Session (UUID) erzeugt
- Aller State ist pro Session — kein Shared State zwischen Teilnehmern
- Supabase handhabt parallele INSERTs nativ
- Counterbalancing prüft die aktuelle DB-Verteilung und weist die unterrepräsentierte Variante zu (Race-Condition bei exakt gleichzeitigem Start akzeptabel bei kleinem N)

---

## 11. Session-Recovery

Falls der Browser abstürzt oder geschlossen wird:
- `current_step` in der Session wird bei jedem Schrittwechsel aktualisiert
- Jede Antwort wird sofort nach Supabase geschrieben (kein Batch am Ende)
- Bei Wiederaufruf: Session-ID aus localStorage laden, `current_step` lesen, dort fortfahren
- Bereits beantwortete Fragen werden nicht wiederholt

---

## 12. Was der Forscher liefern muss

| Material | Beschreibung | Format |
|---|---|---|
| 16 Screenshots | 8 Paare × 2 Visuals (nativ + linientreu) | PNG, möglichst gleiche Abmessungen |
| MC-Optionen Stufe 1 | Pro Paar: 3–5 Antwortmöglichkeiten + korrekte Antwort | JSON/Config |
| 2 Publish-to-Web-Links | Artefakt + Standard-Bericht | Power BI URLs |
| MC-Optionen Stufe 2 | Pro Aufgabe (K1–K3, V1–V4): Antwortmöglichkeiten + korrekte Antwort | JSON/Config |
| Supabase-Projekt | Kostenlos erstellen auf supabase.com | URL + anon key |
| Einverständnistext | Datenschutzhinweis, angepasst für unmoderiertes Format | Text |

---

## 13. Verifikation / Testplan

1. **Funktionstest:** Kompletten Wizard einmal durchspielen, alle Stufen
2. **Timer-Test:** Prüfen dass `time_ms` nur bei getimten Aufgaben gespeichert wird und plausible Werte hat
3. **Counterbalancing-Test:** 4+ Sessions starten, prüfen dass Verteilung ausbalanciert ist
4. **Parallel-Test:** 2 Browser-Tabs gleichzeitig öffnen, beide durchspielen → keine Datenkollisionen
5. **Recovery-Test:** Mitten im Interview Browser schließen, neu öffnen → Fortsetzen ab letztem Schritt
6. **Datenexport-Test:** Supabase CSV-Export → Prüfen ob alle Spalten korrekt gefüllt sind
7. **Randomisierung prüfen:** Mehrere Sessions → Paarreihenfolge und Visual-Seite variieren
8. **Sonderfälle:** P2 (kein Timer), P3 (Notation-Erklärung erscheint), P5 (Zahleneingabe statt MC)
