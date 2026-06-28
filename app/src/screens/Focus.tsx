import { useEffect, useRef, useState } from "react";
import { Page, ScreenHeader } from "../components/Shell";
import { Orca } from "../components/icons";
import { fmtMMSS, progressPct } from "../lib/time";
import { useStore } from "../store/useStore";

type State = "idle" | "active" | "paused" | "completed";

const PRESETS = [25, 50];

export default function Focus() {
  const focus = useStore((s) => s.focus);
  const addFocus = useStore((s) => s.addFocus);

  const [state, setState] = useState<State>("idle");
  const [durationMin, setDurationMin] = useState(25);
  const [elapsed, setElapsed] = useState(0);
  const [toast, setToast] = useState("");

  const startRef = useRef<number>(0);
  const accumRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  const total = durationMin * 60;
  const remaining = Math.max(0, total - elapsed);
  const pct = progressPct(elapsed, total);

  useEffect(() => () => { if (tickRef.current) window.clearInterval(tickRef.current); }, []);

  useEffect(() => {
    if (state === "active") {
      tickRef.current = window.setInterval(() => {
        const now = Date.now();
        const e = Math.floor((accumRef.current + now - startRef.current) / 1000);
        setElapsed(e);
        if (e >= total) {
          window.clearInterval(tickRef.current!); tickRef.current = null;
          setState("completed");
          addFocus(durationMin, true);
          setToast("Сессия сохранена");
          setTimeout(() => setToast(""), 2200);
        }
      }, 250) as unknown as number;
    }
    return () => { if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; } };
  }, [state, total, durationMin, addFocus]);

  const start = () => {
    accumRef.current = 0;
    setElapsed(0);
    startRef.current = Date.now();
    setState("active");
  };
  const pause = () => {
    if (state !== "active") return;
    accumRef.current += Date.now() - startRef.current;
    setState("paused");
  };
  const resume = () => {
    if (state !== "paused") return;
    startRef.current = Date.now();
    setState("active");
  };
  const abandon = () => {
    if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
    const finalElapsed = elapsed;
    if (finalElapsed >= 60) addFocus(Math.round(finalElapsed / 60), false);
    setState("idle");
    setElapsed(0);
    accumRef.current = 0;
  };

  const weekMin = (() => {
    const since = Date.now() - 7 * 24 * 3600 * 1000;
    return focus.filter((f) => f.created_at >= since && f.completed).reduce((a, b) => a + b.duration_min, 0);
  })();

  const R = 76;
  const C = 2 * Math.PI * R;
  const dashoffset = C * (1 - pct);

  return (
    <Page>
      <ScreenHeader title="Фокус" />

      <div className="card" style={{ padding: 22, textAlign: "center" }}>
        {state === "idle" ? (
          <>
            <div className="muted" style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase" }}>Длительность</div>
            <div className="seg" style={{ marginTop: 14 }}>
              {PRESETS.map((m) => (
                <button key={m} className={durationMin === m ? "on" : ""} onClick={() => setDurationMin(m)} style={{ fontSize: 14, padding: "12px 0" }}>{m} мин</button>
              ))}
              <button className={!PRESETS.includes(durationMin) ? "on" : ""} onClick={() => setDurationMin(45)} style={{ fontSize: 14, padding: "12px 0" }}>свой</button>
            </div>
            {!PRESETS.includes(durationMin) && (
              <input
                type="range" min={5} max={120} step={5} value={durationMin}
                onChange={(e) => setDurationMin(parseInt(e.target.value))}
                style={{ width: "100%", marginTop: 14, accentColor: "var(--teal1)" }}
              />
            )}
            <div className="mono" style={{ fontSize: 42, fontWeight: 800, margin: "20px 0 6px", letterSpacing: "-0.02em" }}>{durationMin}<span style={{ fontSize: 18, color: "var(--muted)", marginLeft: 4 }}>мин</span></div>
            <button className="btn" onClick={start}>Начать фокус</button>
          </>
        ) : (
          <>
            <div className="gauge">
              <svg width={170} height={170} viewBox="0 0 170 170" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="85" cy="85" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="10" />
                <circle cx="85" cy="85" r={R} fill="none" stroke="url(#fgrad)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={dashoffset} style={{ transition: "stroke-dashoffset .3s linear" }} />
                <defs>
                  <linearGradient id="fgrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#22D3EE" />
                    <stop offset="1" stopColor="#818CF8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="c">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div className="mono" style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em", lineHeight: 1 }}>{fmtMMSS(remaining)}</div>
                  <div className="muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".16em" }}>{state === "paused" ? "пауза" : state === "completed" ? "готово" : "осталось"}</div>
                </div>
              </div>
            </div>
            <div style={{ margin: "8px auto 0", width: 56, height: 56 }}><Orca size={56} /></div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>
              {state === "completed" ? "Косатка всплыла на поверхность" : "Косатка погружается, пока ты в фокусе"}
            </div>

            {state === "active" && (
              <div className="row" style={{ marginTop: 18 }}>
                <button className="btn ghost" onClick={pause} style={{ flex: 1 }}>Пауза</button>
                <button className="btn ghost" onClick={abandon} style={{ flex: 1 }}>Завершить</button>
              </div>
            )}
            {state === "paused" && (
              <div className="row" style={{ marginTop: 18 }}>
                <button className="btn" onClick={resume} style={{ flex: 1 }}>Продолжить</button>
                <button className="btn ghost" onClick={abandon} style={{ flex: 1 }}>Завершить</button>
              </div>
            )}
            {state === "completed" && (
              <button className="btn" style={{ marginTop: 18 }} onClick={() => { setState("idle"); setElapsed(0); }}>Ещё одна сессия</button>
            )}
          </>
        )}
      </div>

      {state === "idle" && (
        <div className="row" style={{ marginTop: 14 }}>
          <div className="stat"><div className="n mono">{focus.filter((f) => f.completed).length}</div><div className="l">завершено всего</div></div>
          <div className="stat"><div className="n mono">{weekMin}</div><div className="l">мин за неделю</div></div>
        </div>
      )}

      {toast && (
        <div className="pill" style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", padding: "10px 16px", zIndex: 100 }}>
          {toast}
        </div>
      )}
    </Page>
  );
}
