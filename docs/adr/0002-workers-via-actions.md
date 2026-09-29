---
status: accepted
---

# Deploy to Cloudflare Workers static assets from GitHub Actions

The site is an assets-only Cloudflare Worker (`wrangler.jsonc`, no script) deployed by `.github/workflows/ci.yml` after lint, type checks, unit tests, the build, and the Playwright suite pass. Each pull request gets a Worker Preview named `pr-<number>`, and the preview is deleted when the pull request closes. This replaces the old Cloudflare Pages project, which built every push from the dashboard with no checks.

We chose this because:

- Nothing reaches production unless the same checks that gate a merge have passed on that commit. Pages dashboard builds deployed whatever was pushed.
- Cloudflare recommends Workers for new projects and ships new features there (Worker Previews, for one) rather than on Pages. `_redirects`, the 404 page, and trailing-slash handling all work the same way on Workers.
- The end-to-end tests run against `wrangler dev` serving the built `dist`, which is the same asset handling production uses. Redirects and 404s are tested, not assumed.
- The build and deploy steps live in the repository, where they are reviewed, not in dashboard settings.

## Considered options

- **Keep Pages dashboard builds.** Rejected: no gate on checks, and the build configuration lives outside the repository.
- **Workers Builds (Cloudflare's Git integration).** Rejected for now: it would build and deploy in parallel with CI, not after it, so a failing test would not block a deploy.

## Consequences

- Deploys need `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets. Without them, previews are skipped and deploys fail.
- `PUBLIC_CF_ANALYTICS_TOKEN` is read at build time, so it is a repository variable passed to the build step, not a Worker variable.
- The `tiencheng.dev` custom domain moves from the Pages project to the Worker by hand once, with a few minutes of certificate downtime. After that, it is declared in `wrangler.jsonc`.
- Pull requests from forks and from Dependabot get checks but no preview, since they cannot see the secrets.
