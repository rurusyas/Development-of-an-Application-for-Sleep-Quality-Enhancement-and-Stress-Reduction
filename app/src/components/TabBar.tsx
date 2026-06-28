import { useLocation, useNavigate } from "react-router-dom";
import { Icon, Orca } from "./icons";

const tabs = [
  { to: "/", label: "Главная", icon: "home" },
  { to: "/sounds", label: "Сон", icon: "moon" },
  { to: "/diary", label: "Дневник", icon: "diary" },
  { to: "/chat", label: "Orca AI", icon: "orca" },
  { to: "/profile", label: "Профиль", icon: "user" },
];

export default function TabBar() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  return (
    <nav className="tabbar">
      {tabs.map((t) => {
        const on = pathname === t.to;
        return (
          <button key={t.to} className={"tab" + (on ? " on" : "")} onClick={() => nav(t.to)}>
            {t.icon === "orca" ? <Orca size={22} /> : <Icon name={t.icon} size={22} />}
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
