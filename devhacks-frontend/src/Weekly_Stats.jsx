import { useState, useEffect } from "react";
import { useApp } from "./context";

function WeeklyStats() {
  const { weeklyStats, tasksLoading } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  // Use real data from context, fallback to empty week
  const data = weeklyStats && weeklyStats.length > 0 
    ? weeklyStats 
    : [
        { day: "Mon", value: 0 },
        { day: "Tue", value: 0 },
        { day: "Wed", value: 0 },
        { day: "Thu", value: 0 },
        { day: "Fri", value: 0 },
        { day: "Sat", value: 0 },
        { day: "Sun", value: 0 },
      ];

  useEffect(() => {
    // Animate bars after data loads
    if (!tasksLoading && weeklyStats) {
      setTimeout(() => setIsLoaded(true), 100);
    }
  }, [tasksLoading, weeklyStats]);

  const getBarColor = (value) => {
    if (value >= 70) return { gradient: "linear-gradient(180deg, #10b981, #34d399)", glow: "rgba(16, 185, 129, 0.4)" };
    if (value >= 40) return { gradient: "linear-gradient(180deg, #f59e0b, #fbbf24)", glow: "rgba(245, 158, 11, 0.4)" };
    return { gradient: "linear-gradient(180deg, #f43f5e, #fb7185)", glow: "rgba(244, 63, 94, 0.4)" };
  };

  const avgProgress = data.length > 0 
    ? Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length)
    : 0;

  return (
    <div className="glass-panel stats-card" style={{ padding: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h3 style={{
          fontSize: "16px",
          fontWeight: "700",
          color: "#f1f5f9",
          margin: 0
        }}>Weekly Progress</h3>

        <div style={{
          padding: "6px 14px",
          borderRadius: "20px",
          background: avgProgress >= 50 ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
          border: `1px solid ${avgProgress >= 50 ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <span style={{ color: avgProgress >= 50 ? "#10b981" : "#f59e0b", fontSize: "13px", fontWeight: "700" }}>
            {avgProgress >= 50 ? "↑" : "↓"} {avgProgress}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        height: "140px",
        gap: "8px",
        padding: "0 8px"
      }}>
        {data.map((item, index) => {
          const colors = getBarColor(item.value);
          return (
            <div
              key={item.day}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                flex: 1,
                height: "100%",
                justifyContent: "flex-end",
                cursor: "pointer"
              }}
            >
              {/* Value Label */}
              <span style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#94a3b8",
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "translateY(0)" : "translateY(10px)",
                transition: `all 0.4s ease ${index * 0.1}s`
              }}>
                {item.value}%
              </span>

              {/* Bar */}
              <div
                style={{
                  width: "100%",
                  maxWidth: "28px",
                  height: isLoaded ? `${item.value}%` : "0%",
                  background: colors.gradient,
                  borderRadius: "8px",
                  transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s`,
                  boxShadow: `0 0 20px ${colors.glow}`,
                  position: "relative"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scaleY(1.05) scaleX(1.2)";
                  e.currentTarget.style.boxShadow = `0 0 30px ${colors.glow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scaleY(1) scaleX(1)";
                  e.currentTarget.style.boxShadow = `0 0 20px ${colors.glow}`;
                }}
              />

              {/* Day Label */}
              <span style={{
                fontSize: "12px",
                color: "#64748b",
                fontWeight: "500",
                letterSpacing: "0.5px"
              }}>
                {item.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: "20px",
        padding: "12px 16px",
        borderRadius: "12px",
        background: "rgba(99, 102, 241, 0.08)",
        border: "1px solid rgba(99, 102, 241, 0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px"
      }}>
        <span style={{ fontSize: "18px" }}>📈</span>
        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
          {avgProgress >= 70 ? (
            <>Performance is <strong style={{ color: "#10b981" }}>excellent</strong> this week</>
          ) : avgProgress >= 40 ? (
            <>Performance is <strong style={{ color: "#f59e0b" }}>good</strong> this week</>
          ) : (
            <>Keep pushing! <strong style={{ color: "#f43f5e" }}>More tasks</strong> needed this week</>
          )}
        </span>
      </div>
    </div>
  );
}

export default WeeklyStats;
