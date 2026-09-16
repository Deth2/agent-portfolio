"use client";

// Client-side "typewriter" reveal for chat-panel.tsx: this is a simulated
// stream, not a real one — the reply text is already complete when it
// arrives from chat.ask, useTypewriter just reveals it progressively so the
// UI reads as if it were streaming. Real server-to-client streaming would
// mean turning the chat.ask mutation into something that emits chunks —
// out of scope here on purpose.

import { useEffect, useMemo, useState } from "react";

const WORD_INTERVAL_MS = 50;

// Splits into "word + trailing whitespace" chunks so that joining any
// prefix of the array reproduces the corresponding prefix of the original
// text exactly (no re-adding separators, no dropped spacing) — including
// any whitespace the text starts with, kept as its own leading chunk.
function splitIntoChunks(text: string): string[] {
  const leading = text.match(/^\s+/)?.[0];
  const rest = text.match(/\S+\s*/g) ?? [];
  return leading ? [leading, ...rest] : rest;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function")
    return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useTypewriter(text: string, enabled: boolean) {
  const chunks = useMemo(() => splitIntoChunks(text), [text]);
  // Read once per mount rather than per render — a mid-animation change in
  // OS setting isn't a case worth reacting to here.
  const [reducedMotion] = useState(prefersReducedMotion);
  const shouldAnimate = enabled && !reducedMotion;
  const [revealed, setRevealed] = useState(() =>
    shouldAnimate ? 0 : chunks.length,
  );

  useEffect(() => {
    if (!shouldAnimate) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    function tick(next: number) {
      if (cancelled) return;
      setRevealed(next);
      if (next < chunks.length) {
        timeoutId = setTimeout(() => tick(next + 1), WORD_INTERVAL_MS);
      }
    }

    timeoutId = setTimeout(() => tick(1), WORD_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [chunks, shouldAnimate]);

  // While not animating (disabled, reduced motion, or skipped), just show
  // the original text — `revealed` only drives the display while an
  // animation is actually in flight, and may be stale otherwise (e.g. right
  // after `text` changes but before the effect above has re-synced it).
  const displayedText = shouldAnimate
    ? chunks.slice(0, revealed).join("")
    : text;
  const isTyping = shouldAnimate && revealed < chunks.length;

  function skip() {
    setRevealed(chunks.length);
  }

  return { displayedText, isTyping, skip };
}
