import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LifeAidWorkspace from "./LifeAidWorkspace";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {import.meta.env.MODE === "pages" ? <LifeAidWorkspace onLogout={() => window.location.reload()} /> : <App />}
  </React.StrictMode>,
);
