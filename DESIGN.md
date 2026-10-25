---
name: Benedetta Correa, Portfolio Agent
description: A light, airy blue-teal conversation surface where a pinned profile sidebar sits beside a single chat card.
colors:
  primary: "oklch(0.52 0.11 245)"
  primary-dark: "oklch(0.42 0.12 245)"
  primary-tint: "oklch(0.955 0.02 230)"
  secondary: "oklch(0.86 0.07 240)"
  secondary-alt: "oklch(0.9 0.055 205)"
  accent: "oklch(0.72 0.12 245)"
  accent-soft: "oklch(0.79 0.105 212)"
  bg: "oklch(0.981 0.008 240)"
  surface: "oklch(1 0 0)"
  border: "oklch(0.9 0.022 235)"
  text: "oklch(0.34 0.03 250)"
  text-strong: "oklch(0.28 0.032 250)"
  text-muted: "oklch(0.57 0.026 250)"
  success: "oklch(0.72 0.11 230)"
  warning: "oklch(0.65 0.14 70)"
  danger: "oklch(0.55 0.17 25)"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.05
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.08em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "28px"
components:
  chip-topic:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.full}"
    padding: "8px 14px"
  chip-skill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.full}"
    padding: "8px 14px"
  button-send:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.full}"
    size: "36px"
  bubble-assistant:
    backgroundColor: "{colors.primary-tint}"
    textColor: "{colors.text-strong}"
    padding: "12px"
  bubble-user:
    backgroundColor: "{colors.primary-tint}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.lg}"
    padding: "12px"
  input-question:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-strong}"
    rounded: "{rounded.full}"
    height: "48px"
---

# Design System: Benedetta Correa, Portfolio Agent

## Overview

**Creative North Star: "The Open Studio Window"**

A bright, quiet room with one conversation in it. Cool blue-teal light washes the page; a profile column introduces the person and a single rounded card does the talking. Nothing competes with the chat: the surrounding chrome is airy, low-contrast and typographically refined, so the answers are the content.

The tone is cordial and professional, with a touch of editorial warmth from the serif name. Density is low and generous; the layout is pinned to the viewport on desktop so there is no page to scroll, only the conversation.

**Key Characteristics:**
- Light, airy oklch scale in two hues (blue ~245, teal ~205), never dark by default.
- Three-voice type: serif for the person, sans for talk, mono for system chrome.
- Pill shapes for everything interactive; softer rounded corners for containers.
- Flat and tonal; depth comes from a soft page gradient and hairline rings, not shadows.

## Colors

A cool, low-chroma blue-teal family with one lifted accent, layered roughly 60/30/10 (neutral canvas, structural tints, sparing accent).

### Primary
- **Harbor Blue** (oklch(0.52 0.11 245)): primary, links hover, structural blocks.
- **Deep Harbor** (oklch(0.42 0.12 245)): sidebar canvas in the dark scheme, assistant avatar fill, user-bubble text.

### Secondary
- **Mist Tint** (oklch(0.955 0.02 230)): assistant and user bubbles, muted fills, hover states.
- **Sky Wash** (oklch(0.86 0.07 240)) and **Lagoon Wash** (oklch(0.9 0.055 205)): secondary fills and the page gradient's cool corners.

### Tertiary
- **Clear Sky** (oklch(0.72 0.12 245)) and **Shallow Water** (oklch(0.79 0.105 212)): the send button gradient, focus ring, link hover. The only saturated moments on screen.

### Neutral
- **Morning Paper** (oklch(0.981 0.008 240)): page background and chip fill.
- **Pure Surface** (oklch(1 0 0)): card and input surface.
- **Cloud Edge** (oklch(0.9 0.022 235)): hairline borders.
- **Slate Ink** (oklch(0.34 0.03 250)), **Deep Ink** (oklch(0.28 0.032 250)), **Quiet Slate** (oklch(0.57 0.026 250)): body, headings, secondary text.
- Status: success (oklch(0.72 0.11 230)) is a blue, not green; warning oklch(0.65 0.14 70); danger oklch(0.55 0.17 25).

### Named Rules
**The Rare Accent Rule.** Accent blue appears only on interactive or focus states (send button, focus ring, hover borders). Its rarity is the point.
**The Cool Neutrals Rule.** No pure grays; every neutral carries hue 230-250.

## Typography

**Display Font:** Instrument Serif (with Georgia)
**Body Font:** Manrope (with system-ui)
**Label/Mono Font:** IBM Plex Mono

**Character:** A serif for the human name, a friendly geometric sans for dialogue, and mono for the system layer (tags, timestamps, disclaimers).

### Hierarchy
- **Display** (400, 28px, 1.05): the name in the sidebar and greeting moments.
- **Body** (400, 14-14.5px, 1.625): chat bubbles and tagline; markdown in bubbles uses tight 8px block spacing.
- **Label** (400, 10.5-11px, 0.08-0.1em tracking, uppercase): role, section labels, reset button, footer disclaimer.

### Named Rules
**The Three Voices Rule.** Serif is for the person, sans for conversation, mono for chrome. Do not cross them.

## Layout

Two columns on desktop pinned to viewport height: a 336px profile sidebar (own scroll) and a flexible main area holding the chat card; no page scroll. On mobile they stack, sidebar first, chat at least 76dvh. Rhythm is 8/12/20/28px; sidebar padding 28-40px, card padding 20-24px. Page background is a soft radial gradient from sky to teal over the neutral.

## Elevation & Depth

Flat and tonal. Depth is conveyed by the page gradient, a white card with a 1px foreground/10 ring, and tinted bubbles. Shadows appear only as a response: the send button gains `shadow-sm` at rest and `shadow-md` on hover with a slight brightness lift.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest; shadow is a state response.

## Shapes

Pills for interactive things (chips, input, send button, reset button). Containers use a soft base radius of 0.625rem scaled 0.6x to 2.6x; the chat card is notably rounded (28px footer corners). Assistant bubbles have a squared top-left corner as a speech tail; avatars are circles.

## Components

### Buttons
- **Shape:** circular for send (36px), pill for reset and chips.
- **Send:** diagonal gradient Clear Sky to Shallow Water, Deep Harbor icon, inset in the input's right edge.
- **Hover / Focus:** brightness lift and shadow on send; focus ring in accent at 50% (3px). Active presses down 1px.
- **Reset:** mono uppercase label, tinted pill, border shifts to primary at 40% on hover.

### Chips
- **Style:** pill, 1px Cloud Edge border, 70-75% tinted fill, 13-13.5px text.
- **Topic chips:** on hover the border goes accent and the fill Mist Tint; hidden once the first question is sent.
- **Skill tags:** static, in the sidebar, mark "ask me about".

### Cards / Containers
- **Chat card:** Pure Surface, large radius, hairline ring, header with reset, scrollable body, footer with input and disclaimer.
- **Bubbles:** assistant Mist Tint with avatar and squared tail; user Mist Tint with Deep Harbor text, right-aligned, max 85%.

### Inputs / Fields
- **Style:** 48px pill, Cloud Edge border, left padding 16px, right padding 48px for the inset send button.
- **Focus:** border and 30% ring shift to accent.

### Navigation
No navigation. Contact is a single mono link in the sidebar footer under a breathing availability dot (2.6s loop; it currently has no `prefers-reduced-motion` guard).

### Thinking indicator
Three bouncing dots in an assistant bubble, staggered 0.15s, disabled under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** use the oklch tokens in `globals.css` as the single source; add new colors there first.
- **Do** keep accent for interactive and focus states only.
- **Do** use mono uppercase for system chrome and serif only for the person's name.
- **Do** respect `prefers-reduced-motion` on any new animation.

### Don't:
- **Don't** use shadows at rest.
- **Don't** introduce warm or neutral-gray colors that break the 230-250 hue family.
- **Don't** add navigation, page scroll, or a contact form; the chat is the product.
- **Don't** hardcode hex values in components.
