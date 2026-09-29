# tiencheng.dev

My personal site: a short introduction, a web CV, and a case study of OwlShield. It is a static site built with Astro and served by Cloudflare.

The words used across the code (Resume, CV page, Resume snapshot, Work summary, and so on) are defined in [CONTEXT.md](CONTEXT.md).

## Stack

- [Astro](https://astro.build) 7 with TypeScript, [Tailwind CSS](https://tailwindcss.com) 4, and Source Serif 4 served locally
- [Biome](https://biomejs.dev) for linting and formatting, `astro check` for types
- [Vitest](https://vitest.dev) for unit tests, [Playwright](https://playwright.dev) and [axe](https://github.com/dequelabs/axe-core) for end-to-end and accessibility tests
- Cloudflare Workers static assets for hosting, deployed from GitHub Actions
- Node 24 and pnpm 11

## Local development

```sh
pnpm install
pnpm dev          # http://localhost:4321
```

| Command | What it does |
| --- | --- |
| `pnpm lint` | Biome lint and format check (`pnpm format` fixes what it can) |
| `pnpm check` | Astro and TypeScript checks |
| `pnpm test` | Unit tests |
| `pnpm build` | Build the site into `dist/` |
| `pnpm preview` | Serve `dist/` with `wrangler dev`, the same way Cloudflare does |
| `pnpm test:e2e` | Playwright smoke and accessibility tests against `dist/` (run `pnpm build` first). Starts its own `wrangler dev` on port 8788, so port 8788 must be free |

The first time you run the end-to-end tests, install the browser with `pnpm exec playwright install chromium`.

To try the analytics beacon locally, copy `.env.example` to `.env` and fill in the token. Leave it empty otherwise.

## Where content lives

- `src/data/resume/resume.json`, `src/data/resume/meta.json` and `public/Tien_Cheng_Oh_CV.pdf` are the Resume snapshot, and the only files the sync owns. **Don't edit them by hand.** They are overwritten by every sync from the resume repo. To change a job, a date, or a bullet, change the Resume.
- `src/data/resume/schema.json` sits beside them but is not synced. It is generated from `src/lib/resume-schema.ts` by `pnpm gen:schema` and committed; CI fails if the committed copy is stale.
- `src/data/site.ts` holds everything the site owns: the introduction, per-role work summaries, projects, leadership, and the extra awards.
- `src/pages/` has the pages themselves. `public/_redirects` keeps old URLs working.

## How the resume sync works

My resume lives in a private repository as RenderCV YAML. When it changes on `main`, that repo's CI renders the published variant, strips the phone number and anything private, checks the result against `src/data/resume/schema.json`, and pushes a `chore(resume): sync from resume@<sha>` commit here with a deploy key. That commit then deploys like any other.

The schema file is the contract between the two repos, and it is owned here. To change it:

1. Edit the Zod source in `src/lib/resume-schema.ts`.
2. Run `pnpm gen:schema` to regenerate `src/data/resume/schema.json`.
3. Commit both files together.
4. Then, if the export has to change to match, update the resume repo.

The reasoning, and the options we turned down, are in [ADR 0001](docs/adr/0001-resume-sync-push-json.md).

## Deploying

`.github/workflows/ci.yml` runs lint, type checks, unit tests, the build, and the Playwright suite on every pull request and every push to `main`. When those pass:

- a push to `main` deploys to production with `wrangler deploy`;
- a pull request gets a Worker Preview named `pr-<number>`, and a comment with its URL. The preview is deleted when the pull request closes.

Pull requests from forks and Dependabot get the checks but no preview. The workflow needs two repository secrets, `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and reads the optional variable `PUBLIC_CF_ANALYTICS_TOKEN` at build time. You can also run the workflow by hand on `main` to rebuild and redeploy. Why Workers and Actions instead of Pages: [ADR 0002](docs/adr/0002-workers-via-actions.md).

## After merging the rebuild

A few steps have to be done by hand, once, in the Cloudflare and GitHub dashboards. The wizard walks through them in order, opens each page, and sets the secrets for you:

```sh
./scripts/setup-wizard.sh      # or ./scripts/setup-wizard.sh 5 to resume at stage 5
```

1. Create a Cloudflare API token and set the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets.
2. Run one `wrangler deploy` with your own login to create the Worker, and check it on `*.workers.dev`.
3. Merge the portfolio PR and watch the first production deploy.
4. Move `tiencheng.dev` from the Pages project to the Worker (a few minutes of certificate downtime).
5. Add the `tiencheng.dev` custom-domain route to `wrangler.jsonc`.
6. Turn off the Pages project's git builds.
7. Create the resume-sync deploy key: write access here, private key stored as `PORTFOLIO_DEPLOY_KEY` in the resume repo.
8. Merge the resume PR and watch the first sync.
9. Turn on Cloudflare Web Analytics and set the `PUBLIC_CF_ANALYTICS_TOKEN` variable.
