// Static UI strings for the site chrome, keyed by SiteLocale. Only covers
// chrome the visitor reads regardless of what they ask the agent — the
// agent's own replies are never looked up here (see ./locale).

import type { SiteLocale } from "./locale";

export const strings = {
  it: {
    tabs: {
      chat: "💬 Chat",
      experience: "Esperienze",
      skills: "Skills",
      languages: "Lingue",
      hobbies: "Hobby",
      contacts: "Contatti",
    },
    chat: {
      greeting: "Ciao! Sono Benedetta 👋 Vuoi conoscere qualcosa su di me? Fammi una domanda.",
      questionLabel: "La tua domanda",
      questionPlaceholder: "Es. Che esperienza hai con React?",
      send: "Invia",
      sending: "Invio...",
      topicsLabel: "Argomenti",
      topics: [
        { label: "Esperienza", prompt: "Raccontami delle tue esperienze lavorative" },
        { label: "Skills", prompt: "Quali tecnologie sai usare?" },
        { label: "Lingue", prompt: "Che lingue parli?" },
        { label: "Hobby", prompt: "Cosa fai nel tempo libero?" },
        { label: "Contatti", prompt: "Come posso contattarti?" },
      ],
      errorReply: "Mi dispiace, non sono riuscita a rispondere in questo momento. Riprova tra poco.",
      limitExceededReply:
        "Hai raggiunto il numero massimo di domande per questa sessione. Scrivimi tramite i Contatti per continuare la conversazione.",
    },
  },
  en: {
    tabs: {
      chat: "💬 Chat",
      experience: "Experience",
      skills: "Skills",
      languages: "Languages",
      hobbies: "Hobbies",
      contacts: "Contacts",
    },
    chat: {
      greeting: "Hi! I'm Benedetta 👋 Want to know something about me? Ask away.",
      questionLabel: "Your question",
      questionPlaceholder: "E.g. What's your experience with React?",
      send: "Send",
      sending: "Sending...",
      topicsLabel: "Topics",
      topics: [
        { label: "Experience", prompt: "Tell me about your work experience" },
        { label: "Skills", prompt: "What technologies do you know?" },
        { label: "Languages", prompt: "What languages do you speak?" },
        { label: "Hobbies", prompt: "What do you do in your free time?" },
        { label: "Contacts", prompt: "How can I reach you?" },
      ],
      errorReply: "Sorry, I couldn't get a reply right now. Please try again shortly.",
      limitExceededReply:
        "You've reached the maximum number of questions for this session. Reach out via Contacts to keep the conversation going.",
    },
  },
} satisfies Record<SiteLocale, unknown>;

export type SiteStrings = (typeof strings)[SiteLocale];
