import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Orca } from "../../components/icons";
import { Page } from "../../components/Shell";
import { tg } from "../../lib/telegram";
import { useStore } from "../../store/useStore";
import type { Onboarding } from "../../types";

type Step = {
  key: "sleep_hours" | "wake_feeling" | "stress_freq" | "focus_difficulty";
  q: string;
  sub: string;
  kind: "slider" | "scale";
  min?: number; max?: number; step?: number; suffix?: string; def: number;
  labels?: [string, string];
};

const steps: Step[] = [
  { key: "sleep_hours", q: "Сколько часов ты обычно спишь?", sub: "В будни, среднее", kind: "slider", min: 0, max: 12, step: 0.5, suffix: "ч", def: 7 },
  { key: "wake_feeling", q: "Как чувствуешь себя утром?", sub: "После пробуждения", kind: "scale", labels: ["разбит(а)", "отлично"], def: 3 },
  { key: "stress_freq", q: "Часто чувствуешь стресс?", sub: "За последние недели", kind: "scale", labels: ["редко", "постоянно"], def: 3 },
  { key: "focus_difficulty", q: "Тяжело сосредоточиться?", sub: "На работе или учёбе", kind: "scale", labels: ["легко", "сложно"], def: 3 },
];

const TOTAL = steps.length;

export default function TgOnboarding() {
  const nav = useNavigate();
  const setOnboarding = useStore((s) => s.setOnboarding);

  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Partial<Onboarding>>({});
  const [saving, setSaving] = useState(false);

  const step = steps[i];
  const cur = (answers[step.key] as number | undefined) ?? step.def;
  const progress = ((i + 1) / TOTAL) * 100;

  const set = (v: number) => { setAnswers((p) => ({ ...p, [step.key]: v })); tg.haptic("light"); };

  const next = async () => {
    const updated = { ...answers, [step.key]: cur };
    setAnswers(updated);
    if (i < TOTAL - 1) {
      setI(i + 1);
      return;
    }
    setSaving(true);
    const name = tg.name();
    const s = (updated.stress_freq as number) ?? 3;
    const f = (updated.focus_difficulty as number) ?? 3;
    const full: Onboarding = {
      sleep_hours: (updated.sleep_hours as number) ?? 7,
      sleep_latency_min: 20,
      wake_feeling: (updated.wake_feeling as number) ?? 3,
      bedtime_regularity: 3,
      stress_freq: s,
      thoughts_racing: s,
      overload: s,
      focus_difficulty: f,
      distraction: f,
    };
    await setOnboarding(name, full);
    tg.haptic("medium");
    nav("/", { replace: true });
  };

  const back = () => { if (i > 0) setI(i - 1); };

  return (
    <Page>
      <div style={{ padding: "20px 4px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <Orca size={32} />
        <div>
          <div className="eyebrow">Привет, {tg.name()}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Шаг {i + 1} из {TOTAL}</div>
        </div>
      </div>

      <div className="bar" style={{ margin: "16px 0 24px" }}><i style={{ width: progress + "%" }} /></div>

      <div className="card" style={{ padding: 22, minHeight: 260, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 6 }}>{step.q}</div>
        <div className="muted" style={{ fontSize: 12.5, marginBottom: 20 }}>{step.sub}</div>

        {step.kind === "scale" ? (
          <>
            <div className="seg" style={{ margin: "auto 0" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={cur === n ? "on" : ""} onClick={() => set(n)} style={{ fontSize: 16, padding: "14px 0" }}>{n}</button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "var(--faint)" }}>
              <span>{step.labels![0]}</span><span>{step.labels![1]}</span>
            </div>
          </>
        ) : (
          <div style={{ margin: "auto 0", textAlign: "center" }}>
            <div className="mono" style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.02em" }}>
              {cur}<span style={{ fontSize: 18, color: "var(--muted)", marginLeft: 4 }}>{step.suffix}</span>
            </div>
            <input
              type="range" min={step.min} max={step.max} step={step.step ?? 1} value={cur}
              onChange={(e) => set(parseFloat(e.target.value))}
              style={{ width: "100%", marginTop: 16, accentColor: "var(--teal1)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "var(--faint)" }}>
              <span>{step.min}{step.suffix}</span><span>{step.max}{step.suffix}</span>
            </div>
          </div>
        )}
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        {i > 0 && <button className="btn ghost" onClick={back} style={{ flex: 1 }}>Назад</button>}
        <button className="btn" onClick={next} disabled={saving} style={{ flex: i > 0 ? 1 : undefined }}>
          {i === TOTAL - 1 ? (saving ? "Сохраняю..." : "Готово") : "Далее"}
        </button>
      </div>
    </Page>
  );
}
