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

test.describe("theme toggle", () => {
  test.use({ colorScheme: "light" });

  test("flips the theme, reports its state, and remembers it", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const toggle = page.locator("#theme-toggle");

    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  test.describe("when the system prefers dark", () => {
    test.use({ colorScheme: "dark" });

    test("starts dark", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("#theme-toggle")).toHaveAttribute("aria-pressed", "true");
      const scheme = await page.evaluate(
        () => getComputedStyle(document.documentElement).colorScheme,
      );
      expect(scheme).toBe("dark");
    });
  });
});
