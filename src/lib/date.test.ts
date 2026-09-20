import { describe, expect, it } from "vitest";

import { formatDate, isValidIsoDate, parseIsoDate, toIsoDate } from "./date";

describe("toIsoDate", () => {
  it("formats local calendar components as YYYY-MM-DD", () => {
    expect(toIsoDate(new Date(2026, 2, 15))).toBe("2026-03-15");
  });

  it("zero-pads month and day", () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("keeps the local day for dates created near midnight", () => {
    // 15 March 2026 23:59 local time must stay on the 15th, not shift to a
    // different day via a UTC round trip.
    expect(toIsoDate(new Date(2026, 2, 15, 23, 59))).toBe("2026-03-15");
  });
});

describe("parseIsoDate", () => {
  it("parses an ISO date at local midnight", () => {
    const date = parseIsoDate("2026-03-15");
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(2);
    expect(date?.getDate()).toBe(15);
    expect(date?.getHours()).toBe(0);
  });

  it("returns undefined for missing or malformed values", () => {
    expect(parseIsoDate(undefined)).toBeUndefined();
    expect(parseIsoDate("")).toBeUndefined();
    expect(parseIsoDate("15/03/2026")).toBeUndefined();
    expect(parseIsoDate("2026-3-15")).toBeUndefined();
  });

  it("rejects dates that would roll over", () => {
    expect(parseIsoDate("2026-02-31")).toBeUndefined();
    expect(parseIsoDate("2026-13-01")).toBeUndefined();
  });
});

describe("isValidIsoDate", () => {
  it("accepts only storage-format calendar dates", () => {
    expect(isValidIsoDate("2026-03-15")).toBe(true);
    expect(isValidIsoDate("15/03/2026")).toBe(false);
    expect(isValidIsoDate(null)).toBe(false);
  });
});

describe("formatDate", () => {
  it("renders DD/MM/YYYY", () => {
    expect(formatDate("2026-03-15")).toBe("15/03/2026");
  });

  it("zero-pads day and month", () => {
    expect(formatDate("2026-01-05")).toBe("05/01/2026");
  });

  it("returns an empty string for empty input", () => {
    expect(formatDate(undefined)).toBe("");
    expect(formatDate(null)).toBe("");
    expect(formatDate("")).toBe("");
  });

  it("passes through values that are not ISO dates", () => {
    expect(formatDate("Mar 15, 2026")).toBe("Mar 15, 2026");
  });

  it("round-trips through the storage format", () => {
    expect(formatDate(toIsoDate(new Date(2026, 11, 31)))).toBe("31/12/2026");
  });
});
