import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { tg } from "./lib/telegram";
import TelegramApp from "./screens/tg/TelegramApp";
import "./index.css";

tg.init();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TelegramApp />
  </StrictMode>
);
