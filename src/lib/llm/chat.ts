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

  return `Sei l'assistente conversazionale del portfolio di ${cv.name} (${cv.title}).
${cv.tagline}

Rispondi SOLO a domande sul profilo professionale e personale di ${cv.name}: esperienze,
skill tecniche, lingue parlate, hobby e contatti. Se una domanda esce da questo ambito,
rifiuta gentilmente e indirizza chi scrive verso i Contatti.

Rispondi sempre nella stessa lingua della domanda, indipendentemente dalla lingua di
questo prompt.

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
