import { describe, expect, it } from "vitest";
import { escapeHtml, renderInline } from "./inline";

describe("escapeHtml", () => {
  it("escapes markup characters", () => {
    expect(escapeHtml(`<b class="x">'&'</b>`)).toBe(
      "&lt;b class=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/b&gt;",
    );
  });
});

describe("renderInline", () => {
  it("leaves plain text alone apart from escaping", () => {
    expect(renderInline("Grading time fell by >50% & held.")).toBe(
      "Grading time fell by &gt;50% &amp; held.",
    );
  });

  it("renders https links", () => {
    expect(
      renderInline(
        "Contributed a [LiteLLM integration](https://github.com/NVIDIA/garak/pull/572) to Garak.",
      ),
    ).toBe(
      'Contributed a <a href="https://github.com/NVIDIA/garak/pull/572">LiteLLM integration</a> to Garak.',
    );
  });

  it("does not render non-https links", () => {
    expect(renderInline("[x](javascript:alert(1))")).toBe("[x](javascript:alert(1))");
    expect(renderInline("[x](http://example.com)")).toBe("[x](http://example.com)");
  });

  it("cannot break out of the href attribute", () => {
    expect(renderInline('[x](https://a.test/"onmouseover="y)')).toBe(
      '<a href="https://a.test/&quot;onmouseover=&quot;y">x</a>',
    );
  });

  it("renders bold, including inside link labels", () => {
    expect(renderInline("**400%** faster")).toBe("<strong>400%</strong> faster");
    expect(renderInline("[**Garak**](https://garak.ai)")).toBe(
      '<a href="https://garak.ai"><strong>Garak</strong></a>',
    );
  });

  it("escapes HTML inside bold text", () => {
    expect(renderInline("**<script>**")).toBe("<strong>&lt;script&gt;</strong>");
  });
});
