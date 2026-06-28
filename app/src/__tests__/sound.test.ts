import { describe, it, expect } from "vitest";
import { clampVolume, fadeSteps, resolveSound } from "../lib/sound";
import type { SoundDef } from "../types";

const defs: SoundDef[] = [
  { id: "white-noise", title: "белый шум", type: "noise", params: { color: "white" } },
  { id: "rain", title: "дождь", type: "rain", params: { color: "pink" } },
];

describe("clampVolume", () => {
  it("clamps into [0,1]", () => {
    expect(clampVolume(-0.5)).toBe(0);
    expect(clampVolume(0)).toBe(0);
    expect(clampVolume(0.3)).toBe(0.3);
    expect(clampVolume(1)).toBe(1);
    expect(clampVolume(2)).toBe(1);
  });
});

describe("fadeSteps", () => {
  it("produces monotonic ramp from->to with N steps, ending at to", () => {
    const up = fadeSteps(0, 1, 5);
    expect(up.length).toBe(5);
    expect(up[up.length - 1]).toBeCloseTo(1, 10);
    for (let i = 1; i < up.length; i++) expect(up[i]).toBeGreaterThan(up[i - 1]);

    const down = fadeSteps(1, 0, 4);
    expect(down.length).toBe(4);
    expect(down[down.length - 1]).toBeCloseTo(0, 10);
    for (let i = 1; i < down.length; i++) expect(down[i]).toBeLessThan(down[i - 1]);
  });
});

describe("resolveSound", () => {
  it("returns matching def by id or null", () => {
    expect(resolveSound("white-noise", defs)?.title).toBe("белый шум");
    expect(resolveSound("rain", defs)?.type).toBe("rain");
    expect(resolveSound("missing", defs)).toBeNull();
  });
});
