import React from "react";

/**
 * Embeds the Unity WebGL build in an iframe.
 * Loads /unity/index.html (served from dashboard/public/unity/).
 * Optionally pass sessionId to add as query param for backend API flow.
 */
export default function UnityScene({ sessionId, className = "", style = {} }) {
  const src = sessionId
    ? `/unity/index.html?session_id=${encodeURIComponent(sessionId)}`
    : "/unity/index.html";

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "70vh",
        background: "#000",
        borderRadius: "0.75rem",
        overflow: "hidden",
        ...style,
      }}
    >
      <iframe
        src={src}
        title="Crime Scene Simulation"
        style={{
          width: "100%",
          height: "100%",
          minHeight: "70vh",
          border: "none",
          display: "block",
        }}
      />
    </div>
  );
}
