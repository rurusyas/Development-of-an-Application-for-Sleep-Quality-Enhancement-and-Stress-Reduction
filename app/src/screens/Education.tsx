import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, StatusBar } from "../components/Shell";
import { Icon } from "../components/icons";
import articlesJson from "../content/articles.json";
import type { Article } from "../types";

const articles = articlesJson as Article[];

function linkify(src: string) {
  const m = src.match(/https?:\/\/\S+/);
  if (!m) return <span>{src}</span>;
  const url = m[0];
  const text = src.slice(0, m.index).trim();
  return (<><span>{text} </span><a href={url} target="_blank" rel="noreferrer">{url}</a></>);
}

export default function Education() {
  const nav = useNavigate();
  const [open, setOpen] = useState<Article | null>(null);

  if (open) {
    return (
      <Page>
        <StatusBar />
        <div className="scr-h">
          <button className="back" onClick={() => setOpen(null)}><Icon name="chev" size={16} /></button>
          <h2 style={{ fontSize: 18 }}>{open.title}</h2>
        </div>
        <div className="eyebrow" style={{ marginBottom: 10 }}>{open.summary}</div>
        <div className="artbody">
          {open.body.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <div className="eyebrow" style={{ margin: "8px 0 10px" }}>Источники</div>
        {open.sources.map((s, i) => <div className="src" key={i}>{linkify(s)}</div>)}
      </Page>
    );
  }

  const [first, ...rest] = articles;
  return (
    <Page>
      <StatusBar />
      <div className="scr-h">
        <button className="back" onClick={() => nav(-1)}><Icon name="chev" size={16} /></button>
        <h2>Наука о сне</h2>
        <span className="pill" style={{ marginLeft: "auto" }}>{articles.length} карточек</span>
      </div>

      <button className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 12, width: "100%", textAlign: "left", border: "1px solid var(--brd)", cursor: "pointer" }} onClick={() => setOpen(first)}>
        <div style={{ height: 84, background: "linear-gradient(135deg,var(--ocean0),var(--teal0))", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(140px 70px at 80% 120%,rgba(255,255,255,.25),transparent)" }} />
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{first.title}</div>
          <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>{first.summary}</div>
        </div>
      </button>

      <div className="col" style={{ gap: 9 }}>
        {rest.map((a) => (
          <button key={a.id} className="li" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => setOpen(a)}>
            <div className="ico"><Icon name="book" /></div>
            <div style={{ flex: 1 }}><div className="t">{a.title}</div><div className="d">{a.summary}</div></div>
            <Icon name="chev" size={14} style={{ stroke: "var(--faint)", transform: "rotate(180deg)" }} />
          </button>
        ))}
      </div>
    </Page>
  );
}
