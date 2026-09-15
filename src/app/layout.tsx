import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Manrope } from "next/font/google";
import { I18nProvider } from "@/lib/i18n/i18n-provider";
import { TRPCQueryProvider } from "@/lib/trpc/provider";
import "./globals.css";

// Font stack adopted from the Claude Design handoff
// (docs/Portfolio agent chatbot-handoff.zip, see ADR-0008): Manrope for body
// text, IBM Plex Mono for label/mono chrome (uppercase tags, timestamps),
// Instrument Serif for the display name/greeting. Variable names match what
// globals.css's @theme block wires up (--font-sans/--font-geist-mono keep
// their original names so the mapping there didn't need touching).
const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Benedetta Correa",
  description: "Portfolio conversazionale di Benedetta Correa",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${manrope.variable} ${ibmPlexMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TRPCQueryProvider>
          <I18nProvider>{children}</I18nProvider>
        </TRPCQueryProvider>
      </body>
    </html>
  );
}
