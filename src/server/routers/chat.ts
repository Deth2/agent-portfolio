// Chat router (spec: .scratch/cv-chat-agent/spec.md). Replaces the old
// app/api/chat Route Handler — same job (take the current question plus
// prior history, return the assistant's reply text), now exposed as a tRPC
// procedure served over Hono (see src/server/hono.ts).
//
// The CV Profile context comes from content/cv.md (see
// src/lib/cv/load-cv-profile.ts) — the same file that drives the static CV
// sections via the cv.get query (./cv.ts), so the two never drift apart.

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { loadCvProfile } from "@/lib/cv/load-cv-profile";
import { askAboutCv } from "@/lib/llm/chat";
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
        const cvProfile = loadCvProfile();
        const reply = await askAboutCv(input.question, cvProfile, input.history);
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
