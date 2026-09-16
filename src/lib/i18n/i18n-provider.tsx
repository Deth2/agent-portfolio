"use client";

// Feeds next-intl the site chrome's locale/messages (spec: user story 13).
// No routing/middleware — this is a single-page site, and the decision is
// binary/one-shot per page load from the browser's reported locale (see
// ./locale), not a URL-addressable locale. useSiteLocale resolves to "it"
// during SSR/hydration and to the real browser locale right after, so this
// provider's messages follow the same one-step transition.

import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import en from "./messages/en.json";
import it from "./messages/it.json";
import { useSiteLocale } from "./use-site-locale";

const messages = { it, en };

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSiteLocale();

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages[locale]}
      timeZone="Europe/Rome"
    >
      {children}
    </NextIntlClientProvider>
  );
}
