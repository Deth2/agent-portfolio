"use client";

// Chat session controller (spec: .scratch/cv-chat-agent/spec.md). Owns
// message history and the Question Limit counter (ADR-0002) so ChatPanel
// can be a thin rendering layer: it appends the visitor's question, checks
// the Question Limit before calling out, calls the injected askAboutCv for
// the reply when under the limit, or synthesizes the fixed limit-exceeded
// message when at/over it — all scoped to this hook instance (i.e. one
// visitor's browser session), never shared across visitors.

import { useCallback, useState } from "react";
import {
  getQuestionLimitConfig,
  type QuestionLimitConfig,
} from "./question-limit-config";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

// Shaped like the server's askAboutCv(question, cvProfile, history) with
// the CvProfile already bound server-side — the client only ever supplies
// the question and its own prior history.
export type AskAboutCv = (
  question: string,
  history: ChatMessage[],
) => Promise<string>;

export type UseChatSessionOptions = {
  askAboutCv: AskAboutCv;
  initialMessages?: ChatMessage[];
  questionLimit?: QuestionLimitConfig;
  limitExceededMessage?: string;
};

const DEFAULT_LIMIT_EXCEEDED_MESSAGE =
  "Hai raggiunto il numero massimo di domande per questa sessione. Scrivimi tramite i Contatti per continuare la conversazione.";

export function useChatSession({
  askAboutCv,
  initialMessages = [],
  questionLimit = getQuestionLimitConfig(),
  limitExceededMessage = DEFAULT_LIMIT_EXCEEDED_MESSAGE,
}: UseChatSessionOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const sendQuestion = useCallback(
    async (rawQuestion: string) => {
      const question = rawQuestion.trim();
      if (!question || isLoading) return;

      const history = messages;
      const isOverLimit =
        questionLimit.enabled && questionCount >= questionLimit.threshold;

      setMessages((prev) => [...prev, { role: "user", content: question }]);
      setQuestionCount((count) => count + 1);

      if (isOverLimit) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: limitExceededMessage },
        ]);
        return;
      }

      setIsLoading(true);
      try {
        const reply = await askAboutCv(question, history);
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      askAboutCv,
      isLoading,
      messages,
      questionCount,
      questionLimit,
      limitExceededMessage,
    ],
  );

  // Clears history and the Question Limit counter for a fresh session —
  // used by the "nuova chat" control (ADR-0008). Doesn't touch isLoading
  // directly: a reset while a request is in flight just orphans that
  // promise's eventual setMessages call onto the cleared history, same as
  // any other stale-response race this hook doesn't otherwise guard against.
  const resetSession = useCallback(() => {
    setMessages(initialMessages);
    setQuestionCount(0);
  }, [initialMessages]);

  return { messages, isLoading, sendQuestion, resetSession };
}
