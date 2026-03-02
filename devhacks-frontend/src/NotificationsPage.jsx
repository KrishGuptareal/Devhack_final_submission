import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "./context";
import { useAuth } from "@clerk/clerk-react";

function NotificationsPage() {
  const { tasks, subjects, userStats } = useApp();
  const { isLoaded } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate notifications from tasks and subjects
    const generateNotifications = () => {
      const notifs = [];
      const now = new Date();
      
      // Overdue tasks
      tasks.forEach(task => {
        if (task.status !== 'completed' && task.scheduledDate) {
          const taskDate = new Date(task.scheduledDate);
          const daysDiff = Math.floor((now - taskDate) / (1000 * 60 * 60 * 24));
          
          if (daysDiff > 0) {
            notifs.push({
              id: `overdue-${task._id}`,
              type: 'overdue',
              title: 'Overdue Task',
              message: `${task.title || task.subjectId?.name || 'Task'} is ${daysDiff} day${daysDiff > 1 ? 's' : ''} overdue`,
              priority: 'high',
              timestamp: taskDate,
              taskId: task._id,
            });
          } else if (daysDiff === 0) {
            notifs.push({
              id: `due-today-${task._id}`,
              type: 'due_today',
              title: 'Task Due Today',
              message: `${task.title || task.subjectId?.name || 'Task'} is due today`,
              priority: 'medium',
              timestamp: taskDate,
              taskId: task._id,
            });
          }
        }
      });

      // Upcoming deadlines (next 3 days)
      subjects.forEach(subject => {
        if (subject.deadline?.date) {
          const deadlineDate = new Date(subject.deadline.date);
          const daysDiff = Math.floor((deadlineDate - now) / (1000 * 60 * 60 * 24));
          
          if (daysDiff >= 0 && daysDiff <= 3) {
            notifs.push({
              id: `deadline-${subject._id}`,
              type: 'deadline',
              title: `${subject.deadline.type === 'exam' ? 'Exam' : 'Assignment'} Deadline`,
              message: `${subject.name} ${subject.deadline.type} is in ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`,
              priority: daysDiff === 0 ? 'high' : 'medium',
              timestamp: deadlineDate,
              subjectId: subject._id,
            });
          }
        }
      });

      // Achievement notifications
      if (userStats) {
        if (userStats.tasksCompleted > 0 && userStats.tasksCompleted % 5 === 0) {
          notifs.push({
            id: `achievement-${userStats.tasksCompleted}`,
            type: 'achievement',
            title: 'Milestone Reached! 🎉',
            message: `You've completed ${userStats.tasksCompleted} tasks!`,
            priority: 'low',
            timestamp: now,
          });
        }
      }

      // Sort by priority and timestamp
      notifs.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.timestamp - a.timestamp;
      });

      setNotifications(notifs);
      setLoading(false);
    };

    if (isLoaded) {
      generateNotifications();
    }
  }, [tasks, subjects, userStats, isLoaded]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'overdue': return '🔴';
      case 'due_today': return '🟡';
      case 'deadline': return '📅';
      case 'achievement': return '🎉';
      default: return '📢';
    }
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'high': return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' };
      case 'medium': return { bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.3)', text: '#eab308' };
      default: return { bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.3)', text: '#6366f1' };
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (!isLoaded || loading) {
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
            <p style={{ color: "var(--text-muted)" }}>Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay">
        <div className="main-content" style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "8px", color: "var(--text-main)" }}>
                Notifications
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link to="/dashboard" className="action-btn" style={{ padding: "12px 24px" }}>
              ← Back to Dashboard
            </Link>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="glass-panel" style={{ padding: "60px", textAlign: "center" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔔</div>
              <h3 style={{ marginBottom: "8px", color: "var(--text-main)" }}>All Clear!</h3>
              <p style={{ color: "var(--text-muted)" }}>
                You don't have any notifications right now. Keep up the great work!
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {notifications.map((notif) => {
                const colors = getNotificationColor(notif.priority);
                return (
                  <div
                    key={notif.id}
                    className="glass-panel"
                    style={{
                      padding: "24px",
                      borderLeft: `4px solid ${colors.border}`,
                      background: colors.bg,
                      transition: "all 0.3s ease",
                      cursor: notif.taskId ? "pointer" : "default"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(4px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onClick={() => {
                      if (notif.taskId) {
                        window.location.href = `/focus/${notif.taskId}`;
                      }
                    }}
                  >
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                      <div style={{ fontSize: "32px" }}>{getNotificationIcon(notif.type)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <h3 style={{ fontSize: "18px", fontWeight: "700", color: colors.text, margin: 0 }}>
                            {notif.title}
                          </h3>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {formatTimestamp(notif.timestamp)}
                          </span>
                        </div>
                        <p style={{ color: "var(--text-main)", margin: 0, fontSize: "15px" }}>
                          {notif.message}
                        </p>
                        {notif.priority === 'high' && (
                          <div style={{ marginTop: "12px", padding: "6px 12px", background: "rgba(239, 68, 68, 0.2)", borderRadius: "8px", display: "inline-block" }}>
                            <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "600" }}>URGENT</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default NotificationsPage;
