import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./icons";
import { isNative, isTelegram } from "../lib/platform";

export function StatusBar({ time = "9:41" }: { time?: string }) {
  if (isNative() || isTelegram()) return null;
  return (
    <div className="statusbar">
      <span>{time}</span>
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <svg width="17" height="12" viewBox="0 0 24 12" fill="#E9EDFF"><path d="M2 8h2v3H2zM6 6h2v5H6zM10 4h2v7h-2zM14 2h2v9h-2z" /></svg>
        <svg width="22" height="12" viewBox="0 0 26 12"><rect x="1" y="2" width="21" height="8" rx="2" fill="none" stroke="#E9EDFF" /><rect x="3" y="4" width="14" height="4" rx="1" fill="#E9EDFF" /></svg>
      </span>
    </div>
  );
}

export function ScreenHeader({ title, time }: { title: string; time?: string }) {
  const nav = useNavigate();
  return (
    <>
      <StatusBar time={time} />
      <div className="scr-h">
        <button className="back" onClick={() => nav(-1)}><Icon name="chev" size={16} /></button>
        <h2>{title}</h2>
      </div>
    </>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="fade-in">{children}</div>;
}
