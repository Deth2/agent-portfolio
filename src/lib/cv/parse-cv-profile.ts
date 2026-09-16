// Parses the CV Profile Markdown file (YAML frontmatter for structured
// fields + prose sections for experiences/hobbies) into the typed CvProfile
// shape (see ./types.ts). Real content lives in content/cv.md (see
// ./load-cv-profile.ts) — see .scratch/cv-chat-agent/spec.md and CONTEXT.md
// for the format and the domain vocabulary this parser and its error
// messages should use.
//
// Fails loudly (throws CvParseError) on any missing/malformed required
// field rather than silently rendering blank sections — a broken CV update
// must be caught before it reaches production.

import matter from "gray-matter";
import type { Contact, CvProfile, Experience, SpokenLanguage } from "./types";

export class CvParseError extends Error {
  constructor(message: string) {
    super(`Invalid CV Profile Markdown: ${message}`);
    this.name = "CvParseError";
  }
}

const EXPERIENCE_HEADING = /^###\s+(.+?)\s+—\s+(.+?)\s+\(([^)]+)\)\s*$/;

export function parseCvProfile(markdown: string): CvProfile {
  const { data: frontmatter, content: body } = matter(markdown);

  return {
    name: requireString(frontmatter, "name"),
    title: requireString(frontmatter, "title"),
    tagline: requireString(frontmatter, "tagline"),
    contacts: requireContacts(frontmatter),
    skills: requireStringArray(frontmatter, "skills"),
    languages: requireLanguages(frontmatter),
    experiences: requireExperiences(body),
    hobbies: requireHobbies(body),
  };
}

function requireString(
  frontmatter: Record<string, unknown>,
  field: string,
): string {
  const value = frontmatter[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new CvParseError(
      `frontmatter field "${field}" is required and must be a non-empty string`,
    );
  }
  return value.trim();
}

function requireStringArray(
  frontmatter: Record<string, unknown>,
  field: string,
): string[] {
  const value = frontmatter[field];
  if (!Array.isArray(value) || value.length === 0) {
    throw new CvParseError(
      `frontmatter field "${field}" is required and must be a non-empty list`,
    );
  }
  return value.map((item, index) => {
    if (typeof item !== "string" || item.trim() === "") {
      throw new CvParseError(
        `frontmatter field "${field}[${index}]" must be a non-empty string`,
      );
    }
    return item.trim();
  });
}

function requireContacts(frontmatter: Record<string, unknown>): Contact[] {
  const value = frontmatter.contacts;
  if (!Array.isArray(value) || value.length === 0) {
    throw new CvParseError(
      'frontmatter field "contacts" is required and must be a non-empty list',
    );
  }
  return value.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new CvParseError(
        `frontmatter field "contacts[${index}]" must be an object`,
      );
    }
    const record = item as Record<string, unknown>;
    return {
      label: requireEntryField(record, "label", "contacts", index),
      value: requireEntryField(record, "value", "contacts", index),
      href: requireEntryField(record, "href", "contacts", index),
    };
  });
}

function requireLanguages(
  frontmatter: Record<string, unknown>,
): SpokenLanguage[] {
  const value = frontmatter.languages;
  if (!Array.isArray(value) || value.length === 0) {
    throw new CvParseError(
      'frontmatter field "languages" is required and must be a non-empty list',
    );
  }
  return value.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new CvParseError(
        `frontmatter field "languages[${index}]" must be an object`,
      );
    }
    const record = item as Record<string, unknown>;
    return {
      name: requireEntryField(record, "name", "languages", index),
      level: requireEntryField(record, "level", "languages", index),
    };
  });
}

function requireEntryField(
  record: Record<string, unknown>,
  field: string,
  listName: string,
  index: number,
): string {
  const value = record[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new CvParseError(
      `frontmatter field "${listName}[${index}].${field}" must be a non-empty string`,
    );
  }
  return value.trim();
}

function requireExperiences(body: string): Experience[] {
  const section = extractSection(body, "Esperienze");
  if (section === null) {
    throw new CvParseError(
      'body is missing the required "## Esperienze" section',
    );
  }

  const experiences = splitByHeading(section, "###").map((block) => {
    const [headingLine, ...rest] = block.split("\n");
    const match = headingLine.match(EXPERIENCE_HEADING);
    if (!match) {
      throw new CvParseError(
        `malformed experience heading "${headingLine.trim()}" — expected "### Role — Context (Period)"`,
      );
    }
    const [, role, context, period] = match;
    const description = rest.join("\n").trim();
    if (description === "") {
      throw new CvParseError(
        `experience "${headingLine.trim()}" is missing a description`,
      );
    }
    return {
      role: role.trim(),
      context: context.trim(),
      period: period.trim(),
      description,
    };
  });

  if (experiences.length === 0) {
    throw new CvParseError(
      'the "## Esperienze" section must contain at least one "### " entry',
    );
  }

  return experiences;
}

function requireHobbies(body: string): string[] {
  const section = extractSection(body, "Hobby");
  if (section === null) {
    throw new CvParseError('body is missing the required "## Hobby" section');
  }

  const hobbies = section
    .split("\n")
    .map((line) => line.match(/^-\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => match[1].trim());

  if (hobbies.length === 0) {
    throw new CvParseError(
      'the "## Hobby" section must contain at least one "- " bullet item',
    );
  }

  return hobbies;
}

// Returns the content between a `## <heading>` line and the next `## `
// heading (or end of body), or null if the heading isn't present.
function extractSection(body: string, heading: string): string | null {
  const lines = body.split("\n");
  const startIndex = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (startIndex === -1) return null;

  const rest = lines.slice(startIndex + 1);
  const endIndex = rest.findIndex((line) => /^##\s+/.test(line));
  const sectionLines = endIndex === -1 ? rest : rest.slice(0, endIndex);
  return sectionLines.join("\n").trim();
}

// Splits a section's body into blocks starting at each heading of the given
// marker (e.g. "###"), dropping any leading text before the first heading.
function splitByHeading(section: string, marker: string): string[] {
  const lines = section.split("\n");
  const blocks: string[][] = [];

  for (const line of lines) {
    if (line.startsWith(`${marker} `)) {
      blocks.push([line]);
    } else if (blocks.length > 0) {
      blocks[blocks.length - 1].push(line);
    }
  }

  return blocks.map((block) => block.join("\n").trim());
}
