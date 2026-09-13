"use client";

import { useSyncExternalStore } from "react";
import { detectSiteLocale, type SiteLocale } from "./locale";

// navigator.language never changes during a page's lifetime, so there's
// nothing to subscribe to — this only needs useSyncExternalStore for its
// server/client snapshot split: the server snapshot ("it") matches what
// layout.tsx renders, and the client snapshot resolves the real browser
// locale without a hydration mismatch or a setState-in-effect render.
const subscribe = () => () => {};
const getServerSnapshot = (): SiteLocale => "it";

export function useSiteLocale(): SiteLocale {
  return useSyncExternalStore(subscribe, detectSiteLocale, getServerSnapshot);
}
