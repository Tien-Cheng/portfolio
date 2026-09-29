import { describe, expect, it } from "vitest";
import { awards, degreeTitle, education, experience } from "./resume";
import { ResumeSchema } from "./resume-schema";

describe("resume snapshot", () => {
  it("joins a work summary to every role", () => {
    expect(experience.length).toBeGreaterThan(0);
    for (const entry of experience) expect(entry.summary).toBeTypeOf("string");
  });

  it("formats degree titles", () => {
    const titles = education.map(degreeTitle);
    expect(titles).toContain("B.Comp. Computer Science");
    expect(titles).toContain("Diploma in Applied AI and Analytics");
  });

  it("orders awards newest first with undated awards last", () => {
    const years = awards.map((a) => a.year);
    expect(years.at(-1)).toBe("—");
    const dated = years.filter((y) => y !== "—").map(Number);
    expect(dated).toEqual([...dated].sort((a, b) => b - a));
  });
});

describe("ResumeSchema", () => {
  const minimal = {
    name: "A",
    location: "B",
    email: "a@example.com",
    social_networks: [],
    sections: {
      education: [{ institution: "U", area: "CS", degree: "BSc", date: "Expected 2029" }],
      experience: [{ company: "C", position: "P", start_date: "2024-01" }],
      skills: [{ label: "L", details: "D" }],
    },
  };

  it("accepts a variant without awards and with extra keys", () => {
    const variant = { ...minimal, phone: "x", sections: { ...minimal.sections, extra: [1] } };
    expect(ResumeSchema.safeParse(variant).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(ResumeSchema.safeParse({ ...minimal, email: "nope" }).success).toBe(false);
  });
});
