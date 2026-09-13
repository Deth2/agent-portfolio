// Site chrome language (spec: .scratch/cv-chat-agent/spec.md, user story 13).
// Chosen once per page load from the browser's reported locale — binary, no
// manual toggle: Italian if the browser reports Italian, English otherwise.
// Governs only static UI strings (see ./strings), never the agent's own
// replies, which always match the visitor's question language instead.

export type SiteLocale = "it" | "en";

export function detectSiteLocale(): SiteLocale {
  if (typeof navigator === "undefined") return "it";
  const language = navigator.language ?? navigator.languages?.[0] ?? "";
  return language.toLowerCase().startsWith("it") ? "it" : "en";
}
