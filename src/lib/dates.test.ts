import { describe, expect, it } from "vitest";
import { formatRange, formatSpan, isOngoing, parseDate } from "./dates";

describe("parseDate", () => {
  it("parses full dates, year-months and bare years", () => {
    expect(parseDate("2026-07-27")).toEqual({ year: 2026, month: 7 });
    expect(parseDate("2025-08")).toEqual({ year: 2025, month: 8 });
    expect(parseDate("2021")).toEqual({ year: 2021, month: undefined });
  });

  it("rejects free text and invalid months", () => {
    expect(parseDate("Expected 2029")).toBeUndefined();
    expect(parseDate("present")).toBeUndefined();
    expect(parseDate("2025-13")).toBeUndefined();
  });
});

describe("formatRange (CV)", () => {
  it("formats an ongoing role", () => {
    expect(formatRange({ start_date: "2026-07-27", end_date: "present" })).toBe(
      "Jul 2026 – present",
    );
  });

  it("treats a missing end date as ongoing", () => {
    expect(formatRange({ start_date: "2026-07" })).toBe("Jul 2026 – present");
  });

  it("collapses the year when a range stays within one year", () => {
    expect(formatRange({ start_date: "2025-08", end_date: "2025-12" })).toBe("Aug – Dec 2025");
  });

  it("collapses to one month when start and end match", () => {
    expect(formatRange({ start_date: "2025-08", end_date: "2025-08" })).toBe("Aug 2025");
  });

  it("spans years in full", () => {
    expect(formatRange({ start_date: "2022-09", end_date: "2023-02" })).toBe("Sep 2022 – Feb 2023");
  });

  it("handles year-only and mixed precision", () => {
    expect(formatRange({ start_date: "2020", end_date: "2023" })).toBe("2020 – 2023");
    expect(formatRange({ start_date: "2020", end_date: "2023-03" })).toBe("2020 – Mar 2023");
    expect(formatRange({ start_date: "2021", end_date: "2021" })).toBe("2021");
  });

  it("keeps each end's precision within one year when only one end has a month", () => {
    expect(formatRange({ start_date: "2025", end_date: "2025-08" })).toBe("2025 – Aug 2025");
    expect(formatRange({ start_date: "2025-03", end_date: "2025" })).toBe("Mar 2025 – 2025");
  });

  it("passes free-text dates through", () => {
    expect(formatRange({ date: "Expected 2029" })).toBe("Expected 2029");
  });

  it("formats a structured single date", () => {
    expect(formatRange({ date: "2024-05" })).toBe("May 2024");
  });

  it("shows end-only entries as a single date", () => {
    expect(formatRange({ end_date: "2023-03" })).toBe("Mar 2023");
  });

  it("returns an empty string when there is no date", () => {
    expect(formatRange({})).toBe("");
  });
});

describe("formatSpan (index)", () => {
  it("leaves ongoing spans open", () => {
    expect(formatSpan({ start_date: "2026-07-27", end_date: "present" })).toBe("2026 —");
  });

  it("shows a single year for same-year ranges", () => {
    expect(formatSpan({ start_date: "2025-08", end_date: "2025-12" })).toBe("2025");
  });

  it("abbreviates the end year", () => {
    expect(formatSpan({ start_date: "2024-05", end_date: "2025-07" })).toBe("2024 — 25");
    expect(formatSpan({ start_date: "2022-09", end_date: "2023-02" })).toBe("2022 — 23");
  });

  it("keeps the full end year across centuries", () => {
    expect(formatSpan({ start_date: "1999", end_date: "2001" })).toBe("1999 — 2001");
  });

  it("marks expected dates as open-start", () => {
    expect(formatSpan({ date: "Expected 2029" })).toBe("— 2029");
  });

  it("uses the year from other free text", () => {
    expect(formatSpan({ date: "Summer 2024" })).toBe("2024");
    expect(formatSpan({ date: "Ongoing" })).toBe("Ongoing");
  });

  it("shows end-only entries as the end year", () => {
    expect(formatSpan({ end_date: "2023-03" })).toBe("2023");
  });
});

describe("isOngoing", () => {
  it("treats a start date with no end date as ongoing", () => {
    expect(isOngoing({ start_date: "2026-07" })).toBe(true);
    expect(isOngoing({ start_date: "2026-07", end_date: "" })).toBe(true);
  });

  it("treats an end date of present as ongoing, in any case", () => {
    expect(isOngoing({ start_date: "2026-07", end_date: "present" })).toBe(true);
    expect(isOngoing({ start_date: "2026-07", end_date: "Present" })).toBe(true);
    expect(isOngoing({ start_date: "2026-07", end_date: " PRESENT " })).toBe(true);
  });

  it("treats finished and undated entries as not ongoing", () => {
    expect(isOngoing({ start_date: "2025-08", end_date: "2025-12" })).toBe(false);
    expect(isOngoing({ end_date: "2023-03" })).toBe(false);
    expect(isOngoing({ date: "Expected 2029" })).toBe(false);
    expect(isOngoing({})).toBe(false);
  });
});
