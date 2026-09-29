import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./json-ld";

describe("serializeJsonLd", () => {
  it("cannot close the script element", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toMatch(/[<>]/);
    expect(out).toBe(
      String.raw`{"name":"\u003c/script\u003e\u003cscript\u003ealert(1)\u003c/script\u003e"}`,
    );
  });

  it("escapes ampersands and line separators", () => {
    expect(serializeJsonLd("a & b\u2028c\u2029d")).toBe(String.raw`"a \u0026 b\u2028c\u2029d"`);
  });

  it("round-trips through JSON.parse", () => {
    const value = { name: "</script> & <!-- \u2028", list: [1, "x"] };
    expect(JSON.parse(serializeJsonLd(value))).toEqual(value);
  });
});
