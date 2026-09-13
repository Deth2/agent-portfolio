// Hono app serving the API — the pattern for this project's server routes:
// tRPC routers under src/server/routers mounted onto Hono, Hono mounted
// into Next.js via a single catch-all Route Handler
// (src/app/api/[[...route]]/route.ts). Add plain Hono routes here too
// (webhooks, health checks, …) alongside the tRPC mount, rather than
// spreading ad-hoc Route Handlers across app/api.

import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { appRouter } from "./routers/_app";

export const app = new Hono().basePath("/api");

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    endpoint: "/api/trpc",
  })
);
