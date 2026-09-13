"use client";

// Homepage chat panel — a thin rendering layer over useChatSession, which
// owns message history and the Question Limit (ADR-0002). Real replies are
// fetched from /api/chat via askAboutCvClient, backed by the Groq adapter
// from docs/adr/0001-groq-free-tier-for-chat-agent.md and
// docs/adr/0003-openai-compatible-llm-adapter.md (lib/llm/chat.ts).
//
// Static chrome (greeting, labels, topic chips) follows the browser locale
// (useSiteLocale) — the greeting is rendered separately from the
// controller's own history so it reacts to a locale resolved after mount,
// rather than being frozen into history at whatever locale was current when
// the hook first initialized. The agent's own replies always match the
// visitor's question language instead (see lib/llm/chat.ts).
//
// Layout/style folded in from the "Chat Benedetta" design canvas: question
// input on its own row (no side-by-side send button), avatar on assistant
// messages, labeled input and topic list.

import { useCallback, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { askAboutCvClient } from "@/lib/chat/ask-about-cv-client";
import type { AskAboutCv } from "@/lib/chat/use-chat-session";
import { useChatSession } from "@/lib/chat/use-chat-session";
import { useSiteLocale } from "@/lib/i18n/use-site-locale";
import { strings } from "@/lib/i18n/strings";
import { mockCv } from "@/lib/mock-cv";

const AVATAR_INITIALS = mockCv.name
  .split(" ")
  .map((p) => p[0])
  .join("");

function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary-dark text-xs font-semibold tracking-wide text-bg">
        {AVATAR_INITIALS}
      </div>
      <div className="rounded-tl-sm rounded-r-lg rounded-bl-lg bg-muted p-3 text-sm leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="13 5 20 12 13 19" />
    </svg>
  );
}

export function ChatPanel() {
  const locale = useSiteLocale();
  const t = strings[locale].chat;

  const askAboutCv = useCallback<AskAboutCv>(
    async (question, history) => {
      try {
        return await askAboutCvClient(question, history);
      } catch (error) {
        console.error("Chat request failed", error);
        return t.errorReply;
      }
    },
    [t.errorReply]
  );

  const { messages, isLoading, sendQuestion } = useChatSession({
    askAboutCv,
    limitExceededMessage: t.limitExceededReply,
  });
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleTopicClick(prompt: string) {
    setInput(prompt);
    inputRef.current?.focus();
  }

  function handleSend() {
    const question = input.trim();
    if (!question) return;
    setInput("");
    void sendQuestion(question);
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="space-y-6 p-6">
        <div className="space-y-3">
          <AssistantBubble>{t.greeting}</AssistantBubble>

          {messages.map((m, i) =>
            m.role === "assistant" ? (
              <AssistantBubble key={i}>{m.content}</AssistantBubble>
            ) : (
              <div
                key={i}
                className="ml-auto max-w-[85%] rounded-lg bg-primary-tint p-3 text-sm text-primary-dark"
              >
                {m.content}
              </div>
            )
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <label
            htmlFor="chat-question"
            className="mb-2 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
          >
            {t.questionLabel}
          </label>
          <input
            id="chat-question"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={t.questionPlaceholder}
            className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-60"
          />

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-shadow hover:shadow-md disabled:opacity-60"
            >
              <SendIcon />
              {isLoading ? t.sending : t.send}
            </button>
          </div>
        </form>

        <div>
          <span className="mb-2 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {t.topicsLabel}
          </span>
          <div className="flex flex-wrap gap-2">
            {t.topics.map((topic) => (
              <button
                key={topic.label}
                type="button"
                onClick={() => handleTopicClick(topic.prompt)}
                className="rounded-full border border-transparent bg-secondary px-3.5 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:border-accent hover:bg-surface"
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
