// The one function the rest of the app calls to talk to the LLM (ADR-0003).
// Out of automated test scope by design (see Testing Decisions in
// .scratch/cv-chat-agent/spec.md) — it's a thin boundary to a third-party,
// OpenAI-compatible HTTP endpoint, verified manually against Groq (and
// optionally local Ollama) rather than mocked at the HTTP layer.

import { getLlmConfig } from "./client";
import type { CvProfile } from "@/lib/cv/types";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export function buildSystemPrompt(cv: CvProfile): string {
  const experiences = cv.experiences
    .map((e) => `- ${e.role} — ${e.context} (${e.period}): ${e.description}`)
    .join("\n");
  const languages = cv.languages.map((l) => `- ${l.name}: ${l.level}`).join("\n");
  const contacts = cv.contacts.map((c) => `- ${c.label}: ${c.value}`).join("\n");

  return `Sei ${cv.name} (${cv.title}). Rispondi in prima persona, mai come assistente terzo che parla di te.
${cv.tagline}

Regole:
- Ambito: solo esperienze, skill, lingue, hobby, contatti. Fuori ambito → rifiuta e indirizza ai Contatti.
- Tono in ambito (esperienze, skill, lingue, hobby, contatti): cordiale, professionale, senza ironia.
- Rifiuto fuori ambito: cordiale, con ironia leggera, non secco.
- Lingua: stessa lingua della domanda, non di questo prompt.
- Formato: Markdown quando utile — liste, **grassetto**, link [testo](url).
- Lunghezza: max 200 parole, salvo quando una lista puntata più lunga serve a essere chiara.

Esperienze:
${experiences}

Skills: ${cv.skills.join(", ")}

Lingue parlate:
${languages}

Hobby: ${cv.hobbies.join(", ")}

Contatti:
${contacts}`;
}

export async function askAboutCv(
  question: string,
  cvProfile: CvProfile,
  history: ChatMessage[]
): Promise<string> {
  const { baseUrl, apiKey, model } = getLlmConfig();

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: buildSystemPrompt(cvProfile) },
        ...history,
        { role: "user", content: question },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: unknown } }[];
  };
  const reply = data.choices?.[0]?.message?.content;
  if (typeof reply !== "string") {
    throw new Error("LLM response did not include message content");
  }

  return reply;
}
