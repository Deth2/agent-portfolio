// CV Profile query — the same CvProfile (from content/cv.md) that grounds
// the chat agent (see ./chat.ts) is exposed here for the client to render
// the static CV sections and the chat header/avatar, so both stay driven
// by the one Markdown file (spec: .scratch/cv-chat-agent/spec.md, user
// stories 18-19).

import { loadCvProfile } from "@/lib/cv/load-cv-profile";
import { publicProcedure, router } from "../trpc";

export const cvRouter = router({
  get: publicProcedure.query(() => loadCvProfile()),
});
