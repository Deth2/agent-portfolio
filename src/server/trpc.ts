// tRPC init — one instance shared by every router. Kept deliberately bare
// (no auth/session middleware) since the site has no per-visitor identity
// beyond an anonymous browser session (see .scratch/cv-chat-agent/spec.md,
// Out of Scope).

import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
