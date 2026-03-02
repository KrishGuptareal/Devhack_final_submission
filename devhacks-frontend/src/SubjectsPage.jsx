import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "./context";

// Emoji picker options
const EMOJIS = ['📚', '📐', '🔬', '💻', '🎨', '📊', '🌍', '🎵', '⚗️', '🧮', '📖', '✏️', '🎓', '🧬', '⚡', '🔢'];

// Color options
const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

function SubjectsPage() {
  const {
    subjects,
    subjectsLoading,
    createSubject,
    updateSubject,
    deleteSubject
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📚");
  const [color, setColor] = useState("#6366f1");
  const [dailyTime, setDailyTime] = useState(45);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineType, setDeadlineType] = useState("exam");
  const [workloadMultiplier, setWorkloadMultiplier] = useState(1.0);

  const resetForm = () => {
    setName("");
    setIcon("📚");
    setColor("#6366f1");
    setDailyTime(45);
    setDeadlineDate("");
    setDeadlineType("exam");
    setWorkloadMultiplier(1.0);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks with specific messages
    if (!name.trim()) {
      alert("Please enter a Subject Name.");
      return;
    }

    // Check for duplicate names
    const isDuplicate = subjects.some(s =>
      s.name.trim().toLowerCase() === name.trim().toLowerCase() &&
      s._id !== editingId
    );

    if (isDuplicate) {
      alert("A subject with this name already exists. Please choose a different name.");
      return;
    }

    if (!dailyTime) {
      alert("Please enter the Daily Study Time.");
      return;
    }
    if (!deadlineDate) {
      alert("Please select a Deadline Date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const subjectData = {
        name,
        icon,
        color,
        dailyTimeCommitment: parseInt(dailyTime),
        deadline: {
          date: new Date(deadlineDate).toISOString(),
          type: deadlineType
        },
        workloadMultiplier: parseFloat(workloadMultiplier)
      };

      if (editingId) {
        await updateSubject(editingId, subjectData);
      } else {
        await createSubject(subjectData);
      }

      resetForm();
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to save subject:', err);
      alert('Failed to save subject. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (subject) => {
    setName(subject.name);
    setIcon(subject.icon || "📚");
    setColor(subject.color || "#6366f1");
    setDailyTime(subject.dailyTimeCommitment || 45);
    setDeadlineDate(subject.deadline?.date ? subject.deadline.date.split('T')[0] : "");
    setDeadlineType(subject.deadline?.type || "exam");
    setWorkloadMultiplier(subject.workloadMultiplier || 1.0);
    setEditingId(subject._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subject? This will also delete all associated tasks.')) return;

    try {
      await deleteSubject(id);
    } catch (err) {
      console.error('Failed to delete subject:', err);
      alert('Failed to delete subject. Please try again.');
    }
  };

  const getDaysUntilDeadline = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay">
        <div className="main-content">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
            <Link to="/dashboard" className="btn-secondary" style={{ padding: "10px 20px", fontSize: "14px", textDecoration: "none", background: "rgba(15, 23, 42, 0.6)" }}>
              ← Back to Dashboard
            </Link>
          </div>
          <div className="subjects-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "0", alignItems: "stretch" }}>

            {/* Left: Subject Form */}
            <div className="glass-panel" style={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3>{editingId ? 'Edit Subject' : 'Add New Subject'}</h3>
                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="action-btn"
                    style={{ padding: "8px 16px", fontSize: "14px" }}
                  >
                    + Add Subject
                  </button>
                )}
              </div>

              {showAddForm && (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Name */}
                  <div>
                    <label style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Mathematics"
                      style={inputStyle}
                    />
                  </div>

                  {/* Icon Picker */}
                  <div>
                    <label style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>
                      Icon
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setIcon(emoji)}
                          style={{
                            width: "40px",
                            height: "40px",
                            fontSize: "20px",
                            borderRadius: "8px",
                            border: icon === emoji ? "2px solid var(--accent-primary)" : "1px solid #e5e7eb",
                            background: icon === emoji ? "rgba(99, 102, 241, 0.1)" : "#fff",
                            cursor: "pointer"
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>
                      Color
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            border: color === c ? "3px solid #1f2937" : "2px solid transparent",
                            background: c,
                            cursor: "pointer",
                            boxShadow: color === c ? "0 0 0 2px #fff" : "none"
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Daily Time Commitment */}
                  <div>
                    <label style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>
                      Daily Study Time (minutes) *
                    </label>
                    <input
                      type="number"
                      value={dailyTime}
                      onChange={(e) => setDailyTime(e.target.value)}
                      min="15"
                      max="480"
                      style={inputStyle}
                    />
                  </div>

                  {/* Deadline */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>
                        Deadline Date *
                      </label>
                      <input
                        type="date"
                        value={deadlineDate}
                        onChange={(e) => setDeadlineDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>
                        Type *
                      </label>
                      <select
                        value={deadlineType}
                        onChange={(e) => setDeadlineType(e.target.value)}
                        style={{ ...inputStyle, cursor: "pointer" }}
                      >
                        <option value="exam">Exam</option>
                        <option value="assignment">Assignment</option>
                      </select>
                    </div>
                  </div>

                  {/* Workload Multiplier */}
                  <div>
                    <label style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>
                      Workload Priority: {workloadMultiplier}x
                    </label>
                    <input
                      type="range"
                      value={workloadMultiplier}
                      onChange={(e) => setWorkloadMultiplier(e.target.value)}
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      style={{ width: "100%" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
                      <span>Lower</span>
                      <span>Normal</span>
                      <span>Higher</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                    <button
                      type="button"
                      onClick={() => { resetForm(); setShowAddForm(false); }}
                      className="btn-secondary"
                      style={{ flex: 1, padding: "12px" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="action-btn"
                      style={{ flex: 1, padding: "12px" }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              )}

              {!showAddForm && (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
                  <p>Click "Add Subject" to create your first subject</p>
                </div>
              )}
            </div>

            {/* Right: Subject List */}
            <div className="glass-panel" style={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}>
              <h3 style={{ marginBottom: "20px" }}>Your Subjects ({subjects.length})</h3>

              {subjectsLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div className="loading-spinner" style={{
                    width: "40px",
                    height: "40px",
                    border: "3px solid rgba(99, 102, 241, 0.2)",
                    borderTop: "3px solid #6366f1",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto"
                  }} />
                </div>
              ) : subjects.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  <p>No subjects yet. Add your first subject to get started!</p>
                </div>
              ) : (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  flex: 1, // Fill available space in the card
                  maxHeight: "70vh", // slightly more room
                  overflowY: "auto",
                  paddingRight: "8px", // a bit more room for scrollbar
                  height: "100%" // force expansion to fill panel
                }}>
                  {subjects.map(subject => {
                    const daysLeft = getDaysUntilDeadline(subject.deadline?.date);
                    const isUrgent = daysLeft !== null && daysLeft <= 7;

                    return (
                      <div
                        key={subject._id}
                        style={{
                          padding: "16px",
                          borderRadius: "12px",
                          background: "#fff",
                          borderLeft: `4px solid ${subject.color || '#6366f1'}`,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                              <span style={{ fontSize: "24px" }}>{subject.icon || '📚'}</span>
                              <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>{subject.name}</h4>
                            </div>
                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", color: "#6b7280" }}>
                                ⏱ {subject.dailyTimeCommitment} min/day
                              </span>
                              {daysLeft !== null && (
                                <span style={{
                                  fontSize: "12px",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  background: isUrgent ? "rgba(239, 68, 68, 0.1)" : "rgba(99, 102, 241, 0.1)",
                                  color: isUrgent ? "#ef4444" : "#6366f1"
                                }}>
                                  {subject.deadline?.type === 'exam' ? '📝' : '📋'} {daysLeft} days left
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleEdit(subject)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid #e5e7eb",
                                background: "#fff",
                                cursor: "pointer",
                                fontSize: "13px"
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(subject._id)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid #fee2e2",
                                background: "#fee2e2",
                                color: "#ef4444",
                                cursor: "pointer",
                                fontSize: "13px"
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Mobile responsiveness for SubjectsPage */
        @media (max-width: 900px) {
          .subjects-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .subjects-grid .glass-panel {
            padding: 16px !important;
          }
        }
        @media (max-width: 480px) {
          .subjects-grid .glass-panel {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  background: "#fff",
  fontSize: "14px",
  outline: "none"
};

export default SubjectsPage;
