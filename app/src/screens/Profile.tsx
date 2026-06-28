import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Page, StatusBar } from "../components/Shell";
import { Icon } from "../components/icons";
import { useStore } from "../store/useStore";

const TG_BOT = "orca_sleep_bot";

function initials(name: string) {
  return (name || "??").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function Profile() {
  const nav = useNavigate();
  const name = useStore((s) => s.name);
  const indices = useStore((s) => s.indices);
  const diary = useStore((s) => s.diary);

  const firstDate = useMemo(() => {
    if (!diary.length) return new Date();
    return new Date(Math.min(...diary.map((d) => d.created_at)));
  }, [diary]);

  const since = firstDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

  const sleep = indices?.sleep_index ?? 0;
  const stress = indices?.stress_index ?? 0;
  const focus = indices?.focus_index ?? 0;

  return (
    <Page>
      <StatusBar />
      <div className="h"><div className="ttl">Профиль</div></div>

      <div className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
        <div className="av" style={{ width: 52, height: 52, fontSize: 18 }}>{initials(name)}</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{name || "Гость"}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>в Orca с {since} · {diary.length} записей</div>
        </div>
      </div>

      <div className="eyebrow" style={{ margin: "18px 0 10px" }}>Индексы</div>
      <div className="col" style={{ gap: 11 }}>
        <Metric label="Сон" value={sleep} color="teal" />
        <Metric label="Стресс" value={stress} color="warn" inverse />
        <Metric label="Фокус" value={focus} color="lav" />
      </div>

      <div className="col" style={{ gap: 10, marginTop: 18 }}>
        <button onClick={() => nav("/onboarding")} className="li" style={{ textAlign: "left", cursor: "pointer", color: "inherit", font: "inherit" }}>
          <div className="ico"><Icon name="sun" /></div>
          <div style={{ flex: 1 }}><div className="t">Пройти онбординг заново</div><div className="d">пересчитать индексы</div></div>
          <Icon name="chev" size={14} style={{ stroke: "var(--faint)", transform: "rotate(180deg)" }} />
        </button>
        <a href={`https://t.me/${TG_BOT}`} target="_blank" rel="noreferrer" className="li" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="ico"><Icon name="send" /></div>
          <div style={{ flex: 1 }}><div className="t">Открыть Orca в Telegram</div><div className="d">бот и Mini App</div></div>
          <Icon name="chev" size={14} style={{ stroke: "var(--faint)", transform: "rotate(180deg)" }} />
        </a>
      </div>
    </Page>
  );
}

function Metric({ label, value, color, inverse = false }: { label: string; value: number; color: "teal" | "warn" | "lav"; inverse?: boolean }) {
  const v = Math.max(0, Math.min(100, value));
  const fill = inverse
    ? "linear-gradient(90deg,var(--warn),var(--bad))"
    : color === "lav"
      ? "linear-gradient(90deg,var(--lav),var(--teal0))"
      : "linear-gradient(90deg,var(--teal0),var(--lav))";
  const accent = color === "warn" ? "var(--warn)" : color === "lav" ? "var(--lav)" : "var(--teal1)";
  return (
    <div className="card" style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
        <span className="mono" style={{ fontWeight: 700, color: accent }}>{v}</span>
      </div>
      <div className="bar"><i style={{ width: v + "%", background: fill }} /></div>
    </div>
  );
}
