# API Conventions

How API calls are structured in this repo: tRPC routers on Hono, mounted through a single Next.js catch-all route, consumed from the client via TanStack Query. Decision recorded in [ADR-0006](/docs/adr/0006-trpc-on-hono-for-api-routes.md).

## The server chain

```
Browser
  → POST/GET /api/trpc/<router>.<procedure>
  → src/app/api/[[...route]]/route.ts   (Next.js catch-all Route Handler)
  → src/server/hono.ts                  (Hono app, basePath "/api")
  → @hono/trpc-server                   (mounts appRouter at /trpc/*)
  → src/server/routers/_app.ts          (combines chatRouter + cvRouter)
  → src/server/routers/<name>.ts        (the actual procedure)
```

**`src/app/api/[[...route]]/route.ts`** — the only Route Handler in the app. Everything under `/api/*` goes through here:

```ts
import { handle } from "hono/vercel";
import { app } from "@/server/hono";

export const GET = handle(app);
export const POST = handle(app);
```

**`src/server/hono.ts`** — owns actual routing. Add future plain-Hono routes (webhooks, health checks) here too, rather than adding more Route Handlers under `app/api`:

```ts
export const app = new Hono().basePath("/api");

app.use(
  "/trpc/*",
  trpcServer({ router: appRouter, endpoint: "/api/trpc" })
);
```

**`src/server/trpc.ts`** — one shared tRPC instance, deliberately bare (no auth/session middleware — the site has no per-visitor identity):

```ts
const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;
```

## Adding a procedure

1. Add it to an existing router under `src/server/routers/`, or create a new router file and register it in `routers/_app.ts`.
2. Every procedure is `publicProcedure` (no auth layer exists) with a `.input(zodSchema)` when it takes input.
3. Queries read data (`.query(...)`); mutations change state or have side effects, including calling out to the LLM (`.mutation(...)`).
4. Throw `TRPCError` with a specific `code` on failure — don't let internal errors leak to the client uncaught.

Example — `cv.get`, a query with no input:

```ts
// src/server/routers/cv.ts
export const cvRouter = router({
  get: publicProcedure.query(() => loadCvProfile()),
});
```

Example — `chat.ask`, a mutation with validated input and explicit error handling:

```ts
// src/server/routers/chat.ts
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
        throw new TRPCError({ code: "BAD_GATEWAY", message: "Failed to get a reply from the LLM" });
      }
    }),
});
```

## Client setup

**`src/lib/trpc/context.ts`** — creates the typed React context/hooks from the `AppRouter` type (no values cross the client/server boundary at import time, only the type):

```ts
export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();
```

**`src/lib/trpc/provider.tsx`** — wires a TanStack Query `QueryClient` (fresh per request on the server, reused across re-renders in the browser) together with the tRPC client, and is mounted once in `src/app/layout.tsx`:

```tsx
export function TRPCQueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({ links: [httpBatchLink({ url: "/api/trpc" })] })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
```

## Calling a procedure from a component

Use `useTRPC()` to get typed query/mutation options, then pass them straight into TanStack Query's own `useQuery`/`useMutation` — there is no separate tRPC-flavored hook set (`@trpc/tanstack-react-query`, not `@trpc/react-query`).

**Query example** — `src/app/page.tsx`:

```ts
const trpc = useTRPC();
const { data: cv, isPending, isError } = useQuery(trpc.cv.get.queryOptions());
```

**Mutation example** — `src/lib/chat/use-ask-about-cv.ts`, wrapping a mutation in a small adapter so the caller (`useChatSession`) doesn't need to know it's backed by tRPC at all:

```ts
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
```

## Conventions to follow

- New endpoint → new tRPC procedure, not a new Route Handler. The single catch-all route stays the only entry point.
- Client components call procedures via `useTRPC()` + TanStack Query hooks, never `fetch("/api/...")` directly.
- Keep server-only logic (file reads, LLM calls, env var access) inside `src/server/` or `src/lib/<feature>` modules imported by routers — not inlined in route/procedure definitions.
- One data source per concept: both `cv.get` and `chat.ask` call the same `loadCvProfile()` so the static CV sections and the chat's context never drift apart. Follow this pattern for any new data — one loader, reused everywhere it's needed, not copied.
