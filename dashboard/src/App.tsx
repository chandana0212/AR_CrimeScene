import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

type SessionSummary = {
  session_id: string;
  scene_version: string;
  started_at: string;
};

type ReportResponse = {
  memory_accuracy: number;
  suggestibility_index: number;
  distortion_rate: number;
  false_recall_count: number;
  missed_object_count: number;
  witness_reliability: string;
};

const API_BASE = "http://localhost:8000";

const App: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittingAnswers, setSubmittingAnswers] = useState(false);

  const crimeScenes = [
    { id: "crime_scene_1", name: "Crime Scene 1" },
    // Ready to extend later: { id: "crime_scene_2", name: "Crime Scene 2" },
  ];

  const recallQuestions = [
    {
      id: "light_stand_color",
      label: "What was the color of the light stand?",
      objectKey: "light_stand_color",
    },
    {
      id: "phone_location",
      label: "Where was the phone placed?",
      objectKey: "phone_location",
    },
    {
      id: "knife_location",
      label: "Where was the knife?",
      objectKey: "knife_location",
    },
  ];

  useEffect(() => {
    fetch(`${API_BASE}/sessions`)
      .then((res) => res.json())
      .then((data) => {
        const items = (data.items || []) as any[];
        setSessions(
          items.map((s) => ({
            session_id: s.session_id,
            scene_version: s.scene_version,
            started_at: s.started_at,
          }))
        );
      })
      .catch((err) => console.error("Failed to load sessions", err));
  }, []);

  useEffect(() => {
    if (!selectedSession) return;
    fetch(`${API_BASE}/sessions/${selectedSession}/report`)
      .then((res) => res.json())
      .then((data) => setReport(data as ReportResponse))
      .catch((err) => console.error("Failed to load report", err));
  }, [selectedSession]);

  const barData = report && {
    labels: ["Accuracy", "Suggestibility", "Distortion"],
    datasets: [
      {
        label: "Proportion",
        backgroundColor: ["#16a34a", "#f97316", "#ea580c"],
        data: [
          report.memory_accuracy,
          report.suggestibility_index,
          report.distortion_rate,
        ],
      },
    ],
  };

  const pieData = report && {
    labels: ["Correct", "Incorrect"],
    datasets: [
      {
        label: "Answers",
        data: [
          report.memory_accuracy,
          1 - report.memory_accuracy,
        ],
        backgroundColor: ["#22c55e", "#ef4444"],
      },
    ],
  };

  const [sessionError, setSessionError] = useState<string | null>(null);

  const handleStartSession = async (sceneId: string) => {
    setSessionError(null);
    try {
      setIsCreatingSession(true);
      const res = await fetch(`${API_BASE}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene_version: sceneId,
          participant_id: null,
          condition: "default",
          metadata: {},
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Session creation failed (${res.status})`);
      }
      const data = await res.json();
      const sessionId = data.session_id as string;
      setActiveSessionId(sessionId);
      setSelectedSession(sessionId);
      setAnswers({});
      setReport(null);
      // Open Unity scene in a new tab so the crime scene loads immediately
      const unityUrl = `${window.location.origin}/unity/index.html?session_id=${encodeURIComponent(sessionId)}`;
      window.open(unityUrl, "_blank", "noopener,noreferrer");
      // Refresh sessions list so the new session appears
      fetch(`${API_BASE}/sessions`)
        .then((r) => r.json())
        .then((d) => {
          const items = (d.items || []) as any[];
          setSessions(
            items.map((s) => ({
              session_id: s.session_id,
              scene_version: s.scene_version,
              started_at: s.started_at,
            }))
          );
        })
        .catch((err) => console.error("Failed to refresh sessions", err));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create session";
      setSessionError(message);
      console.error("Failed to create session", e);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const submitAnswers = async () => {
    if (!activeSessionId) return;
    setSubmittingAnswers(true);
    try {
      for (const q of recallQuestions) {
        const answer = answers[q.id];
        if (!answer) continue;
        await fetch(`${API_BASE}/recall`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: activeSessionId,
            question_id: q.id,
            object_key: q.objectKey,
            user_answer: answer,
          }),
        });
      }

      // After submitting all recall answers, load the report
      const res = await fetch(
        `${API_BASE}/sessions/${activeSessionId}/report`
      );
      const data = (await res.json()) as ReportResponse;
      setReport(data);
    } catch (e) {
      console.error("Failed to submit answers or load report", e);
    } finally {
      setSubmittingAnswers(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Crime Scene Memory Distortion Dashboard</h1>
        <p>
          Visualize eyewitness memory accuracy, suggestibility, and distortion
          for each experimental session.
        </p>
      </header>
      <main className="layout">
        <section className="panel sessions">
          <h2>Crime Scenes</h2>
          <p>Select a crime scene to start a new experimental session.</p>
          {sessionError && (
            <p style={{ color: "#f87171", fontSize: "0.85rem", marginTop: "0.5rem" }}>
              {sessionError} (Is the backend running on port 8000?)
            </p>
          )}
          <ul>
            {crimeScenes.map((scene) => (
              <li
                key={scene.id}
                className={
                  activeSessionId && selectedSession === activeSessionId
                    ? "session selected"
                    : "session"
                }
                onClick={() => {
                  if (scene.id === "crime_scene_1") {
                    navigate("/crime-scene-1");
                    return;
                  }
                  if (!isCreatingSession) handleStartSession(scene.id);
                }}
                style={{ opacity: isCreatingSession ? 0.7 : 1, cursor: "pointer" }}
              >
                <div className="session-id">{scene.name}</div>
                <div className="session-meta">
                  <span>
                    {scene.id === "crime_scene_1"
                      ? "Click to open Unity scene"
                      : isCreatingSession
                        ? "Starting…"
                        : "Click to start session (opens Unity)"}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <h2 style={{ marginTop: "1.5rem" }}>Recent Sessions</h2>
          <ul>
            {sessions.map((s) => (
              <li
                key={s.session_id}
                className={
                  s.session_id === selectedSession ? "session selected" : "session"
                }
                onClick={() => {
                  setSelectedSession(s.session_id);
                  setActiveSessionId(s.session_id);
                }}
              >
                <div className="session-id">{s.session_id.slice(0, 8)}…</div>
                <div className="session-meta">
                  <span>{s.scene_version}</span>
                  <span>{new Date(s.started_at).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel report">
          <h2>Experiment Flow & Report</h2>
          {!activeSessionId && (
            <p>
              Start by selecting a crime scene on the left. This will create a new{" "}
              experimental session and give you a session id.
            </p>
          )}
          {activeSessionId && !report && (
            <>
              <p>
                Active session: <strong>{activeSessionId.slice(0, 8)}…</strong>
              </p>
              <div
                className="unity-embed"
                style={{
                  marginBottom: "1rem",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  border: "1px solid rgba(148,163,184,0.4)",
                  background: "#000",
                }}
              >
                <iframe
                  src={`/unity/index.html${activeSessionId ? `?session_id=${encodeURIComponent(activeSessionId)}` : ""}`}
                  title="Crime Scene Simulation"
                  style={{
                    width: "100%",
                    height: "480px",
                    border: "none",
                    display: "block",
                  }}
                />
              </div>
              <ol>
                <li>
                  In Unity, run <strong>Crime Scene 1</strong>. The{" "}
                  <code>Scene_Before</code> will show for 25 seconds, followed by a
                  distraction puzzle and the modified <code>Scene_After</code>.
                </li>
                <li>
                  After the Unity sequence, answer the recall questions below about
                  the <strong>original</strong> crime scene.
                </li>
                <li>
                  When you submit, the backend will run AI analysis and the report
                  will appear.
                </li>
              </ol>

              <div className="metrics-grid">
                {recallQuestions.map((q) => (
                  <div key={q.id} className="metric-card">
                    <h3>{q.label}</h3>
                    <input
                      type="text"
                      value={answers[q.id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(q.id, e.target.value)
                      }
                      placeholder="Type your answer"
                      style={{
                        marginTop: "0.5rem",
                        width: "100%",
                        padding: "0.45rem 0.6rem",
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(148,163,184,0.5)",
                        background: "rgba(15,23,42,0.9)",
                        color: "#e5e7eb",
                      }}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={submitAnswers}
                disabled={submittingAnswers}
                style={{
                  marginTop: "1rem",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "999px",
                  border: "none",
                  background:
                    "linear-gradient(to right, #22c55e, #16a34a, #15803d)",
                  color: "#0f172a",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {submittingAnswers ? "Submitting & Analyzing..." : "Submit Answers & Generate Report"}
              </button>
            </>
          )}
          {report && (
            <>
              <div className="metrics-grid">
                <div className="metric-card">
                  <h3>Memory Accuracy</h3>
                  <p className="metric-value">
                    {(report.memory_accuracy * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="metric-card">
                  <h3>Suggestibility Index</h3>
                  <p className="metric-value">
                    {(report.suggestibility_index * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="metric-card">
                  <h3>Distortion Rate</h3>
                  <p className="metric-value">
                    {(report.distortion_rate * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="metric-card">
                  <h3>False Recalls</h3>
                  <p className="metric-value">
                    {report.false_recall_count}
                  </p>
                </div>
                <div className="metric-card">
                  <h3>Missed Objects</h3>
                  <p className="metric-value">
                    {report.missed_object_count}
                  </p>
                </div>
                <div className="metric-card">
                  <h3>Witness Reliability</h3>
                  <p className="metric-value">{report.witness_reliability}</p>
                </div>
              </div>

              <div className="charts">
                {barData && (
                  <div className="chart">
                    <h3>Accuracy vs Distortion</h3>
                    <Bar data={barData} />
                  </div>
                )}
                {pieData && (
                  <div className="chart">
                    <h3>Overall Answer Split</h3>
                    <Pie data={pieData} />
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;

