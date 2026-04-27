import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./styles/auth.css";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
