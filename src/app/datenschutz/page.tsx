// ============================================================
// IBCS Interview Tool — Datenschutzerklärung & Impressum
// Static server component. Accessible at /datenschutz.
// ============================================================

import Link from 'next/link';

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white px-8 py-10 shadow-lg ring-1 ring-gray-100 sm:px-12 sm:py-14">

        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Zurück zur Studie
        </Link>

        {/* ════════════════════════════════════════════════════ */}
        {/* DATENSCHUTZERKLÄRUNG                                 */}
        {/* ════════════════════════════════════════════════════ */}

        <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
          Datenschutzerklärung
        </h1>
        <div className="mb-8 h-1 w-12 rounded-full bg-blue-500" />

        <div className="space-y-8 text-[15px] leading-7 text-gray-600">

          {/* 1. Verantwortlicher */}
          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-800">
              1. Verantwortlicher
            </h2>
            <p>
              Quentin Malik<br />
              Silbersteinstraße 114<br />
              12051 Berlin<br />
              E-Mail:{' '}
              <a href="mailto:quentinmalik.career@gmail.com" className="text-blue-600 underline hover:text-blue-800">
                quentinmalik.career@gmail.com
              </a>
            </p>
          </section>

          {/* 2. Zweck */}
          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-800">
              2. Zweck der Datenverarbeitung
            </h2>
            <p>
              Die erhobenen Daten dienen ausschließlich der wissenschaftlichen
              Auswertung im Rahmen einer Masterarbeit an der Steinbeis
              Hochschule. Untersucht wird, wie die visuelle Gestaltung von
              Management-Berichten die Informationsaufnahme beeinflusst.
            </p>
          </section>

          {/* 3. Rechtsgrundlage */}
          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-800">
              3. Rechtsgrundlage
            </h2>
            <p>
              Die Verarbeitung erfolgt auf Grundlage Ihrer Einwilligung gemäß
              Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;a DSGVO. Die Einwilligung kann
              jederzeit ohne Angabe von Gründen widerrufen werden, ohne dass
              Ihnen daraus Nachteile entstehen.
            </p>
          </section>

          {/* 4. Erhobene Daten */}
          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-800">
              4. Welche Daten werden erhoben
            </h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>Rolle im Unternehmen (Freitext)</li>
              <li>Antworten auf Aufgaben- und Bewertungsfragen</li>
              <li>Reaktionszeiten (Zeitstempel in Millisekunden)</li>
              <li>Likert-Bewertungen und Freitextantworten</li>
              <li>Technische Metadaten: Session-ID (UUID), Zeitstempel</li>
            </ul>
            <p className="mt-2">
              Es werden <strong className="text-gray-700">keine</strong>{' '}
              personenbezogenen Daten wie Name, E-Mail-Adresse oder
              IP-Adresse erhoben. Die Teilnahme ist vollständig anonym.
            </p>
          </section>

          {/* 5. Speicherdauer */}
          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-800">
              5. Speicherdauer
            </h2>
            <p>
              Die Daten werden bis zum Abschluss und zur Bewertung der
              Masterarbeit gespeichert. Danach werden sie gelöscht oder
              vollständig anonymisiert.
            </p>
          </section>

          {/* 6. Empfänger */}
          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-800">
              6. Empfänger und Auftragsverarbeiter
            </h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>
                <strong className="text-gray-700">Supabase Inc.</strong> —
                Datenbankhosting (Server in der EU)
              </li>
              <li>
                <strong className="text-gray-700">Vercel Inc.</strong> —
                Webhosting und Deployment
              </li>
            </ul>
            <p className="mt-2">
              Eine Weitergabe an sonstige Dritte findet nicht statt.
            </p>
          </section>

          {/* 7. Ihre Rechte */}
          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-800">
              7. Ihre Rechte
            </h2>
            <p>Sie haben gemäß DSGVO folgende Rechte:</p>
            <ul className="list-disc ml-5 space-y-1 mt-2">
              <li>Auskunft über Ihre gespeicherten Daten (Art.&nbsp;15)</li>
              <li>Berichtigung unrichtiger Daten (Art.&nbsp;16)</li>
              <li>Löschung Ihrer Daten (Art.&nbsp;17)</li>
              <li>Einschränkung der Verarbeitung (Art.&nbsp;18)</li>
              <li>
                Widerruf Ihrer Einwilligung — jederzeit, ohne Angabe von
                Gründen und ohne Nachteile
              </li>
              <li>
                Beschwerderecht bei der zuständigen Aufsichtsbehörde
                (Berliner Beauftragte für Datenschutz und Informationsfreiheit)
              </li>
            </ul>
          </section>

          {/* 8. Kontakt */}
          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-800">
              8. Kontakt für Datenschutzanfragen
            </h2>
            <p>
              Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte
              wenden Sie sich bitte an:<br />
              <a href="mailto:quentinmalik.career@gmail.com" className="text-blue-600 underline hover:text-blue-800">
                quentinmalik.career@gmail.com
              </a>
            </p>
          </section>
        </div>

        {/* ════════════════════════════════════════════════════ */}
        {/* IMPRESSUM                                            */}
        {/* ════════════════════════════════════════════════════ */}

        <div className="mt-16 border-t border-gray-200 pt-10">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
            Impressum
          </h1>
          <div className="mb-8 h-1 w-12 rounded-full bg-blue-500" />

          <div className="space-y-4 text-[15px] leading-7 text-gray-600">
            <p className="font-medium text-gray-700">
              Angaben gemäß § 5 DDG
            </p>
            <p>
              Quentin Malik<br />
              Silbersteinstraße 114<br />
              12051 Berlin
            </p>
            <p>
              E-Mail:{' '}
              <a href="mailto:quentinmalik.career@gmail.com" className="text-blue-600 underline hover:text-blue-800">
                quentinmalik.career@gmail.com
              </a>
            </p>
            <p className="text-sm text-gray-400">
              Studentisches Forschungsprojekt im Rahmen einer Masterarbeit
              an der Steinbeis Hochschule. Keine gewerbliche Nutzung.
            </p>
          </div>
        </div>

        {/* Back link (bottom) */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors underline"
          >
            Zurück zur Studie
          </Link>
        </div>
      </div>
    </div>
  );
}
