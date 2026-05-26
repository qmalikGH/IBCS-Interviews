// ============================================================
// Datenschutz Layout — overrides root mobile guard so the
// privacy policy is readable on all devices.
// ============================================================

export default function DatenschutzLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Override root layout's mobile guard for this route */}
      <style>{`
        #mobile-guard { display: none !important; }
        #app-root { display: flex !important; }
      `}</style>
      {children}
    </>
  );
}
