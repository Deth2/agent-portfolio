"use client";

// Homepage chat panel — a thin rendering layer over useChatSession, which
// owns message history and the Question Limit (ADR-0002). Real replies come
// from the chat.ask tRPC procedure via useAskAboutCv, a TanStack Query
// mutation (ADR-0006), backed by the Groq adapter from
// docs/adr/0001-groq-free-tier-for-chat-agent.md and
// docs/adr/0003-openai-compatible-llm-adapter.md (lib/llm/chat.ts).
//
// Static chrome (greeting, labels, topic chips) is translated via next-intl
// (lib/i18n/messages/{it,en}.json, provided by I18nProvider based on the
// browser locale — see lib/i18n) — the greeting is rendered separately from the
// controller's own history so it reacts to a locale resolved after mount,
// rather than being frozen into history at whatever locale was current when
// the hook first initialized. The agent's own replies always match the
// visitor's question language instead (see lib/llm/chat.ts).
//
// Layout/style: avatar on assistant messages, topic list below the input.
// Question input and send button are merged into a single pill (icon-only
// send button inline at the end of the field) per docs/adr/0007-chat-only-homepage.md;
// the visible "Domanda"/"Question" label was dropped in favor of a sr-only
// label, since the field's accessible name no longer needs to be on screen.

import { useQuery } from "@tanstack/react-query";
import { SendHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AskAboutCv } from "@/lib/chat/use-chat-session";
import { useAskAboutCv } from "@/lib/chat/use-ask-about-cv";
import { useChatSession } from "@/lib/chat/use-chat-session";
import { useTypewriter } from "@/lib/chat/use-typewriter";
import { useTRPC } from "@/lib/trpc/context";

type Topic = { label: string; prompt: string };

function avatarInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("");
}

function AssistantAvatar({ initials }: { initials: string }) {
  return (
    <Avatar className="flex-none">
      <AvatarFallback className="bg-primary-dark text-xs font-semibold tracking-wide text-bg">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

function AssistantBubble({
  avatarInitials,
  children,
  onClick,
  onClickLabel,
}: {
  avatarInitials: string;
  children: React.ReactNode;
  onClick?: () => void;
  onClickLabel?: string;
}) {
  return (
    <div
      className="flex items-start gap-2.5"
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault(); // stop Space from also scrolling the page
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? onClickLabel : undefined}
    >
      <AssistantAvatar initials={avatarInitials} />
      <div
        className={`rounded-tl-sm rounded-r-lg rounded-bl-lg bg-muted p-3 text-sm leading-relaxed text-foreground ${onClick ? "cursor-pointer" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

// Reveals an assistant reply progressively (simulated streaming — see
// use-typewriter.ts). Only animates when `animate` is true, i.e. for the
// most recent assistant message; earlier messages render fully formed.
// Clicking the bubble while it's still typing reveals the rest instantly.
function TypedReply({
  avatarInitials,
  text,
  animate,
  skipLabel,
}: {
  avatarInitials: string;
  text: string;
  animate: boolean;
  skipLabel: string;
}) {
  const { displayedText, isTyping, skip } = useTypewriter(text, animate);
  return (
    <AssistantBubble
      avatarInitials={avatarInitials}
      onClick={isTyping ? skip : undefined}
      onClickLabel={skipLabel}
    >
      {displayedText}
    </AssistantBubble>
  );
}

// "Sta pensando" indicator shown while waiting for the reply, styled after
// the classic bouncing-dots typing indicator. Bounce is skipped for
// prefers-reduced-motion via Tailwind's motion-reduce: variant.
function ThinkingBubble({ avatarInitials }: { avatarInitials: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <AssistantAvatar initials={avatarInitials} />
      <div className="flex items-center gap-1 rounded-tl-sm rounded-r-lg rounded-bl-lg bg-muted px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground motion-reduce:animate-none"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatPanel() {
  const trpc = useTRPC();
  // Already resolved by the time ChatPanel mounts — page.tsx (its only
  // caller) fetches the same cv.get query first and gates on it — so this
  // is a cache hit, not a second round trip.
  const { data: cv } = useQuery(trpc.cv.get.queryOptions());
  const initials = cv ? avatarInitials(cv.name) : "";

  const t = useTranslations("Chat");
  const topics = t.raw("topics") as Topic[];

  const askAboutCvMutation = useAskAboutCv();
  const askAboutCv = useCallback<AskAboutCv>(
    async (question, history) => {
      try {
        return await askAboutCvMutation(question, history);
      } catch (error) {
        console.error("Chat request failed", error);
        return t("errorReply");
      }
    },
    [askAboutCvMutation, t]
  );

  const { messages, isLoading, sendQuestion } = useChatSession({
    askAboutCv,
    limitExceededMessage: t("limitExceededReply"),
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
          <AssistantBubble avatarInitials={initials}>{t("greeting")}</AssistantBubble>

          {messages.map((m, i) =>
            m.role === "assistant" ? (
              <TypedReply
                key={i}
                avatarInitials={initials}
                text={m.content}
                animate={i === messages.length - 1}
                skipLabel={t("skipTyping")}
              />
            ) : (
              <div
                key={i}
                className="ml-auto max-w-[85%] rounded-lg bg-primary-tint p-3 text-sm text-primary-dark"
              >
                {m.content}
              </div>
            )
          )}

          {isLoading && <ThinkingBubble avatarInitials={initials} />}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <label htmlFor="chat-question" className="sr-only">
            {t("questionLabel")}
          </label>
          <div className="relative">
            <Input
              id="chat-question"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder={t("questionPlaceholder")}
              className="h-12 rounded-full border-border pr-12 pl-4 text-sm focus-visible:border-accent focus-visible:ring-accent/30"
            />
            <Button
              type="submit"
              disabled={isLoading}
              size="icon"
              aria-label={t("send")}
              className="absolute top-1.5 right-1.5 h-9 w-9 rounded-full bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 hover:shadow-md"
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div>
          <span className="mb-2 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {t("topicsLabel")}
          </span>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Button
                key={topic.label}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleTopicClick(topic.prompt)}
                className="rounded-full border border-transparent px-3.5 py-1.5 text-xs font-medium hover:border-accent hover:bg-surface"
              >
                {topic.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
