import { parseSSE } from "../lib/sse";
import type { ChatMsg } from "../store/useStore";
import { isNative } from "../lib/platform";

const BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8000";
const UNREACHABLE_HINT = isNative() && /localhost|127\.0\.0\.1/.test(BASE)
  ? "В iOS-сборке backend не настроен, так как оффлайн-сборка не подключена к интернету"
  : "Сервер недоступен. Запусти бэкенд Orca, чтобы включить чат.";

async function jsonOrNull(promise: Promise<Response>) {
  try {
    const r = await promise;
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

export const api = {
  base: BASE,
  upsertUser: (tgId: string, body: any) =>
    jsonOrNull(fetch(`${BASE}/user/${tgId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })),
  getUser: (tgId: string) => jsonOrNull(fetch(`${BASE}/user/${tgId}`)),
  postDiary: (body: any) =>
    jsonOrNull(fetch(`${BASE}/diary`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })),
  getStats: (uid: number) => jsonOrNull(fetch(`${BASE}/stats/${uid}`)),
  getArticles: () => jsonOrNull(fetch(`${BASE}/content/articles`)),
  getLeaderboard: () => jsonOrNull(fetch(`${BASE}/leaderboard`)),
  postFocus: (body: any) =>
    jsonOrNull(fetch(`${BASE}/focus`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })),
  async analyzeApnea(blob: Blob, uid?: number, mode = "browser") {
    const fd = new FormData();
    fd.append("file", blob, "rec.webm");
    if (uid != null) fd.append("user_id", String(uid));
    fd.append("mode", mode);
    return jsonOrNull(fetch(`${BASE}/apnea/analyze`, { method: "POST", body: fd }));
  },
  async *streamChat(message: string, history: ChatMsg[]) {
    let res: Response;
    try {
      res = await fetch(`${BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
    } catch {
      yield UNREACHABLE_HINT;
      return;
    }
    if (!res.body) { yield "Нет ответа от сервера."; return; }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const parts = buf.split("\n\n");
      buf = parts.pop() || "";
      for (const p of parts) for (const d of parseSSE(p)) yield d;
    }
  },
};
