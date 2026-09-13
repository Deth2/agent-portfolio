import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CvParseError, parseCvProfile } from "./parse-cv-profile";

function fixture(name: string) {
  return readFileSync(join(__dirname, "__fixtures__", name), "utf-8");
}

describe("parseCvProfile", () => {
  it("parses a fully-populated CV Markdown file into a CvProfile", () => {
    const cv = parseCvProfile(fixture("valid-full.md"));

    expect(cv).toEqual({
      name: "Benedetta Correa",
      title: "Software Engineer",
      tagline: "Costruisco interfacce e agenti AI con TypeScript e React.",
      contacts: [
        {
          label: "Email",
          value: "correa.benedetta@yahoo.it",
          href: "mailto:correa.benedetta@yahoo.it",
        },
        {
          label: "LinkedIn",
          value: "linkedin.com/in/benedettacorrea",
          href: "https://linkedin.com/in/benedettacorrea",
        },
        {
          label: "GitHub",
          value: "github.com/benedettacorrea",
          href: "https://github.com/benedettacorrea",
        },
      ],
      skills: ["TypeScript", "React", "Next.js"],
      languages: [
        { name: "Italiano", level: "Madrelingua" },
        { name: "Inglese", level: "B2" },
      ],
      experiences: [
        {
          role: "Frontend Engineer",
          context: "Azienda Alpha",
          period: "2023 — presente",
          description:
            "Sviluppo di interfacce React/Next.js per prodotti B2B, con focus su design\nsystem e accessibilità.",
        },
        {
          role: "Full-stack Developer",
          context: "Progetto Beta",
          period: "2021 — 2023",
          description:
            "Costruzione di API Node.js e integrazione con servizi esterni, oltre alla UI\nReact collegata.",
        },
      ],
      hobbies: ["Fotografia", "Escursionismo", "Lettura sci-fi"],
    });
  });

  it("parses a minimal-but-valid CV Markdown file", () => {
    const cv = parseCvProfile(fixture("valid-minimal.md"));

    expect(cv.name).toBe("Ada Lovelace");
    expect(cv.contacts).toHaveLength(1);
    expect(cv.skills).toEqual(["TypeScript"]);
    expect(cv.languages).toEqual([{ name: "Inglese", level: "Madrelingua" }]);
    expect(cv.experiences).toEqual([
      {
        role: "Engineer",
        context: "Analytical Engines Ltd",
        period: "1840 — 1852",
        description: "Prima esperienza professionale.",
      },
    ]);
    expect(cv.hobbies).toEqual(["Matematica"]);
  });

  it("fails loudly (does not return partial data) when a required frontmatter field is missing", () => {
    expect(() => parseCvProfile(fixture("malformed-missing-frontmatter-field.md"))).toThrow(
      CvParseError
    );
  });

  it("fails loudly when the Esperienze section is missing entirely", () => {
    expect(() =>
      parseCvProfile(fixture("malformed-missing-experiences-section.md"))
    ).toThrow(CvParseError);
  });
});
