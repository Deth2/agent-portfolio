# agent-porfolio

Portfolio personale con una chat che risponde a domande sul profilo
professionale di Benedetta Correa, grounded sul suo CV. Vedi
[CONTEXT.md](CONTEXT.md) per il glossario di dominio (CV Profile,
Experience, Skill, Spoken Language, Contact, Question Limit) e
[docs/adr/](docs/adr/) per le decisioni architetturali con relative
motivazioni.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **tRPC su Hono** — un unico Route Handler catch-all
  (`app/api/[[...route]]/route.ts`) delega a un'app Hono che monta i router
  tRPC (`src/server/routers`) — vedi [ADR-0006](docs/adr/0006-trpc-on-hono-for-api-routes.md)
- **TanStack Query** (`@trpc/tanstack-react-query`) per le chiamate dal client
- **next-intl** per la lingua della chrome statica (IT/EN in base al browser,
  binario, senza toggle manuale)
- **Zod** per la validazione degli input tRPC
- **Vitest** + Testing Library per i test
- **Tailwind CSS v4** + shadcn/ui per lo styling

## Getting Started

```bash
npm install
cp .env.example .env.local   # poi compila LLM_BASE_URL/LLM_API_KEY/LLM_MODEL
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

Altri script:

```bash
npm run build   # build di produzione
npm run test    # esegue la suite Vitest una volta
npm run test:watch
npm run lint
```

## Configurazione (LLM adapter)

Tutto l'accesso al modello passa da un unico adapter OpenAI-compatible
(`src/lib/llm`), configurato via env var — vedi
[ADR-0001](docs/adr/0001-groq-free-tier-for-chat-agent.md) e
[ADR-0003](docs/adr/0003-openai-compatible-llm-adapter.md). `.env.example`
documenta tutte le variabili; le due configurazioni tipiche:

**Produzione (Groq, default):**

```bash
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_API_KEY=<la-tua-groq-api-key>
LLM_MODEL=llama-3.3-70b-versatile
```

**Sviluppo locale contro Ollama** (`ollama serve` già in esecuzione,
modello già scaricato con `ollama pull <modello>`):

```bash
LLM_BASE_URL=http://localhost:11434/v1
LLM_API_KEY=ollama
LLM_MODEL=<un-modello-che-hai-scaricato>   # es. gemma4:e4b
```

Il Question Limit (soglia di domande per sessione prima di reindirizzare ai
Contatti — [ADR-0002](docs/adr/0002-client-side-question-limit.md)) si
configura con `NEXT_PUBLIC_QUESTION_LIMIT_ENABLED` /
`NEXT_PUBLIC_QUESTION_LIMIT_THRESHOLD` (default: attivo, soglia 5).

## CV Profile

Tutti i contenuti — sia le sezioni statiche del sito (Esperienze, Skills,
Lingue, Hobby, Contatti) sia il contesto passato all'agent chat — arrivano
da un unico file: [`content/cv.md`](content/cv.md). Per aggiornare il CV
basta modificare quel file (frontmatter YAML per i campi strutturati,
sezioni Markdown per esperienze e hobby): non serve toccare codice, e i due
punti (sito e chat) non possono andare fuori sincrono.

Il parsing (`src/lib/cv/parse-cv-profile.ts`) fallisce rumorosamente su un
campo obbligatorio mancante o malformato, invece di renderizzare sezioni
vuote in silenzio — `src/lib/cv/load-cv-profile.test.ts` fa da guardia
contro un typo nel file reale.

## Architettura in breve

```
src/
├─ app/
│  ├─ page.tsx                 homepage (client component): sidebar profilo + card chat
│  └─ api/[[...route]]/route.ts  unico entry point HTTP → delega a Hono
├─ server/
│  ├─ hono.ts                  app Hono, monta tRPC su /api/trpc
│  ├─ trpc.ts                  init tRPC
│  └─ routers/                 chat.ask (mutation), cv.get (query)
├─ components/
│  ├─ chat-panel.tsx           rendering layer sopra useChatSession
│  └─ profile-sidebar.tsx      riassunto identità (nome/tagline/skill/contatto)
├─ lib/
│  ├─ chat/                    useChatSession (history + Question Limit + reset),
│  │                           useAskAboutCv (mutation TanStack Query)
│  ├─ cv/                      parseCvProfile, loadCvProfile, tipi CvProfile
│  ├─ llm/                     adapter OpenAI-compatible (askAboutCv)
│  ├─ i18n/                    rilevazione locale browser + provider next-intl,
│  │                           messages/{it,en}.json (stringhe della chrome statica)
│  └─ trpc/                    QueryClient + contesto tRPC per il client
content/cv.md                  CV Profile — unica fonte di verità
```

## Test

```bash
npm run test
```

Copertura automatica sui due seam identificati nello spec
(`.scratch/cv-chat-agent/spec.md`): `parseCvProfile` (fixture valide/minime/
malformate) e `useChatSession` (Question Limit, history, con un
`askAboutCv` finto — nessuna chiamata di rete reale nei test).
`askAboutCv`/l'adapter LLM è verificato manualmente contro Groq/Ollama, non
mockato a livello HTTP.

## Deploy

Pensato per Vercel. La configurazione dell'ambiente Vercel (dominio,
variabili in produzione) non è coperta da questo repo — vedi
`.env.example` per le variabili da impostare.
