import type { CSSProperties } from "react";

const P: Record<string, string> = {
  home: "M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z",
  moon: "M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z",
  diary: "M6 4h12a1 1 0 011 1v15l-7-3-7 3V5a1 1 0 011-1z",
  user: "M12 8a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0",
  chev: "M15 5l-7 7 7 7",
  bell: "M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 004 0",
  wave: "M3 12h2l2-6 3 14 3-18 3 14 2-4h3",
  send: "M4 12l16-7-7 16-2-7-7-2z",
  fire: "M12 3c1 4-3 5-3 9a3 3 0 006 0c0-1 0-2-1-3 3 1 4 4 4 6a6 6 0 01-12 0c0-5 5-7 6-12z",
  mic: "M9 6a3 3 0 016 0v5a3 3 0 01-6 0zM5 11a7 7 0 0014 0M12 18v3",
  sun: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1 1M18 18l1 1M19 5l-1 1M6 18l-1 1",
  book: "M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2z",
  trophy: "M7 4h10v4a5 5 0 01-10 0zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M9 19h6M10 15h4l1 4H9z",
  play: "M7 5l12 7-12 7z",
  pause: "M8 5v14M16 5v14",
};

export function Icon({ name, size = 20, style, className }: { name: keyof typeof P | string; size?: number; style?: CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <path d={P[name] || ""} />
    </svg>
  );
}

export function Orca({ size = 40, style }: { size?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={style}>
      <path d="M60 14c-9 0-16 5-20 13-3-7-9-12-9-12s1 9 4 15c-9 6-15 17-15 30 0 22 18 38 40 38 6 0 11-1 16-3l16 9-4-17c7-7 11-16 11-27 0-26-18-46-39-46z" fill="#0a1130" stroke="rgba(233,237,255,.85)" strokeWidth="1.2" />
      <path d="M60 26c-6 0-11 4-13 10 8-2 17-2 25 1-2-7-6-11-12-11z" fill="rgba(233,237,255,.92)" />
      <circle cx="46" cy="52" r="3.4" fill="#E9EDFF" />
    </svg>
  );
}
