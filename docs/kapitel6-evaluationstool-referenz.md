# Kapitel 6 — Referenz: Das Evaluations-Tool

> Schreibfertige Beschreibung des Interview-Tools, des Ablaufs, der Mess- und
> Bewertungslogik sowie der methodischen Begründungen. Stand: nach allen
> Pre-Launch-Fixes (Mai 2026). Diese Datei beschreibt den **tatsächlich
> implementierten** Zustand, nicht die ältere Design-Spec.

---

## 1. Zweck und Einordnung

Das Tool automatisiert die **summative Evaluation** der in der Arbeit definierten
IBCS-konformen Design-Richtlinien (D-01 … D-15). Es vergleicht einen
linientreuen, IBCS-konformen Power-BI-Bericht (Artefakt) mit einer **nativen
Power-BI-Baseline**.

Zentrale Eigenschaft: Es ist ein **unmoderiertes Web-Tool**. Es ersetzt den
mündlichen Interview-Leitfaden vollständig — die Teilnehmenden werden ohne
Versuchsleiter durch alle Phasen geführt, die Antwortzeiten werden unsichtbar
gemessen, alle Antworten landen automatisch in einer Datenbank. Mehrere
Personen können gleichzeitig teilnehmen (z. B. im Rahmen eines Team-Termins),
weil jede Browser-Sitzung isoliert ist und parallele Schreibzugriffe von der
Datenbank unterstützt werden.

Daraus folgt das Forschungsziel je Stufe:

| Stufe | Forschungsfrage (sinngemäß) | Charakter |
|---|---|---|
| Stufe 1 | Welche Einzel-Designregel verbessert die *Wahrnehmung/Erfassung* messbar? | Element-Ebene, quantitativ |
| Stufe 2 | Schlägt sich das im *vollständigen Bericht* in Geschwindigkeit & Korrektheit nieder? | System-Ebene, quantitativ |
| Stufe 3 | Wie *bewerten* die Teilnehmenden die Konventionen subjektiv? | Akzeptanz, qualitativ/Likert |

---

## 2. Technische Architektur

| Komponente | Technologie | Begründung |
|---|---|---|
| Frontend | Next.js 16 (App Router), React, TypeScript | Single-Page-Wizard, einfaches Deployment |
| State | Zustand | leichtgewichtiger Client-State, kein Boilerplate |
| Datenbank | Supabase (PostgreSQL) | kostenlos, Web-UI, CSV-Export, parallele Inserts |
| Visuals | Power BI „Publish to Web"-iframes | echte, interaktive Berichte statt Screenshots |
| Styling | Tailwind CSS | schnelles, konsistentes UI |

**Single-Page-Wizard mit linearem Fluss.** Ein Link, alle Phasen in einer
Seite, kein Seitenwechsel, **keine Rückwärtsnavigation**. Das verhindert, dass
Teilnehmende frühere Antworten revidieren, nachdem sie Folgeinformationen
gesehen haben, und hält die Messbedingungen für alle gleich.

Die Power-BI-Berichte werden als iframe eingebettet. Jede einzelne Visual-Seite
wird über den URL-Parameter `pageName` (hexadezimaler Seiten-Identifier aus
Power BI) adressiert; Navigations-, Filter- und Action-Bar werden per
URL-Parameter ausgeblendet, sodass die Teilnehmenden nur das jeweils relevante
Visual sehen.

---

## 3. Phasenablauf (die Zustandsmaschine)

```
welcome → onboarding → stufe1 → stufe2_tasks → stufe2_alt_preview → stufe3 → completed
```

1. **welcome** — Begrüßung, Rolle, zwei Vertrautheits-Abfragen, Einwilligung.
2. **onboarding** — dreiseitiges Briefing (Studienformat + IBCS-Lesekonventionen).
3. **stufe1** — 8 Element-Vergleichspaare (P1–P8) in randomisierter Reihenfolge.
4. **stufe2_tasks** — 6 Analyseaufgaben auf **einem** Bericht (zeitgemessen).
5. **stufe2_alt_preview** — der jeweils andere Bericht zum Ansehen (ohne Aufgabe/Timer).
6. **stufe3** — 13 Bewertungsfragen (Likert, Präferenz, Freitext).
7. **completed** — Abschlussbildschirm.

Der globale Fortschrittsbalken zählt nur die „echten" Arbeitsschritte:
8 (Stufe 1) + 6 (Stufe 2) + 1 (Alt-Preview) + 1 (Stufe 3) = **16 Schritte**.
Welcome, Onboarding und Abschluss werden bewusst nicht mitgezählt.

---

## 4. Versuchsdesign und Counterbalancing

Beim Absenden des Welcome-Screens wird pro Teilnehmer eine Session in der
Datenbank angelegt und die Randomisierung festgelegt und gespeichert. Es gibt
**drei voneinander unabhängige Counterbalancing-Mechanismen**:

1. **`pair_order`** — die 8 Paare werden per Fisher-Yates-Shuffle in zufällige
   Reihenfolge gebracht. *Zweck:* neutralisiert Reihenfolge-/Ermüdungseffekte
   über die Paare hinweg.

2. **`pair_side_order`** — pro Paar wird zufällig (50/50) entschieden, ob das
   native oder das IBCS-Visual **zuerst** gezeigt wird. *Zweck:* neutralisiert
   den Reihenfolgevorteil „erstes vs. zweites Visual" innerhalb eines Paares
   (das zweite Visual könnte durch Lerneffekt schneller beantwortet werden).

3. **`report_order`** — bestimmt in Stufe 2, **welchen** der beiden Berichte
   der Teilnehmer bearbeitet. Die Zuweisung ist **balanciert** (nicht rein
   zufällig): das Tool weist immer der bisher kleineren Gruppe zu, bei
   Gleichstand zufällig. *Zweck:* hält die beiden Stichproben-Gruppen
   (native vs. IBCS) etwa gleich groß.

**Wichtige Design-Unterscheidung:**

- **Stufe 1 = Within-Subjects.** Jeder sieht *beide* Welten (A und B) für jedes
  Paar und vergleicht sie direkt.
- **Stufe 2 = Between-Subjects.** Jeder bearbeitet *nur einen* Bericht unter
  Zeitmessung. Den anderen sieht er erst danach (ohne Messung) zur
  Präferenzbildung. *Begründung:* Würde derselbe Teilnehmer beide Berichte mit
  denselben 6 Aufgaben bearbeiten, wäre der zweite Durchlauf durch
  Aufgaben-Kenntnis verfälscht. Der Preis dafür ist, dass Stufe 2
  Gruppenvergleiche statt Paarvergleiche liefert — entsprechend ist hier eine
  größere Stichprobe nötig.

---

## 5. Stufe 1 — Element-Duelle (P1–P8)

### 5.1 Idee
Jedes Paar isoliert **eine** Design-Regel und stellt dieselbe Informationsfrage
an zwei Darstellungen derselben Daten: einmal nativ, einmal IBCS-konform. Die
Welten sind neutral als **„Darstellung A"** und **„Darstellung B"** bezeichnet —
welche Welt dahintersteckt, ist für die Teilnehmenden nicht erkennbar (vermeidet
Erwartungs-/Demand-Effekte).

### 5.2 Ablauf pro Paar
1. **Frageschirm** — Teilnehmer liest die Aufgabe (kein Timer läuft).
2. Klick auf „Darstellung anzeigen" → **Visual A**.
3. **Antwort** wählen → Timer stoppt, Korrektheit automatisch bewertet.
4. **Visual B** erscheint → Antwort wählen → Timer stoppt.
5. **Präferenzfrage:** „Welche Darstellung war für dich eindeutiger?" → A / B.

### 5.3 Die 8 Paare

| Paar | Regel | Getesteter Kontrast | Fragetyp |
|---|---|---|---|
| P1 | D-06 | Kreisdiagramm vs. sortiertes Ranking | MC |
| P2 | D-03 | Farbsemantik (türkis/blau vs. rot/blau) | **nur Präferenz** |
| P3 | D-08 | Vollfarben vs. Szenarionotation | MC |
| P4 | D-02 | Zahlenmatrix vs. grafische Tabelle | MC |
| P5 | D-11 | abgeschnittene Achse vs. Nullbasislinie | **Schätzung (%)** |
| P6 | D-04 | ohne vs. mit Kommentar-/Botschaftsfeld | MC |
| P7 | D-06 | Tacho vs. Bullet-Chart/Karte | MC |
| P8 | D-13 | Spaghetti-Linie vs. Small Multiples | MC |

### 5.4 Sonderfälle (und warum)
- **P2 (Farbsemantik):** Es gibt kein objektives Richtig/Falsch — gemessen wird
  nur die **Präferenz**, daher **kein Timer**.
- **P3 (Szenarionotation):** Vor dem IBCS-Visual wird die Notation kurz erklärt
  („Gefüllt = Ist, Umrandet = Plan, Schraffiert = Forecast"). Sonst wäre die
  Konvention ohne Vorwissen nicht lesbar — die Frage zielt auf Lesbarkeit *nach*
  Erklärung, nicht auf Vorwissen.
- **P5 (Nullachse):** Statt MC eine **Prozent-Schätzung**. Der Effekt
  abgeschnittener Achsen zeigt sich genau in der Verzerrung der geschätzten
  Größenverhältnisse; die Genauigkeit der Schätzung ist die eigentliche
  Messgröße (Auswertung gegen den Sollwert erfolgt durch dich).

### 5.5 Schlüsseldetail: Seitenspezifische Antworten
Native und IBCS zeigen **unterschiedliche Datenschnitte** desselben Visualtyps
(z. B. native = „North America 2023", IBCS = „alle Märkte 2023"). Damit hat
jede Seite eine **eigene korrekte Antwort** (`pairSideAnswers`). Zwei Gründe:
1. **Anti-Memory:** Man kann die Antwort von Visual A nicht einfach für Visual B
   wiederverwenden — beide erfordern echtes Ablesen.
2. **Korrekte Bewertung:** Bei P6 unterscheiden sich sogar die
   Antwortoptionen je Seite (`optionsBySide`), weil die Datenschnitte andere
   Kostenstellen/Werte enthalten. Würde man dieselben Optionen für beide Seiten
   anzeigen, gäbe es auf einer Seite „Phantom-Distraktoren" (Optionen, die im
   gezeigten Datenschnitt gar nicht vorkommen).

---

## 6. Stufe 2 — Berichtsanalyse (6 Aufgaben)

### 6.1 Aufbau
Split-Screen: links der eingebettete Power-BI-Bericht, rechts das
Aufgabenpanel. Die 6 Aufgaben laufen in **fester Reihenfolge** (kein Shuffle —
sie bauen inhaltlich aufeinander auf und führen durch einen realistischen
Analyse-Pfad: Überblick → Aufriss → Detail).

| ID | Ebene/Sicht | Aufgabentyp |
|---|---|---|
| K1 | Überblick | zwei größte Plan-Abweichungen + Summe identifizieren |
| K2 | Überblick | Kernbotschaft in 20 Sekunden erfassen |
| V2 | Überblick | Forecast-Treffsicherheit beurteilen |
| K3 | PC-Detail | zweitgrößten Treiber der Überschreitung finden |
| V1 | PC-Detail | zeitliches Muster der Abweichung erkennen |
| V3 | Kostenstelle | Abweichung auf Kostenstelle lokalisieren |

Alle 6 Aufgaben sind Multiple-Choice mit automatischer Korrektheitsbewertung
und Zeitmessung. Der native Bericht hat eine einzige Seite; der IBCS-Bericht
führt über drei Seiten (Überblick, PC-Aufriss, Detailanalyse) — das Tool
navigiert automatisch zur richtigen Seite je Aufgabe.

### 6.2 Ablauf pro Aufgabe
1. Frage + Bericht sichtbar, Teilnehmer orientiert sich.
2. Klick auf **„Aufgabe starten"** → Timer startet, Antwortoptionen erscheinen.
3. Antwort wählen → Timer stoppt → speichern → nächste Aufgabe.

### 6.3 Alt-Preview
Nach den 6 Aufgaben sieht der Teilnehmer den **anderen** Bericht (den er nicht
bearbeitet hat) — ohne Aufgaben, ohne Zeitmessung. Zweck: faire Grundlage für
die Präferenz- und Bewertungsfragen in Stufe 3, ohne die Between-Subjects-Messung
zu verfälschen.

---

## 7. Stufe 3 — Bewertung (Feedback)

13 Fragen, einzeln nacheinander angezeigt, jeweils sofort gespeichert:

- **FQ1–FQ6 — Qualitative Einzelfragen (Likert 1–5):** je eine Aussage zu einer
  Konvention, jeweils mit IBCS-Regel verknüpft:
  - FQ1 → D-03 Farbsemantik (Rot = ungünstig, Blau = günstig)
  - FQ2 → D-04 Botschaftsfeld
  - FQ3 → D-08 Szenarionotation
  - FQ4 → A-08 Hochformat
  - FQ5 → D-14 Drill-Pfad/Navigation
  - FQ6 → D-01 Two-World-Prinzip (Ist-Welt vs. Plan-Welt)
- **FB1–FB5 — Likert-Batterie (1–5):** zusammenfassende Bewertung
  (Abweichungen schneller erfassbar, Farbsemantik eindeutig, Botschaftsfeld
  trifft Kern, selbstständig navigierbar, Nutzungsabsicht im Alltag).
- **FP1 — Präferenz:** „Welchen Bericht würdest du behalten?" (native vs. IBCS).
- **FP1_reason — Freitext:** Begründung der Präferenz.
- **FO1 — Freitext:** „Was würdest du als Erstes verbessern?"

So lässt sich jede subjektive Bewertung einer konkreten Designregel zuordnen und
mit den objektiven Messwerten aus Stufe 1/2 trianguliert auswerten.

---

## 8. Mess- und Bewertungslogik (der methodische Kern)

### 8.1 Zeitmessung
- Basis ist `performance.now()` — eine **monotone, hochauflösende** Uhr. Sie
  ist immun gegen Systemzeit-Änderungen und liefert Millisekunden-Genauigkeit.
- Gemessen wird die Differenz zwischen *Stimulus sichtbar* und *Antwort gewählt*.

**Was bewusst NICHT in die Zeit einfließt:**

1. **Lesen der Frage.** In Stufe 1 steht die Frage auf einem separaten Schirm
   *vor* dem Visual; der Timer startet erst mit dem Visual. In Stufe 2 startet
   der Timer erst beim Klick auf „Aufgabe starten", also nachdem die Frage
   gelesen und der Bericht gesichtet wurde. Gemessen wird damit reine
   **Antwort-/Erfassungszeit**, nicht Lesezeit.

2. **Ladezeit des iframes.** Der Timer startet erst, wenn das Visual **geladen
   UND sichtbar** ist (umgesetzt über reaktive Effekte, die sowohl den
   sichtbaren Schritt als auch den `onLoad`-Zustand prüfen). Die Berichte werden
   außerdem im Hintergrund **vorgeladen** (beide Visuals eines Paares ab dem
   ersten Rendern; das nächste Paar wird ebenfalls schon geladen). *Begründung:*
   Ohne diese „Timer-Fairness" würde unterschiedlich schnelles Laden von Visual
   A vs. B als Bearbeitungszeit fehlinterpretiert.

### 8.2 Korrektheit (`is_correct`)
Kodierung: **0 = falsch, 1 = nicht automatisch bewertet (geloggt), 2 = korrekt.**
- MC-Aufgaben (Stufe 1 & 2): Tool vergleicht die gewählte Option gegen die
  hinterlegte korrekte Option → 0 oder 2.
- P5-Schätzung und Präferenzen werden mit `is_correct = 1` als „geloggt"
  markiert; die eigentliche Bewertung (Schätzgenauigkeit, Präferenzrichtung)
  nimmst du in der Auswertung vor.

### 8.3 Präferenz
Pro Paar in Stufe 1 wird zusätzlich die direkte Präferenz (A/B) erfasst und als
eigene Zeile gespeichert (`task_id = "<Pn>_preference"`, `preference = 'a'|'b'`).

---

## 9. Datenmodell (3 Tabellen)

### `sessions` (eine Zeile pro Teilnehmer)
`id`, `participant_role`, `powerbi_familiarity`, `ibcs_familiarity`,
`started_at`, `completed_at`, `report_order`, `pair_order`, `pair_side_order`,
`current_step`.

- **Vertrautheits-Variablen:** `powerbi_familiarity` und `ibcs_familiarity` mit
  jeweils drei Stufen (`nicht_vertraut` / `leicht_vertraut` / `vertraut`).
  Erlauben Kontrollanalysen, ob Effekte durch Vorwissen moderiert werden
  (z. B. profitieren IBCS-Unkundige stärker/schwächer von den Konventionen).

### `responses` (eine Zeile pro beantworteter Aufgabe)
`session_id`, `stage` (`stufe1` | `stufe2_tasks`), `task_id`, `report_type`
(`native` | `ibcs`), `answer`, `is_correct` (0/1/2), `time_ms`, `seq_score`
(siehe §11), `preference`, `answered_at`.

`task_id`-Konventionen:
- Stufe 1 Visual: `P1_native`, `P1_ibcs`, …
- Stufe 1 Präferenz: `P1_preference` (immer mit `report_type = native` geloggt)
- Stufe 2: `K1`, `K2`, `V2`, `K3`, `V1`, `V3`

### `feedback` (eine Zeile pro Stufe-3-Frage)
`session_id`, `question_id` (z. B. `FQ1`, `FB3`, `FP1`, `FO1`),
`answer_type` (`likert` | `freetext`), `value`, `answered_at`.

**Verknüpfung:** alles hängt über `session_id` zusammen; `ON DELETE CASCADE`
sorgt für referenzielle Integrität. Datenschutz: erhoben wird nur die
**Rolle** (Freitext), keine personenidentifizierenden Daten.

---

## 10. Variablen-Überblick für die Auswertung

**Unabhängige Variablen**
- Berichtsformat: native vs. IBCS (Within in Stufe 1, Between in Stufe 2).
- Getestete Designregel (D-01 … D-15, je Paar/Frage).
- Kovariaten: Rolle, Power-BI-Vertrautheit, IBCS-Vertrautheit.

**Abhängige Variablen**
- **Antwortzeit** (`time_ms`) — Effizienz der Informationsaufnahme.
- **Korrektheit** (`is_correct`) — Genauigkeit/Verständnis.
- **Schätzgenauigkeit** (P5, aus `answer` gegen Sollwert) — Verzerrungsmaß.
- **Direkte Präferenz** (Stufe 1 je Paar; Stufe 3 Gesamtbericht).
- **Subjektive Bewertung** (Likert FQ/FB) — Akzeptanz je Konvention.
- **Qualitative Aussagen** (FP1_reason, FO1) — Begründungen, Verbesserungsideen.

Typische Auswertungsrichtungen: pro Paar native vs. IBCS bei Zeit & Korrektheit
(Stufe 1, gepaart); Gruppenvergleich native- vs. IBCS-Gruppe bei Zeit &
Korrektheit über die 6 Aufgaben (Stufe 2, ungepaart); Likert-Mittelwerte je
Regel; Triangulation objektiver Effekte mit subjektiver Bewertung und
Präferenz.

---

## 11. Methodische Stärken (für die Diskussion)

- **Automatisierte, reaktionslose Zeitmessung** ohne Versuchsleiter-Einfluss.
- **Doppelte Randomisierung** in Stufe 1 (Paar- und Seitenreihenfolge) gegen
  Reihenfolge- und Lerneffekte.
- **Balancierte Gruppenzuweisung** in Stufe 2.
- **Neutrale Benennung** (A/B) gegen Demand-/Erwartungseffekte.
- **Trennung von Lese- und Antwortzeit** sowie **Eliminierung der Ladezeit**
  aus der Messung (Timer-Fairness + Preloading).
- **Saubere Bewertbarkeit** durch seitenspezifische Antworten/Optionen
  (kein Memory-Effekt, keine Phantom-Distraktoren).
- **Triangulation:** objektive Leistung (Stufe 1/2) + subjektive Akzeptanz
  (Stufe 3) je Designregel.

---

## 12. Limitationen und Hinweise (unbedingt in Kapitel 6 erwähnen)

- **Between-Subjects in Stufe 2** → benötigt ausreichend große, balancierte
  Gruppen; bei kleinem n sind Aussagen zur Berichts-Ebene vorsichtig zu
  interpretieren (n=1-Varianz war im Pretest sichtbar).
- **Unmoderiert** → keine Kontrolle über Endgerät, Bildschirmgröße,
  Ablenkung oder ob die Frage wirklich verstanden wurde.
- **IBCS-Unvertrautheit** kann anfängliche Effekte zugunsten der nativen
  Darstellung erzeugen (Neuheits-/Lernkosten); das Onboarding mildert dies,
  hebt es aber nicht auf.
- **`seq_score` ist im Schema vorhanden, wird aber NICHT erhoben.** Die ältere
  Design-Spec sah einen Single-Ease-Question-Wert (1–7) je Visual vor; die
  finale Implementierung verzichtet darauf. In den Daten ist `seq_score` daher
  immer leer — bitte **nicht** als erhobene Variable in Kapitel 6 beschreiben.
- **Selbstauskunft zur Vertrautheit** (3-stufig) ist grob und subjektiv.
- **Power-BI „Publish to Web"** rendert serverabhängig; trotz Preloading können
  Restschwankungen der Renderzeit nicht vollständig ausgeschlossen werden.

---

## 13. Abweichungen Design-Spec ↔ finale Umsetzung (Kurzliste)

| Thema | Spec (24.05.) | Finale Umsetzung |
|---|---|---|
| Visual-Einbettung | Screenshots (PNG) | echte Power-BI-iframes mit Preloading |
| Stufe 2 | innerhalb-Subjekt (Bericht A & B) | **Between-Subjects** (ein Bericht + Alt-Preview) |
| SEQ (1–7) | je Visual erhoben | **entfällt** (Spalte bleibt leer) |
| Onboarding | nicht vorgesehen | dreiseitiges Briefing ergänzt |
| P6-Optionen | einheitlich | **seitenspezifisch** (optionsBySide) |
| Vertrautheit | nicht erhoben | zwei 3-stufige Abfragen ergänzt |
