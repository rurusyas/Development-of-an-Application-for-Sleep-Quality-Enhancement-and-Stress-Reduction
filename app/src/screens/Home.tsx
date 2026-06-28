import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Page, StatusBar } from "../components/Shell";
import { Icon, Orca } from "../components/icons";
import { useStore } from "../store/useStore";

function streakDays(timestamps: number[]) {
  if (!timestamps.length) return 0;
  const days = new Set(timestamps.map((t) => new Date(t).toDateString()));
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (days.has(d.toDateString())) streak++;
    else if (i > 0) break;
  }
  return streak;
}

export default function Home() {
  const nav = useNavigate();
  const name = useStore((s) => s.name);
  const indices = useStore((s) => s.indices);
  const diary = useStore((s) => s.diary);
  const focus = useStore((s) => s.focus);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 6) return "Доброй ночи";
    if (h < 12) return "Доброе утро";
    if (h < 18) return "Добрый день";
    return "Добрый вечер";
  }, []);

  const sleep = indices?.sleep_index ?? 0;
  const streak = useMemo(() => streakDays(diary.map((d) => d.created_at)), [diary]);
  const focusMin = useMemo(() => {
    const since = Date.now() - 7 * 24 * 3600 * 1000;
    return focus.filter((f) => f.created_at >= since && f.completed).reduce((a, b) => a + b.duration_min, 0);
  }, [focus]);

  return (
    <Page>
      <StatusBar />
      <div className="h">
        <div>
          <div className="eyebrow">{greeting}</div>
          <div className="ttl">{name || "Гость"}</div>
        </div>
        <Orca size={38} />
      </div>

      <button
        onClick={() => nav("/apnea")}
        className="card"
        style={{
          padding: 16, position: "relative", overflow: "hidden", width: "100%",
          textAlign: "left", cursor: "pointer", color: "inherit", font: "inherit",
        }}
      >
        <div style={{ position: "absolute", right: -20, top: -20, width: 130, height: 130, background: "radial-gradient(circle,rgba(34,211,238,.25),transparent 65%)" }} />
        <span className="pill"><span className="dot" style={{ background: "var(--teal1)" }} />Фича-герой</span>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
          <div style={{ position: "relative", width: 64, height: 64, flex: "none" }}>
            <div className="ring a" style={{ inset: 0 }} />
            <div className="ring b" style={{ inset: 10 }} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>Анализ апноэ во сне</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Запиши дыхание — проверим паузы</div>
          </div>
        </div>
        <div className="btn" style={{ marginTop: 14, pointerEvents: "none" }}>
          <Icon name="mic" size={16} style={{ stroke: "#04122a" }} /> Записать сейчас
        </div>
      </button>

      <div className="row" style={{ marginTop: 14 }}>
        <div className="stat"><div className="n mono">{sleep || "—"}</div><div className="l">Индекс сна</div></div>
        <div className="stat"><div className="n mono">{streak}</div><div className="l">Дней подряд</div></div>
        <div className="stat"><div className="n mono">{Math.round(focusMin / 60 * 10) / 10}ч</div><div className="l">Фокус 7д</div></div>
      </div>

      <div className="eyebrow" style={{ margin: "20px 0 10px" }}>Быстрый доступ</div>
      <div className="col" style={{ gap: 10 }}>
        <Tile to="/diary" icon="diary" title="Дневник эмоций" desc="настроение, стресс, сон" nav={nav} />
        <Tile to="/sounds" icon="moon" title="Звуки для сна" desc="океан, дождь, белый шум" nav={nav} />
        <Tile to="/education" icon="book" title="Наука о сне" desc="10 карточек с источниками" nav={nav} />
        <Tile to="/focus" icon="fire" title="Фокус-сессия" desc="25 или 50 минут" nav={nav} />
        <Tile to="/chat" icon="wave" title="Orca AI" desc="спроси про сон или фокус" nav={nav} />
        <Tile to="/routine" icon="moon" title="Вечерняя рутина" desc="night shift, dnd, будильник" nav={nav} />
      </div>
    </Page>
  );
}

function Tile({ to, icon, title, desc, nav }: { to: string; icon: string; title: string; desc: string; nav: (p: string) => void }) {
  return (
    <button onClick={() => nav(to)} className="li" style={{ textAlign: "left", cursor: "pointer", width: "100%", color: "inherit", font: "inherit" }}>
      <div className="ico"><Icon name={icon} /></div>
      <div style={{ flex: 1 }}><div className="t">{title}</div><div className="d">{desc}</div></div>
      <Icon name="chev" size={14} style={{ stroke: "var(--faint)", transform: "rotate(180deg)" }} />
    </button>
  );
}
