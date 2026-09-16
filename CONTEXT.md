# Agent Portfolio

Sito portfolio personale con una chat che risponde a domande sul profilo professionale della persona, usando i suoi dati CV come contesto.

## Language

**CV Profile**:
L'insieme strutturato di tutti i dati professionali e personali di una persona (esperienze, skill, lingue parlate, contatti, hobby). È la fonte di verità sia per le sezioni statiche del portfolio sia per il contesto passato all'agent chat.
_Avoid_: CV, resume (termini per il documento sorgente/PDF, non per il modello dati)

**Experience**:
Un'esperienza lavorativa o di progetto, con contesto (azienda/progetto), ruolo, periodo e descrizione.
_Avoid_: Job, Work

**Skill**:
Una tecnologia, strumento o competenza tecnica che la persona sa usare (es. "React", "TypeScript").
_Avoid_: Technology, Tool (quando riferiti a un singolo elemento della lista competenze)

**Spoken Language**:
Una lingua umana parlata/scritta dalla persona, con relativo livello (es. Italiano — madrelingua, Inglese — B2). Distinta da Skill: una Skill è una competenza tecnica, una Spoken Language è una lingua umana.
_Avoid_: Language da solo (ambiguo con "linguaggio di programmazione", che è una Skill)

**Contact**:
Un canale statico per essere contattati (email, LinkedIn, GitHub, ecc.), mostrato come testo/link. Non esiste un form interattivo in questo progetto.
_Avoid_: Contact form

**Question Limit**:
Il numero massimo di domande che un visitatore può rivolgere all'agent chat in una sessione prima che venga mostrato un messaggio che invita a usare i Contact invece di continuare a rispondere. È una feature attivabile/disattivabile (di default attiva, soglia a 5).
_Avoid_: Rate limit — il Question Limit è un limite lato client pensato per UX e contenimento costi, non una misura di sicurezza reale (vedi [ADR-0002](docs/adr/0002-client-side-question-limit.md)).

**Agent Voice**:
Il registro con cui l'agent chat risponde: sempre in prima persona, come se fosse la persona del CV Profile stessa a scrivere — mai un assistente terzo che parla di lei. Sulle domande in ambito (esperienze, skill, lingue, hobby, contatti) il tono è cordiale e professionale, senza ironia; l'ironia leggera è riservata al rifiuto delle domande fuori ambito.
_Avoid_: Assistente/Bot (quando si descrive come l'agent "parla" — l'agent non si presenta come un assistente su di lei, ma come lei in prima persona).
