"use client";

// Profile sidebar for the two-column chat layout introduced in ADR-0008
// (design: docs/Portfolio agent chatbot-handoff.zip → "Portfolio Agent.dc.html").
// Gives a visitor identity/context (name, role, tagline, top skills,
// contact) before they type anything, next to the chat card that does the
// actual talking. Pure presentation — cv is already fetched by page.tsx
// (single source of truth, see best-practices.md), passed down rather than
// re-queried here.

import { useTranslations } from "next-intl";
import type { CvProfile } from "@/lib/cv/types";

// How many of the CV's skills surface as "ask me about" tags — enough to
// read as a set without crowding the narrow sidebar column.
const SIDEBAR_TAG_COUNT = 5;

export function ProfileSidebar({ cv }: { cv: CvProfile }) {
  const t = useTranslations("Sidebar");
  // The mockup shows a single contact line (email); reuse the "Email"
  // contact from content/cv.md instead of inventing sidebar-only copy, and
  // fall back to whichever contact comes first if that label ever changes.
  const primaryContact =
    cv.contacts.find((contact) => contact.label === "Email") ?? cv.contacts[0];

  return (
    <aside className="flex w-full flex-col gap-7 px-5 py-8 md:w-[336px] md:flex-none md:overflow-y-auto md:px-7 md:py-10">
      <div className="flex flex-col gap-0.5">
        <div className="font-display text-[28px] leading-[1.05]">{cv.name}</div>
        <div className="font-mono text-[11px] tracking-[0.08em] text-text-muted uppercase">
          {cv.title}
        </div>
      </div>

      <p className="text-[14.5px] leading-relaxed text-text-muted text-pretty">
        {cv.tagline}
      </p>

      <div className="flex flex-col gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted/80 uppercase">
          {t("tagsLabel")}
        </div>
        <div className="flex flex-wrap gap-2">
          {cv.skills.slice(0, SIDEBAR_TAG_COUNT).map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-border bg-surface/70 px-3.5 py-2 text-[13px] text-text"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {primaryContact && (
        <div className="mt-auto flex flex-col gap-2.5 border-t border-border pt-6">
          <div className="flex items-center gap-2.5 text-[13.5px] text-text-muted">
            <span
              className="h-[7px] w-[7px] shrink-0 rounded-full bg-success [animation:breathe_2.6s_ease-in-out_infinite]"
              aria-hidden
            />
            {t("availability")}
          </div>
          <a
            href={primaryContact.href}
            className="w-fit font-mono text-[11px] text-text-muted hover:text-primary"
          >
            {primaryContact.value}
          </a>
        </div>
      )}
    </aside>
  );
}
