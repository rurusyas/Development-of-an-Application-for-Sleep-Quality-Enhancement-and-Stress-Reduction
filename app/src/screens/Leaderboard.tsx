import { useEffect, useState } from "react";
import { Page, StatusBar } from "../components/Shell";
import { Icon } from "../components/icons";
import { useStore } from "../store/useStore";
import { api } from "../services/api";

type Row = { user_id: number | string; name: string | null; score: number; me?: boolean };

const mock: Row[] = [
  { user_id: 1, name: "Аня К.", score: 4.9 },
  { user_id: 2, name: "Миша Р.", score: 4.8 },
  { user_id: 3, name: "Лера П.", score: 4.7 },
  { user_id: 4, name: "Дима С.", score: 4.6 },
  { user_id: 5, name: "Соня В.", score: 4.5 },
  { user_id: 6, name: "Артём Ж.", score: 4.5 },
  { user_id: 7, name: "Фёдор", score: 4.4, me: true },
  { user_id: 8, name: "Вера С.", score: 4.3 },
  { user_id: 9, name: "Игорь Л.", score: 4.2 },
  { user_id: 10, name: "Катя Д.", score: 4.1 },
  { user_id: 11, name: "Паша М.", score: 4.0 },
  { user_id: 12, name: "Юля Т.", score: 3.9 },
  { user_id: 13, name: "Никита Б.", score: 3.8 },
  { user_id: 14, name: "Маша Г.", score: 3.7 },
  { user_id: 15, name: "Олег Н.", score: 3.6 },
  { user_id: 16, name: "Даша Ф.", score: 3.5 },
  { user_id: 17, name: "Костя Ш.", score: 3.4 },
  { user_id: 18, name: "Лиза Р.", score: 3.3 },
  { user_id: 19, name: "Рома К.", score: 3.2 },
  { user_id: 20, name: "Настя Е.", score: 3.1 },
];

export default function Leaderboard() {
  const backendUid = useStore((s) => s.backendUid);
  const [rows, setRows] = useState<Row[]>(mock);

  useEffect(() => {
    api.getLeaderboard().then((data) => {
      if (Array.isArray(data) && data.length) {
        setRows(data.map((r: any) => ({ ...r, me: backendUid != null && r.user_id === backendUid })));
      }
    });
  }, [backendUid]);

  const initials = (n: string | null) => (n || "??").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const posColor = (i: number) => (i === 0 ? "#FBBF24" : i === 1 ? "#cbd5e1" : "var(--muted)");

  return (
    <Page>
      <StatusBar />
      <div className="scr-h">
        <Icon name="trophy" size={26} style={{ stroke: "var(--teal1)" }} />
        <h2>Лидерборд</h2>
      </div>
      <p className="muted" style={{ fontSize: 11, marginBottom: 14 }}>Очки = среднее качество сна за 7 дней · только в Telegram</p>
      <div className="col" style={{ gap: 9 }}>
        {rows.slice(0, 20).map((r, i) => (
          <div key={r.user_id} className={"rank" + (r.me ? " me" : "")}>
            <div className="pos" style={{ color: posColor(i) }}>{i + 1}</div>
            <div className="av">{initials(r.name)}</div>
            <div style={{ flex: 1 }}><div className="t" style={{ fontSize: 13, fontWeight: 600 }}>{r.name || "Без имени"}{r.me ? " · ты" : ""}</div></div>
            <div className="mono" style={{ fontWeight: 700, color: r.me ? "var(--teal1)" : "var(--text)" }}>{r.score}</div>
          </div>
        ))}
      </div>
    </Page>
  );
}
