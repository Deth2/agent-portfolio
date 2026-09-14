# La homepage mostra solo la chat, senza più le altre sezioni CV

**Supersede** [0004-chat-first-homepage.md](./0004-chat-first-homepage.md).

L'ADR-0004 aveva scelto un layout a tab (Variante C) in cui la chat è la tab
di default, ma le sezioni strutturate del CV (Esperienze, Skills, Lingue,
Hobby, Contatti) restavano raggiungibili con un click tramite la tab bar —
esplicitamente "non rimosse", per non perdere chi preferisce sfogliare il CV
piuttosto che chattare.

Il proprietario del progetto ha richiesto di eliminare del tutto header e tab
bar: la homepage ora mostra solo il pannello di chat, sempre, senza altra UI
di navigazione. Le sezioni CV non sono più raggiungibili dall'interfaccia.

**Costo accettato**: chi preferisce leggere il CV a colpo d'occhio non ha più
modo di farlo dalla UI (a differenza del costo mitigato in 0004). Il
contenuto delle altre sezioni resta comunque nell'agente di chat (può essere
chiesto in linguaggio naturale) e nei dati sorgente (`content/cv.md`); il
codice UI che le renderizzava è stato rimosso da `src/app/page.tsx`, insieme
ai componenti shadcn `Badge`/`Tabs` diventati inutilizzati.

**Esito**: `src/app/page.tsx` renderizza solo `<ChatPanel />`, in un
contenitore largo almeno l'80% della viewport, centrato, senza tetto massimo.
