/**
 * Site-owned content. The résumé snapshot (src/data/resume) owns experience, education, skills
 * and the résumé's award bullets; everything written only for the website lives here.
 */

export const site = {
  name: "Oh Tien Cheng",
  title: "Oh Tien Cheng",
  description:
    "Computer science student at NUS building applied ML systems: search, evaluation, and production LLM tooling.",
  location: "Singapore",
  email: "tiencheng.oh@gmail.com",
  jobTitle: "Computer Science Student",
  links: {
    github: "https://github.com/Tien-Cheng",
    linkedin: "https://www.linkedin.com/in/ohtiencheng",
  },
  resumePdf: "/Tien_Cheng_Oh_CV.pdf",
} as const;

/** Index intro; the second paragraph renders muted. */
export const intro = [
  "I study computer science at NUS and build software around machine learning: search engines, LLM applications, and the backends and infrastructure that run them in production.",
  "I've co-founded two small companies, built an LLM exam-marking platform during national service, and shipped MLOps tooling at DSTA. Right now I'm a backend intern at TikTok, president of RC4Entre, and on the NUS Hackers coreteam.",
] as const;

/**
 * Start years for education entries whose résumé dates carry only an end ("Expected 2029", or an
 * end date alone), so the index can show a span. A start date in the résumé itself takes precedence.
 */
export const educationStartYears: Readonly<Record<string, number>> = {
  "National University of Singapore": 2025,
  "Singapore Polytechnic": 2020,
};

/** One-line summaries for the index Work list, keyed by the résumé's `company`. */
export const workSummaries: Readonly<Record<string, string>> = {
  TikTok: "Backend work on content moderation services.",
  "Conform Labs": "Voice agents and the tooling to evaluate them.",
  "Digital and Intelligence Service":
    "An LLM exam-marking platform that halved instructor grading time, air-gapped.",
  Flora: "Neural search for enterprise documents, piloted with SkillsFuture SG and NSCC.",
  "Defence Science and Technology Agency":
    "An internal model hub for deploying ML models as Kubernetes services.",
};

export interface Project {
  name: string;
  year: string;
  /** Absolute URL for external projects, a site path for case studies. */
  href: string;
  blurb: string;
}

export const projects: readonly Project[] = [
  {
    name: "OwlShield",
    year: "2024",
    href: "/projects/owlshield",
    blurb:
      "An LLM safety firewall that screens prompts and outputs for attacks and harmful content. First place, NSCC HPC Innovation Competition (university category).",
  },
  {
    name: "AI App Store",
    year: "2022",
    href: "https://dinohub.github.io/appstore-ai/",
    blurb:
      "Open-source hub for publishing model cards and deploying models as services. Built at DSTA with Vue and FastAPI.",
  },
  {
    name: "Emotive",
    year: "2021",
    href: "https://github.com/Tien-Cheng/Emotive",
    blurb:
      "Emotion detection from faces, with Flask and TensorFlow. Served on Heroku, while that lasted.",
  },
  {
    name: "Rentier",
    year: "2021",
    href: "https://github.com/Tien-Cheng/Rentier",
    blurb: "Property rent valuation with scikit-learn.",
  },
  {
    name: "Project Cactus",
    year: "2021",
    href: "https://github.com/Ducksss/Project-Cactus",
    blurb: "Flagging suspicious news articles with ML.",
  },
];

export interface LeadershipEntry {
  org: string;
  role: string;
  dates: string;
  points: readonly string[];
}

export const leadership: readonly LeadershipEntry[] = [
  {
    org: "RC4Entre",
    role: "President",
    dates: "AY26/27",
    points: ["Leading the entrepreneurship interest group of Residential College 4, NUS."],
  },
  {
    org: "NUS Hackers",
    role: "Coreteam",
    dates: "2026 – present",
    points: [
      "Ran workshops for the student hacker community, including an introduction to Vim and a two-part series on end-to-end deployment.",
    ],
  },
  {
    org: "SPAI, Singapore Polytechnic",
    role: "Co-founder & Operations Head",
    dates: "AY21/22",
    points: [
      "Co-founded an AI Singapore student chapter and organised a Machine Learning Bootcamp and a Deep Learning workshop; SPAI won an SP Excellence Award in its first year.",
    ],
  },
];

export interface Award {
  /** Four-digit year, or "—" when undated. */
  year: string;
  /** Inline Markdown (links and bold), rendered with `renderInline`. */
  text: string;
}

/** Awards that appear on the website but not in the résumé. */
export const siteAwards: readonly Award[] = [
  { year: "2025", text: "Champion, SingHacks 2025." },
  { year: "2023", text: "NUS Global Merit Scholarship; Singapore Computer Society Silver Medal." },
  {
    year: "2021",
    text: "Best Junior Hack, NTU MLDA Deep Learning Week Hackathon, for Project Cactus.",
  },
  { year: "2020", text: "Champion, Collegial Artificial Intelligence Innovation Competition." },
  { year: "2020", text: "DSTA Polytechnic Digital Scholarship." },
];

/**
 * Years for the résumé's "Awards & Open Source" bullets, which carry no date field. The first
 * entry whose `match` appears in the bullet wins; unmatched bullets get "—".
 */
export const awardYears: readonly { match: string; year: string }[] = [
  { match: "HPC Innovation", year: "2024" },
  { match: "Garak", year: "2024" },
];
