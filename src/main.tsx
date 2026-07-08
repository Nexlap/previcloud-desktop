import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./app/router";
import { applyThemeMode, getThemeMode } from "./lib/theme";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "./index.css";

applyThemeMode(getThemeMode());

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);
