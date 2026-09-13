// CvProfile shape — matches the placeholder established by src/lib/mock-cv.ts.
// parseCvProfile() produces this same shape from the real CV Markdown once it
// exists (see .scratch/cv-chat-agent/spec.md); until then mock-cv.ts is the
// only producer, and both are consumed identically by page.tsx / chat-panel.tsx.

export type Contact = {
  label: string;
  value: string;
  href: string;
};

export type Experience = {
  role: string;
  context: string;
  period: string;
  description: string;
};

export type SpokenLanguage = {
  name: string;
  level: string;
};

export type CvProfile = {
  name: string;
  title: string;
  tagline: string;
  contacts: Contact[];
  experiences: Experience[];
  skills: string[];
  languages: SpokenLanguage[];
  hobbies: string[];
};
