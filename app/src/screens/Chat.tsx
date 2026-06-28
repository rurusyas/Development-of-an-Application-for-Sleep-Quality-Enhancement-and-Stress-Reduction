import { useEffect, useRef, useState } from "react";
import { Page, StatusBar } from "../components/Shell";
import { Orca } from "../components/icons";
import { Icon } from "../components/icons";
import { useStore } from "../store/useStore";
import { api } from "../services/api";
import { tg } from "../lib/telegram";

export default function Chat() {
  const chat = useStore((s) => s.chat);
  const pushChat = useStore((s) => s.pushChat);
  const setLastAssistant = useStore((s) => s.setLastAssistant);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const history = useStore.getState().chat.slice();
    pushChat({ role: "user", content: text });
    pushChat({ role: "assistant", content: "" });
    setInput("");
    setBusy(true);
    tg.haptic("light");
    let acc = "";
    try {
      for await (const d of api.streamChat(text, history)) { acc += d; setLastAssistant(acc); }
      if (!acc) setLastAssistant("Пустой ответ.");
    } catch {
      setLastAssistant("Что-то пошло не так. Попробуй ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 110px)" }}>
        <StatusBar />
        <div className="scr-h" style={{ marginBottom: 12 }}>
          <Orca size={32} />
          <div><h2 style={{ fontSize: 17 }}>Orca AI</h2><div className="faint" style={{ fontSize: 9.5 }}>отвечает по проверенным статьям</div></div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 9, paddingBottom: 8 }}>
          <div className="bubble ai">Привет 👋 Я Orca AI. Спроси про сон, стресс или концентрацию — отвечу по проверенным источникам.</div>
          {chat.map((m, i) =>
            m.role === "assistant" && m.content === "" && busy && i === chat.length - 1 ? (
              <div className="typing" key={i}><i /><i /><i /></div>
            ) : m.role === "assistant" && m.content.includes("Configure LLM_API_KEY") ? (
              <div key={i} className="bubble ai" style={{ border: "1px solid rgba(251,191,36,.4)", background: "rgba(251,191,36,.08)" }}>
                AI-чат пока не подключён к ключу LLM. На демо отвечу по-простому: задай вопрос — я перешлю в бэкенд, как только ключ появится.
              </div>
            ) : (
              <div key={i} className={"bubble " + (m.role === "user" ? "me" : "ai")}>{m.content}</div>
            )
          )}
          <div ref={bottom} />
        </div>

        <div className="field" style={{ marginTop: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder="Спроси Orca…"
          />
          <button className="send" onClick={send}><Icon name="send" size={16} style={{ stroke: "#04122a" }} /></button>
        </div>
      </div>
    </Page>
  );
}
