import { describe, expect, it } from "vitest";
import { loadCvProfile } from "./load-cv-profile";

// Guards content/cv.md itself, not just the parser: Benedetta edits that
// file directly (spec: .scratch/cv-chat-agent/spec.md, user story 18), so a
// typo there should fail this test loudly rather than surface as a broken
// homepage.
describe("loadCvProfile (content/cv.md)", () => {
  it("parses the real CV Profile without throwing", () => {
    const cv = loadCvProfile();

    expect(cv.name).toBe("Benedetta Correa");
    expect(cv.contacts.length).toBeGreaterThan(0);
    expect(cv.skills.length).toBeGreaterThan(0);
    expect(cv.languages.length).toBeGreaterThan(0);
    expect(cv.experiences.length).toBeGreaterThan(0);
    expect(cv.hobbies.length).toBeGreaterThan(0);
  });
});
