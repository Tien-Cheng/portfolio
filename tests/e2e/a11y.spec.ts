import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const paths = ["/", "/cv", "/projects/owlshield"];
const themes = ["light", "dark"] as const;
const widths = [375, 1280];

for (const path of paths) {
  for (const theme of themes) {
    for (const width of widths) {
      test(`${path} has no axe violations (${theme}, ${width}px)`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);

        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();

        const summary = violations.map((v) => ({
          rule: v.id,
          impact: v.impact,
          targets: v.nodes.map((n) => n.target.join(" ")),
        }));
        expect(summary).toEqual([]);
      });
    }
  }
}
