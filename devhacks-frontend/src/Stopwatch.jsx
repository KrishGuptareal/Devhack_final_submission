import { useState, useEffect } from "react";

function Stopwatch({ size = "medium", theme = "default", monochrome = false, time: externalTime, isRunning: externalIsRunning, onToggle, onReset, hideControls = false }) {
  const [internalTime, setInternalTime] = useState(0);
  const [internalIsRunning, setInternalIsRunning] = useState(false);

  // Hover states for animation
  const [isStartHovered, setIsStartHovered] = useState(false);
  const [isResetHovered, setIsResetHovered] = useState(false);

  const isControlled = externalTime !== undefined && externalIsRunning !== undefined;
  const time = isControlled ? externalTime : internalTime;
  const isRunning = isControlled ? externalIsRunning : internalIsRunning;

  // Internal timer logic only runs if NOT controlled
  useEffect(() => {
    if (isControlled) return;

    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setInternalTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isControlled]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const fontSize = size === "large" ? "160px" : size === "small" ? "48px" : "80px";

  // Dynamic Color Logic
  let color = "var(--text-muted)";
  if (isRunning) {
    if (monochrome || theme === "monochrome") color = "#ffffff";
    else if (theme === "blue") color = "#60a5fa"; // Blue-400
    else color = "var(--success)";
  } else {
    if (monochrome || theme === "monochrome") color = "#525252";
    else if (theme === "blue") color = "#475569"; // Slate-600
  }

  // Button Style Logic
  const getBtnStyle = () => {
    if (monochrome || theme === "monochrome") {
      return {
        background: isRunning ? "#262626" : "#ffffff",
        color: isRunning ? "#a3a3a3" : "#000000",
        border: "none"
      };
    } else if (theme === "blue") {
      return {
        // Darker Blue Background for Start Button
        background: isRunning ? "rgba(96, 165, 250, 0.1)" : "rgba(37, 99, 235, 0.2)",
        color: isRunning ? "#93c5fd" : "#60a5fa",
        border: isRunning ? "1px solid rgba(96, 165, 250, 0.2)" : "1px solid rgba(37, 99, 235, 0.4)"
      };
    }
    return { background: isRunning ? "var(--glass-bg)" : "var(--accent-primary)" };
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize, fontWeight: "700", fontFamily: "monospace", color, transition: "color 0.3s" }}>
        {formatTime(time)}
      </div>
      {!hideControls && (
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "24px" }}>

          {/* START / PAUSE BUTTON */}
          <button
            onClick={() => {
              if (isControlled && onToggle) onToggle();
              else if (!isControlled) setInternalIsRunning(!internalIsRunning);
            }}
            disabled={isControlled && !onToggle}
            onMouseEnter={() => !isControlled && setIsStartHovered(true)}
            onMouseLeave={() => setIsStartHovered(false)}
            className={monochrome || theme !== "default" ? "" : "action-btn"}
            style={{
              ...getBtnStyle(),
              minWidth: "120px",
              padding: "12px 24px",
              borderRadius: "12px",
              cursor: (isControlled && !onToggle) ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "600",
              opacity: (isControlled && !onToggle) ? 0.6 : 1,
              // POP EFFECT LOGIC:
              transform: isStartHovered ? "scale(1.1)" : "scale(1)",
              boxShadow: isStartHovered ? "0 10px 25px -5px rgba(0, 0, 0, 0.3)" : "none",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" // Bouncy transition
            }}
          >
            {isRunning ? "Pause" : "Start"}
          </button>

          {/* RESET BUTTON */}
          <button
            onClick={() => {
              if (isControlled && onReset) onReset();
              else if (!isControlled) { setInternalIsRunning(false); setInternalTime(0); }
            }}
            disabled={isControlled && !onReset}
            onMouseEnter={() => !isControlled && setIsResetHovered(true)}
            onMouseLeave={() => setIsResetHovered(false)}
            className="reset-btn"
            style={{
              background: "transparent",
              border: (monochrome || theme === "monochrome") ? "1px solid #404040" : "1px solid rgba(255,255,255,0.2)",
              color: (monochrome || theme === "monochrome") ? "#a3a3a3" : "inherit",
              padding: "12px 24px",
              borderRadius: "12px",
              cursor: (isControlled && !onReset) ? "not-allowed" : "pointer",
              fontWeight: "500",
              opacity: (isControlled && !onReset) ? 0.3 : 0.8,
              // POP EFFECT LOGIC:
              transform: isResetHovered ? "scale(1.1)" : "scale(1)",
              boxShadow: isResetHovered ? "0 10px 25px -5px rgba(0, 0, 0, 0.3)" : "none",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" // Bouncy transition
            }}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

export default Stopwatch;