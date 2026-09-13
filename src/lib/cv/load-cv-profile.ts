// Server-only loader for the real CV Profile Markdown (content/cv.md at the
// repo root — Benedetta edits this file directly, no code changes needed;
// see .scratch/cv-chat-agent/spec.md, user stories 18-19). Both the tRPC
// chat router and the cv.get query read through this single function, so
// there is exactly one place that knows the file's path.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseCvProfile } from "./parse-cv-profile";
import type { CvProfile } from "./types";

const CV_MARKDOWN_PATH = join(process.cwd(), "content", "cv.md");

export function loadCvProfile(): CvProfile {
  const markdown = readFileSync(CV_MARKDOWN_PATH, "utf-8");
  return parseCvProfile(markdown);
}
