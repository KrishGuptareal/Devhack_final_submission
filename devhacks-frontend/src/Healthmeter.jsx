import { useState, useEffect } from "react";
import { useApp } from "./context";

function Healthmeter() {
  const { tasks, userStats, weeklyStats } = useApp();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Calculate score based on task completion
  const taskStats = {
    completed: tasks.filter(t => t.status === 'completed').length,
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length
  };
  const score = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;
  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  // Animate score on mount
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getGradient = () => {
    if (score >= 70) return { start: "#10b981", end: "#34d399", glow: "rgba(16, 185, 129, 0.4)" };
    if (score >= 40) return { start: "#f59e0b", end: "#fbbf24", glow: "rgba(245, 158, 11, 0.4)" };
    return { start: "#ef4444", end: "#f87171", glow: "rgba(239, 68, 68, 0.4)" };
  };

  const colors = getGradient();
  const gradientId = "healthGradient";

  const stats = userStats || { tasksCompleted: 0, focusTimeHours: 0, xpPoints: 0, completionRate: 0 };
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  return (
    <>
      <div
        className="glass-panel health-card"
        style={{
          padding: "32px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          transition: "all 0.3s ease"
        }}
        onClick={() => setShowStatsModal(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.02)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(99, 102, 241, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <h3 style={{
          fontSize: "16px",
          fontWeight: "700",
          color: "#f1f5f9",
          marginBottom: "24px",
          letterSpacing: "-0.3px"
        }}>Academic Health</h3>

        <div style={{
          position: "relative",
          width: "190px",
          height: "190px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {/* Glow Effect */}
          <div style={{
            position: "absolute",
            inset: "20px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            animation: "ringPulse 3s ease-in-out infinite"
          }}></div>

          {/* SVG Ring */}
          <svg
            width="190"
            height="190"
            style={{ position: "absolute", transform: "rotate(-90deg)" }}
          >
            {/* Gradient Definition */}
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.start} />
                <stop offset="100%" stopColor={colors.end} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Ring */}
            <circle
              cx="95"
              cy="95"
              r={radius}
              stroke="rgba(148, 163, 184, 0.1)"
              strokeWidth="10"
              fill="transparent"
            />

            {/* Progress Ring */}
            <circle
              cx="95"
              cy="95"
              r={radius}
              stroke={`url(#${gradientId})`}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              filter="url(#glow)"
              style={{
                transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            />
          </svg>

          {/* Score Display */}
          <div style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <span style={{
              fontSize: "52px",
              fontWeight: "800",
              background: `linear-gradient(135deg, ${colors.start}, ${colors.end})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1
            }}>
              {animatedScore}
            </span>
            <span style={{
              fontSize: "12px",
              color: "#64748b",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginTop: "4px"
            }}>SCORE</span>
          </div>
        </div>

        {/* Status Text */}
        <p style={{
          color: colors.start,
          fontSize: "15px",
          fontWeight: "600",
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: colors.start,
            boxShadow: `0 0 10px ${colors.glow}`
          }}></span>
          {score >= 70
            ? "Excellent Performance"
            : score >= 40
              ? "Needs Improvement"
              : "Critical Attention Needed"}
        </p>

        {/* Metrics */}
        <div style={{
          width: "100%",
          marginTop: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          {score >= 70 ? (
            <>
              <div style={{
                padding: "10px 16px",
                borderRadius: "12px",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                fontSize: "12px",
                color: "#10b981",
                fontWeight: "600",
                textAlign: "center"
              }}>
                ✓ High Consistency
              </div>
              <div style={{
                padding: "10px 16px",
                borderRadius: "12px",
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                fontSize: "12px",
                color: "#818cf8",
                fontWeight: "600",
                textAlign: "center"
              }}>
                ↑ Low Risk
              </div>
            </>
          ) : score >= 40 ? (
            <>
              <div style={{
                padding: "10px 16px",
                borderRadius: "12px",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                fontSize: "12px",
                color: "#f59e0b",
                fontWeight: "600",
                textAlign: "center"
              }}>
                ⚠ Moderate Progress
              </div>
              <div style={{
                padding: "10px 16px",
                borderRadius: "12px",
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                fontSize: "12px",
                color: "#818cf8",
                fontWeight: "600",
                textAlign: "center"
              }}>
                💪 Keep Going
              </div>
            </>
          ) : (
            <>
              <div style={{
                padding: "10px 16px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                fontSize: "12px",
                color: "#ef4444",
                fontWeight: "600",
                textAlign: "center"
              }}>
                ⚠ Needs Attention
              </div>
              <div style={{
                padding: "10px 16px",
                borderRadius: "12px",
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                fontSize: "12px",
                color: "#818cf8",
                fontWeight: "600",
                textAlign: "center"
              }}>
                🎯 Focus Required
              </div>
            </>
          )}
        </div>

        <style>{`
        @keyframes ringPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
      </div>

      {/* Statistics Modal */}
      {showStatsModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(8px)"
          }}
          onClick={() => setShowStatsModal(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: "90%",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
              padding: "40px",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowStatsModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "transparent",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "var(--text-muted)",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              ×
            </button>

            <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "32px", color: "var(--text-main)" }}>
              Academic Health Statistics
            </h2>

            {/* Overall Score */}
            <div style={{ marginBottom: "32px", textAlign: "center" }}>
              <div style={{ fontSize: "64px", fontWeight: "800", background: `linear-gradient(135deg, ${colors.start}, ${colors.end})`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {score}%
              </div>
              <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>Overall Completion Rate</p>
            </div>

            {/* Task Breakdown */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "var(--text-main)" }}>
                Task Breakdown
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <div className="glass-panel" style={{ padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#10b981" }}>{taskStats.completed}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Completed</div>
                </div>
                <div className="glass-panel" style={{ padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#6366f1" }}>{taskStats.inProgress}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>In Progress</div>
                </div>
                <div className="glass-panel" style={{ padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#f59e0b" }}>{taskStats.pending}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Pending</div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "var(--text-main)" }}>
                Performance Metrics
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(99, 102, 241, 0.1)", borderRadius: "12px" }}>
                  <span style={{ color: "var(--text-main)" }}>Tasks Completed</span>
                  <span style={{ fontWeight: "700", color: "var(--accent-primary)" }}>{stats.tasksCompleted}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "12px" }}>
                  <span style={{ color: "var(--text-main)" }}>Focus Time</span>
                  <span style={{ fontWeight: "700", color: "#10b981" }}>{stats.focusTimeHours}h</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(245, 158, 11, 0.1)", borderRadius: "12px" }}>
                  <span style={{ color: "var(--text-main)" }}>XP Points</span>
                  <span style={{ fontWeight: "700", color: "#f59e0b" }}>{stats.xpPoints}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(99, 102, 241, 0.1)", borderRadius: "12px" }}>
                  <span style={{ color: "var(--text-main)" }}>Completion Rate</span>
                  <span style={{ fontWeight: "700", color: "var(--accent-primary)" }}>{stats.completionRate}%</span>
                </div>
              </div>
            </div>

            {/* Weekly Progress Summary */}
            {weeklyStats && weeklyStats.length > 0 && (
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "var(--text-main)" }}>
                  Weekly Progress
                </h3>
                <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}>
                  {weeklyStats.map((day, index) => (
                    <div key={index} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>{day.day}</div>
                      <div style={{
                        height: "60px",
                        width: "100%",
                        background: "rgba(148, 163, 184, 0.1)",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        padding: "4px"
                      }}>
                        <div style={{
                          width: "100%",
                          height: `${day.value}%`,
                          background: day.value >= 70 ? "linear-gradient(180deg, #10b981, #34d399)" :
                            day.value >= 40 ? "linear-gradient(180deg, #f59e0b, #fbbf24)" :
                              "linear-gradient(180deg, #f43f5e, #fb7185)",
                          borderRadius: "4px",
                          transition: "height 0.3s ease"
                        }} />
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{day.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Healthmeter;
