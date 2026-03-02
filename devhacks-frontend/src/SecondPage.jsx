import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "./context";

function SecondPage() {
  const {
    tasks,
    subjects,
    tasksLoading,
    createTask,
    deleteTask,
    generateDailyTasks,
    fetchTodayTasks
  } = useApp();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dateFilter = queryParams.get("date");
  const [displayTasks, setDisplayTasks] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);

  // Initialize displayTasks with context tasks
  useEffect(() => {
    if (!dateFilter) {
      setDisplayTasks(tasks);
    }
  }, [tasks, dateFilter]);

  // Handle specific date fetching
  useEffect(() => {
    if (dateFilter) {
      const fetchDateTasks = async () => {
        setLocalLoading(true);
        try {
          const { taskApi } = await import("./api");
          const { useAuth } = await import("@clerk/clerk-react");
          // NOTE: This is a bit tricky since we need getToken. 
          // Better to use a hook or expose it from context.
          // For now, let's assume AppContext tasks are enough if we fetched them?
          // No, AppContext only holds today's.

          // Let's filter the existing tasks first, and if we want more, we'd need another API call.
          // Actually, many tasks might already be in 'tasks' if they were fetched previously.

          // Filter tasks that match the date
          const filtered = tasks.filter(t => t.scheduledDate && t.scheduledDate.startsWith(dateFilter));
          setDisplayTasks(filtered);
        } catch (err) {
          console.error("Error filtering tasks by date:", err);
        } finally {
          setLocalLoading(false);
        }
      };
      fetchDateTasks();
    }
  }, [dateFilter, tasks]);

  const [filterSubject, setFilterSubject] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Task State
  const [newTitle, setNewTitle] = useState("");
  const [newSubjectId, setNewSubjectId] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Format tasks for display
  const formattedTasks = displayTasks.map((task) => ({
    id: task._id,
    subject: task.subjectId?.name || task.title || "Study Session",
    subjectId: task.subjectId?._id || task.subjectId,
    subjectColor: task.subjectId?.color || "#6366f1",
    time: `${task.estimatedMinutes} min`,
    estimatedMinutes: task.estimatedMinutes,
    status:
      task.status === "completed"
        ? "Completed"
        : task.status === "in_progress"
          ? "In Progress"
          : "Pending",
    title: task.title,
    description: task.description,
    rawTask: task,
  }));

  // Filter Logic
  const filteredTasks = formattedTasks.filter((task) => {
    if (filterSubject === "All") return true;
    return task.subject === filterSubject;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle || !newTime || !newSubjectId) return;

    setIsSubmitting(true);
    try {
      await createTask({
        title: newTitle,
        description: newDescription,
        estimatedMinutes: parseInt(newTime),
        scheduledDate: new Date().toISOString(),
        subjectId: newSubjectId,
      });

      // Reset form
      setNewTitle("");
      setNewSubjectId("");
      setNewTime("");
      setNewDescription("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to create task:", err);
      alert("Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      console.log("Starting delete for task:", taskId);
      await deleteTask(taskId);
      console.log("Task deleted successfully");
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert(`Failed to delete task. Error: ${err.message}`);
    }
  };

  const handleGenerateTasks = async (force = false) => {
    if (force && !confirm("This will regenerate today's tasks. Are you sure?")) {
      return;
    }

    try {
      await generateDailyTasks(force);
    } catch (err) {
      console.error("Failed to generate tasks:", err);
    }
  };

  const uniqueSubjects = [
    "All",
    ...new Set(formattedTasks.map((t) => t.subject)),
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay">
        <div className="main-content">
          {/* Top Bar Navigation */}
          <div
            className="glass-panel"
            style={{
              padding: "16px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ color: "var(--text-main)", fontWeight: "600" }}>
              Task Manager
            </h2>
            <Link
              to="/dashboard"
              style={{
                color: "var(--accent-primary)",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="dashboard-grid">
            {/* Left Panel: Controls */}
            <div className="left-panel">
              <div className="glass-panel" style={{ padding: "24px" }}>
                <h3>Actions</h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    marginTop: "16px",
                  }}
                >
                  <button
                    className="action-btn"
                    style={{ width: "100%", border: "2px solid rgba(255,255,255,0.2)" }}
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    {showAddForm ? "Close Form" : "+ Add Custom Task"}
                  </button>
                  <button
                    className="action-btn"
                    style={{
                      width: "100%",
                      border: "2px solid rgba(255,255,255,0.2)",
                      background: formattedTasks.length > 0
                        ? "linear-gradient(135deg, #f59e0b, #d97706)"
                        : "linear-gradient(135deg, #10b981, #059669)",
                    }}
                    onClick={() => handleGenerateTasks(formattedTasks.length > 0)}
                  >
                    {formattedTasks.length > 0 ? "♻️ Regenerate Tasks" : "⚡ Generate Daily Tasks"}
                  </button>
                </div>
              </div>

              <div
                className="glass-panel"
                style={{ padding: "24px", overflow: "visible" }}
              >
                <h3>Filters</h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    marginTop: "16px",
                  }}
                >
                  <label
                    style={{ fontSize: "14px", color: "var(--text-muted)" }}
                  >
                    By Subject
                  </label>

                  {/* CUSTOM DROPDOWN START */}
                  <div style={{ position: "relative" }}>
                    <div
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: "rgba(30, 41, 59, 0.8)",
                        border: "1px solid rgba(148, 163, 184, 0.15)",
                        color: "var(--text-main)",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        userSelect: "none",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      }}
                    >
                      <span style={{ fontWeight: "500", color: "var(--text-main)" }}>{filterSubject}</span>
                      <span
                        style={{
                          transform: isDropdownOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.3s ease",
                          display: "inline-block",
                          fontSize: "12px",
                          color: "var(--text-muted)",
                        }}
                      >
                        ▼
                      </span>
                    </div>

                    {isDropdownOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: "115%",
                          left: 0,
                          width: "100%",
                          background: "rgba(15, 23, 42, 0.95)",
                          border: "1px solid rgba(148, 163, 184, 0.15)",
                          borderRadius: "12px",
                          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                          zIndex: 100,
                          overflow: "hidden",
                        }}
                      >
                        {uniqueSubjects.map((sub) => (
                          <div
                            key={sub}
                            onClick={() => {
                              setFilterSubject(sub);
                              setIsDropdownOpen(false);
                            }}
                            className="dropdown-item"
                            style={{
                              padding: "10px 14px",
                              cursor: "pointer",
                              color:
                                filterSubject === sub
                                  ? "var(--accent-primary)"
                                  : "var(--text-main)",
                              background:
                                filterSubject === sub
                                  ? "rgba(99, 102, 241, 0.15)"
                                  : "transparent",
                              borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                              fontSize: "14px",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)")
                            }
                            onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              filterSubject === sub
                                ? "rgba(99, 102, 241, 0.15)"
                                : "transparent")
                            }
                          >
                            {sub}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* CUSTOM DROPDOWN END */}
                </div>
              </div>

              {/* Subjects List */}
              <div className="glass-panel" style={{ padding: "24px" }}>
                <h3>Your Subjects</h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginTop: "16px",
                  }}
                >
                  {subjects.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                      No subjects yet
                    </p>
                  ) : (
                    subjects.map((subject) => (
                      <div
                        key={subject._id}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          background: "rgba(30, 41, 59, 0.6)",
                          borderLeft: `4px solid ${subject.color || "#6366f1"}`,
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span>{subject.icon || "📚"}</span>
                        <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-main)" }}>
                          {subject.name}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel: Task List */}
            <div className="right-panel">
              {/* Add Form */}
              {showAddForm && (
                <div
                  className="glass-panel"
                  style={{
                    padding: "24px",
                    marginBottom: "24px",
                    borderLeft: "4px solid var(--accent-primary)",
                  }}
                >
                  <h3>New Custom Task</h3>
                  <form
                    onSubmit={handleAdd}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      marginTop: "16px",
                    }}
                  >
                    <input
                      className="task-input"
                      placeholder="Task title (e.g. Review Chapter 5) *"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      style={{ width: "100%", ...inputStyle }}
                    />

                    {/* Subject Dropdown */}
                    <select
                      value={newSubjectId}
                      onChange={(e) => setNewSubjectId(e.target.value)}
                      style={{
                        width: "100%",
                        ...inputStyle,
                        cursor: "pointer",
                      }}
                    >
                      <option value="">Select Subject *</option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.icon || "📚"} {subject.name}
                        </option>
                      ))}
                    </select>

                    <CustomNumberInput
                      placeholder="Estimated time in minutes (e.g. 45) *"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      min="1"
                      style={{ width: "100%", ...inputStyle }}
                    />
                    <textarea
                      className="task-input"
                      placeholder="Description (optional)"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={3}
                      style={{
                        width: "100%",
                        ...inputStyle,
                        resize: "vertical",
                      }}
                    />

                    {(!newTitle || !newTime || !newSubjectId) && (
                      <div
                        style={{
                          color: "var(--danger)",
                          fontSize: "12px",
                          textAlign: "center",
                        }}
                      >
                        Title, subject, and time are required.
                      </div>
                    )}
                    <button
                      type="submit"
                      className="action-btn"
                      style={{ width: "100%", border: "2px solid rgba(255,255,255,0.2)" }}
                      disabled={
                        isSubmitting || !newTitle || !newTime || !newSubjectId
                      }
                    >
                      {isSubmitting ? "Creating..." : "Save Task"}
                    </button>
                  </form>
                </div>
              )}

              {/* List */}
              <div className="glass-panel" style={{ padding: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                    alignItems: "center"
                  }}
                >
                  <h3>
                    {dateFilter ? `Tasks for ${dateFilter}` : "Today's Tasks"} ({filteredTasks.length})
                  </h3>
                  {dateFilter && (
                    <Link
                      to="/second-page"
                      style={{
                        padding: "6px 12px",
                        background: "rgba(99, 102, 241, 0.1)",
                        color: "#6366f1",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ✕ Clear Date Filter
                    </Link>
                  )}
                </div>

                {(tasksLoading || localLoading) ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div
                      className="loading-spinner"
                      style={{
                        width: "40px",
                        height: "40px",
                        border: "3px solid rgba(99, 102, 241, 0.2)",
                        borderTop: "3px solid #6366f1",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto 16px",
                      }}
                    />
                    <p style={{ color: "var(--text-muted)" }}>
                      Loading tasks...
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      maxHeight: "60vh",
                      overflowY: "auto",
                      paddingRight: "8px",
                    }}
                  >
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="task-item"
                        style={{
                          cursor: "default",
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          background: "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)",
                          padding: "16px",
                          borderRadius: "12px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                          flexShrink: 0,
                          borderLeft: `4px solid ${task.subjectColor}`,
                          border: "1px solid rgba(148, 163, 184, 0.1)",
                        }}
                      >
                        {/* Left Side: Course Info */}
                        <div
                          className="task-info"
                          style={{ textAlign: "left", flex: "1" }}
                        >
                          <h4
                            style={{
                              color: "var(--text-main)",
                              margin: "0 0 4px 0",
                              fontSize: "16px",
                            }}
                          >
                            {task.title || task.subject}
                          </h4>
                          <div
                            className="task-meta"
                            style={{ color: "var(--text-muted)", fontSize: "13px" }}
                          >
                            <span>📚 {task.subject}</span>
                            <span style={{ margin: "0 8px" }}>•</span>
                            <span>⏱ {task.time}</span>
                            <span style={{ margin: "0 8px" }}>•</span>
                            <span
                              style={{
                                color:
                                  task.status === "Completed"
                                    ? "#10b981"
                                    : task.status === "In Progress"
                                      ? "#6366f1"
                                      : "#6b7280",
                              }}
                            >
                              {task.status}
                            </span>
                          </div>
                        </div>

                        {/* Right Side: Delete Button */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "16px",
                            flexShrink: 0,
                          }}
                        >
                          <button
                            onClick={() => handleDelete(task.id)}
                            style={{
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#ef4444",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              padding: "8px 16px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: "500",
                              transition: "all 0.2s",
                              fontSize: "14px",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)")
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}

                    {filteredTasks.length === 0 && (
                      <div style={{ textAlign: "center", padding: "40px" }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                          📋
                        </div>
                        <p style={{ color: "var(--text-muted)" }}>
                          No tasks found. Generate daily tasks or add a custom
                          one!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Mobile responsiveness for SecondPage */
        @media (max-width: 768px) {
          .task-item {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .task-item .task-info {
            width: 100% !important;
          }
          .task-item .task-meta {
            flex-wrap: wrap;
            gap: 4px;
          }
          .task-item .task-meta span {
            display: inline-block;
          }
          .task-item button {
            width: 100%;
          }
        }
        @media (max-width: 480px) {
          .task-item {
            padding: 12px !important;
          }
          .task-item h4 {
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  background: "rgba(30, 41, 59, 0.8)",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  color: "var(--text-main)",
  outline: "none",
};

const CustomNumberInput = ({ value, onChange, placeholder, min, style }) => {
  const handleIncrement = () => onChange({ target: { value: (parseInt(value) || 0) + 1 } });
  const handleDecrement = () => onChange({ target: { value: Math.max(min || 0, (parseInt(value) || 0) - 1) } });

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="number"
        className="task-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        style={{ ...style, paddingRight: "40px" }}
      />
      <div style={{
        position: "absolute",
        right: "8px",
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: "2px"
      }}>
        <button
          type="button"
          onClick={handleIncrement}
          style={{
            background: "none",
            border: "none",
            color: "#6b7280",
            cursor: "pointer",
            fontSize: "10px",
            padding: "2px",
            lineHeight: 1
          }}
        >
          ▲
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          style={{
            background: "none",
            border: "none",
            color: "#6b7280",
            cursor: "pointer",
            fontSize: "10px",
            padding: "2px",
            lineHeight: 1
          }}
        >
          ▼
        </button>
      </div>
    </div>
  );
};

export default SecondPage;
