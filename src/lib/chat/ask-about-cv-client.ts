"use client";

// Client-side askAboutCv-shaped function ChatPanel injects into
// useChatSession — forwards to the /api/chat Route Handler, which holds the
// real askAboutCv() (server-only: LLM API key, CV Profile). Kept separate
// from the hook so the hook itself stays network-agnostic and easy to test
// with a fake.

import type { AskAboutCv } from "./use-chat-session";

export const askAboutCvClient: AskAboutCv = async (question, history) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { reply?: unknown };
  if (typeof data.reply !== "string") {
    throw new Error("Chat response did not include a reply");
  }

  return data.reply;
};
