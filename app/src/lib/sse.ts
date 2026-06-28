export function parseSSE(chunk: string): string[] {
  const out: string[] = [];
  for (const line of chunk.split("\n")) {
    const t = line.trim();
    if (!t.startsWith("data:")) continue;
    const payload = t.slice(5).trim();
    try {
      const obj = JSON.parse(payload);
      if (typeof obj.delta === "string") out.push(obj.delta);
    } catch {
      /* ignore keep-alive */
    }
  }
  return out;
}
