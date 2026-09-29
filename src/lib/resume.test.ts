import { afterEach, describe, expect, it, vi } from "vitest";
import { degreeTitle, joinWorkSummaries, mergeAwards, resume } from "./resume";
import { type Education, type Experience, ResumeSchema } from "./resume-schema";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("joinWorkSummaries", () => {
  const roles: Experience[] = [
    { company: "Acme", position: "Engineer", start_date: "2024-01" },
    { company: "Globex", position: "Intern", start_date: "2023-05", end_date: "2023-08" },
  ];

  it("attaches each role's summary by company", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const joined = joinWorkSummaries(roles, { Acme: "Builds rockets.", Globex: "Ran reports." });
    expect(joined.map((r) => r.summary)).toEqual(["Builds rockets.", "Ran reports."]);
    expect(joined[0]).toMatchObject({ company: "Acme", position: "Engineer" });
    expect(warn).not.toHaveBeenCalled();
  });

  it("leaves a role without a summary undefined and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const joined = joinWorkSummaries(roles, { Acme: "Builds rockets." });
    expect(joined[1]?.summary).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"Globex"'));
  });

  it("ignores inherited object keys", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const joined = joinWorkSummaries([{ company: "toString", position: "P" }], {});
    expect(joined[0]?.summary).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe("degreeTitle", () => {
  const edu = (degree: string, area: string): Education => ({ institution: "U", degree, area });

  it("joins an abbreviated degree to its area with a space", () => {
    expect(degreeTitle(edu("B.Comp.", "Computer Science"))).toBe("B.Comp. Computer Science");
  });

  it("joins a named qualification to its area with 'in'", () => {
    expect(degreeTitle(edu("Diploma", "Applied AI and Analytics"))).toBe(
      "Diploma in Applied AI and Analytics",
    );
  });
});

describe("mergeAwards", () => {
  it("orders awards newest first, undated last, keeping ties in order", () => {
    const merged = mergeAwards(
      [{ bullet: "Won the Alpha Cup" }, { bullet: "Something undated" }],
      [
        { year: "2025", text: "Site award 2025" },
        { year: "2023", text: "Site award 2023" },
        { year: "—", text: "Site undated" },
      ],
      [{ match: "Alpha", year: "2023" }],
    );
    expect(merged.map((a) => a.text)).toEqual([
      "Site award 2025",
      "Won the Alpha Cup",
      "Site award 2023",
      "Something undated",
      "Site undated",
    ]);
    expect(merged[1]?.year).toBe("2023");
  });
});

describe("live resume snapshot", () => {
  it("parses", () => {
    expect(resume.sections.experience.length).toBeGreaterThan(0);
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
