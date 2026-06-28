import { describe, it, expect } from "vitest";
import { fmtMMSS, progressPct } from "../lib/time";

describe("fmtMMSS", () => {
  it("formats seconds as mm:ss with zero padding", () => {
    expect(fmtMMSS(0)).toBe("0:00");
    expect(fmtMMSS(59)).toBe("0:59");
    expect(fmtMMSS(60)).toBe("1:00");
    expect(fmtMMSS(3661)).toBe("61:01");
    expect(fmtMMSS(-5)).toBe("0:00");
  });
});

describe("progressPct", () => {
  it("handles boundaries and clamps to [0,1]", () => {
    expect(progressPct(0, 100)).toBe(0);
    expect(progressPct(50, 100)).toBe(0.5);
    expect(progressPct(100, 100)).toBe(1);
    expect(progressPct(200, 100)).toBe(1);
    expect(progressPct(-5, 100)).toBe(0);
    expect(progressPct(10, 0)).toBe(0);
  });
});
