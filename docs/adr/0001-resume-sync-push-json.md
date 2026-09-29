---
status: accepted
---

# The private resume repo pushes a JSON snapshot to the portfolio

The Resume lives in the private `Tien-Cheng/resume` repository as RenderCV YAML. On every change to `main` there, its CI renders the Published variant, exports a sanitised Resume snapshot (`resume.json`, `meta.json`, and the PDF), and pushes it to this repository's `main` using a deploy key with write access. The portfolio never reads the resume repo.

We chose this because:

- The YAML's `#` comments hold confidential notes about employers, so the YAML itself must never reach a public repository. Only the exported JSON, with comments gone, crosses over.
- The phone number is in the source but must not be public. The export drops it from both the JSON and the PDF, and the sync workflow refuses to push if it finds it.
- This repository is public, so anything committed here is published. The snapshot is the one reviewed boundary.
- Local development and CI need real data with no credentials: `pnpm dev` works from a fresh clone.
- The portfolio build has no dependency on another repository, token, or network fetch, so it cannot break because the resume repo is unreachable.

## Considered options

- **Portfolio pulls from the resume repo at build time with a personal access token.** Rejected: every build, preview, and local checkout would need a secret that can read the private repo, and local dev would break without it.
- **Git submodule of the resume repo.** Rejected: a submodule of a private repo in a public one breaks clones for everyone else, and it would bring the raw YAML (and its comments) into the build.
- **Fine-grained PAT used by the resume repo to push.** Rejected: fine-grained PATs expire and are tied to a personal account. A deploy key is scoped to this one repository and does not expire.

## Consequences

- The sync owns exactly three files: `src/data/resume/resume.json`, `src/data/resume/meta.json` and `public/Tien_Cheng_Oh_CV.pdf`. Hand edits to them get overwritten on the next sync.
- The resume repo validates its export against `src/data/resume/schema.json` before pushing, so the schema is the contract between the two repos. The sync never writes it: it is generated from the Zod source in `src/lib/resume-schema.ts` by `pnpm gen:schema` and committed, and CI fails if the committed copy is stale.
- To change the schema: edit `src/lib/resume-schema.ts`, run `pnpm gen:schema`, commit both files, and only then update the resume repo if its export needs to change.
- Sync commits land on `main` directly and trigger a normal deploy.
