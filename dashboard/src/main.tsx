import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import CrimeScene1 from "./pages/CrimeScene1";
import DistractionQuestions from "./pages/DistractionQuestions";
import ModifiedCrimeScene from "./pages/ModifiedCrimeScene.jsx";

import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/crime-scene-1" element={<CrimeScene1 />} />
        <Route path="/questions" element={<DistractionQuestions />} />
        <Route path="/crime-scene-1-modified" element={<ModifiedCrimeScene />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
