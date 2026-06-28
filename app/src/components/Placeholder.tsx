import { useNavigate } from "react-router-dom";
import { Icon } from "./icons";
import { Page, StatusBar } from "./Shell";

export default function Placeholder({ title, desc, icon = "moon", back = false }: { title: string; desc: string; icon?: string; back?: boolean }) {
  const nav = useNavigate();
  return (
    <Page>
      <StatusBar />
      {back ? (
        <div className="scr-h"><button className="back" onClick={() => nav(-1)}><Icon name="chev" size={16} /></button><h2>{title}</h2></div>
      ) : (
        <div className="h"><div className="ttl">{title}</div><span className="pill">скоро</span></div>
      )}
      <div className="card" style={{ padding: 22, textAlign: "center" }}>
        <div className="ico" style={{ width: 52, height: 52, margin: "4px auto 14px" }}><Icon name={icon} size={26} /></div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{title}</div>
        <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>{desc}</p>
      </div>
    </Page>
  );
}
