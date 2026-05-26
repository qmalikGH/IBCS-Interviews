import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IBCS Interview-Tool",
  description: "Forschungsstudie zu Berichtsdarstellungen",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8f9fa] text-gray-900">
        {/* Mobile guard — visible only on screens < 1024px via CSS */}
        <div
          id="mobile-guard"
          className="fixed inset-0 z-[9999] flex-col items-center justify-center bg-white px-8 text-center"
          aria-live="polite"
        >
          <svg
            className="mb-6 h-16 w-16 text-gray-300"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3"
            />
          </svg>
          <h1 className="mb-3 text-2xl font-semibold text-gray-800">
            Desktop erforderlich
          </h1>
          <p className="text-base leading-7 text-gray-600">
            Bitte verwende einen Desktop-Computer für diese Studie.
          </p>
        </div>

        {/* Main app */}
        <div id="app-root" className="flex min-h-full flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
