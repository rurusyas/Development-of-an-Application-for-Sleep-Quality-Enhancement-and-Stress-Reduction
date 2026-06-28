import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const mode = (import.meta as any).env?.MODE;
const demo = mode === "demo";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App demo={demo} />
  </StrictMode>
);
