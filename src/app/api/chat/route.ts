// Chat endpoint: takes the current question plus prior history and returns
// the assistant's reply text (spec: .scratch/cv-chat-agent/spec.md).
// Streaming is a nice-to-have, not required, per that spec.
//
// The CV Profile context comes from mock-cv.ts until the real CV Markdown
// exists (see src/lib/mock-cv.ts) — swap this for parseCvProfile() over the
// real file once it's wired into src/app/page.tsx and
// src/components/chat-panel.tsx.

import { NextResponse, type NextRequest } from "next/server";
import { askAboutCv, type ChatMessage } from "@/lib/llm/chat";
import { mockCv } from "@/lib/mock-cv";

type ChatRequestBody = {
  question?: unknown;
  history?: unknown;
};

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    (record.role === "user" || record.role === "assistant") &&
    typeof record.content === "string"
  );
}

export async function POST(request: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON" }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ error: "\"question\" is required" }, { status: 400 });
  }

  const history = Array.isArray(body.history) ? body.history.filter(isChatMessage) : [];

  try {
    const reply = await askAboutCv(question, mockCv, history);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("askAboutCv failed", error);
    return NextResponse.json({ error: "Failed to get a reply from the LLM" }, { status: 502 });
  }
}
