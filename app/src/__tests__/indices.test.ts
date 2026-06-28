import { describe, it, expect } from "vitest";
import { sleepIndex, stressIndex, focusIndex, computeIndices } from "../lib/indices";
import type { Onboarding } from "../types";

const worst: Onboarding = {
  sleep_hours: 0, sleep_latency_min: 90, wake_feeling: 1, bedtime_regularity: 1,
  stress_freq: 5, thoughts_racing: 5, overload: 5,
  focus_difficulty: 5, distraction: 5,
};

const best: Onboarding = {
  sleep_hours: 8, sleep_latency_min: 0, wake_feeling: 5, bedtime_regularity: 5,
  stress_freq: 1, thoughts_racing: 1, overload: 1,
  focus_difficulty: 1, distraction: 1,
};

const mid: Onboarding = {
  sleep_hours: 6, sleep_latency_min: 30, wake_feeling: 3, bedtime_regularity: 3,
  stress_freq: 3, thoughts_racing: 3, overload: 3,
  focus_difficulty: 3, distraction: 3,
};

describe("sleepIndex", () => {
  it("extremes return 0 and 100", () => {
    expect(sleepIndex(worst)).toBe(0);
    expect(sleepIndex(best)).toBe(100);
  });
});

describe("stressIndex / focusIndex", () => {
  it("stress maxes at 100, mins at 0; focus inverse", () => {
    expect(stressIndex(worst)).toBe(100);
    expect(stressIndex(best)).toBe(0);
    expect(focusIndex(best)).toBe(100);
    expect(focusIndex(worst)).toBe(0);
  });
});

describe("indices middle values", () => {
  it("mid onboarding produces non-extreme indices", () => {
    const s = sleepIndex(mid);
    const st = stressIndex(mid);
    const f = focusIndex(mid);
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(100);
    expect(st).toBeCloseTo(50, 0);
    expect(f).toBeCloseTo(50, 0);
  });
});

describe("computeIndices", () => {
  it("returns object with all three keys", () => {
    const r = computeIndices(best);
    expect(r).toHaveProperty("sleep_index");
    expect(r).toHaveProperty("stress_index");
    expect(r).toHaveProperty("focus_index");
    expect(r.sleep_index).toBe(100);
    expect(r.stress_index).toBe(0);
    expect(r.focus_index).toBe(100);
  });
});
