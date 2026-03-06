import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const QUESTIONS = [
  {
    id: 1,
    prompt: "What is 23 + 18 ?",
    options: ["39", "41", "43", "45"],
    correctIndex: 1,
  },
  {
    id: 2,
    prompt: "What is 45 \u2212 19 ?",
    options: ["24", "25", "26", "27"],
    correctIndex: 2,
  },
  {
    id: 3,
    prompt: "Which number comes next? 2, 4, 6, 8, ?",
    options: ["9", "10", "12", "14"],
    correctIndex: 1,
  },
  {
    id: 4,
    prompt: "How many days are there in a week?",
    options: ["5", "6", "7", "8"],
    correctIndex: 2,
  },
  {
    id: 5,
    prompt: "If you have 3 apples and take away 2, how many do you have?",
    options: ["1", "2", "3", "5"],
    correctIndex: 1,
  },
  {
    id: 6,
    prompt: "What color do you get when you mix red and blue?",
    options: ["Green", "Purple", "Orange", "Yellow"],
    correctIndex: 1,
  },
];

export default function DistractionQuestions() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const current = QUESTIONS[currentIndex];
  const selected = answers[current.id] ?? null;

  const handleOptionChange = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }));
  };

  const handleNext = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      // End of distraction phase: move to the modified crime scene for 25s.
      navigate("/crime-scene-1-modified");
    }
  };

  const atEnd = currentIndex === QUESTIONS.length - 1;

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <button type="button" onClick={() => navigate("/")} style={buttonStyle}>
          \u2190 Back to Dashboard
        </button>
        <h1 style={{ fontSize: "1.1rem", margin: 0 }}>Distraction Questions</h1>
      </header>

      <main style={cardStyle}>
        {!atEnd && (
          <p style={{ margin: "0 0 0.5rem", color: "#9ca3af", fontSize: "0.9rem" }}>
            Question {currentIndex + 1} of {QUESTIONS.length}
          </p>
        )}

        <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem" }}>{current.prompt}</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {current.options.map((opt, idx) => (
            <label
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 0.6rem",
                borderRadius: "0.5rem",
                border:
                  selected === idx
                    ? "1px solid rgba(96,165,250,0.9)"
                    : "1px solid rgba(148,163,184,0.5)",
                cursor: "pointer",
                background:
                  selected === idx ? "rgba(30,64,175,0.3)" : "rgba(15,23,42,0.8)",
              }}
            >
              <input
                type="radio"
                name={`q-${current.id}`}
                checked={selected === idx}
                onChange={() => handleOptionChange(idx)}
              />
              <span>{String.fromCharCode(65 + idx)}) {opt}</span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={selected === null}
          style={{
            ...buttonStyle,
            marginTop: "1rem",
            opacity: selected === null ? 0.6 : 1,
            cursor: selected === null ? "not-allowed" : "pointer",
          }}
        >
          {atEnd ? "Finish" : "Next"}
        </button>

        {atEnd && (
          <p style={{ marginTop: "1rem", color: "#22c55e" }}>
            Distraction phase completed.
          </p>
        )}
      </main>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#020617",
  color: "#e5e7eb",
  padding: "1.5rem 1rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const headerStyle = {
  width: "100%",
  maxWidth: "720px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "1rem",
};

const cardStyle = {
  width: "100%",
  maxWidth: "720px",
  background: "rgba(15,23,42,0.95)",
  borderRadius: "1rem",
  padding: "1.25rem 1.5rem 1.5rem",
  border: "1px solid rgba(148,163,184,0.3)",
  boxShadow: "0 18px 45px rgba(0,0,0,0.6)",
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

