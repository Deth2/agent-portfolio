# Client-Side Pages

This is a single-route app (no dynamic segments, no i18n URL routing). What follows is the whole page tree plus how i18n and the chat panel are wired in.

## Route tree

```
src/app/
├── layout.tsx   # root layout: providers + fonts
└── page.tsx     # the only page: tabbed homepage
```

**`layout.tsx`** — sets `<html lang="it">`, loads Geist fonts, and nests the two app-wide providers around `children`:

```tsx
<TRPCQueryProvider>
  <I18nProvider>{children}</I18nProvider>
</TRPCQueryProvider>
```

Provider order matters here only in that `I18nProvider` doesn't depend on tRPC data, so either order would work — but keep `TRPCQueryProvider` outermost if a future provider ever needs query data during its own render.

**`page.tsx`** (`Home`) — fetches `cv.get`, then renders a header (`cv.name` / `cv.title`) and a shadcn `Tabs` with six tabs: `chat`, `experience`, `skills`, `languages`, `hobbies`, `contacts`. `chat` is `defaultValue` — visible with no click on load, per [ADR-0004](/docs/adr/0004-chat-first-homepage.md). The other five tabs render directly from the `cv` query result; there's no separate fetch per tab.

Loading/error states are handled once, before the tabs render at all:

```tsx
if (isPending) return <div>{tCommon("loading")}</div>;
if (isError || !cv) return <div>{tCommon("loadError")}</div>;
```

If you add a new page or route, it goes under `src/app/`; nest a new `layout.tsx` only if that route needs providers or chrome the root layout doesn't already give it.

## i18n (next-intl)

Governs **only static chrome strings** (labels, buttons, greeting) — not the LLM's own replies, which always match the visitor's question language regardless of site locale (handled in the system prompt inside `src/lib/llm/chat.ts`, not app code).

No routing/middleware: locale is a one-shot decision from the browser's reported language, not a URL segment.

- `src/lib/i18n/locale.ts` — `detectSiteLocale()` reads `navigator.language`, resolves to `"it"` or `"en"`, defaults to `"it"` when `navigator` is undefined (SSR).
- `src/lib/i18n/use-site-locale.ts` — `useSiteLocale()` uses `useSyncExternalStore` so the SSR/hydration snapshot is always `"it"` (matching what the server rendered) and the post-hydration client snapshot resolves the real browser locale, avoiding a hydration mismatch or a setState-in-effect flash:

```ts
const subscribe = () => () => {};
const getServerSnapshot = (): SiteLocale => "it";

export function useSiteLocale(): SiteLocale {
  return useSyncExternalStore(subscribe, detectSiteLocale, getServerSnapshot);
}
```

- `src/lib/i18n/i18n-provider.tsx` — `I18nProvider` wraps `children` in next-intl's `NextIntlClientProvider`, picking `messages` from `{ it, en }` (loaded from `src/lib/i18n/messages/{it,en}.json`) keyed by the resolved locale.
- Consumed in components via `useTranslations("<Namespace>")`, e.g. `useTranslations("Tabs")`, `useTranslations("Common")`, `useTranslations("Chat")` — namespaces match top-level keys in the message JSON files.

**Adding a UI string**: add the key under the right namespace in both `src/lib/i18n/messages/en.json` and `it.json`, then read it with `useTranslations("<Namespace>")` in the component. Never hardcode user-facing chrome text in JSX.

## Chat panel (`src/components/chat-panel.tsx`)

A thin rendering layer — all state lives in hooks, the component just renders it:

- Fetches `cv.get` again (cache hit — `page.tsx` already fetched it, gated the page render on it, so this never triggers a second network round trip) to get the visitor's initials for the assistant avatar.
- `useAskAboutCv()` (tRPC mutation, see [api-conventions.md](./api-conventions.md)) is wrapped in a local `askAboutCv` that catches errors and returns a translated `t("errorReply")` string instead of throwing — so a network/LLM failure shows as a chat bubble, not a crash.
- `useChatSession({ askAboutCv, limitExceededMessage })` (`src/lib/chat/use-chat-session.ts`) owns:
  - `messages` — the conversation history for this browser session only, never shared across visitors.
  - the Question Limit counter — checked *before* calling `askAboutCv`; once over the threshold it synthesizes `limitExceededMessage` locally without a network call at all (see [ADR-0002](/docs/adr/0002-client-side-question-limit.md)).
  - `isLoading` / `sendQuestion`.
- The greeting bubble is rendered separately from `messages` (not seeded into history) specifically so it reacts to the locale resolving after mount, instead of being frozen at whatever locale was current when the hook first initialized.
- Local subcomponents: `AssistantBubble` (avatar + message bubble), `SendIcon` (inline SVG) — kept in the same file since neither is reused elsewhere.
- Topic chips (`t.raw("topics")`) pre-fill the input on click rather than sending immediately, so the visitor can edit before submitting.

## Adding a new interactive component

Follow the same split as `ChatPanel`/`useChatSession`: put non-trivial state and side effects in a hook under `src/lib/<feature>/`, keep the component itself focused on rendering + wiring the hook's return value to markup. See [architecture.md](./architecture.md) for where new feature slices go.
