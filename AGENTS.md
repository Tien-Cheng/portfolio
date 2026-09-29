# AGENTS.md

Personal site for tiencheng.dev: an overview page, a web CV, one case study. Static Astro 7 build with Tailwind 4, served as a Cloudflare Workers static-assets site. Use the domain vocabulary in `CONTEXT.md` (Resume vs CV page, Resume snapshot, Work summary, Published variant…).

## Checks

Scripts are in `package.json`. Before pushing, run CI's chain in its order: `pnpm lint`, `pnpm check`, `pnpm gen:schema` (then `git diff --exit-code src/data/resume/schema.json`), `pnpm test`, `pnpm build`, `pnpm test:e2e`.

- E2E runs Playwright + axe against `wrangler dev` serving `dist/`, so build first. One test: `pnpm build && pnpm exec playwright test tests/e2e/smoke.spec.ts -g "<name>"`.
- One unit test: `pnpm exec vitest run src/lib/dates.test.ts -t "<name>"`.
- A new dependency with a postinstall script needs an entry in `pnpm-workspace.yaml` `allowBuilds` (pnpm 11 fails the install otherwise).
- TypeScript stays on ^6 until `@astrojs/check` supports 7.

## Content ownership

Pages read two sources; route each edit to the right one.

- **Resume snapshot**: `src/data/resume/resume.json`, `meta.json`, `public/Tien_Cheng_Oh_CV.pdf`. The sync workflow in the private `Tien-Cheng/resume` repo overwrites these on every resume change (RenderCV YAML → JSON, phone stripped, YAML comments dropped) with a `chore(resume): sync from resume@<sha>` commit to `main`. Jobs, dates, bullets, skills and the "Awards & Open Source" bullets change in the resume repo. Published variant: `mle_internship`.
- **Site-owned**: `src/data/site.ts` holds intro, projects, leadership, extra awards, `awardYears` (year lookup by substring for the resume's award bullets), and `workSummaries`, which join to resume experience by exact company name (a missing one renders without a summary and warns).

The contract between the repos is `src/lib/resume-schema.ts` (Zod 4 via `astro/zod`). `src/lib/resume.ts` parses the snapshot at import, so bad data fails the build. The resume repo validates against the generated `schema.json` before pushing, so a schema change is: edit the Zod source → `pnpm gen:schema` → commit both. Keep it loose enough for every resume variant (dates may be strings or bare numeric years; extra sections allowed). Rationale: `docs/adr/0001-resume-sync-push-json.md`.

## Routing and deploy

- Pages build to `cv.html` (`build.format: "file"`, `trailingSlash: "never"`) and Workers serves them at `/cv` (`html_handling: "drop-trailing-slash"`). At build time `Astro.url.pathname` is `/cv.html`, so derive canonicals and nav state through `publicPath()` in `src/lib/paths.ts`.
- `public/_redirects` (old URLs, splat rules last) and `public/_headers` (immutable caching for content-hashed `/_astro/*` only) are Workers features; the e2e suite exercises them, which is why it runs on `wrangler dev`.
- Push to `main` → checks → `wrangler deploy`. Same-repo PRs get a Worker Preview `pr-<n>` plus a sticky comment, deleted when the PR closes. `PUBLIC_CF_ANALYTICS_TOKEN` (repo variable, read at build) is the bare 32-hex token; the build throws on anything else. One-time Cloudflare/GitHub setup: `scripts/setup-wizard.sh [stage]`. Rationale: `docs/adr/0002-workers-via-actions.md`.

## Markup and styling

- Theme = CSS-variable swap. Tokens live in `src/styles/global.css` (light on `:root`; dark from `prefers-color-scheme` unless `data-theme="light"`, or forced by `data-theme="dark"`) and reach Tailwind via `@theme inline` as `bg ink ink2 muted faint rule panel`. Style with those tokens; the theme follows automatically. The inline `<head>` script in `src/layouts/Base.astro` applies a stored theme before first paint, so it stays inline and in `<head>`.
- Astro 7 collapses whitespace between elements into a space, so a line break before a comma renders "TikTok , Role". Keep punctuation on the same line as the preceding element (see `OrgRole.astro`) and write spaces explicitly as `{" "}` (e.g. before " ↗", " →").
- Render resume bullets (`[text](https://…)`, `**bold**`) through `renderInline()` in `src/lib/inline.ts`, and JSON-LD through `serializeJsonLd()` in `src/lib/json-ld.ts`; both escape first.
- Faint text sits just above WCAG AA (≈4.59:1 light). The axe suite checks both themes at 375 and 1280px, so re-run e2e after any colour change.
- Brand SVGs are outlined glyphs. To regenerate: `uv run --no-project --with 'fonttools[woff]' --with uharfbuzz python scripts/brand/build_glyphs.py`, then `pnpm gen:brand`.
