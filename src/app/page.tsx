"use client";

// Portfolio homepage. Chat is the only content — no header, no other CV
// sections reachable from here, per docs/adr/0007-chat-only-homepage.md
// (which supersedes the tabbed layout from docs/adr/0004-chat-first-homepage.md).
//
// Layout is now a two-column split (profile sidebar + chat card) per
// ADR-0008, replacing the single centered card from ADR-0007 — the "chat
// only, no CV tabs" decision in 0007 still holds, this just adds identity
// chrome around the same one interactive surface. See
// docs/adr/0005-brand-palette-60-30-10.md for the token system (values
// updated by ADR-0008, mapping unchanged).

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ChatPanel } from "@/components/chat-panel";
import { ProfileSidebar } from "@/components/profile-sidebar";
import { useTRPC } from "@/lib/trpc/context";

// Radial wash from the design handoff — light blue-teal at the top-left,
// settling into --bg. Kept as a one-off gradient here (not a token) since
// nothing else in the app uses it.
const PAGE_BACKGROUND =
  "bg-[radial-gradient(120%_90%_at_12%_0%,_oklch(0.968_0.026_235)_0%,_oklch(0.981_0.008_240)_55%,_oklch(0.962_0.028_205)_100%)]";

export default function Home() {
  const trpc = useTRPC();
  const { isPending, isError, data: cv } = useQuery(trpc.cv.get.queryOptions());
  const tCommon = useTranslations("Common");

  if (isPending) {
    return (
      <div className={`flex flex-1 items-center justify-center ${PAGE_BACKGROUND} p-8 text-sm text-muted-foreground`}>
        {tCommon("loading")}
      </div>
    );
  }

  if (isError || !cv) {
    return (
      <div className={`flex flex-1 items-center justify-center ${PAGE_BACKGROUND} p-8 text-sm text-destructive`}>
        {tCommon("loadError")}
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-full flex-1 flex-col md:h-full md:min-h-0 md:flex-row md:items-stretch ${PAGE_BACKGROUND}`}
    >
      <ProfileSidebar cv={cv} />
      <main className="flex min-h-[76dvh] min-w-0 flex-1 flex-col p-3 pb-5 md:min-h-0 md:p-5 md:pl-0">
        <ChatPanel />
      </main>
    </div>
  );
}
