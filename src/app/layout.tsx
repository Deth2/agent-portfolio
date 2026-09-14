import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { I18nProvider } from "@/lib/i18n/i18n-provider";
import { TRPCQueryProvider } from "@/lib/trpc/provider";
import "./globals.css";

// --font-sans is the variable globals.css's @theme block maps to the
// font-sans utility — naming it that way here (instead of e.g.
// --font-inter) is what actually wires the loaded font in, rather than
// leaving font-sans to fall back to shadcn's default stack.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Benedetta Correa",
  description: "Portfolio conversazionale di Benedetta Correa",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TRPCQueryProvider>
          <I18nProvider>{children}</I18nProvider>
        </TRPCQueryProvider>
      </body>
    </html>
  );
}
