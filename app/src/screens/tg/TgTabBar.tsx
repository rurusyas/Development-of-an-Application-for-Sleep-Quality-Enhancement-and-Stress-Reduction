import { useLocation, useNavigate } from "react-router-dom";
import { Icon, Orca } from "../../components/icons";
import { tg } from "../../lib/telegram";

const tabs = [
  { to: "/", label: "Главная", icon: "home" },
  { to: "/diary", label: "Дневник", icon: "diary" },
  { to: "/sounds", label: "Звуки", icon: "moon" },
  { to: "/chat", label: "Orca AI", icon: "orca" },
  { to: "/leaderboard", label: "Топ", icon: "trophy" },
];

export default function TgTabBar() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  return (
    <nav className="tabbar">
      {tabs.map((t) => {
        const on = pathname === t.to;
        return (
          <button key={t.to} className={"tab" + (on ? " on" : "")} onClick={() => { tg.haptic("light"); nav(t.to); }}>
            {t.icon === "orca" ? <Orca size={22} /> : <Icon name={t.icon} size={22} />}
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
