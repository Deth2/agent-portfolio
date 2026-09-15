# Layout a due colonne (sidebar profilo + card chat) con nuova palette/font, dal design handoff

Il proprietario del progetto ha fornito un bundle di design da Claude Design
(`docs/Portfolio agent chatbot-handoff.zip`, primario:
`Portfolio Agent.dc.html`) con istruzioni di ricrearlo pixel-per-pixel nella
tecnologia del progetto. Il mockup sostituisce la card unica centrata di
[ADR-0007](./0007-chat-only-homepage.md) con un layout a due colonne: una
sidebar fissa (foto/iniziali, nome, ruolo, tagline, tag "Posso parlarti di",
indicatore di disponibilità animato, contatto email) affiancata alla card
chat, ora con header (titolo + bottone "nuova chat"), area messaggi
scrollabile a altezza fissa, chip di suggerimento nascosti dopo la prima
domanda, e footer con disclaimer.

**La decisione "chat only" di ADR-0007 resta valida**: non sono state
reintrodotte le tab CV (Esperienze/Skills/Lingue/Hobby/Contatti) rimosse in
quell'ADR — la sidebar mostra solo un riassunto d'identità (nome, ruolo,
tagline, primi 5 skill, un contatto), non le sezioni strutturate complete.
`src/app/page.tsx` ora renderizza `<ProfileSidebar cv={cv} />` +
`<ChatPanel />` in un contenitore flex che impila le due colonne sotto i
900px circa (breakpoint `md` di Tailwind) e le affianca sopra, invece del
singolo contenitore centrato all'80% di larghezza.

**Contenuti sidebar**: presi da `cv.get` (stesso `CvProfile` già caricato da
`content/cv.md`, single source of truth per [best-practices.md](../agents/best-practices.md))
invece di testo statico — nome/ruolo/tagline sono già campi del profilo, i
tag riusano i primi `SIDEBAR_TAG_COUNT` (5) elementi di `skills`, il
contatto è quello con `label === "Email"`. **Costo accettato**: il mockup
mostra una frase di disponibilità specifica e romanzata ("Disponibile da
ottobre"); non avendo un dato reale equivalente nel CV, è stata sostituita
con una frase neutra e veritiera ("Assistente virtuale · sempre
disponibile") invece di inventare una data di disponibilità professionale.

**Palette e font**: sostituita la scala hex di
[ADR-0005](./0005-brand-palette-60-30-10.md) con la scala oklch chiara
(toni blu/teal) del mockup, mantenendo però gli **stessi nomi** di custom
property (`--primary`, `--accent`, `--bg`, ecc.) e lo stesso mapping verso i
token semantici shadcn — il livellamento 60/30/10 (neutro dominante / brand
strutturale / accento sparso su stati interattivi) resta lo stesso, solo i
valori cambiano. Aggiunto un nuovo token `--accent-soft` (secondo stop del
gradiente su bottone invio/icone) e `--font-display` (Instrument Serif, per
il nome nella sidebar) accanto ai font esistenti, ora Manrope (`--font-sans`)
e IBM Plex Mono (`--font-geist-mono`) al posto di Inter/Geist Mono
(`src/app/layout.tsx`). **Costo accettato**: qualunque componente shadcn
non ancora usato nel progetto erediterà la nuova palette blu/teal invece di
quella navy/oro originaria — coerente con la richiesta di adottare il nuovo
design, ma da tenere presente se in futuro si reintroduce la palette 0005.

**Reset conversazione**: il bottone "nuova chat" del mockup è stato
implementato per davvero (non solo visivamente) aggiungendo
`resetSession()` a `useChatSession` (`src/lib/chat/use-chat-session.ts`),
che svuota `messages` e azzera il contatore del Question Limit
([ADR-0002](./0002-client-side-question-limit.md)) — la sessione chat
riparte da zero, coerente col nome del bottone.

**Esito**: `src/app/page.tsx` renderizza sidebar + card in un layout a due
colonne; nuovo componente `src/components/profile-sidebar.tsx`;
`src/components/chat-panel.tsx` ristrutturato con header/scroll
area/footer; `src/app/globals.css` e `src/app/layout.tsx` aggiornati per
palette e font; nuove chiavi i18n sotto `Sidebar` e chiavi aggiuntive sotto
`Chat` in `src/lib/i18n/messages/{it,en}.json`.
