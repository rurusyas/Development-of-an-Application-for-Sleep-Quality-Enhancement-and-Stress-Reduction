import { useMemo, useState } from "react";
import { Page, StatusBar } from "../components/Shell";
import { useStore } from "../store/useStore";
import { tg } from "../lib/telegram";

const faces = ["😔", "😕", "😐", "🙂", "😄"];
const dows = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

function Scale({ label, value, set }: { label: string; value: number; set: (n: number) => void }) {
  return (
    <div className="metric">
      <div className="lab"><span>{label}</span><span>{value}</span></div>
      <div className="seg">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} className={value === n ? "on" : ""} onClick={() => { tg.haptic("light"); set(n); }}>{n}</button>
        ))}
      </div>
    </div>
  );
}

export default function Diary() {
  const diary = useStore((s) => s.diary);
  const addDiary = useStore((s) => s.addDiary);

  const [mood, setMood] = useState(4);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(2);
  const [sleep, setSleep] = useState(4);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await addDiary({ mood, energy, stress, sleep_quality: sleep, note: note.trim() || undefined });
    tg.haptic("medium");
    setNote("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const week = useMemo(() => diary.slice(0, 7).slice().reverse(), [diary]);
  const avg = (key: "mood" | "stress") =>
    week.length ? (week.reduce((a, e) => a + (e as any)[key], 0) / week.length).toFixed(1) : "—";

  return (
    <Page>
      <StatusBar />
      <div className="h"><div className="ttl">Дневник</div>{saved && <span className="pill">сохранено</span>}</div>

      <div className="card" style={{ padding: 16 }}>
        <div className="metric">
          <div className="lab"><span>Настроение</span><span>{mood}</span></div>
          <div className="faces">
            {faces.map((f, i) => (
              <button key={i} className={mood === i + 1 ? "on" : ""} onClick={() => { tg.haptic("light"); setMood(i + 1); }}>{f}</button>
            ))}
          </div>
        </div>
        <Scale label="Энергия" value={energy} set={setEnergy} />
        <Scale label="Стресс" value={stress} set={setStress} />
        <Scale label="Качество сна" value={sleep} set={setSleep} />
        <textarea className="noteinput" rows={2} placeholder="Заметка (необязательно)" value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="btn" style={{ marginTop: 12 }} onClick={save}>Сохранить запись</button>
      </div>

      <div className="eyebrow" style={{ margin: "18px 0 10px" }}>Неделя</div>
      <div className="card" style={{ padding: "14px 14px 16px" }}>
        {week.length === 0 ? (
          <p className="muted" style={{ fontSize: 12.5, textAlign: "center", padding: "16px 4px" }}>Пока нет записей. Сделай первую — и здесь появится график качества сна.</p>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 84, gap: 7 }}>
              {week.map((e, i) => (
                <i key={i} style={{ flex: 1, height: ((e.sleep_quality / 5) * 100) + "%", borderRadius: 5, background: i >= week.length - 2 ? "linear-gradient(180deg,var(--lav),var(--teal0))" : "linear-gradient(180deg,var(--teal1),var(--ocean1))" }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 9, color: "var(--faint)" }}>
              {week.map((_, i) => <span key={i}>{dows[i % 7]}</span>)}
            </div>
          </>
        )}
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <div className="stat"><div className="n mono">{avg("mood")}</div><div className="l">ср. настроение</div></div>
        <div className="stat"><div className="n mono">{avg("stress")}</div><div className="l">ср. стресс</div></div>
        <div className="stat"><div className="n mono">{diary.length}</div><div className="l">записей</div></div>
      </div>
    </Page>
  );
}
