import { Page, ScreenHeader } from "../components/Shell";
import { Icon } from "../components/icons";

export default function Alarm() {
  return (
    <Page>
      <ScreenHeader title="Умный будильник" />

      <div className="card" style={{ padding: 22, textAlign: "center" }}>
        <div className="muted" style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase" }}>Окно пробуждения</div>
        <div className="mono" style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.02em", margin: "12px 0" }}>
          6:45<span style={{ color: "var(--faint)", fontSize: 26 }}> – </span>7:10
        </div>
        <p className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
          Разбудим в лёгкой фазе сна внутри окна мягким нарастающим звуком
        </p>
      </div>

      <div className="card" style={{ padding: 14, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.6 }}>
        <div><div className="t" style={{ fontSize: 13, fontWeight: 600 }}>Окно</div><div className="d muted" style={{ fontSize: 11 }}>ширина пробуждения</div></div>
        <div className="seg" style={{ width: 160 }}>
          <button>15м</button><button className="on">25м</button><button>40м</button>
        </div>
      </div>

      <div className="card" style={{ padding: 14, marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="ico"><Icon name="wave" /></div>
          <div><div className="t" style={{ fontSize: 13, fontWeight: 600 }}>Нарастающий звук</div><div className="d muted" style={{ fontSize: 11 }}>плавный fade-in 90 сек</div></div>
        </div>
        <div className="toggle"><i /></div>
      </div>

      <div className="card" style={{ padding: 16, marginTop: 16, background: "rgba(34,211,238,.08)", border: "1px solid rgba(34,211,238,.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Icon name="bell" size={18} style={{ stroke: "var(--teal1)" }} />
          <div className="eyebrow" style={{ color: "var(--teal1)" }}>Доступно в iOS-приложении</div>
        </div>
        <p style={{ fontSize: 12.5, lineHeight: 1.5, margin: 0, color: "var(--ice)" }}>
          Умный будильник анализирует движение и звук через сенсоры устройства, поэтому полная функциональность работает в нативной сборке.
          В веб-версии — макет интерфейса для демонстрации.
        </p>
      </div>
    </Page>
  );
}
