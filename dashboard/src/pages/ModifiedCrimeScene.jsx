import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UnitySceneModified from "../components/UnitySceneModified.jsx";

/**
 * Page shown after distraction questions.
 * Displays the modified crime scene (Cmod2 WebGL build) for 25 seconds,
 * then automatically returns to the main dashboard so the participant can
 * answer recall questions.
 */
export default function ModifiedCrimeScene() {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(25);

  useEffect(() => {
    setSecondsLeft(25);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // After 25 seconds, continue the experiment by returning
          // to the dashboard where recall questions live.
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <button type="button" onClick={() => navigate("/")} style={buttonStyle}>
          ← Back to Dashboard
        </button>
        <h1 style={{ fontSize: "1.1rem", margin: 0 }}>Modified Crime Scene</h1>
      </header>

      <UnitySceneModified style={{ flex: 1, minHeight: "60vh" }} />

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <p style={{ color: "#e5e7eb" }}>
          Modified scene viewing time remaining: <strong>{secondsLeft}s</strong>
        </p>
        <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginTop: "0.25rem" }}>
          Please freely look around this altered version of the crime scene.
          You will automatically continue to the recall phase when the timer ends.
        </p>
      </div>
    </div>
  );
}

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  background: "#0f172a",
  color: "#e2e8f0",
  padding: "0.75rem 1rem",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "0.75rem",
  flexShrink: 0,
};

const buttonStyle = {
  padding: "0.5rem 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid rgba(148,163,184,0.4)",
  background: "rgba(30,41,59,0.8)",
  color: "#e2e8f0",
  cursor: "pointer",
  fontSize: "0.9rem",
};

