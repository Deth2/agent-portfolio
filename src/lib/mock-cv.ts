// MOCK DATA — placeholder only, not the real CV Profile (see CONTEXT.md).
// Stands in for the real CV Markdown until it's provided; every field here
// shapes what the real Markdown/frontmatter schema will need to cover.
// Replace with the parsed CV Markdown data once it exists.

import type { CvProfile } from "@/lib/cv/types";

export const mockCv: CvProfile = {
  name: "Benedetta Correa",
  title: "Software Engineer",
  tagline: "Costruisco interfacce e agenti AI con TypeScript e React.",
  contacts: [
    { label: "Email", value: "correa.benedetta@yahoo.it", href: "mailto:correa.benedetta@yahoo.it" },
    { label: "LinkedIn", value: "linkedin.com/in/benedettacorrea", href: "#" },
    { label: "GitHub", value: "github.com/benedettacorrea", href: "#" },
  ],
  experiences: [
    {
      role: "Frontend Engineer",
      context: "Azienda Alpha",
      period: "2023 — presente",
      description:
        "Sviluppo di interfacce React/Next.js per prodotti B2B, con focus su design system e accessibilità.",
    },
    {
      role: "Full-stack Developer",
      context: "Progetto Beta",
      period: "2021 — 2023",
      description:
        "Costruzione di API Node.js e integrazione con servizi esterni, oltre alla UI React collegata.",
    },
    {
      role: "Junior Developer",
      context: "Startup Gamma",
      period: "2020 — 2021",
      description: "Prime esperienze professionali su stack JavaScript full-stack.",
    },
  ],
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Tailwind CSS",
    "shadcn/ui",
    "PostgreSQL",
    "Git",
  ],
  languages: [
    { name: "Italiano", level: "Madrelingua" },
    { name: "Inglese", level: "B2" },
  ],
  hobbies: ["Fotografia", "Escursionismo", "Lettura sci-fi"],
};

export type MockCv = typeof mockCv;
