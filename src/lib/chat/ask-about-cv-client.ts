"use client";

// Client-side askAboutCv-shaped function ChatPanel injects into
// useChatSession — calls the chat.ask tRPC procedure (src/server/routers/chat.ts),
// which holds the real askAboutCv() (server-only: LLM API key, CV Profile).
// Kept separate from the hook so the hook itself stays transport-agnostic
// and easy to test with a fake.

import type { AskAboutCv } from "./use-chat-session";
import { trpc } from "./trpc-client";

export const askAboutCvClient: AskAboutCv = async (question, history) => {
  const { reply } = await trpc.chat.ask.mutate({ question, history });
  return reply;
};
