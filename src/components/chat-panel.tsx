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
//
// Card chrome (header with a "nuova chat" reset control, scrollable message
// area, chips hidden once the visitor has sent a first question, footer
// disclaimer) follows the design handoff in ADR-0008. `started` is derived
// from messages.length rather than tracked separately, so resetSession()
// (which clears messages) automatically brings the topic chips back too.

import { useQuery } from "@tanstack/react-query";
import { SendHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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

// Assistant replies come back as Markdown (bullet lists, bold, links —
// see lib/llm/chat.ts's system prompt) instead of plain text, so they're
// rendered rather than shown with literal "*"/"**" characters. Tight,
// bubble-sized spacing replaces the browser's default block margins;
// remark-breaks turns single newlines into <br> (the model doesn't
// reliably emit blank lines between paragraphs); raw HTML in the source is
// left un-rendered by default (no rehype-raw), which is also what keeps
// this safe against HTML/script injection from the reply text.
const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-accent"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-[0.85em]">
      {children}
    </code>
  ),
};

function MarkdownContent({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={markdownComponents}
    >
      {text}
    </ReactMarkdown>
  );
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
      <MarkdownContent text={displayedText} />
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
    [askAboutCvMutation, t],
  );

  const { messages, isLoading, sendQuestion, resetSession } = useChatSession({
    askAboutCv,
    limitExceededMessage: t("limitExceededReply"),
  });
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  // Chips hide after the first question and come back once resetSession()
  // clears messages — derived rather than tracked separately, so reset
  // doesn't need to also touch a `started` flag.
  const started = messages.length > 0;

  // Keeps the message list pinned to its latest content — including while
  // an assistant reply is still being typed out by useTypewriter, since
  // that grows the content's height without changing messages.length.
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = scrollAreaRef.current;
    const content = scrollContentRef.current;
    if (!container || !content) return;
    const observer = new ResizeObserver(() => {
      container.scrollTop = container.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

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
    <Card className="min-h-0 flex-1 gap-0 rounded-[28px] border border-white/70 bg-bg/75 py-0 shadow-[0_30px_70px_-40px_oklch(0.45_0.06_250_/_0.45),0_2px_6px_-2px_oklch(0.45_0.06_250_/_0.12)] ring-0 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border px-5 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[14.5px] font-semibold text-text-strong">
              {t("headerTitle")}
            </span>
            <span className="font-mono text-[10.5px] tracking-[0.06em] text-text-muted">
              {t("headerSubtitle")}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={resetSession}
          className="h-auto rounded-full border-border bg-bg/60 px-3.5 py-2 font-mono text-[10.5px] tracking-[0.08em] text-text-muted uppercase hover:border-primary/40 hover:bg-bg hover:text-text-strong"
        >
          {t("resetButton")}
        </Button>
      </CardHeader>

      <CardContent
        ref={scrollAreaRef}
        className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6"
      >
        <div ref={scrollContentRef} className="space-y-3">
          <AssistantBubble avatarInitials={initials}>
            <MarkdownContent text={t("greeting")} />
          </AssistantBubble>

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
                className="ml-auto w-fit min-w-[20%] max-w-[85%] rounded-lg bg-primary-tint p-3 text-sm text-primary-dark"
              >
                {m.content}
              </div>
            ),
          )}

          {isLoading && <ThinkingBubble avatarInitials={initials} />}
        </div>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-3.5 rounded-b-[28px] border-t-0 bg-transparent px-5 py-4 md:px-6">
        {!started && (
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Button
                key={topic.label}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleTopicClick(topic.prompt)}
                className="rounded-full border border-border bg-bg/75 px-3.5 py-2 text-[13.5px] font-medium text-text hover:border-accent hover:bg-primary-tint"
              >
                {topic.label}
              </Button>
            ))}
          </div>
        )}

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
              className="absolute top-1.5 right-1.5 h-9 w-9 rounded-full bg-gradient-to-br from-accent to-accent-soft text-accent-foreground shadow-sm hover:brightness-105 hover:shadow-md"
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="text-center font-mono text-[10.5px] tracking-[0.05em] text-text-muted/80">
          {t("footerDisclaimer")}
        </div>
      </CardFooter>
    </Card>
  );
}
