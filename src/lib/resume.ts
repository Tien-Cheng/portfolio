import raw from "../data/resume/resume.json";
import { type Award, awardYears, siteAwards, workSummaries } from "../data/site";
import { type Education, type Experience, ResumeSchema } from "./resume-schema";

/** Parsed at import time, so an invalid snapshot fails the build. */
export const resume = ResumeSchema.parse(raw);

export type WorkEntry = Experience & { summary: string | undefined };

/**
 * Pairs each role with its site-owned work summary, keyed by company. A role without one keeps
 * `summary: undefined` and logs a warning, so a new job in the résumé never breaks the build.
 */
export function joinWorkSummaries(
  experiences: readonly Experience[],
  summaries: Readonly<Record<string, string>>,
): WorkEntry[] {
  return experiences.map((entry) => {
    const summary = Object.hasOwn(summaries, entry.company) ? summaries[entry.company] : undefined;
    if (summary === undefined) {
      console.warn(`[resume] No work summary in src/data/site.ts for "${entry.company}".`);
    }
    return { ...entry, summary };
  });
}

export const experience: readonly WorkEntry[] = joinWorkSummaries(
  resume.sections.experience,
  workSummaries,
);

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

/**
 * Résumé award bullets first, then site-only awards; newest first, undated ("—") last, ties in
 * their original order. A bullet's year is the first entry in `years` whose `match` it contains.
 */
export function mergeAwards(
  bullets: readonly { bullet: string }[],
  extras: readonly Award[],
  years: readonly { match: string; year: string }[],
): Award[] {
  const yearFor = (bullet: string) =>
    years.find(({ match }) => bullet.includes(match))?.year ?? "—";
  return [...bullets.map(({ bullet }) => ({ year: yearFor(bullet), text: bullet })), ...extras]
    .map((award, index) => ({ award, index }))
    .sort((a, b) => {
      const ya = a.award.year === "—" ? -1 : Number(a.award.year);
      const yb = b.award.year === "—" ? -1 : Number(b.award.year);
      return yb - ya || a.index - b.index;
    })
    .map(({ award }) => award);
}

export const awards: readonly Award[] = mergeAwards(
  resume.sections["Awards & Open Source"] ?? [],
  siteAwards,
  awardYears,
);
