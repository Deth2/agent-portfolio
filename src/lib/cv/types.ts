// CvProfile shape — produced by parseCvProfile() from content/cv.md (see
// src/lib/cv/load-cv-profile.ts) and consumed by the chat.ask and cv.get
// tRPC procedures (src/server/routers).

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
