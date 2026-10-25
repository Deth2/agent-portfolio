# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recruiters and hiring managers evaluating Benedetta Correa for a software engineering role. They arrive with limited time and want to judge fit quickly (skills, experience, languages, how she works) without scrolling a static CV.

## Product Purpose

A personal portfolio where the primary interaction is a chat that answers questions about Benedetta's professional profile, grounded only in her CV Profile (`content/cv.md`). Success: a recruiter gets the answers they need in a few questions and then uses the Contacts to reach out.

## Positioning

The portfolio is the conversation. The agent replies in first person, as Benedetta herself (Agent Voice), not as a third-party assistant. Off-topic questions get a light, ironic refusal. A generic portfolio template cannot truthfully copy this.

## Operating Context

- Single-page site: profile sidebar (CV Profile) plus chat panel in a two-column layout pinned to the viewport height.
- Content source of truth is `content/cv.md`; it feeds both the static sections and the agent's context.
- A client-side Question Limit (default 5) directs visitors to Contacts instead of continuing to answer; it is UX and cost containment, not security (ADR-0002).

## Capabilities and Constraints

- Static Contacts only (email, LinkedIn); no contact form.
- Chrome language is Italian or English based on the browser, binary, with no manual toggle (next-intl).
- Domain terms: CV Profile, Experience, Skill, Spoken Language, Contact, Question Limit, Agent Voice (see `CONTEXT.md`).
- Stack: Next.js 16, React 19, Tailwind v4 + shadcn/ui, tRPC on Hono.

## Brand Commitments

- Name and voice: Benedetta Correa, first person, cordial and professional on in-scope topics, ironic only when declining out-of-scope ones.
- Bilingual IT/EN chrome.
- Visual identity is not bound; the current UI is evolvable.

## Evidence on Hand

`content/cv.md` is the only source of facts. No testimonials, case studies, metrics, or project links exist; future work must not fabricate them.

## Product Principles

1. The chat is the product; everything else supports getting to a good answer quickly.
2. Speak as Benedetta, in first person, grounded only in the CV Profile.
3. Never invent proof beyond `content/cv.md`.
4. Respect the recruiter's time: fast answers, clear path to Contacts.
5. Honest limits: the Question Limit is UX, not security.
