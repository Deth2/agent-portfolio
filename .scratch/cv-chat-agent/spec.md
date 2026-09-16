# CV Chat Agent

Status: ready-for-agent

## Problem Statement

Benedetta wants her personal portfolio to let visitors ask about her background — experience, skills, spoken languages, hobbies, how to reach her — conversationally, instead of only reading static CV sections. A visitor landing on the homepage should be able to start that conversation immediately, in whichever language they read (Italian or English), without hunting for a contact form. Because the site is public, free, and hosted on a free-tier LLM quota, Benedetta also needs the chat to not run away with API usage if the site gets unexpected traffic.

## Solution

A chat-first homepage where the agent answers only questions about Benedetta's CV Profile, grounded in a single Markdown file that is also the source for the static CV sections (Esperienze, Skills, Lingue, Hobby, Contatti), so the two never drift apart. The agent is powered by an OpenAI-compatible LLM provider (Groq by default) reached through a small adapter that can be pointed at another provider — including a local Ollama instance during development — purely via environment variables. A disableable, session-scoped Question Limit protects the free-tier quota by pointing visitors to Contacts after a configurable number of questions. The site's static chrome switches between Italian and English based on the visitor's browser locale, while the agent itself always replies in whatever language the visitor's question was asked in.

## User Stories

1. As a visitor, I want to see a chat panel as soon as I open the homepage, so that I don't have to search for how to learn about Benedetta.
2. As a visitor, I want to read a welcome message when I open the chat, so that I understand I can ask questions in natural language.
3. As a visitor, I want suggested topic chips (Esperienza, Skills, Lingue, Hobby, Contatti), so that I know what I can ask even if I can't think of a question myself.
4. As a visitor, I want clicking a topic chip to pre-fill the question input, so that I can quickly ask a common question without typing it myself.
5. As a visitor, I want to type a free-form question and get an answer grounded in Benedetta's real CV, so that I get accurate information about her background.
6. As a visitor, I want the agent to answer only questions related to Benedetta's professional/personal profile, so that I don't mistake it for a general-purpose chatbot.
7. As a visitor, I want the agent to politely point me to Contacts when I ask something off-topic, so that I understand its scope instead of hitting a dead end or a generic refusal.
8. As a visitor, I want the agent to answer about Benedetta's work Experiences (company/context, role, period, description), so that I can evaluate her professional background.
9. As a visitor, I want the agent to answer about the Skills Benedetta knows, so that I can assess fit for a role or project.
10. As a visitor, I want the agent to answer about which Spoken Languages Benedetta knows and at what level, so that I know how to communicate with her.
11. As a visitor, I want the agent to answer about Benedetta's hobbies, so that I get a sense of her as a person, not just a CV.
12. As a visitor, I want the agent to tell me her Contacts (email, LinkedIn, GitHub) when I ask, so that I can reach out directly.
13. As a visitor, I want the site's static labels and headings to appear in Italian if my browser is set to Italian, and in English otherwise, so that I can read the site comfortably without configuring anything.
14. As a visitor, I want the agent to reply in the same language I used to ask my question, regardless of the site's displayed language, so that the conversation feels natural.
15. As a visitor who has asked several questions, I want to be told, after a limited number of questions, to contact Benedetta directly, so that I have a clear next step if I need more than the agent can give me.
16. As Benedetta, I want the Question Limit to be a feature I can turn on or off via configuration, so that I can loosen it for a demo or a quiet period without changing code.
17. As Benedetta, I want the Question Limit to default to enabled with a threshold of 5 questions per session, so that my free-tier LLM quota is protected from day one without extra setup.
18. As Benedetta, I want the CV Profile to live in a single Markdown file I can edit myself, so that I don't need to touch code or duplicate data to update my CV.
19. As Benedetta, I want that same CV Markdown file to drive both the static sections and the agent's chat context, so that the two never drift out of sync.
20. As Benedetta, I want the chat powered by a free-tier LLM provider (Groq) by default, so that the portfolio costs nothing to run at low traffic.
21. As Benedetta, I want the LLM provider swappable to any other OpenAI-compatible endpoint (including a local Ollama instance) purely via environment variables, so that I can develop against a local model and deploy against a hosted one without touching code.
22. As Benedetta, I want the agent's system prompt built from the CV Profile at request time, so that an edit to the CV Markdown shows up in the agent's answers without redeploying prompt logic.
23. As Benedetta, I want the chat session state (messages, question count) scoped to each visitor's browser session, so that one visitor's Question Limit doesn't affect another's.
24. As a visitor, I want my questions answered without a full page reload, so that the conversation feels responsive.
25. As Benedetta, I want the Question Limit's exceeded message to point to Contacts, so that an engaged visitor has a real next step instead of a dead end.
26. As a developer maintaining this project, I want CV Markdown parsing to fail loudly on a malformed file (not silently drop fields), so a broken CV update is caught before it reaches production.
27. As a developer, I want to test the Question Limit and chat session behavior without calling a real LLM, so tests are fast and don't burn API quota.
28. As a developer, I want to test CV Markdown parsing against fixture files, so I can verify the schema without needing Benedetta's real CV content in the test suite.

## Implementation Decisions

- **CV Profile data**: a single Markdown file (YAML frontmatter for structured fields — contacts, spoken languages, skills; prose sections for experiences and hobbies) is the CV Profile's source of truth, per the project's domain glossary. A `parseCvProfile(markdown: string): CvProfile` function turns it into the typed shape already established by `src/lib/mock-cv.ts` (name, title, tagline, contacts, experiences, skills, spoken languages, hobbies) — that mock file is what this parser replaces, without changing the shape its consumers rely on. Missing/malformed required fields should fail parsing rather than silently rendering blank sections.
- **LLM adapter**: all model access goes through one function, `askAboutCv(question, cvProfile, history)` (ADR-0003), backed by an OpenAI-compatible HTTP client configured entirely via `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL` env vars. Defaults point at Groq (ADR-0001); pointing them at a local Ollama endpoint is a supported alternative for local development only — Ollama itself is not deployable on Vercel serverless (ADR-0001).
- **Guardrail & context**: the system prompt is assembled at request time from the full `CvProfile` (no RAG — the CV is small enough to pass whole) plus an instruction to answer only about Benedetta's profile and to redirect off-topic questions toward Contacts. The reply-language behavior (matching the visitor's question) is left to the model via this same system prompt, not a separate detection step in application code.
- **Chat endpoint**: a Next.js Route Handler (e.g. `app/api/chat/route.ts`) takes the current question plus prior history and returns the assistant's reply text. Streaming is a nice-to-have, not required.
- **Question Limit** (ADR-0002): a session-scoped count of visitor questions. When enabled (default) and the count reaches a configured threshold (default 5), further questions are intercepted client-side, before any LLM call, and answered instead with a fixed message pointing to Contacts. Enabled/disabled state and the threshold are read from env vars at build time (client-side check).
- **Chat session controller**: message history and the Question Limit counter live in one controller (e.g. a `useChatSession` hook wrapping a plain reducer) that: appends the visitor's question, checks the Question Limit before calling out, calls an injected `askAboutCv`-shaped function for the reply when under the limit, or synthesizes the fixed limit-exceeded message when at/over it. `ChatPanel` becomes a thin rendering layer over this controller, replacing its current inline placeholder-reply logic.
- **Site chrome language**: chosen once per page load from the browser's reported locale — Italian if Italian, English for every other locale (binary, no manual toggle, per the decision made in this project). Governs only static UI strings, not the chat's own replies.
- **Configuration surface**: `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, and the Question Limit env vars, documented in a `.env.example`.

## Testing Decisions

Good tests here assert externally observable behavior (what a caller gets back, what a visitor would see), not internal implementation details.

- **`parseCvProfile`** — unit-tested against fixture Markdown strings: one fully-populated valid fixture, one minimal-valid fixture, and at least one malformed fixture missing a required field. Asserts the returned `CvProfile` shape, and that the malformed fixture fails parsing rather than returning partial data.
- **Chat session controller** (`useChatSession` or equivalent) — unit-tested with an injected fake `askAboutCv` (returns a canned reply / records calls), no network involved. Asserts: a question under the Question Limit is forwarded to `askAboutCv` and its reply appended to history; a question at/over the threshold is _not_ forwarded and instead appends the fixed Contacts message; with the limit disabled via configuration, no threshold applies regardless of question count.
- **LLM adapter itself** (`askAboutCv` / the HTTP client) is out of scope for automated tests in this spec — it's a thin boundary to a third-party provider, verified manually against the real Groq endpoint (and optionally local Ollama) rather than mocked at the HTTP layer. This keeps the test seam at the session-controller boundary, not the network call.
- No test runner exists in this repo yet; introducing one (a standard TypeScript/Next.js choice, e.g. Vitest) is part of this work, since there's no prior art to follow here.
- UI-only behavior (chip pre-fill, locale-based chrome language) is covered by manual verification, not automated tests, consistent with keeping automated coverage at the two seams above.

## Out of Scope

- Actually deploying to Vercel (platform env var setup, domain, etc.) — this spec covers the application code and its configuration surface, not the deploy operation.
- Server-side rate limiting per IP (e.g. Upstash Redis) — explicitly deferred in ADR-0002; the Question Limit is a cost-containment measure, not a security boundary.
- RAG/embeddings/vector search over the CV — rejected for this data size; the whole CV Profile is passed in context on every request.
- A manual language toggle in the UI — browser-locale auto-detect only.
- A contact form or any other write path (sending emails/messages) — Contacts are displayed as static information only.
- Further visual/interaction redesign — the chat-first layout, avatar, stacked input/send, topic chips, and brand palette are already implemented; this spec wires real data and a real model behind that existing interface.
- Authentication, accounts, or any per-visitor identity beyond an anonymous browser session.
- Streaming LLM responses (nice-to-have, not required here).

## Further Notes

- Benedetta's real CV content (experiences, skills, spoken languages, hobbies, contacts) hasn't been provided yet. `src/lib/mock-cv.ts` stays the placeholder data source until it is; `parseCvProfile` can and should be implemented and tested against fixtures in the meantime, and `mock-cv.ts` can be deleted once the real Markdown file is wired into `src/app/page.tsx` and `src/components/chat-panel.tsx`.
- Relevant prior decisions: [ADR-0001](../../docs/adr/0001-groq-free-tier-for-chat-agent.md) (Groq over Claude/OpenAI/Ollama), [ADR-0002](../../docs/adr/0002-client-side-question-limit.md) (client-side Question Limit over server-side rate limiting), [ADR-0003](../../docs/adr/0003-openai-compatible-llm-adapter.md) (OpenAI-compatible adapter for provider swappability), [ADR-0004](../../docs/adr/0004-chat-first-homepage.md) (chat as the homepage's primary content), [ADR-0005](../../docs/adr/0005-brand-palette-60-30-10.md) (60/30/10 brand palette).
- Domain vocabulary (see `CONTEXT.md`): CV Profile, Experience, Skill, Spoken Language, Contact, Question Limit — use these terms during implementation, not synonyms (e.g. "Spoken Language" is distinct from "Skill", which covers programming languages/tools).
