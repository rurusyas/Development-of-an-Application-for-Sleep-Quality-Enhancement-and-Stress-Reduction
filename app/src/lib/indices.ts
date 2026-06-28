import type { Indices, Onboarding } from "../types";

const c01 = (x: number) => Math.max(0, Math.min(1, x));
const to1 = (v: number, a: number, b: number) => (b === a ? 0 : c01((v - a) / (b - a)));
const r1 = (x: number) => Math.round(x * 10) / 10;

export function sleepIndex(o: Onboarding) {
  const hours = to1(o.sleep_hours, 4, 8);
  const latency = c01(1 - o.sleep_latency_min / 60);
  const wake = to1(o.wake_feeling, 1, 5);
  const reg = to1(o.bedtime_regularity, 1, 5);
  return r1(100 * (0.4 * hours + 0.2 * latency + 0.2 * wake + 0.2 * reg));
}
export function stressIndex(o: Onboarding) {
  const p = [to1(o.stress_freq, 1, 5), to1(o.thoughts_racing, 1, 5), to1(o.overload, 1, 5)];
  return r1((100 * p.reduce((a, b) => a + b, 0)) / p.length);
}
export function focusIndex(o: Onboarding) {
  const p = [1 - to1(o.focus_difficulty, 1, 5), 1 - to1(o.distraction, 1, 5)];
  return r1((100 * p.reduce((a, b) => a + b, 0)) / p.length);
}
export function computeIndices(o: Onboarding): Indices {
  return { sleep_index: sleepIndex(o), stress_index: stressIndex(o), focus_index: focusIndex(o) };
}
