import React from "react";

/**
 * Embeds the MODIFIED Unity WebGL crime scene.
 * Loads /unity-modified/index.html (served from dashboard/public/unity-modified/).
 * This is used after the distraction questions for the misinformation phase.
 */
export default function UnitySceneModified({ className = "", style = {} }) {
  const src = "/unity-modified/index.html";

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
        title="Modified Crime Scene Simulation"
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

