import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Icon, Orca } from "../../components/icons";
import { tg } from "../../lib/telegram";
import { useStore } from "../../store/useStore";
import { Page, StatusBar } from "../../components/Shell";

export default function TgHome() {
  const nav = useNavigate();
  const indices = useStore((s) => s.indices);
  const storeName = useStore((s) => s.name);
  const diary = useStore((s) => s.diary);

  const name = storeName || tg.name();
  const noOnboarding = indices === null;

  const sleep = indices?.sleep_index ?? 0;
  const stress = indices?.stress_index ?? 0;
  const focus = indices?.focus_index ?? 0;

  const streak = useMemo(() => {
    if (!diary.length) return 0;
    const days = new Set(diary.map((d) => new Date(d.created_at).toDateString()));
    let s = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (days.has(d.toDateString())) s++;
      else if (i > 0) break;
    }
    return s;
  }, [diary]);

  return (
    <Page>
      <StatusBar />
      <div className="h">
        <div>
          <div className="eyebrow">Telegram Mini App</div>
          <div className="ttl">Привет, {name}</div>
        </div>
        <Orca size={36} />
      </div>

      {noOnboarding ? (
        <button
          className="card"
          onClick={() => { tg.haptic("light"); nav("/onboarding"); }}
          style={{ padding: 18, position: "relative", overflow: "hidden", width: "100%", textAlign: "left", cursor: "pointer", color: "inherit", font: "inherit" }}
        >
          <div style={{ position: "absolute", right: -20, top: -20, width: 130, height: 130, background: "radial-gradient(circle,rgba(34,211,238,.25),transparent 65%)" }} />
          <span className="pill"><span className="dot" style={{ background: "var(--teal1)" }} />новое</span>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 10 }}>Короткий опрос — 4 вопроса</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4, marginBottom: 14 }}>Рассчитаем твои индексы сна, стресса и фокуса</div>
          <div className="btn" style={{ pointerEvents: "none" }}>Начать</div>
        </button>
      ) : (
        <button
          className="card"
          onClick={() => { tg.haptic("light"); nav("/diary"); }}
          style={{ padding: 16, position: "relative", overflow: "hidden", width: "100%", textAlign: "left", cursor: "pointer", color: "inherit", font: "inherit" }}
        >
          <div style={{ position: "absolute", right: -20, top: -20, width: 130, height: 130, background: "radial-gradient(circle,rgba(34,211,238,.22),transparent 65%)" }} />
          <div className="eyebrow">Сегодня</div>
          <div style={{ fontSize: 16, fontWeight: 700, margin: "6px 0 12px" }}>Как ты спал и чувствуешь себя?</div>
          <div className="btn" style={{ pointerEvents: "none" }}>
            <Icon name="diary" size={16} style={{ stroke: "#04122a" }} /> Отметить в дневнике
          </div>
        </button>
      )}

      {!noOnboarding && (
        <>
          <div className="eyebrow" style={{ margin: "18px 0 10px" }}>Индексы</div>
          <div className="row">
            <div className="stat"><div className="n mono">{sleep}</div><div className="l">Сон</div><div className="bar" style={{ marginTop: 8 }}><i style={{ width: sleep + "%" }} /></div></div>
            <div className="stat"><div className="n mono">{stress}</div><div className="l">Стресс</div><div className="bar" style={{ marginTop: 8 }}><i style={{ width: stress + "%", background: "linear-gradient(90deg,var(--warn),var(--bad))" }} /></div></div>
            <div className="stat"><div className="n mono">{focus}</div><div className="l">Фокус</div><div className="bar" style={{ marginTop: 8 }}><i style={{ width: focus + "%" }} /></div></div>
          </div>
        </>
      )}

      <div className="eyebrow" style={{ margin: "18px 0 10px" }}>Быстрый доступ</div>
      <div className="col" style={{ gap: 10 }}>
        <button className="li" style={{ textAlign: "left", cursor: "pointer", color: "inherit", font: "inherit" }} onClick={() => { tg.haptic("light"); nav("/sounds"); }}>
          <div className="ico"><Icon name="moon" /></div>
          <div style={{ flex: 1 }}><div className="t">Звуки для сна</div><div className="d">океан, дождь, белый шум · таймер</div></div>
          <Icon name="chev" size={14} style={{ stroke: "var(--faint)", transform: "rotate(180deg)" }} />
        </button>
        <button className="li" style={{ textAlign: "left", cursor: "pointer", color: "inherit", font: "inherit" }} onClick={() => { tg.haptic("light"); nav("/education"); }}>
          <div className="ico"><Icon name="book" /></div>
          <div style={{ flex: 1 }}><div className="t">Наука о сне</div><div className="d">10 карточек с источниками</div></div>
          <Icon name="chev" size={14} style={{ stroke: "var(--faint)", transform: "rotate(180deg)" }} />
        </button>
        <button className="li" style={{ textAlign: "left", cursor: "pointer", color: "inherit", font: "inherit" }} onClick={() => { tg.haptic("light"); nav("/chat"); }}>
          <div className="ico"><Orca size={19} /></div>
          <div style={{ flex: 1 }}><div className="t">Orca AI</div><div className="d">спроси про сон, стресс, фокус</div></div>
          <Icon name="chev" size={14} style={{ stroke: "var(--faint)", transform: "rotate(180deg)" }} />
        </button>
        {streak > 0 && (
          <div className="li" style={{ background: "rgba(34,211,238,.08)", borderColor: "rgba(34,211,238,.3)" }}>
            <div className="ico"><Icon name="fire" /></div>
            <div style={{ flex: 1 }}><div className="t">{streak} {streak === 1 ? "день" : streak < 5 ? "дня" : "дней"} подряд в дневнике</div><div className="d">так держать</div></div>
          </div>
        )}
      </div>
    </Page>
  );
}
