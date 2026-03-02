import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "./context";
import Stopwatch from "./Stopwatch";

function FreeMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    tasks, 
    getTaskById, 
    getSubjectById,
    startSession, 
    endSession, 
    activeSession,
    updateTaskStatus 
  } = useApp();
  
  // Get current task
  const currentTask = getTaskById(id);
  const currentSubject = currentTask?.subjectId?._id ? currentTask.subjectId : getSubjectById(currentTask?.subjectId);
  
  // Format tasks for sidebar
  const formattedTasks = tasks.map(task => {
    const subject = task.subjectId?._id ? task.subjectId : getSubjectById(task.subjectId);
    return {
      id: task._id,
      subject: subject?.name || task.title || 'Study Session',
      subjectId: subject?._id || task.subjectId,
      color: subject?.color || '#6366f1',
      time: `${task.estimatedMinutes} min`,
      status: task.status,
      rawTask: task
    };
  });
  
  const activeTask = formattedTasks.find(t => t.id === id) || formattedTasks[0];
  const [theme, setTheme] = useState("blue");

  // Timer State Logic
  const [taskTimes, setTaskTimes] = useState({});
  const [runningTaskId, setRunningTaskId] = useState(null);
  const [notes, setNotes] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const intervalRef = useRef(null);
  const notesTimeoutRef = useRef(null);

  useEffect(() => {
    if (runningTaskId) {
      intervalRef.current = setInterval(() => {
        setTaskTimes((prev) => ({
          ...prev,
          [runningTaskId]: (prev[runningTaskId] || 0) + 1
        }));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [runningTaskId]);

  // Auto-save notes functionality
  useEffect(() => {
    if (notes && activeSession?._id) {
      setSaveStatus("saving");
      
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current);
      }
      
      notesTimeoutRef.current = setTimeout(() => {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(""), 2000);
      }, 2000);
    }
    
    return () => {
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current);
      }
    };
  }, [notes, activeSession]);

  // Load saved notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(`free-notes-${id}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [id]);

  // Save notes to localStorage
  useEffect(() => {
    if (notes) {
      localStorage.setItem(`free-notes-${id}`, notes);
    }
  }, [notes, id]);

  // Auto-switch timer when changing tasks
  useEffect(() => {
    if (activeTask && runningTaskId && runningTaskId !== activeTask.id) {
      setRunningTaskId(activeTask.id);
    }
  }, [activeTask, runningTaskId]);

  const toggleTimer = async () => {
    if (runningTaskId === activeTask?.id) {
      setRunningTaskId(null);
    } else {
      // Start session if not already started
      if (!sessionStarted && activeTask?.subjectId) {
        try {
          await startSession(activeTask.subjectId, 'free', activeTask.id);
          setSessionStarted(true);
        } catch (err) {
          console.error('Error starting session:', err);
          if (err.message?.includes('active session')) {
            setSessionStarted(true);
          }
        }
      }
      setRunningTaskId(activeTask?.id);
    }
  };

  const resetTimer = () => {
    setTaskTimes((prev) => ({ ...prev, [activeTask?.id]: 0 }));
    if (runningTaskId === activeTask?.id) setRunningTaskId(null);
  };

  const handleEndSession = async () => {
    try {
      if (activeSession?._id) {
        await endSession(activeSession._id, notes, activeTask?.id, true);
        // Clear saved notes from localStorage
        localStorage.removeItem(`free-notes-${id}`);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Error ending session:', err);
      navigate('/dashboard');
    }
  };

  // Theme Configs
  const styles = {
    monochrome: {
      bg: "#0a0a0a",
      panelBg: "#171717",
      panelBorder: "1px solid #262626",
      text: "#e5e5e5",
      textMuted: "#a3a3a3",
      accent: "#ffffff",
      sidebarHighlight: "#262626"
    },
    blue: {
      bg: "#020617",
      panelBg: "rgba(30, 41, 59, 0.5)",
      panelBorder: "1px solid rgba(148, 163, 184, 0.2)",
      text: "#bfdbfe",
      textMuted: "#64748b",
      accent: "#60a5fa",
      sidebarHighlight: "rgba(56, 189, 248, 0.15)"
    }
  };

  const currentStyle = styles[theme];

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: currentStyle.bg, color: currentStyle.text, transition: "background 0.3s" }}>
      {/* Header */}
      <div style={{ 
        padding: "16px 24px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        borderBottom: currentStyle.panelBorder
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#93c5fd" }}>Free Mode Workspace</h2>
          {sessionStarted && (
            <span style={{
              fontSize: "12px",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <span style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#10b981",
                animation: "pulse 2s infinite"
              }} />
              Session Active
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => setTheme(theme === "blue" ? "monochrome" : "blue")}
            style={{
              background: "transparent",
              border: `1px solid ${currentStyle.accent}40`,
              color: currentStyle.textMuted,
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            🎨 {theme === "blue" ? "Mono" : "Blue"}
          </button>
          <button
            onClick={handleEndSession}
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              padding: "6px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500"
            }}
          >
            End & Save
          </button>
          <Link to="/dashboard" style={{ color: currentStyle.accent, textDecoration: "none", fontSize: "14px" }}>
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="dashboard-grid" style={{ height: "calc(100vh - 70px)", padding: "24px", gap: "24px" }}>
        
        {/* Sidebar */}
        <div className="left-panel" style={{ 
          background: currentStyle.panelBg, 
          border: currentStyle.panelBorder, 
          borderRadius: "16px",
          padding: "16px",
          overflowY: "auto"
        }}>
          <h3 style={{ fontSize: "14px", marginBottom: "16px", color: currentStyle.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>
            Tasks ({formattedTasks.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {formattedTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => navigate(`/free/${task.id}`)}
                className="sidebar-item"
                style={{ 
                  padding: "12px", 
                  borderRadius: "8px", 
                  background: task.id === activeTask?.id ? currentStyle.sidebarHighlight : "transparent",
                  border: task.id === activeTask?.id ? `1px solid ${currentStyle.accent}` : "1px solid transparent",
                  borderLeft: `4px solid ${task.color}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  transform: task.id === activeTask?.id ? "translateX(4px)" : "none"
                }}
                onMouseEnter={(e) => {
                   if (task.id !== activeTask?.id) {
                     e.target.style.background = "rgba(148, 163, 184, 0.1)";
                     e.target.style.transform = "translateX(2px)";
                   }
                }}
                onMouseLeave={(e) => {
                   if (task.id !== activeTask?.id) {
                     e.target.style.background = "transparent";
                     e.target.style.transform = "none";
                   }
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: "14px", marginBottom: "4px", color: task.id === activeTask?.id ? currentStyle.accent : currentStyle.text }}>
                    {task.subject}
                  </h4>
                  {taskTimes[task.id] > 0 && (
                    <span style={{ fontSize: "11px", color: "#10b981" }}>
                      {Math.floor(taskTimes[task.id] / 60)}:{(taskTimes[task.id] % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "12px", color: currentStyle.textMuted }}>{task.time}</span>
              </div>
            ))}
            
            {formattedTasks.length === 0 && (
              <p style={{ color: currentStyle.textMuted, fontSize: "13px", textAlign: "center", padding: "20px" }}>
                No tasks available
              </p>
            )}
          </div>
        </div>

        {/* Workspace */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", height: "100%" }}>
          
          {/* Timer Card */}
          <div style={{ 
            background: currentStyle.panelBg,
            border: currentStyle.panelBorder,
            borderRadius: "16px",
            padding: "32px", 
            textAlign: "center" 
          }}>
            <div 
              style={{ 
                width: "12px", 
                height: "12px", 
                borderRadius: "50%", 
                background: activeTask?.color || '#6366f1',
                margin: "0 auto 12px",
                boxShadow: `0 0 20px ${activeTask?.color || '#6366f1'}50`
              }} 
            />
            <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>{activeTask?.subject || 'Select a Task'}</h1>
            <p style={{ color: currentStyle.textMuted, marginBottom: "24px" }}>
              {activeTask?.status === 'completed' ? '✅ Completed' : 
               activeTask?.status === 'in_progress' ? '🔄 In Progress' : 
               '⏳ Pending'}
            </p>
            <Stopwatch 
              size="medium" 
              theme={theme} 
              time={taskTimes[activeTask?.id] || 0}
              isRunning={runningTaskId === activeTask?.id}
              onToggle={toggleTimer}
              onReset={resetTimer}
            />
          </div>

          {/* Notes Card */}
          <div style={{ 
            flex: 1, 
            background: currentStyle.panelBg,
            border: currentStyle.panelBorder,
            borderRadius: "16px",
            padding: "24px" 
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "16px", margin: 0, color: currentStyle.textMuted }}>Quick Notes</h3>
              {saveStatus && (
                <span style={{
                  fontSize: "11px",
                  color: saveStatus === "saved" ? "#10b981" : "#f59e0b",
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}>
                  {saveStatus === "saved" ? "✓ Saved" : "Saving..."}
                </span>
              )}
            </div>
            <textarea 
              placeholder="Jot down quick thoughts... These will be saved when you end the session." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ 
                width: "100%", 
                height: "calc(100% - 40px)", 
                background: "transparent", 
                border: "none", 
                color: currentStyle.text, 
                resize: "none", 
                outline: "none",
                fontSize: "15px",
                lineHeight: "1.5"
              }}
            />
          </div>

        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default FreeMode;
