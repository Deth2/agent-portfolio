# Best Practices

Practices this codebase already follows. Match them in new code rather than introducing a different style.

## TypeScript & linting

- `tsconfig.json` has `"strict": true` and `moduleResolution: "bundler"`; path alias `@/*` → `./src/*`. Use the alias for cross-directory imports instead of relative `../../..` chains.
- `eslint.config.mjs` uses `eslint-config-next` (`core-web-vitals` + `typescript` rule sets), flat config. Run the linter before considering a change done.

## Testing

- Vitest (`vitest.config.ts`), `jsdom` environment, `@testing-library/react` available. Test files are co-located as `src/**/*.test.{ts,tsx}` next to the code they cover, not in a separate `__tests__` tree.
- Existing tests: `parse-cv-profile.test.ts`, `load-cv-profile.test.ts`, `use-chat-session.test.ts` — all use fixtures rather than inline fixtures-in-test, e.g. `src/lib/cv/__fixtures__/` holds `valid-full`, `valid-minimal`, and two malformed-input variants (`missing-frontmatter-field`, `missing-experiences-section`).
- When adding parsing/validation logic, add a malformed-input fixture and a test asserting it fails loudly (see next section) — not a silently-degraded output.

## Error handling

- **Fail loud on malformed input, don't degrade silently.** `parseCvProfile` throws on malformed/missing required CV fields rather than rendering a blank section — verified by the malformed fixtures above. Apply the same rule to any new parser: a bad input is a thrown error, not an empty result.
- **Convert internal failures to typed API errors at the boundary.** `chatRouter.ask` catches `askAboutCv` failures, logs with `console.error`, and rethrows as `TRPCError({ code: "BAD_GATEWAY" })` — the client never sees a raw internal error. Do this in every procedure that calls out to something that can fail (LLM, filesystem, external API).
- **Catch and translate at the UI edge, not deeper.** `ChatPanel`'s wrapped `askAboutCv` catches the mutation's error and returns a translated string (`t("errorReply")`) so a failure renders as a normal chat bubble instead of throwing into `useChatSession`. Keep this catch at the outermost caller, not scattered through the hook chain.

## Configuration

- All LLM provider config is centralized in `src/lib/llm/client.ts` (`getLlmConfig()`), read from env vars only — no values duplicated or hardcoded elsewhere (see [ADR-0003](/docs/adr/0003-openai-compatible-llm-adapter.md)). Any new external-service config should follow the same single-function pattern.

## Single source of truth

- CV data lives in exactly one place, `content/cv.md`, read through exactly one function, `loadCvProfile()`, used by both the `cv.get` query and the `chat.ask` mutation — so the static CV sections and the chat's grounding context can never drift apart. When two features need the same data, make them share the loader; don't let each fetch/parse independently.

## ADR discipline

- Architecturally significant, hard-to-reverse, or non-obvious decisions are recorded as ADRs under `docs/adr/` (see current list in [docs-and-ai-workflow.md](./docs-and-ai-workflow.md)) — each with rationale and accepted cost/risk.
- Source files cross-reference the ADR that justifies their approach directly in a header comment (e.g. `chat-panel.tsx`, `hono.ts`). Do the same for new files whose approach isn't self-evident: link the ADR or spec that explains "why this way," don't just describe "what."
- Before implementing something that touches an existing ADR's territory, read it. If your change would contradict it, say so explicitly (see [domain.md](./domain.md)) rather than silently doing it differently.

## Comment convention

Most source files open with a short header comment explaining the file's role and why it exists this way, often linking to the relevant ADR or spec section (see any file under `src/server/routers/` or `src/lib/chat/` for the pattern). Follow it for new non-trivial files — the comment should answer "why does this file exist and why does it work this way," not restate what the code obviously does line by line.

## No CONTRIBUTING.md

Coding-standards guidance lives here, in `docs/agents/`, routed from `CLAUDE.md` → `AGENTS.md`, rather than in a separate CONTRIBUTING.md. See [docs-and-ai-workflow.md](./docs-and-ai-workflow.md) for how these files connect.
