"use client";

// Bridges the chat.ask tRPC procedure (src/server/routers/chat.ts) to the
// AskAboutCv shape useChatSession expects, via TanStack Query's
// useMutation — the network call itself, including its pending/error
// state, is owned by TanStack Query; useChatSession still owns the
// conversation's message history and Question Limit count on top of it.

import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { useTRPC } from "@/lib/trpc/context";
import type { AskAboutCv } from "./use-chat-session";

export function useAskAboutCv(): AskAboutCv {
  const trpc = useTRPC();
  const { mutateAsync } = useMutation(trpc.chat.ask.mutationOptions());

  return useCallback(
    async (question, history) => {
      const { reply } = await mutateAsync({ question, history });
      return reply;
    },
    [mutateAsync]
  );
}
