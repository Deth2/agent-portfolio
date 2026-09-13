// Chat router (spec: .scratch/cv-chat-agent/spec.md). Replaces the old
// app/api/chat Route Handler — same job (take the current question plus
// prior history, return the assistant's reply text), now exposed as a tRPC
// procedure served over Hono (see src/server/hono.ts).
//
// The CV Profile context comes from mock-cv.ts until the real CV Markdown
// exists (see src/lib/mock-cv.ts) — swap this for parseCvProfile() over the
// real file once it's wired into src/app/page.tsx and
// src/components/chat-panel.tsx.

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { askAboutCv } from "@/lib/llm/chat";
import { mockCv } from "@/lib/mock-cv";
import { publicProcedure, router } from "../trpc";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const chatRouter = router({
  ask: publicProcedure
    .input(
      z.object({
        question: z.string().trim().min(1),
        history: z.array(chatMessageSchema).default([]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const reply = await askAboutCv(input.question, mockCv, input.history);
        return { reply };
      } catch (error) {
        console.error("askAboutCv failed", error);
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: "Failed to get a reply from the LLM",
        });
      }
    }),
});
