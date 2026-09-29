/**
 * The public URL path for a page. With `build.format: "file"`, `Astro.url.pathname` is
 * "/cv.html" or "/index.html" at build time, but the site serves (and canonicalises) "/cv" and "/".
 */
export function publicPath(pathname: string): string {
  const clean = pathname
    .replace(/\.html$/, "")
    .replace(/\/index$/, "/")
    .replace(/\/+$/, "");
  return clean === "" ? "/" : clean;
}
