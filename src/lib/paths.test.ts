import { describe, expect, it } from "vitest";
import { publicPath } from "./paths";

describe("publicPath", () => {
  it.each([
    ["/", "/"],
    ["/index.html", "/"],
    ["/cv.html", "/cv"],
    ["/cv", "/cv"],
    ["/cv/", "/cv"],
    ["/projects/owlshield.html", "/projects/owlshield"],
    ["/projects/index.html", "/projects"],
  ])("%s → %s", (input, expected) => {
    expect(publicPath(input)).toBe(expected);
  });
});
