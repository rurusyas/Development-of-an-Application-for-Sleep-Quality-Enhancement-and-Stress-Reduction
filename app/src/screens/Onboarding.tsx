import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Orca } from "../components/icons";
import { Page } from "../components/Shell";
import { useStore } from "../store/useStore";
import type { Onboarding as OnboardingT } from "../types";

type Step =
  | { key: keyof OnboardingT; kind: "number"; q: string; sub: string; min: number; max: number; step?: number; suffix?: string; def: number }
  | { key: keyof OnboardingT; kind: "scale"; q: string; sub: string; labels: [string, string]; def: number };

const steps: Step[] = [
  { key: "sleep_hours", kind: "number", q: "Сколько часов ты обычно спишь?", sub: "В будни, средний показатель", min: 0, max: 12, step: 0.5, suffix: "ч", def: 7 },
  { key: "sleep_latency_min", kind: "number", q: "За сколько минут засыпаешь?", sub: "От момента, как лёг, до момента сна", min: 0, max: 180, step: 5, suffix: "мин", def: 20 },
  { key: "wake_feeling", kind: "scale", q: "Как обычно чувствуешь себя утром?", sub: "После пробуждения", labels: ["разбит(а)", "отлично"], def: 3 },
  { key: "bedtime_regularity", kind: "scale", q: "Насколько стабильно ложишься спать?", sub: "В одно и то же время", labels: ["хаотично", "стабильно"], def: 3 },
  { key: "stress_freq", kind: "scale", q: "Как часто чувствуешь стресс?", sub: "За последние недели", labels: ["редко", "постоянно"], def: 3 },
  { key: "thoughts_racing", kind: "scale", q: "Мысли мешают расслабиться?", sub: "Перед сном или в течение дня", labels: ["редко", "часто"], def: 3 },
  { key: "overload", kind: "scale", q: "Чувствуешь перегруз?", sub: "Много дел, дедлайнов, усталость", labels: ["редко", "часто"], def: 3 },
  { key: "focus_difficulty", kind: "scale", q: "Тяжело сосредоточиться?", sub: "На работе или учёбе", labels: ["легко", "очень сложно"], def: 3 },
  { key: "distraction", kind: "scale", q: "Часто отвлекаешься?", sub: "На телефон, соцсети, мысли", labels: ["редко", "постоянно"], def: 3 },
];

const TOTAL = steps.length + 1;

export default function Onboarding() {
  const nav = useNavigate();
  const setOnboarding = useStore((s) => s.setOnboarding);
  const existingName = useStore((s) => s.name);

  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingT>>({});
  const [name, setName] = useState(existingName || "");
  const [saving, setSaving] = useState(false);

  const isFinal = i === steps.length;
  const step = !isFinal ? steps[i] : null;
  const progress = ((i + 1) / TOTAL) * 100;

  const cur = step ? (answers[step.key] as number | undefined) ?? step.def : 0;

  const set = (v: number) => setAnswers((p) => ({ ...p, [step!.key]: v }));

  const next = async () => {
    if (!isFinal) {
      if (answers[step!.key] === undefined) setAnswers((p) => ({ ...p, [step!.key]: cur }));
      setI(i + 1);
      return;
    }
    if (!name.trim()) return;
    setSaving(true);
    const full: OnboardingT = {
      sleep_hours: 7, sleep_latency_min: 20, wake_feeling: 3, bedtime_regularity: 3,
      stress_freq: 3, thoughts_racing: 3, overload: 3, focus_difficulty: 3, distraction: 3,
      ...answers,
    };
    await setOnboarding(name.trim(), full);
    nav("/", { replace: true });
  };

  const back = () => { if (i > 0) setI(i - 1); };

  return (
    <Page>
      <div style={{ padding: "20px 4px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <Orca size={32} />
        <div>
          <div className="eyebrow">Orca · Настройка</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Шаг {i + 1} из {TOTAL}</div>
        </div>
      </div>

      <div className="bar" style={{ margin: "16px 0 24px" }}><i style={{ width: progress + "%" }} /></div>

      <div className="card" style={{ padding: 22, minHeight: 280, display: "flex", flexDirection: "column" }}>
        {!isFinal ? (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 6 }}>{step!.q}</div>
            <div className="muted" style={{ fontSize: 12.5, marginBottom: 20 }}>{step!.sub}</div>

            {step!.kind === "scale" ? (
              <>
                <div className="seg" style={{ margin: "auto 0" }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} className={cur === n ? "on" : ""} onClick={() => set(n)} style={{ fontSize: 16, padding: "14px 0" }}>{n}</button>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "var(--faint)" }}>
                  <span>{(step as any).labels[0]}</span><span>{(step as any).labels[1]}</span>
                </div>
              </>
            ) : (
              <div style={{ margin: "auto 0", textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {cur}<span style={{ fontSize: 18, color: "var(--muted)", marginLeft: 4 }}>{(step as any).suffix}</span>
                </div>
                <input
                  type="range"
                  min={(step as any).min}
                  max={(step as any).max}
                  step={(step as any).step ?? 1}
                  value={cur}
                  onChange={(e) => set(parseFloat(e.target.value))}
                  style={{ width: "100%", marginTop: 16, accentColor: "var(--teal1)" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "var(--faint)" }}>
                  <span>{(step as any).min}{(step as any).suffix}</span><span>{(step as any).max}{(step as any).suffix}</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 6 }}>Как тебя зовут?</div>
            <div className="muted" style={{ fontSize: 12.5, marginBottom: 24 }}>Чтобы Orca могла обращаться по имени</div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя"
              style={{
                background: "rgba(255,255,255,.06)", border: "1px solid var(--brd)", borderRadius: 14,
                color: "var(--text)", font: "500 16px var(--font)", padding: "14px 16px", outline: "none",
                margin: "auto 0",
              }}
            />
          </>
        )}
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        {i > 0 && <button className="btn ghost" onClick={back} style={{ flex: 1 }}>Назад</button>}
        <button
          className="btn"
          onClick={next}
          disabled={isFinal && (!name.trim() || saving)}
          style={{ flex: i > 0 ? 1 : undefined, opacity: isFinal && !name.trim() ? 0.5 : 1 }}
        >
          {isFinal ? (saving ? "Сохраняю..." : "Готово") : "Далее"}
        </button>
      </div>
    </Page>
  );
}
