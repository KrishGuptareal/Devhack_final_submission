import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "./context";
import Stopwatch from "./Stopwatch";

function FocusMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getTaskById, 
    getSubjectById,
    startSession, 
    endSession, 
    activeSession,
    updateTaskStatus,
    tasks,
    tasksLoading,
    subjects,
    subjectsLoading,
    fetchSubjects,
    checkActiveSession,
    syncUser,
    sessionFileUrl,
    uploadSessionFile,
    deleteSessionFile
  } = useApp();
  
  // Get task from context - use useMemo to prevent unnecessary recalculations
  const task = useMemo(() => getTaskById(id), [getTaskById, id, tasks]);
  const subject = useMemo(() => {
    if (!task) return null;
    const taskSubId = task.subjectId?._id || task.subjectId || task.subject?._id || task.subject;
    if (!taskSubId) return null;
    return subjects.find(s => s._id === taskSubId) || getSubjectById(taskSubId);
  }, [task, subjects, getSubjectById]);
  
  // Local state
  const [isEndHovered, setIsEndHovered] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [focusTime, setFocusTime] = useState(0); // Actual seconds focused
  const timerRef = useRef(null);
  
  // File upload state (pending file before session starts)
  const [pendingFile, setPendingFile] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Derive task info
  const taskInfo = {
    subject: subject?.name || task?.title || "Focus Session",
    time: task?.estimatedMinutes ? `${task.estimatedMinutes} min` : "Unlimited",
    color: subject?.color || "#6366f1"
  };

  // Combined effect to check and auto-resume session if possible
  useEffect(() => {
    if (tasksLoading) return;

    const checkExisting = async () => {
      try {
        const session = await checkActiveSession();
        if (session && (session.taskId === id || !session.taskId)) {
          // If a session exists for this task (or no task ID), we can enter
          // But we don't auto-set started because we NEED the user gesture for fullscreen
          console.log("Found relevant active session.");
        }
      } catch (err) {
        console.error("Error checking for existing session:", err);
      }
    };

    checkExisting();
  }, [tasksLoading, checkActiveSession, id]);

  // Timer logic for accurate focus time tracking
  useEffect(() => {
    if (sessionStarted && !isInterrupted) {
      timerRef.current = setInterval(() => {
        setFocusTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionStarted, isInterrupted]);

  // Initialize focusTime from activeSession if resuming
  useEffect(() => {
    if (activeSession && sessionStarted && focusTime === 0) {
      // If we're resuming, we can estimate focus time from start time
      // or start from 0 if it's a fresh session.
    }
    
    // Safety check: specific file fetch for this session
    if (activeSession && sessionStarted) {
      const fetchFiles = async () => {
        try {
          // We can use the context method which internally calls the API
          // Since checkActiveSession updates sessionFileUrl, we can just trigger that
          await checkActiveSession();
          console.log("Forced session file check for session:", activeSession._id);
        } catch (e) {
          console.error("Error fetching session files:", e);
        }
      };
      
      // Delay slightly to ensure backend processing if just uploaded
      setTimeout(fetchFiles, 1000);
    }
  }, [activeSession?._id, sessionStarted]);

  // Handle start session (requires user gesture for fullscreen)
  const handleStartSession = async () => {
    // Basic validation
    if (loading || sessionStarted) return;
    
    // Diagnostic Log
    console.log("Starting focus session diagnostic...");
    console.log("Task:", task?.title);
    console.log("Subjects Array:", subjects);
    console.log("Subjects Count:", subjects?.length);

    if (!task) {
      setError("Task data not loaded yet. Please wait.");
      return;
    }

    // EXTRA FAIL-SAFE: If subjects are empty, try one last fetch before giving up
    let sessionSubjects = subjects;
    if (!sessionSubjects || sessionSubjects.length === 0) {
      console.log("Subjects empty in cache. Force fetching subjects...");
      try {
        await fetchSubjects();
        // Since subjects is a state from context, we need to use the fresh data if possible
        // But context set state won't be immediate in this closure. 
        // We'll rely on the next attempt if this fails.
      } catch (e) {
        console.error("Force fetch failed:", e);
      }
    }

    // 1. ULTRA-RESILIENT SUBJECT ID EXTRACTION
    let finalSubjectId = null;

    // A. Check if the 'subject' object from useMemo found it
    if (subject?._id) {
      finalSubjectId = subject._id;
      console.log("Found subject ID via memo:", finalSubjectId);
    }

    // B. Check raw task fields
    if (!finalSubjectId) {
      const paths = [
        task.subjectId?._id,
        task.subjectId,
        task.subject?._id,
        task.subject,
        task.subject_id
      ];
      finalSubjectId = paths.find(p => typeof p === 'string' && p.length > 10);
      if (finalSubjectId) console.log("Found subject ID via path discovery:", finalSubjectId);
    }

    // C. AGGRESSIVE TEXT MATCHING RECOVERY (with fresh subjects if possible)
    const currentSubjects = subjects || [];
    if (!finalSubjectId && currentSubjects.length > 0) {
      console.log("Applying text-matching recovery against subjects:", currentSubjects.map(s => s.name));
      const searchStr = (task.title + " " + (task.subject || "")).toLowerCase();
      
      const matched = currentSubjects.find(s => {
        const name = s.name?.toLowerCase();
        if (!name) return false;
        return searchStr.includes(name) || name.includes(task.title?.split(' ')[0].toLowerCase());
      });

      if (matched) {
        finalSubjectId = matched._id;
        console.log("Matched via text recovery:", matched.name);
      }
    }

    // D. THE "SAFETY NET" FALLBACK
    if (!finalSubjectId && currentSubjects.length > 0) {
      console.warn("Total recovery failure. Using first available subject as definitive safety net.");
      finalSubjectId = currentSubjects[0]._id;
      console.log("Safety net selected subject:", currentSubjects[0].name);
    }
                    
    if (!finalSubjectId) {
      const dbgMsg = `No subjects found in account. (Tasks Loaded: ${!!tasks}, Tasks Count: ${tasks?.length}, Subjects Loading: ${subjectsLoading})`;
      setError(`CRITICAL ERROR: ${dbgMsg} Please ensure you have subjects created first.`);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Request Fullscreen
      if (containerRef.current && !document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      }

      // 2. Start API Session
      console.log("PROCEEDING TO BACKEND: startSession with SubId:", finalSubjectId);
      const newSession = await startSession(finalSubjectId, 'focus', id);
      setSessionStarted(true);
      setError(null);
      
      // 3. Upload pending file if exists
      if (pendingFile && newSession?._id) {
        setFileUploading(true);
        try {
          await uploadSessionFile(newSession._id, pendingFile);
          console.log("Study material uploaded successfully");
        } catch (uploadErr) {
          console.warn("Could not upload study material:", uploadErr);
          // Don't fail the session start for file upload errors
        } finally {
          setFileUploading(false);
          setPendingFile(null);
        }
      }
      
      // 4. Sync State
      await checkActiveSession();
      await syncUser();
    } catch (err) {
      console.error('Error starting focus session:', err);
      const errorMsg = err.message || '';
      if (errorMsg.includes('active session') || errorMsg.includes('already have')) {
        setSessionStarted(true);
        setError(null);
        
        // Recover session and upload pending file if needed
        try {
          const recoveredSession = await checkActiveSession();
          
          if (pendingFile && recoveredSession?._id) {
            setFileUploading(true);
            try {
              await uploadSessionFile(recoveredSession._id, pendingFile);
              console.log("Study material uploaded to recovered session");
            } catch (uploadErr) {
              console.warn("Could not upload study material:", uploadErr);
            } finally {
              setFileUploading(false);
              setPendingFile(null);
            }
          }
        } catch (recoveryErr) {
          console.error("Error during session recovery:", recoveryErr);
        }
      } else {
        setError(errorMsg || 'Failed to enter Focus Mode. Please try again.');
        if (document.fullscreenElement) {
          try { await document.exitFullscreen(); } catch (e) {}
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Tab restriction and interruption logic
  useEffect(() => {
    if (!sessionStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !isEnding) {
        setIsInterrupted(true);
      }
    };

    const handleBlur = () => {
      if (!isEnding) {
        setIsInterrupted(true);
      }
    };

    const handleBeforeUnload = (e) => {
      if (sessionStarted && !isEnding) {
        e.preventDefault();
        e.returnValue = "STRICT FOCUS ACTIVE: Leaving now will abandon your session and you will lose all progress and XP. Are you sure?";
        return e.returnValue;
      }
    };

    // Aggressive Fullscreen Monitoring
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && sessionStarted && !isInterrupted && !isEnding) {
        setIsInterrupted(true);
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      // NOTE: exitFullscreen is handled in a separate effect to avoid race conditions on resume
    };
  }, [sessionStarted, isInterrupted, isEnding]);

  // Dedicated unmount cleanup for fullscreen
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const resumeSession = async () => {
    try {
      if (containerRef.current && !document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      }
      setIsInterrupted(false);
    } catch (err) {
      console.warn("Fullscreen request failed during resume:", err);
      setIsInterrupted(false); // Still resume even if fullscreen fails
    }
  };

  // Handle ending the session
  const handleEndSession = async () => {
    if (isEnding) return;
    
    // Calculate if task should be marked as completed (at least 50% of estimated time)
    let markAsCompleted = true;
    const durationMinutes = focusTime / 60;
    const estimatedMinutes = task?.estimatedMinutes || 0;

    if (estimatedMinutes > 0 && durationMinutes < (estimatedMinutes / 2)) {
      markAsCompleted = false;
      console.log(`Actual focus (${durationMinutes.toFixed(1)}m) is less than half of estimate (${estimatedMinutes}m).`);
      
      if (!window.confirm(`You've only focused for ${Math.floor(durationMinutes)} minutes (${Math.floor((durationMinutes/estimatedMinutes)*100)}% of target). The task will NOT be marked as completed. End session anyway?`)) {
        return;
      }
    }

    setIsEnding(true);
    try {
      if (activeSession?._id) {
        await endSession(activeSession._id, "", id, markAsCompleted);
        // Notes feature removed, no localStorage cleanup needed
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Error ending session:', err);
      setError(err.message);
      // Navigate anyway after a delay
      setTimeout(() => navigate('/dashboard'), 1500);
    } finally {
      setIsEnding(false);
    }
  };

  // Show loading state while tasks or subjects are loading
  if (tasksLoading || subjectsLoading) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          background: "#0a0a0a",
          color: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "24px"
        }}
      >
        <div style={{
          width: "40px",
          height: "40px",
          border: "3px solid rgba(99, 102, 241, 0.2)",
          borderTop: "3px solid #6366f1",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <p style={{ color: "#737373", fontSize: "14px" }}>Loading session...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show error state if task not found
  if (!task) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          background: "#0a0a0a",
          color: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "24px"
        }}
      >
        <p style={{ color: "#ef4444", fontSize: "16px" }}>Task not found</p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: "12px 24px",
            background: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600"
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: "100vh",
        width: "100vw",
        background: "#0a0a0a",
        color: "#f5f5f5",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        overflow: "hidden"
      }}
    >
      {/* Top Bar - Minimalist */}
      <div style={{
        textAlign: "center",
        padding: "32px",
        borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div 
          style={{ 
            width: "12px", 
            height: "12px", 
            borderRadius: "50%", 
            background: taskInfo.color,
            margin: "0 auto 12px",
            boxShadow: `0 0 20px ${taskInfo.color}50`
          }} 
        />
        <h1 style={{ fontSize: "24px", fontWeight: "500", letterSpacing: "2px", color: "#d4d4d4" }}>
          {taskInfo.subject}
        </h1>
        <p style={{ color: "#737373", fontSize: "14px", marginTop: "8px" }}>
          TARGET: {taskInfo.time}
        </p>
        {error && (
          <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "8px" }}>
            {error}
          </p>
        )}
      </div>

      {/* Center Content */}
      <div style={{ display: "grid", gridTemplateColumns: "35% 65%", height: "100%" }}>

        {/* Stopwatch Zone - Pure Focus */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          background: "radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 70%)"
        }}>
          <Stopwatch 
            size="large" 
            monochrome={true} 
            hideControls={false} 
            isRunning={sessionStarted && !isInterrupted}
            time={focusTime}
            isControlled={true}
            onToggle={() => {
              // Toggle interruption state to pause/resume
              setIsInterrupted(!isInterrupted);
            }}
            onReset={() => {
              handleEndSession();
            }}
          />
          <p style={{ 
            marginTop: "40px", 
            color: sessionStarted ? "#10b981" : "#525252", 
            fontSize: "12px", 
            letterSpacing: "4px", 
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            {sessionStarted && (
              <span style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10b981",
                animation: "pulse 2s infinite"
              }} />
            )}
            {sessionStarted ? "Session Active" : "Starting Session..."}
          </p>
        </div>

        {/* Side Panel (Study Material Only) - Dark Grey */}
        <div style={{ padding: "24px", background: "#171717", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{
              color: "#a3a3a3",
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              margin: 0
            }}>📚 Study Material</h3>
            
            {/* Remove Button */}
            {sessionFileUrl && (
              <button
                onClick={() => {
                  if (activeSession?._id && sessionFileUrl) {
                    deleteSessionFile(activeSession._id, sessionFileUrl);
                  }
                }}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "4px",
                  fontSize: "12px",
                  cursor: "pointer",
                  padding: "6px 12px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.background = "rgba(239, 68, 68, 0.2)"}
                onMouseLeave={(e) => e.target.style.background = "rgba(239, 68, 68, 0.1)"}
              >
                Remove File
              </button>
            )}
          </div>

          <div style={{ 
            flex: 1, 
            background: "#262626", 
            borderRadius: "12px", 
            border: "1px solid #404040", 
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            position: "relative"
          }}>
            {fileUploading ? (
              <div style={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <div style={{ 
                  width: "40px", 
                  height: "40px", 
                  border: "4px solid #404040",
                  borderTop: "4px solid #6366f1",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "16px"
                }} />
                <p style={{ color: "#d4d4d4", fontSize: "16px" }}>Uploading your file...</p>
              </div>
            ) : sessionFileUrl ? (
              <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                {/* File Viewer Area */}
                <div style={{ flex: 1, position: "relative", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {(sessionFileUrl.toLowerCase().includes('.jpg') || 
                    sessionFileUrl.toLowerCase().includes('.jpeg') || 
                    sessionFileUrl.toLowerCase().includes('.png') || 
                    sessionFileUrl.toLowerCase().includes('.gif') || 
                    sessionFileUrl.toLowerCase().includes('.webp') ||
                    sessionFileUrl.includes('/image/')) ? (
                    <img 
                      src={sessionFileUrl} 
                      alt="Study material" 
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "contain",
                      }}
                    />
                  ) : (sessionFileUrl.toLowerCase().includes('.pdf') || sessionFileUrl.includes('/raw/')) ? (
                    <iframe
                      src={sessionFileUrl}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        background: "#ffffff"
                      }}
                      title="Study Material PDF"
                    />
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                      <div style={{ fontSize: "64px", marginBottom: "24px" }}>📄</div>
                      <p style={{ color: "#d4d4d4", fontSize: "18px", marginBottom: "8px" }}>Document Uploaded</p>
                      <p style={{ color: "#737373", fontSize: "14px" }}>This file type cannot be previewed directly.</p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div style={{ 
                  padding: "16px", 
                  background: "#1f1f1f", 
                  borderTop: "1px solid #404040",
                  display: "flex",
                  justifyContent: "center"
                }}>
                  <a 
                    href={sessionFileUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 24px",
                      background: "#3b82f6",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "600",
                      textDecoration: "none",
                      borderRadius: "6px",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#2563eb"}
                    onMouseLeave={(e) => e.target.style.background = "#3b82f6"}
                  >
                    <span>Open in New Tab</span>
                    <span style={{ fontSize: "16px" }}>↗</span>
                  </a>
                </div>
              </div>
            ) : pendingFile ? (
              <div style={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                padding: "40px",
                textAlign: "center"
              }}>
                <div style={{ 
                  fontSize: "64px", 
                  marginBottom: "24px",
                  opacity: 0.5 
                }}>⏳</div>
                <h3 style={{ color: "#d4d4d4", fontSize: "20px", marginBottom: "8px" }}>
                  File Pending
                </h3>
                <p style={{ color: "#10b981", fontSize: "16px", fontWeight: "500", marginBottom: "8px" }}>
                  {pendingFile.name}
                </p>
                <p style={{ color: "#737373", fontSize: "14px" }}>
                  Upload will start automatically...
                </p>
              </div>
            ) : (
              <div style={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                padding: "40px",
                textAlign: "center"
              }}>
                <div style={{ 
                  fontSize: "64px", 
                  marginBottom: "24px", 
                  opacity: 0.2 
                }}>📚</div>
                <p style={{ color: "#525252", fontSize: "16px" }}>
                  No study material uploaded.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar - Deliberate Exit */}
      <div style={{ padding: "32px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button
          onClick={handleEndSession}
          disabled={isEnding}
          onMouseEnter={() => setIsEndHovered(true)}
          onMouseLeave={() => setIsEndHovered(false)}
          style={{
            background: "transparent",
            color: isEndHovered ? "#f5f5f5" : "#737373",
            borderColor: isEndHovered ? "#f5f5f5" : "#404040",
            border: "1px solid",
            padding: "12px 32px",
            borderRadius: "30px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: isEnding ? "not-allowed" : "pointer",
            opacity: isEnding ? 0.5 : 1,
            transform: isEndHovered && !isEnding ? "scale(1.1)" : "scale(1)",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}
        >
          {isEnding ? "Ending Session..." : "End Session"}
        </button>
      </div>
      
      {/* Start Focus Overlay - User Gesture Required */}
      {!sessionStarted && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.95)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(15px)"
        }}>
          <h1 style={{ color: "#fff", marginBottom: "24px", fontSize: "42px", fontWeight: "700" }}>Focus Ready?</h1>
          
          {/* File Upload Zone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files[0];
              if (file) setPendingFile(file);
            }}
            style={{
              width: "400px",
              maxWidth: "90%",
              padding: "24px",
              border: pendingFile ? "2px solid #10b981" : "2px dashed #525252",
              borderRadius: "16px",
              background: pendingFile ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 255, 255, 0.03)",
              cursor: "pointer",
              textAlign: "center",
              marginBottom: "32px",
              transition: "all 0.3s ease"
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPendingFile(file);
              }}
            />
            {pendingFile ? (
              <div>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📄</div>
                <p style={{ color: "#10b981", fontWeight: "600", marginBottom: "4px" }}>
                  {pendingFile.name}
                </p>
                <p style={{ color: "#737373", fontSize: "12px", marginBottom: "12px" }}>
                  {(pendingFile.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  style={{
                    padding: "6px 16px",
                    background: "rgba(239, 68, 68, 0.2)",
                    color: "#ef4444",
                    border: "1px solid #ef4444",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "500"
                  }}
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📁</div>
                <p style={{ color: "#a3a3a3", fontWeight: "500", marginBottom: "4px" }}>
                  Upload Study Material (Optional)
                </p>
                <p style={{ color: "#525252", fontSize: "12px" }}>
                  Click or drag a file • PDF, Images, Documents
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleStartSession}
            disabled={loading || fileUploading}
            style={{
              padding: "24px 64px",
              background: (loading || fileUploading) ? "#404040" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              border: "none",
              borderRadius: "50px",
              fontSize: "24px",
              fontWeight: "700",
              cursor: (loading || fileUploading) ? "not-allowed" : "pointer",
              boxShadow: (loading || fileUploading) ? "none" : "0 0 50px rgba(99, 102, 241, 0.4)",
              transition: "all 0.2s",
              opacity: (loading || fileUploading) ? 0.7 : 1
            }}
            onMouseEnter={(e) => !(loading || fileUploading) && (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => !(loading || fileUploading) && (e.target.style.transform = "scale(1)")}
          >
            {loading ? "Starting Focus..." : fileUploading ? "Uploading File..." : "Start Focus Session 🚀"}
          </button>
          <p style={{ color: "#737373", marginTop: "24px", fontSize: "16px" }}>
            This will enter fullscreen and lock distractions.
          </p>
          {error && (
            <div style={{ 
              marginTop: "32px", 
              padding: "16px 24px", 
              background: "rgba(239, 68, 68, 0.1)", 
              border: "1px solid #ef4444", 
              borderRadius: "12px",
              color: "#ef4444",
              fontSize: "14px",
              maxWidth: "400px",
              textAlign: "center"
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      {/* Interruption Overlay - UNBREAKABLE BLOCKER */}
      {isInterrupted && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.98)", // Almost pure black
          zIndex: 9999, // Ensure it's on top of EVERYTHING
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          backdropFilter: "blur(20px)"
        }}>
          <div style={{ fontSize: "64px" }}>🔒</div>
          <h2 style={{ color: "#f5f5f5", fontSize: "36px", fontWeight: "700", textAlign: "center", marginBottom: "8px" }}>Focus Locked</h2>
          <p style={{ color: "#a3a3a3", fontSize: "18px", textAlign: "center", maxWidth: "500px", lineHeight: "1.6" }}>
            You switched tabs or left fullscreen. <br/>
            <strong>Strict Focus Mode</strong> is active. You must return to focus to continue earning XP.
          </p>
          <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
            <button
              onClick={resumeSession}
              style={{
                padding: "18px 48px",
                background: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "30px",
                fontSize: "18px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
              Resume Focus
            </button>
            <button
              onClick={() => {
                if (window.confirm("Abandoning focus will lose all progress. End session anyway?")) {
                  handleEndSession();
                }
              }}
              style={{
                padding: "12px 24px",
                background: "transparent",
                color: "#737373",
                border: "1px solid #404040",
                borderRadius: "30px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer"
              }}
            >
              Abandon Session
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default FocusMode;