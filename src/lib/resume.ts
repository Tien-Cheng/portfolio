import raw from "../data/resume/resume.json";
import { type Award, awardYears, siteAwards, workSummaries } from "../data/site";
import { type Education, type Experience, ResumeSchema } from "./resume-schema";

/** Parsed at import time, so an invalid snapshot fails the build. */
export const resume = ResumeSchema.parse(raw);

export type WorkEntry = Experience & { summary: string | undefined };

export const experience: readonly WorkEntry[] = resume.sections.experience.map((entry) => {
  const summary = workSummaries[entry.company];
  if (summary === undefined) {
    console.warn(`[resume] No work summary in src/data/site.ts for "${entry.company}".`);
  }
  return { ...entry, summary };
});

export const education: readonly Education[] = resume.sections.education;

export const skills = resume.sections.skills;

/**
 * "B.Comp." + "Computer Science" → "B.Comp. Computer Science";
 * "Diploma" + "Applied AI and Analytics" → "Diploma in Applied AI and Analytics".
 */
export function degreeTitle(entry: Education): string {
  return entry.degree.endsWith(".")
    ? `${entry.degree} ${entry.area}`
    : `${entry.degree} in ${entry.area}`;
}

/** Education highlights as one line, e.g. "NUS Global Merit Scholarship. GPA 4.79/5.0." */
export function educationNote(entry: Education): string {
  return (entry.highlights ?? []).join(" ");
}

function yearFor(bullet: string): string {
  return awardYears.find(({ match }) => bullet.includes(match))?.year ?? "—";
}

/** Résumé award bullets first, then site-only awards; newest first, undated last. */
export const awards: readonly Award[] = [
  ...(resume.sections["Awards & Open Source"] ?? []).map(({ bullet }) => ({
    year: yearFor(bullet),
    text: bullet,
  })),
  ...siteAwards,
]
  .map((award, index) => ({ award, index }))
  .sort((a, b) => {
    const ya = a.award.year === "—" ? -1 : Number(a.award.year);
    const yb = b.award.year === "—" ? -1 : Number(b.award.year);
    return yb - ya || a.index - b.index;
  })
  .map(({ award }) => award);
