import { z } from "astro/zod";

/**
 * The part of the RenderCV `cv` object this site reads. Objects are loose so other résumé
 * variants (extra sections, extra fields) still validate; only what the pages use is checked.
 * `scripts/gen-schema.ts` turns this into `src/data/resume/schema.json`, which the resume repo's
 * sync job validates against before it pushes a snapshot.
 */

const Dated = {
  location: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  date: z.string().optional(),
  highlights: z.array(z.string()).optional(),
};

export const EducationSchema = z.looseObject({
  institution: z.string().min(1),
  area: z.string().min(1),
  degree: z.string().min(1),
  ...Dated,
});

export const ExperienceSchema = z.looseObject({
  company: z.string().min(1),
  position: z.string().min(1),
  ...Dated,
});

export const SkillSchema = z.looseObject({
  label: z.string().min(1),
  details: z.string().min(1),
});

export const BulletSchema = z.looseObject({
  bullet: z.string().min(1),
});

export const ResumeSchema = z.looseObject({
  name: z.string().min(1),
  location: z.string().min(1),
  email: z.email(),
  social_networks: z.array(
    z.looseObject({
      network: z.string().min(1),
      username: z.string().min(1),
    }),
  ),
  sections: z.looseObject({
    education: z.array(EducationSchema).min(1),
    experience: z.array(ExperienceSchema).min(1),
    skills: z.array(SkillSchema).min(1),
    "Awards & Open Source": z.array(BulletSchema).optional(),
  }),
});

export type Resume = z.infer<typeof ResumeSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Skill = z.infer<typeof SkillSchema>;
