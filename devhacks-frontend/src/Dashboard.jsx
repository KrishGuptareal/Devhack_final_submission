import { useEffect } from "react";
import Healthmeter from "./Healthmeter.jsx";
import Todaytasks from "./Todaytasks.jsx";
import WeeklyStats from "./Weekly_Stats.jsx";
import { Link } from "react-router-dom";
import { useApp } from "./context";

function Dashboard() {
  const { 
    tasks, 
    tasksLoading, 
    fetchTodayTasks,
    generateDailyTasks,
    subjects,
    subjectsLoading,
    error 
  } = useApp();

  // Transform API tasks to the format expected by components
  const formattedTasks = tasks.map(task => ({
    id: task._id,
    subject: task.subjectId?.name || task.title || 'Study Session',
    subjectColor: task.subjectId?.color || '#6366f1',
    time: `${task.estimatedMinutes} min`,
    status: task.status === 'completed' ? 'Completed' : 
            task.status === 'in_progress' ? 'In Progress' : 'Not Started',
    deadline: task.scheduledDate ? getDeadlineText(task.scheduledDate) : 'No deadline',
    priority: task.priority,
    urgencyScore: task.urgencyScore,
    completionPercentage: task.completionPercentage || 0,
    rawTask: task // Keep original for API calls
  }));

  // Helper to format deadline text
  function getDeadlineText(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return `Due in ${Math.ceil(diffDays / 7)} weeks`;
  }

  // Try to generate tasks if none exist
  const handleGenerateTasks = async () => {
    try {
      // On dashboard, we usually only generate if none exist, so force is false by default
      // but the underlying generateDailyTasks will now correctly sync state
      await generateDailyTasks(false);
    } catch (err) {
      console.error('Failed to generate tasks:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay">
        <div className="main-content" style={{ marginTop: 0 }}>

          <div className="dashboard-grid">
            <div className="left-panel">
              <Healthmeter />
              <WeeklyStats />
            </div>

            {/* Right Panel with Scroll */}
            <div
              className="right-panel"
              style={{
                maxHeight: "78vh",
                overflowY: "auto",
                paddingRight: "8px"
              }}
            >
              {tasksLoading ? (
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
                  <p style={{ color: "var(--text-muted)" }}>Loading tasks...</p>
                </div>
              ) : error ? (
                <div className="glass-panel" style={{ padding: "40px", textAlign: "center" }}>
                  <p style={{ color: "#ef4444", marginBottom: "16px" }}>⚠️ {error}</p>
                  <button 
                    onClick={() => fetchTodayTasks()}
                    className="action-btn"
                  >
                    Retry
                  </button>
                </div>
              ) : formattedTasks.length === 0 ? (
                <div className="glass-panel" style={{ padding: "40px", textAlign: "center" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
                  <h3 style={{ marginBottom: "8px", color: "var(--text-main)" }}>No Tasks Yet</h3>
                  <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
                    {subjects.length === 0 
                      ? "Add some subjects first, then generate your daily tasks!"
                      : "Generate your daily study tasks to get started!"}
                  </p>
                  {subjects.length > 0 && (
                    <button 
                      onClick={handleGenerateTasks}
                      className="action-btn"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                    >
                      ⚡ Generate Tasks
                    </button>
                  )}
                </div>
              ) : (
                <Todaytasks tasks={formattedTasks} />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;