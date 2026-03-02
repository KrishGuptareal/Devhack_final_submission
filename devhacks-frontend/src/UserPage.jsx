import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { useApp } from "./context";

function UserPage() {
  const { user, userStats, tasksLoading } = useApp();
  const { isLoaded } = useAuth();
  const { signOut } = useClerk();




  if (!user && !isLoaded) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-panel" style={{ padding: "40px", textAlign: "center" }}>
            <div className="loading-spinner" style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(99, 102, 241, 0.2)",
              borderTop: "3px solid #6366f1",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px"
            }} />
            <p style={{ color: "var(--text-muted)" }}>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const userEmail = user?.email || "No email found";
  const stats = userStats || { tasksCompleted: 0, focusTimeHours: 0, xpPoints: 0 };

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="glass-panel" style={{ width: "100%", maxWidth: "600px", padding: "40px", textAlign: "center" }}>
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent-primary), #8b5cf6)",
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: "bold",
              color: "white",
              textTransform: "uppercase"
            }}
          >
            {user?.username?.[0] || userEmail[0]}
          </div>

          <h2>{user?.username || "Student Profile"}</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>{userEmail}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "32px" }}>
            <div className="glass-panel" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "28px", color: "var(--accent-glow)" }}>
                {tasksLoading ? "..." : stats.tasksCompleted}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Tasks Done</p>
            </div>
            <div className="glass-panel" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "28px", color: "var(--success)" }}>
                {tasksLoading ? "..." : `${stats.focusTimeHours}h`}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Focus Time</p>
            </div>
            <div className="glass-panel" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "28px", color: "var(--warning)" }}>
                {tasksLoading ? "..." : stats.xpPoints}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>XP Points</p>
            </div>
          </div>



          <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
            <Link to="/dashboard" className="btn-secondary" style={{ flex: 1, padding: "14px", textDecoration: "none" }}>
              Back to Dashboard
            </Link>
            <button
              onClick={() => signOut()}
              className="action-btn"
              style={{ flex: 1, padding: "14px", background: "#ef4444" }}
            >
              ↪ Sign Out
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 600px) {
          .user-stats-grid {
            grid-template-columns: 1fr !important;
          }
          .glass-panel {
            padding: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default UserPage;
