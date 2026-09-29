import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", name: "Oh Tien Cheng" },
  { path: "/cv", name: "CV" },
  { path: "/projects/owlshield", name: "OwlShield" },
] as const;

const pdfPath = "/Tien_Cheng_Oh_CV.pdf";

/** Pathname of a Location header, whether wrangler sends it absolute or relative. */
const locationPath = (location: string | undefined) =>
  location === undefined ? undefined : new URL(location, "http://placeholder").pathname;

test.describe("pages", () => {
  for (const { path, name } of pages) {
    test(`${path} renders with one h1 and a named title`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page).toHaveTitle(new RegExp(name));
      await expect(page).toHaveTitle(/Oh Tien Cheng/);
    });

    test(`${path} has a slash-free canonical URL without .html`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://tiencheng.dev${path}`,
      );
    });

    test(`${path} has no horizontal overflow at 375px`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("Makeovr appears on no page", async ({ request }) => {
    for (const path of [...pages.map((p) => p.path), "/this-page-does-not-exist"]) {
      const body = await (await request.get(path)).text();
      expect(body, path).not.toMatch(/makeovr/i);
    }
  });
});

test.describe("routing", () => {
  test("/cv is served directly, without a redirect", async ({ page, request }) => {
    const direct = await request.get("/cv", { maxRedirects: 0 });
    expect(direct.status()).toBe(200);

    const response = await page.goto("/cv");
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/cv");
  });

  test("/cv/ settles on /cv without a redirect loop", async ({ request }) => {
    const response = await request.get("/cv/", { maxRedirects: 5 });
    expect(response.status()).toBe(200);
    expect(new URL(response.url()).pathname).toBe("/cv");
  });

  test("an unknown path returns the site's 404 page with a 404 status", async ({ request }) => {
    const notFoundHtml = readFileSync(resolve("dist/404.html"), "utf8");
    const expectedTitle = notFoundHtml.match(/<title>(.*?)<\/title>/)?.[1];
    expect(expectedTitle).toBeTruthy();

    const response = await request.get("/this-page-does-not-exist", { maxRedirects: 0 });
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain(`<title>${expectedTitle}</title>`);
  });

  const redirects = [
    { from: "/projects", to: "/", status: 301 },
    { from: "/projects/hpcic23.sg", to: "/projects/owlshield", status: 301 },
    { from: "/blog/anything", to: "/", status: 301 },
    { from: "/rss.xml", to: "/", status: 301 },
    { from: "/resume", to: "/cv", status: 301 },
    { from: "/cv.pdf", to: pdfPath, status: 302 },
  ] as const;

  for (const { from, to, status } of redirects) {
    test(`${from} redirects ${status} to ${to}`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status()).toBe(status);
      expect(locationPath(response.headers().location)).toBe(to);
    });
  }
});

test.describe("CV page", () => {
  test("links to the resume PDF, which is served as a PDF", async ({ page, request }) => {
    await page.goto("/cv");
    await expect(page.locator(`a[href="${pdfPath}"]`).first()).toBeVisible();

    const pdf = await request.get(pdfPath);
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()["content-type"]).toContain("application/pdf");
  });
});

test.describe("navigation", () => {
  for (const path of ["/", "/cv"]) {
    test(`marks the ${path} link as the current page`, async ({ page }) => {
      await page.goto(path);
      const current = page
        .getByRole("navigation", { name: "Main" })
        .locator('[aria-current="page"]');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveAttribute("href", path);
    });
  }
});

const background = {
  light: "rgb(251, 250, 246)", // --bg #fbfaf6
  dark: "rgb(22, 21, 19)", // --bg #161513
} as const;

const flip = { light: "dark", dark: "light" } as const;

for (const scheme of ["light", "dark"] as const) {
  test.describe(`theme toggle when the system prefers ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    test("flips the colours, reports its state, and remembers it", async ({ page }) => {
      await page.goto("/");
      const html = page.locator("html");
      const body = page.locator("body");
      const toggle = page.locator("#theme-toggle");
      const other = flip[scheme];

      await expect(body).toHaveCSS("background-color", background[scheme]);
      await expect(toggle).toHaveAttribute("aria-pressed", String(scheme === "dark"));

      await toggle.click();
      await expect(html).toHaveAttribute("data-theme", other);
      await expect(body).toHaveCSS("background-color", background[other]);
      await expect(toggle).toHaveAttribute("aria-pressed", String(other === "dark"));

      await page.reload();
      await expect(html).toHaveAttribute("data-theme", other);
      await expect(body).toHaveCSS("background-color", background[other]);
      await expect(toggle).toHaveAttribute("aria-pressed", String(other === "dark"));

      await toggle.click();
      await expect(html).toHaveAttribute("data-theme", scheme);
      await expect(body).toHaveCSS("background-color", background[scheme]);

      await page.reload();
      await expect(body).toHaveCSS("background-color", background[scheme]);
    });
  });
}

test.describe("stored theme", () => {
  test.use({ colorScheme: "light" });

  test("is applied by the head script before the body is parsed", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("theme", "dark");
      // Record the theme at the moment <body> is inserted, i.e. before first paint.
      const observer = new MutationObserver(() => {
        if (!document.body) return;
        document.documentElement.dataset.themeAtBody = document.documentElement.dataset.theme ?? "";
        observer.disconnect();
      });
      observer.observe(document, { childList: true, subtree: true });
    });

    await page.goto("/", { waitUntil: "commit" });
    await page.waitForLoadState("domcontentloaded");
    const theme = await page.evaluate(() => ({
      now: document.documentElement.dataset.theme,
      atBody: document.documentElement.dataset.themeAtBody,
    }));
    expect(theme).toEqual({ now: "dark", atBody: "dark" });
    await expect(page.locator("body")).toHaveCSS("background-color", background.dark);
  });
});
