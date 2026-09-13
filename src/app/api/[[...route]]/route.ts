// Single Next.js Route Handler delegating all of /api/* to the Hono app
// (src/server/hono.ts), which owns actual routing (tRPC today, anything
// else added there later).

import { handle } from "hono/vercel";
import { app } from "@/server/hono";

export const GET = handle(app);
export const POST = handle(app);
