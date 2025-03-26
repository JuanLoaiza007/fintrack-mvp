// __tests__/utils.test.js
import { cn, formatCurrency, isDateInNowMonth } from "@/lib/utils";

describe("cn()", () => {
  it("combines multiple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignores falsy values", () => {
    expect(cn("foo", null, undefined, false, "", "bar")).toBe("foo bar");
  });

  it("deduplicates conflicting Tailwind classes (twMerge)", () => {
    expect(cn("p-4 p-2 text-center text-left")).toBe("p-2 text-left");
  });

  it("merges conditional classnames via object syntax", () => {
    expect(cn("foo", { bar: true, baz: false })).toBe("foo bar");
  });
});

describe("formatCurrency()", () => {
  it("formats zero as currency", () => {
    expect(formatCurrency(0)).toBe(`$\u00A00,00`);
  });

  it("formats integer amounts correctly", () => {
    expect(formatCurrency(10000)).toBe(`$\u00A010.000,00`);
  });

  it("formats decimals correctly", () => {
    expect(formatCurrency(1234567.89)).toBe(`$\u00A01.234.567,89`);
  });
});

describe("isDateInNowMonth()", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date("2025-03-15T12:00:00Z"));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it("returns false for a date in a different year", () => {
    expect(isDateInNowMonth("2024-03-15")).toBe(false);
    expect(isDateInNowMonth("2026-03-15")).toBe(false);
  });

  it("returns false for invalid date strings", () => {
    expect(isDateInNowMonth("not-a-date")).toBe(false);
    expect(isDateInNowMonth("")).toBe(false);
  });
});
