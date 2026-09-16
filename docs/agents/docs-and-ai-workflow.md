# Documentation Map & AI Workflow

Two closely related things: where this repo's documentation lives and how it cross-references itself, and how AI agents/skills are expected to use it.

## Documentation map

```
CLAUDE.md                          # entry point / index for agent skills
  → @AGENTS.md                     # framework-injected, not project-authored (see below)
  → docs/agents/*.md                 # agent-facing conventions (this directory)

docs/agents/
  ├── architecture.md              # project structure & architecture
  ├── api-conventions.md           # tRPC/Hono call structure, with examples
  ├── pages.md                     # client-side page structure
  ├── best-practices.md            # practices to follow
  ├── docs-and-ai-workflow.md      # this file
  ├── domain.md                    # how to consume CONTEXT.md / ADRs
  ├── issue-tracker.md             # .scratch/ convention
  └── triage-labels.md             # label vocabulary mapping

CONTEXT.md                          # domain glossary (root)
docs/adr/*.md                       # architecture decision records (root)
.scratch/<feature-slug>/spec.md     # feature specs, e.g. cv-chat-agent
README.md                           # human-facing getting-started + architecture summary
```

### How the pieces reference each other

- **`CLAUDE.md`** starts with `@AGENTS.md` (an include directive), then an "## Agent skills" section listing every doc in `docs/agents/`. It's the single index — add a new `docs/agents/*.md` file here whenever one is created, following the existing `### <Name>` + one-line pointer pattern.
- **`AGENTS.md`** is _not_ project-authored documentation — it's a block written and re-added by `next dev` itself (see `node_modules/next/dist/server/lib/generate-agent-files.js`), warning that this Next.js version has breaking changes versus training data and pointing at `node_modules/next/dist/docs/`. Don't edit it by hand; don't be surprised if it reappears after `next dev` runs.
- **`CONTEXT.md`** is the domain glossary (terms like CV Profile, Experience, Skill, Question Limit — each with a definition and rejected synonyms). It cross-references specific ADRs where a term's meaning was pinned down by a decision (e.g. Question Limit → [ADR-0002](/docs/adr/0002-client-side-question-limit.md)).
- **`docs/adr/`** holds eight ADRs, each an independent, numbered, accepted decision:
  - `0001-groq-free-tier-for-chat-agent.md`
  - `0002-client-side-question-limit.md`
  - `0003-openai-compatible-llm-adapter.md`
  - `0004-chat-first-homepage.md`
  - `0005-brand-palette-60-30-10.md`
  - `0006-trpc-on-hono-for-api-routes.md`
  - `0007-chat-only-homepage.md`
  - `0008-sidebar-profile-layout.md`
- **`.scratch/cv-chat-agent/spec.md`** is a full PRD-style spec (problem statement, user stories, implementation/testing decisions, out-of-scope, further notes) that links back to ADRs 0001–0005 and to `CONTEXT.md`'s vocabulary. It follows the issue-tracker convention in [issue-tracker.md](./issue-tracker.md) and currently carries `Status: ready-for-agent`.
- **`README.md`** is the human-facing entry point: stack summary, setup, LLM config instructions, an architecture tree, test/deploy notes — and links out to `CONTEXT.md` and `docs/adr/*`.
- **Source code comments** close the loop: files under `src/server/routers/`, `src/lib/chat/`, `src/components/chat-panel.tsx` etc. link back to the spec and the specific ADR number that justifies their approach (see [best-practices.md](./best-practices.md), "ADR discipline").

### Flow for a reader

A human or agent landing in this repo follows: `CLAUDE.md` → the relevant `docs/agents/*.md` (conventions for the task at hand) → `CONTEXT.md`/`docs/adr/` (domain + decisions) → source code, whose header comments point back to the exact spec/ADR that explains "why." `.scratch/` is the separate, parallel track for active feature work (specs and tickets), referenced from source comments but not from `CLAUDE.md` directly — it's discovered via [issue-tracker.md](./issue-tracker.md).

## AI workflow: skills and commands

No `.claude/commands/` or `.claude/skills/` directory exists in this repo — there are no repo-local custom slash commands. The project instead relies on globally available Anthropic/mattpocock skills (`/domain-modeling`, `/grill-with-docs`, `/to-issues`, `/to-prd`, `/review`, `/wayfinder`, etc.), routed to this repo's specific conventions through `docs/agents/`.

### `.claude/` config

- **`.claude/launch.json`** — dev server config for Claude Code's preview tooling: runs `npm run dev` on port 3000 (`agent-porfolio-dev`, `autoPort: true`). Used by preview/browser tools to boot the app without you needing to start it manually.
- **`.claude/settings.local.json`** — local permission allowlist (Bash command patterns, Read paths) accumulated across sessions (scaffolding, shadcn installs, git ops, design-canvas scripts, npm/vitest/eslint/tsc runs). Not a workflow file to read for conventions — just accumulated tool permissions.

### `docs/agents/*.md` — what each file is for

| File                                       | Purpose                                                                                                                                                                                                                                           | Consumed by                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [domain.md](./domain.md)                   | Tells exploration/refactor skills to read `CONTEXT.md` and relevant ADRs _before_ exploring, use the glossary's exact terms, and flag (not silently override) ADR conflicts.                                                                      | `/domain-modeling`, `/grill-with-docs`, `/improve-codebase-architecture`                |
| [issue-tracker.md](./issue-tracker.md)     | Defines the `.scratch/<feature-slug>/spec.md` + `.scratch/<feature-slug>/issues/NN-<slug>.md` convention, `Status:`/`## Comments` fields, and the map/child "wayfinder" ticket scheme (`.scratch/<effort>/map.md`, `Blocked by:`, claim/resolve). | Any skill that reads/writes tickets; `/wayfinder` specifically for the map/child scheme |
| [triage-labels.md](./triage-labels.md)     | Maps the five generic skill triage roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) to this repo's actual label strings — currently identical 1:1.                                                           | Any skill that applies or reads a triage label                                          |
| [architecture.md](./architecture.md)       | Project folder structure, what lives where, where new code should go.                                                                                                                                                                             | General-purpose exploration/implementation work                                         |
| [api-conventions.md](./api-conventions.md) | tRPC-on-Hono call structure end to end, with concrete query/mutation examples, and the convention for adding a new procedure.                                                                                                                     | Work that adds/changes an API call                                                      |
| [pages.md](./pages.md)                     | The (single-route) page tree, i18n wiring, and the chat panel's hook/component split.                                                                                                                                                             | Work that touches `src/app` or adds client-side UI                                      |
| [best-practices.md](./best-practices.md)   | Testing, error-handling, config, single-source-of-truth, and ADR/comment conventions already in force.                                                                                                                                            | Any code-writing task, as a style/pattern reference                                     |
| docs-and-ai-workflow.md (this file)        | How all of the above documentation connects, and how AI skills are meant to use it.                                                                                                                                                               | Orientation for a new session                                                           |

### Practical flow for an agent picking up work

1. Read `CLAUDE.md` → the `docs/agents/*.md` files relevant to the task (this table tells you which).
2. Per [domain.md](./domain.md), read `CONTEXT.md` and any ADR touching the area before writing code; use the glossary's terms verbatim.
3. If the task is issue-tracker-shaped, follow [issue-tracker.md](./issue-tracker.md) and [triage-labels.md](./triage-labels.md) for where tickets live and what status to set.
4. Write code following [architecture.md](./architecture.md), [api-conventions.md](./api-conventions.md), [pages.md](./pages.md), and [best-practices.md](./best-practices.md) as applicable.
5. If a term needed clarifying or a hard-to-reverse decision got made, update `CONTEXT.md` or add an ADR inline, per [domain.md](./domain.md) — don't batch it for later.
