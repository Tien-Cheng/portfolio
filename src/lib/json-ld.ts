/**
 * Serialises a value for an inline `<script type="application/ld+json">`. JSON.stringify leaves
 * `<`, `>` and `&` alone, so a string containing `</script>` would close the element early. Those
 * characters, and the line separators U+2028/U+2029, are replaced with their `\uXXXX` escapes,
 * which JSON parsers read back as the same characters.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(
    /[<>&\u2028\u2029]/g,
    (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}
