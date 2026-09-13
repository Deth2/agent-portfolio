"use client";

// Vanilla tRPC client for the browser — no React Query wrapper, since the
// chat's own state/loading/history already live in useChatSession. Points
// at the Hono-served tRPC endpoint (src/server/hono.ts).

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";

export const trpc = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "/api/trpc" })],
});
