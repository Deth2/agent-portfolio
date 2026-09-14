"use client";

// Portfolio homepage. Chat is the only content — no header, no other CV
// sections reachable from here, per docs/adr/0007-chat-only-homepage.md
// (which supersedes the tabbed layout from docs/adr/0004-chat-first-homepage.md).
// See docs/adr/0005-brand-palette-60-30-10.md for the color system.

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ChatPanel } from "@/components/chat-panel";
import { useTRPC } from "@/lib/trpc/context";

// Chat panel is always at least 80% of the viewport width, centered, with
// no upper max-width cap (docs/adr/0007-chat-only-homepage.md) — same
// container used across the loading/error/loaded states so the page
// doesn't shift width when data resolves.
const PAGE_CONTAINER = "mx-auto w-[80%] px-6 py-8";

export default function Home() {
  const trpc = useTRPC();
  const { isPending, isError, data: cv } = useQuery(trpc.cv.get.queryOptions());
  const tCommon = useTranslations("Common");

  if (isPending) {
    return <div className={`${PAGE_CONTAINER} text-sm text-muted-foreground`}>{tCommon("loading")}</div>;
  }

  if (isError || !cv) {
    return <div className={`${PAGE_CONTAINER} text-sm text-destructive`}>{tCommon("loadError")}</div>;
  }

  return (
    <div className={PAGE_CONTAINER}>
      <ChatPanel />
    </div>
  );
}
