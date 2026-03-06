import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnityScene from "../components/UnityScene.jsx";

const API_BASE = "http://localhost:8000";

/**
 * Crime Scene 1 page: loads UnityScene and creates a session with the backend.
 * User can interact with the Unity WebGL scene; data can be sent via POST /sessions, POST /recall.
 */
export default function CrimeScene1() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetch(`${API_BASE}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scene_version: "crime_scene_1",
        participant_id: null,
        condition: "default",
        metadata: {},
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Session failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setSessionId(data.session_id);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to create session");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!timerStarted) return;
    setSecondsLeft(25);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/questions");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStarted, navigate]);

  if (loading) {
    return (
      <div className="crime-scene-page" style={pageStyle}>
        <p style={{ color: "#94a3b8" }}>Starting session…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="crime-scene-page" style={pageStyle}>
        <p style={{ color: "#f87171" }}>{error} (Is the backend running on port 8000?)</p>
        <button type="button" onClick={() => navigate("/")} style={buttonStyle}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="crime-scene-page" style={pageStyle}>
      <header style={headerStyle}>
        <button type="button" onClick={() => navigate("/")} style={buttonStyle}>
          ← Back to Dashboard
        </button>
        <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
          Session: {sessionId?.slice(0, 8)}…
        </span>
      </header>
      <UnityScene sessionId={sessionId} style={{ flex: 1, minHeight: "60vh" }} />
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        {!timerStarted ? (
          <button
            type="button"
            onClick={() => setTimerStarted(true)}
            style={{
              ...buttonStyle,
              padding: "0.6rem 1.2rem",
              borderRadius: "999px",
              background:
                "linear-gradient(to right, #22c55e, #16a34a, #15803d)",
              border: "none",
              fontWeight: 600,
            }}
          >
            Start Observation Timer (25s)
          </button>
        ) : (
          <p style={{ color: "#e5e7eb" }}>
            Observation time remaining:{" "}
            <strong>{secondsLeft}s</strong>
          </p>
        )}
        {timerStarted && (
          <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Please keep observing the crime scene carefully. You will automatically
            move to distraction questions when the timer ends.
          </p>
        )}
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
