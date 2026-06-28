import { useMemo, useState } from "react";
import { Page, ScreenHeader } from "../components/Shell";
import { Icon, Orca } from "../components/icons";
import { useStore } from "../store/useStore";

export default function Routine() {
  const settings = useStore((s) => s.settings);
  const toggle = useStore((s) => s.toggleSetting);
  const [toast, setToast] = useState("");

  const minsToBedtime = useMemo(() => {
    const now = new Date();
    const target = new Date(); target.setHours(23, 30, 0, 0);
    if (target < now) target.setDate(target.getDate() + 1);
    return Math.round((target.getTime() - now.getTime()) / 60000);
  }, []);

  const launch = () => {
    setToast("Рутина включена");
    setTimeout(() => setToast(""), 2200);
  };

  return (
    <Page>
      <ScreenHeader title="Вечерняя рутина" />

      <div className="card" style={{ padding: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -10, bottom: -10, width: 100, height: 100, opacity: 0.25 }}>
          <Orca size={100} />
        </div>
        <div className="eyebrow">через {minsToBedtime} минут</div>
        <div style={{ fontSize: 17, fontWeight: 700, marginTop: 6 }}>Готовимся ко сну</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 4, maxWidth: "78%" }}>
          Притушим экран, включим звук и зарядим будильник
        </div>
      </div>

      <div className="col" style={{ gap: 10, marginTop: 14 }}>
        <Toggle
          icon="moon" title="Night Shift" sub="23:30 – 7:00"
          on={settings.nightshift} onChange={() => toggle("nightshift")}
        />
        <Toggle
          icon="bell" title="Не беспокоить" sub="внутри приложения"
          on={settings.dnd} onChange={() => toggle("dnd")}
        />
        <Toggle
          icon="sun" title="Системный Focus" sub="iOS Focus mode"
          on={settings.haptics} onChange={() => toggle("haptics")}
        />
      </div>

      <button className="btn" style={{ marginTop: 16 }} onClick={launch}>Запустить рутину</button>

      <div className="muted" style={{ fontSize: 11, lineHeight: 1.5, marginTop: 14, padding: "0 4px" }}>
        Night Shift и системный Focus реально включаются в нативной iOS-сборке через диплинки. В веб-версии это переключатели предпочтений.
      </div>

      {toast && (
        <div className="pill" style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", padding: "10px 16px", zIndex: 100 }}>
          {toast}
        </div>
      )}
    </Page>
  );
}

function Toggle({ icon, title, sub, on, onChange }: { icon: string; title: string; sub: string; on: boolean; onChange: () => void }) {
  return (
    <div className="card" style={{ padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="ico"><Icon name={icon} /></div>
        <div><div className="t" style={{ fontSize: 13, fontWeight: 600 }}>{title}</div><div className="d muted" style={{ fontSize: 11 }}>{sub}</div></div>
      </div>
      <button className={"toggle" + (on ? "" : " off")} onClick={onChange}><i /></button>
    </div>
  );
}
