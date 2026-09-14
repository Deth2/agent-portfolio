# Architecture

Project structure and architectural shape of this repo, for agents that need to know where things live before writing code.

## Stack

Next.js 16 (App Router, Turbopack), single-page portfolio site with a chat agent grounded in one CV Markdown file. No database — see [Content: no persistence layer](#content-no-persistence-layer).

## Top-level layout

```
/
├── content/cv.md              # single source of truth for CV data
├── src/
│   ├── app/                   # Next.js App Router
│   ├── server/                # Hono + tRPC backend
│   ├── components/            # React components (chat UI, shadcn/ui primitives)
│   └── lib/                   # feature-organized library code
├── docs/adr/                  # architecture decision records
├── docs/agents/                # this directory — agent-facing docs
├── .scratch/                   # local issue tracker (see docs/agents/issue-tracker.md)
└── CONTEXT.md                  # domain glossary
```

## `src/app`

- `layout.tsx` — root layout: fonts, mounts `TRPCQueryProvider` then `I18nProvider` around `children`. See [pages.md](./pages.md).
- `page.tsx` — the only real page: a tabbed homepage (chat + CV sections).
- `globals.css` — global styles / design tokens.
- `api/[[...route]]/route.ts` — single catch-all Route Handler delegating all of `/api/*` to the Hono app. See [api-conventions.md](./api-conventions.md).

## `src/server`

Backend logic, never imported from client components:

- `hono.ts` — the Hono app; mounts tRPC routers under `/api/trpc/*`. Add any future plain Hono routes (webhooks, health checks) here too, rather than spreading ad-hoc Route Handlers across `app/api`.
- `trpc.ts` — bare `initTRPC.create()`; exports `router` and `publicProcedure`. No auth/session middleware — the site has no per-visitor identity beyond an anonymous browser session (see `.scratch/cv-chat-agent/spec.md`, Out of Scope).
- `routers/_app.ts` — combines all routers into `appRouter`; exports the `AppRouter` type consumed by the client.
- `routers/chat.ts` — `chat.ask` mutation: takes a question + history, returns the LLM reply.
- `routers/cv.ts` — `cv.get` query: returns the parsed CV Profile.

## `src/components`

- `chat-panel.tsx` — the chat UI, a thin rendering layer over `useChatSession` (see [pages.md](./pages.md)).
- `ui/` — shadcn/ui primitives (`badge.tsx`, `button.tsx`, `card.tsx`, `tabs.tsx`). Treat these as generated/vendored; extend by composition, don't hand-edit their internals.

## `src/lib` — feature slices

Each subdirectory is a self-contained slice: its own hooks, types, and co-located `.test.ts` files where relevant.

- **`chat/`** — chat session state machine.
  - `use-chat-session.ts` — owns message history and the Question Limit counter (client-side, see [ADR-0002](/docs/adr/0002-client-side-question-limit.md)); takes an injected `askAboutCv` function so it stays transport-agnostic.
  - `use-ask-about-cv.ts` — bridges `chat.ask` (tRPC) to the shape `useChatSession` expects.
  - `question-limit-config.ts` — the Question Limit's enabled/threshold config.
- **`cv/`** — CV Profile parsing.
  - `types.ts` — the `CvProfile` shape.
  - `parse-cv-profile.ts` — parses `content/cv.md` frontmatter + prose into a `CvProfile`; fails loudly on malformed/missing required fields.
  - `load-cv-profile.ts` — reads the file and calls the parser; the one function used by both `cv.get` and `chat.ask` so static sections and chat context never drift apart.
  - `__fixtures__/` — Markdown fixtures for tests (valid-full, valid-minimal, two malformed variants).
- **`llm/`** — LLM provider integration.
  - `client.ts` — `getLlmConfig()`, reads provider config from env vars only; generic OpenAI-compatible HTTP client, no provider SDK (see [ADR-0003](/docs/adr/0003-openai-compatible-llm-adapter.md)).
  - `chat.ts` — `askAboutCv(question, cvProfile, history)`, the adapter function the chat router calls.
- **`trpc/`** — client-side tRPC/TanStack Query wiring. See [api-conventions.md](./api-conventions.md).
- **`i18n/`** — site-chrome translations (next-intl). See [pages.md](./pages.md).
- **`utils.ts`** — shadcn's `cn()` class-merge helper.

## Content: no persistence layer

`content/cv.md` is a flat Markdown file (frontmatter + prose) read at request time on the server. There is no database and none is planned yet — this is an explicit, current-scope decision (see [ADR-0006](/docs/adr/0006-trpc-on-hono-for-api-routes.md) and `.scratch/cv-chat-agent/spec.md`, Out of Scope), not an oversight. If a task implies persistence (saved conversations, multiple CVs, an admin editor), flag it — it's a scope change, not a bug fix.

## Where a new piece of work goes

- New API endpoint → a new tRPC router under `src/server/routers/`, registered in `_app.ts`. Only reach for a plain Hono route in `hono.ts` for something tRPC can't express (webhooks, health checks).
- New client data-fetching → a `useQuery`/`useMutation` call using `trpc.<router>.<procedure>` from `useTRPC()` (see [api-conventions.md](./api-conventions.md)).
- New UI → a component in `src/components`, composed from `src/components/ui` primitives where possible; feature-specific state/hooks go in the matching `src/lib/<feature>/` slice, not inline in the component, if there's real logic to isolate.
- New domain vocabulary → `CONTEXT.md` first (see [domain.md](./domain.md)).
