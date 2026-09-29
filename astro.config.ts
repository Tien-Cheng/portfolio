import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://tiencheng.dev",
  // Cloudflare serves /cv from cv.html; keep URLs, canonicals and the sitemap slash-free.
  trailingSlash: "never",
  // Inline the (small) stylesheet so first paint does not wait on a CSS request.
  build: { format: "file", inlineStylesheets: "always" },
  compressHTML: true,
  integrations: [sitemap({ filter: (page) => !page.endsWith("/404") })],
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Source Serif 4",
      cssVariable: "--font-serif",
      fallbacks: ["Georgia", "serif"],
      options: {
        variants: [
          {
            weight: "200 900",
            style: "normal",
            src: ["./src/assets/fonts/source-serif-4-latin-opsz-normal.woff2"],
          },
          {
            weight: "200 900",
            style: "italic",
            src: ["./src/assets/fonts/source-serif-4-latin-opsz-italic.woff2"],
          },
        ],
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
