import { useState } from "react";
import { Link } from "react-router-dom";

const HoverLink = ({ to, className, style, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Link
      to={to}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: isHovered ? "scale(1.05)" : "scale(1)",
        boxShadow: isHovered ? "0 4px 20px rgba(0,0,0,0.4)" : "none",
        zIndex: isHovered ? 10 : 1, // Ensure hovered button is on top
        textDecoration: "none",
        position: "relative" // Required for z-index
      }}
    >
      {children}
    </Link>
  );
};

function Todaytasks({ tasks }) {

  const getDeadlineStyle = (deadlineText, isCompleted) => {
    if (isCompleted) return { bg: "transparent", text: "#a3a3a3", border: "transparent" };

    const text = deadlineText.toLowerCase();
    if (text.includes("tomorrow") || text.includes("today") || text.includes("overdue")) {
      return { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444", border: "rgba(239, 68, 68, 0.3)" };
    } else if (text.includes("days") && !text.includes("weeks")) {
      return { bg: "rgba(234, 179, 8, 0.15)", text: "#eab308", border: "rgba(234, 179, 8, 0.3)" };
    }
    return { bg: "rgba(255, 255, 255, 0.05)", text: "#737373", border: "rgba(255, 255, 255, 0.1)" };
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444" },
      medium: { bg: "rgba(234, 179, 8, 0.15)", text: "#eab308" },
      low: { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e" }
    };
    return styles[priority] || styles.medium;
  };

  return (
    <div className="glass-panel tasks-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3>Today's Focus</h3>
        <span style={{ 
          fontSize: "13px", 
          color: "var(--text-muted)",
          background: "rgba(99, 102, 241, 0.1)",
          padding: "4px 12px",
          borderRadius: "20px"
        }}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="task-list">
        {tasks.map((task) => {
          const isCompleted = task.status === "Completed";
          const isInProgress = task.status === "In Progress";
          const deadlineText = task.deadline || "No deadline";
          const badgeStyle = getDeadlineStyle(deadlineText, isCompleted);
          const priorityStyle = getPriorityBadge(task.priority);

          return (
            <div
              key={task.id}
              className="task-item"
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "16px",
                opacity: isCompleted ? 0.95 : 1,
                transition: "all 0.3s ease",
                borderLeft: task.subjectColor ? `4px solid ${task.subjectColor}` : "4px solid var(--accent-primary)",
              }}
            >
              <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="task-info">
                  <h4 style={{
                    fontSize: "18px",
                    marginBottom: "6px",
                    textDecoration: isCompleted ? "line-through" : "none",
                    color: isCompleted ? "#4b5563" : "var(--text-main)"
                  }}>
                    {task.subject}
                  </h4>

                  <div className="task-meta" style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", color: "#737373", display: "flex", alignItems: "center", gap: "6px" }}>
                      ⏱ {task.time}
                    </span>

                    {task.priority && (
                      <span style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        background: priorityStyle.bg,
                        color: priorityStyle.text,
                        padding: "2px 8px",
                        borderRadius: "12px",
                        textTransform: "uppercase"
                      }}>
                        {task.priority}
                      </span>
                    )}

                    <span style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      background: badgeStyle.bg,
                      color: badgeStyle.text,
                      padding: "4px 10px",
                      borderRadius: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      letterSpacing: "0.3px"
                    }}>
                      {!isCompleted && "⏳"} {deadlineText}
                    </span>
                  </div>

                  {/* Progress bar for in-progress tasks */}
                  {isInProgress && task.completionPercentage > 0 && (
                    <div style={{ marginTop: "12px", width: "100%" }}>
                      <div style={{
                        height: "4px",
                        background: "rgba(99, 102, 241, 0.2)",
                        borderRadius: "2px",
                        overflow: "hidden"
                      }}>
                        <div style={{
                          width: `${task.completionPercentage}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                          transition: "width 0.3s ease"
                        }} />
                      </div>
                      <span style={{ fontSize: "11px", color: "#737373", marginTop: "4px", display: "block" }}>
                        {task.completionPercentage}% complete
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", width: "100%" }}>
                {!isCompleted ? (
                  <>
                    <HoverLink
                      to={`/focus/${task.id}`}
                      className="action-btn"
                      style={{ flex: 1, padding: "12px", fontSize: "14px", background: "var(--accent-primary)" }}
                    >
                      🎯 Focus
                    </HoverLink>

                    <HoverLink
                      to={`/free/${task.id}`}
                      className="btn-secondary"
                      style={{ 
                        flex: 1, 
                        padding: "12px", 
                        fontSize: "14px", 
                        background: "rgba(148, 163, 184, 0.1)", 
                        border: "1px solid rgba(148, 163, 184, 0.2)", 
                        color: "var(--text-main)" 
                      }}
                    >
                      🧭 Free
                    </HoverLink>
                  </>
                ) : (
                  <div style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(16, 185, 129, 0.2)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "12px",
                    color: "#10b981",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}>
                    ✅ Session Complete
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Todaytasks;