export function fmtMMSS(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
export function progressPct(elapsed: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, elapsed / total));
}
