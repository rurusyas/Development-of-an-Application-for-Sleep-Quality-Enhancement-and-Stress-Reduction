import { useEffect, useRef, useState } from "react";
import { Page, StatusBar } from "../components/Shell";
import { Icon } from "../components/icons";
import { createSoundEngine } from "../lib/sound";
import { tg } from "../lib/telegram";
import soundsJson from "../content/sounds.json";
import type { SoundDef } from "../types";

const defs = soundsJson as SoundDef[];
const bars = Array.from({ length: 12 });

export default function Sounds() {
  const engine = useRef<ReturnType<typeof createSoundEngine> | null>(null);
  const [current, setCurrent] = useState<SoundDef | null>(null);
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(0.6);
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    engine.current = createSoundEngine();
    return () => { engine.current?.stop(0); };
  }, []);

  const select = (d: SoundDef) => {
    tg.haptic("light");
    engine.current?.play(d, vol);
    setCurrent(d);
    setPlaying(true);
    if (timer) engine.current?.timerStop(timer * 60);
  };

  const toggle = () => {
    if (!current) return;
    if (playing) { engine.current?.stop(600); setPlaying(false); }
    else { engine.current?.play(current, vol); setPlaying(true); }
    tg.haptic("light");
  };

  const changeVol = (delta: number) => {
    const v = Math.max(0, Math.min(1, Math.round((vol + delta) * 10) / 10));
    setVol(v);
    engine.current?.setVolume(v);
  };

  const setTimerMin = (m: number) => {
    setTimer(m);
    if (playing) engine.current?.timerStop(m * 60);
    tg.haptic("light");
  };

  return (
    <Page>
      <StatusBar />
      <div className="h"><div className="ttl">Звуки для сна</div></div>

      <div className="card" style={{ padding: 18, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(240px 130px at 50% 0,rgba(6,182,212,.22),transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="muted" style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase" }}>{playing ? "Сейчас играет" : "Выбери звук"}</div>
          <div style={{ fontSize: 19, fontWeight: 700, marginTop: 6 }}>{current ? current.title : "—"}</div>
          <div className={"waveform" + (playing ? " live" : "")} style={{ margin: "16px 8px 14px" }}>
            {bars.map((_, i) => <i key={i} style={{ height: 30 + (i * 37) % 60 + "%" }} />)}
          </div>
          <div className="row" style={{ alignItems: "center", justifyContent: "center", gap: 18 }}>
            <button className="chip" onClick={() => changeVol(-0.1)}>−</button>
            <button onClick={toggle} style={{ width: 52, height: 52, borderRadius: "50%", border: "none", cursor: "pointer", background: "linear-gradient(135deg,var(--ocean1),var(--teal0))", display: "grid", placeItems: "center", color: "#04122a" }}>
              <Icon name={playing ? "pause" : "play"} size={20} style={{ fill: playing ? "none" : "#04122a", stroke: "#04122a", strokeWidth: 2 }} />
            </button>
            <button className="chip" onClick={() => changeVol(0.1)}>+</button>
          </div>
          <div className="muted" style={{ fontSize: 10.5, marginTop: 10 }}>громкость {Math.round(vol * 100)}%</div>
          <div className="row" style={{ justifyContent: "center", gap: 8, marginTop: 12 }}>
            {[15, 30, 60].map((m) => (
              <button key={m} className={"chip" + (timer === m ? " on" : "")} onClick={() => setTimerMin(m)}>{m} мин</button>
            ))}
          </div>
          {timer && <div className="pill" style={{ marginTop: 10 }}>Таймер {timer} мин · fade-out</div>}
        </div>
      </div>

      <div className="eyebrow" style={{ margin: "18px 0 10px" }}>Все звуки</div>
      <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
        {defs.map((d) => (
          <button key={d.id} className={"chip" + (current?.id === d.id ? " on" : "")} onClick={() => select(d)}>{d.title}</button>
        ))}
      </div>
    </Page>
  );
}
