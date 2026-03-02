import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "./context";

function GPAStrategizer() {
  const { subjects: contextSubjects = [] } = useApp();
  const [step, setStep] = useState(1);

  // Semester Courses state
  const [semesterCourses, setSemesterCourses] = useState([]);

  // Baseline inputs
  const [userName, setUserName] = useState("");
  const [currentSem, setCurrentSem] = useState(1);
  const [prevCredits, setPrevCredits] = useState("");
  const [currentCGPA, setCurrentCGPA] = useState("");
  const [targetCGPA, setTargetCGPA] = useState("");

  // Results
  const [results, setResults] = useState(null);

  // Initialize semester courses from context if available
  useEffect(() => {
    if (contextSubjects.length > 0 && semesterCourses.length === 0) {
      setSemesterCourses(contextSubjects.map(s => ({
        id: s._id,
        name: s.name,
        icon: s.icon,
        credits: 4, // Default credits
        difficulty: "medium", // easy, medium, hard
        competition: "medium" // low, medium, high
      })));
    }
  }, [contextSubjects]);

  const addManualCourse = () => {
    setSemesterCourses([...semesterCourses, {
      id: Date.now().toString(),
      name: "",
      credits: 4,
      difficulty: "medium",
      competition: "medium",
      isManual: true
    }]);
  };

  const updateCourse = (id, field, value) => {
    setSemesterCourses(prev => prev.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const removeCourse = (id) => {
    setSemesterCourses(prev => prev.filter(c => c.id !== id));
  };

  const calculateStrategy = () => {
    const totalPrevCredits = parseFloat(prevCredits) || 0;
    const cgpa = parseFloat(currentCGPA) || 0;
    const target = parseFloat(targetCGPA) || 0;
    const semesterCredits = semesterCourses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);

    if (!target || !semesterCredits) return;

    const totalCreditsSoFar = totalPrevCredits;
    const totalPointsSoFar = totalCreditsSoFar * cgpa;
    const futureTotalCredits = totalCreditsSoFar + semesterCredits;
    const requiredTotalPoints = futureTotalCredits * target;
    const requiredSemesterPoints = requiredTotalPoints - totalPointsSoFar;
    const requiredSGPA = requiredSemesterPoints / semesterCredits;

    let unreachable = requiredSGPA > 10;
    let underestimated = requiredSGPA < 0;
    let currentTargetPoints = requiredSemesterPoints;
    let maxPossibleCGPA = (totalPointsSoFar + (semesterCredits * 10)) / futureTotalCredits;

    // Adjust target points for logic processing
    if (unreachable) {
      currentTargetPoints = semesterCredits * 10; // Aim for max if unreachable
    }

    // Optimization V7 - Hierarchy-Strict Hill Climbing
    const gradeNames = ["AA", "AB", "BB", "BC", "CC", "CD", "DD"];
    const gradeValues = [10, 9, 8, 7, 6, 5, 4];

    // 1. Initial baseline: Easy=10, Medium=9, Hard=8
    let currentAllocation = semesterCourses.map(c => {
      let val = 8;
      if (c.difficulty === 'easy') val = 10;
      else if (c.difficulty === 'medium') val = 9;
      return {
        ...c,
        gradeValue: val,
        creditsVal: parseFloat(c.credits) || 0,
        compPenalty: c.competition === 'high' ? 0.5 : c.competition === 'low' ? -0.5 : 0
      };
    });

    const calculatePoints = (alloc) => alloc.reduce((sum, c) => sum + (c.gradeValue * c.creditsVal), 0);

    // Check if hierarchy constraint is met: Easy >= Medium >= Hard
    const satisfiesHierarchy = (alloc) => {
      const easyVals = alloc.filter(c => c.difficulty === 'easy').map(c => c.gradeValue);
      const mediumVals = alloc.filter(c => c.difficulty === 'medium').map(c => c.gradeValue);
      const hardVals = alloc.filter(c => c.difficulty === 'hard').map(c => c.gradeValue);

      const minEasy = easyVals.length ? Math.min(...easyVals) : 10;
      const maxMedium = mediumVals.length ? Math.max(...mediumVals) : 0;
      const minMedium = mediumVals.length ? Math.min(...mediumVals) : 10;
      const maxHard = hardVals.length ? Math.max(...hardVals) : 0;

      return minEasy >= maxMedium && minMedium >= maxHard;
    };

    // 2. Optimization Loop
    let iterations = 0;
    const maxIterations = 300;

    while (iterations < maxIterations) {
      let currentPoints = calculatePoints(currentAllocation);
      let error = currentTargetPoints - currentPoints;

      if (Math.abs(error) < 0.05) break;

      let bestStep = null;
      let minScore = Infinity; // Modified to include competition penalty

      for (let i = 0; i < currentAllocation.length; i++) {
        const delta = error > 0 ? 1 : -1;
        const newVal = currentAllocation[i].gradeValue + delta;

        if (newVal >= 4 && newVal <= 10) {
          let testAlloc = currentAllocation.map((c, idx) => idx === i ? { ...c, gradeValue: newVal } : c);

          if (satisfiesHierarchy(testAlloc)) {
            let testPoints = calculatePoints(testAlloc);
            let testError = Math.abs(currentTargetPoints - testPoints);

            // Score = Error (weight 1000) + Competition Penalty
            // Lower target grade for HIGH competition if possible
            let totalPenalty = testAlloc.reduce((sum, c) => sum + (c.gradeValue * c.compPenalty), 0);
            let score = testError * 1000 + totalPenalty;

            if (score < minScore) {
              minScore = score;
              bestStep = testAlloc;
            }
          }
        }
      }

      if (bestStep) {
        currentAllocation = bestStep;
      } else {
        break;
      }
      iterations++;
    }

    setResults({
      userName: userName || "Scholar",
      requiredSGPA: requiredSGPA.toFixed(2),
      isPossible: !unreachable,
      underestimated,
      maxPossibleCGPA: maxPossibleCGPA.toFixed(2),
      gradePath: currentAllocation.map(c => ({
        ...c,
        gradeName: gradeNames[gradeValues.indexOf(c.gradeValue)]
      })),
      achievedSGPA: (calculatePoints(currentAllocation) / semesterCredits).toFixed(2)
    });
    setStep(5);
  };

  const currentTotalCredits = semesterCourses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" style={{ overflowY: "auto" }}>
        <div className="main-content">
          <div style={{ maxWidth: "850px", margin: "20px auto", padding: "0 20px" }}>
            {/* Back to Dashboard */}
            <Link to="/dashboard" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "12px",
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              color: "#818cf8",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
              marginBottom: "16px",
              transition: "all 0.2s ease"
            }}>
              ← Back to Dashboard
            </Link>
            <div className="glass-panel gpa-card" style={{ padding: "40px", borderRadius: "24px", minHeight: "600px", overflow: "visible" }}>

              {/* Progress Indicator */}
              {step < 5 && (
                <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
                  {[1, 2, 3, 4].map(s => (
                    <div key={s} style={{
                      height: "6px",
                      flex: 1,
                      borderRadius: "3px",
                      background: step >= s ? "var(--accent-primary)" : "rgba(255,255,255,0.1)",
                      transition: "all 0.3s ease"
                    }} />
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="fade-in">
                  <h2 style={{ fontSize: "28px", marginBottom: "12px" }}>Semester Courses 📚</h2>
                  <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>Hi there! Let's start with your name and your courses for this semester.</p>

                  <div className="input-group" style={{ marginBottom: "30px" }}>
                    <label style={labelStyle}>Your Name <span style={{ color: "#ef4444" }}>* (Please enter your name)</span></label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. Rushil"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "30px" }}>
                    {semesterCourses.map((course) => (
                      <div key={course.id} style={{
                        background: "rgba(255,255,255,0.03)",
                        padding: "20px",
                        borderRadius: "20px",
                        border: "1px solid rgba(255,255,255,0.05)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px"
                      }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 50px", gap: "12px", alignItems: "flex-end" }}>
                          <div className="input-group">
                            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                              Course Name <span style={{ color: "#ef4444" }}>* (Fill this)</span>
                            </label>
                            <input
                              style={{ ...inputStyle, padding: "10px" }}
                              placeholder="e.g. Data Structures"
                              value={course.name}
                              onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                            />
                          </div>
                          <div className="input-group">
                            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                              Credits <span style={{ color: "#ef4444" }}>* (Fill)</span>
                            </label>
                            <CustomNumberInput
                              min="1"
                              style={{ ...inputStyle, padding: "10px" }}
                              placeholder="Credits"
                              value={course.credits}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                updateCourse(course.id, 'credits', isNaN(val) ? "" : Math.max(1, val));
                              }}
                            />
                          </div>
                          <button
                            onClick={() => removeCourse(course.id)}
                            style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "18px", paddingBottom: "12px" }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="btn-secondary" onClick={addManualCourse} style={{ padding: "12px", borderStyle: "dashed", opacity: 0.8 }}>
                      + Add Another Course
                    </button>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
                    <div style={{ fontSize: "16px", fontWeight: "600" }}>Total Credits: <span style={{ color: "var(--accent-primary)" }}>{currentTotalCredits}</span></div>
                    <button
                      className="action-btn"
                      onClick={() => setStep(2)}
                      disabled={!userName.trim() || semesterCourses.length === 0 || semesterCourses.some(c => !c.name.trim() || !c.credits || c.credits <= 0)}
                      style={{ border: "2px solid rgba(255,255,255,0.3)", opacity: (!userName.trim() || semesterCourses.length === 0 || semesterCourses.some(c => !c.name.trim() || !c.credits || c.credits <= 0)) ? 0.5 : 1, cursor: (!userName.trim() || semesterCourses.length === 0 || semesterCourses.some(c => !c.name.trim() || !c.credits || c.credits <= 0)) ? "not-allowed" : "pointer" }}
                    >
                      Next: Academic Stats →
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="fade-in">
                  <h2 style={{ fontSize: "28px", marginBottom: "12px" }}>Academic Stats 📊</h2>
                  <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>Provide your historical data.</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="input-group">
                      <label style={labelStyle}>Current Semester Number <span style={{ color: "#ef4444" }}>*</span></label>
                      <select value={currentSem} onChange={e => setCurrentSem(e.target.value)} style={inputStyle}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div className="input-group">
                        <label style={labelStyle}>Prev. Credits Earned <span style={{ color: "#ef4444" }}>* (Fill to calculate)</span></label>
                        <CustomNumberInput
                          placeholder="e.g. 45"
                          value={prevCredits}
                          onChange={e => setPrevCredits(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div className="input-group">
                        <label style={labelStyle}>Current CGPA <span style={{ color: "#ef4444" }}>* (Fill to proceed)</span></label>
                        <CustomNumberInput
                          step="0.01"
                          placeholder="e.g. 8.5"
                          value={currentCGPA}
                          onChange={e => setCurrentCGPA(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label style={labelStyle}>Target CGPA <span style={{ color: "#ef4444" }}>* (Set your goal)</span></label>
                      <CustomNumberInput
                        step="0.01"
                        placeholder="e.g. 9.0"
                        value={targetCGPA}
                        onChange={e => setTargetCGPA(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                      <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1, border: "2px solid rgba(255,255,255,0.2)" }}>Back</button>
                      <button
                        className="action-btn"
                        onClick={() => setStep(3)}
                        style={{ flex: 2, justifyContent: "center", border: "2px solid rgba(255,255,255,0.3)", opacity: (!prevCredits || !currentCGPA || !targetCGPA) ? 0.5 : 1, cursor: (!prevCredits || !currentCGPA || !targetCGPA) ? "not-allowed" : "pointer" }}
                        disabled={!prevCredits || !currentCGPA || !targetCGPA}
                      >
                        Identify Difficulty →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="fade-in">
                  <h2 style={{ fontSize: "28px", marginBottom: "12px" }}>Subject Difficulty 🧠</h2>
                  <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>Categorize your subjects to optimize your grade path.</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "30px" }}>
                    {semesterCourses.map(course => (
                      <div key={course.id} style={{
                        padding: "20px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        border: "1px solid rgba(255,255,255,0.1)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "20px" }}>{course.icon || '📚'}</span>
                            <span style={{ fontWeight: "600" }}>{course.name || "Course"}</span>
                          </div>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>{course.credits} Credits</span>
                        </div>

                        <div className="gpa-grid-options" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                          <div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Difficulty</div>
                            <div className="difficulty-buttons" style={{ display: "flex", gap: "8px" }}>
                              {['easy', 'medium', 'hard'].map(level => (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => updateCourse(course.id, 'difficulty', level)}
                                  style={{
                                    flex: 1,
                                    padding: "12px 6px",
                                    borderRadius: "10px",
                                    border: "2px solid",
                                    borderColor: course.difficulty === level ? (level === 'easy' ? '#10b981' : level === 'medium' ? '#eab308' : '#ef4444') : "rgba(255,255,255,0.15)",
                                    background: course.difficulty === level ? (level === 'easy' ? 'rgba(16, 185, 129, 0.2)' : level === 'medium' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)') : "rgba(255,255,255,0.05)",
                                    color: course.difficulty === level ? "white" : "var(--text-muted)",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    textTransform: "uppercase",
                                    transition: "all 0.2s ease",
                                    boxShadow: course.difficulty === level ? "0 4px 12px rgba(0,0,0,0.2)" : "none"
                                  }}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Competition</div>
                            <div className="difficulty-buttons" style={{ display: "flex", gap: "8px" }}>
                              {['low', 'medium', 'high'].map(level => (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => updateCourse(course.id, 'competition', level)}
                                  style={{
                                    flex: 1,
                                    padding: "12px 6px",
                                    borderRadius: "10px",
                                    border: "2px solid",
                                    borderColor: course.competition === level ? "#818cf8" : "rgba(255,255,255,0.15)",
                                    background: course.competition === level ? "rgba(129, 140, 248, 0.2)" : "rgba(255,255,255,0.05)",
                                    color: course.competition === level ? "white" : "var(--text-muted)",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    textTransform: "uppercase",
                                    transition: "all 0.2s ease",
                                    boxShadow: course.competition === level ? "0 4px 12px rgba(0,0,0,0.2)" : "none"
                                  }}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn-secondary" onClick={() => setStep(2)} style={{ flex: 1, border: "2px solid rgba(255,255,255,0.2)" }}>Back</button>
                    <button className="action-btn" onClick={calculateStrategy} style={{ flex: 2, justifyContent: "center", border: "2px solid rgba(255,255,255,0.3)" }}>Generate Final Strategy ✨</button>
                  </div>
                </div>
              )}

              {step === 5 && results && (
                <div className="fade-in">
                  <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "32px", marginBottom: "8px" }}>Strategy Report 🏆</h2>
                    <p style={{ color: "var(--text-muted)" }}>Hey {results.userName}, here is your personalized path to {targetCGPA} CGPA</p>
                    <p style={{ fontSize: "14px", color: "var(--accent-primary)", marginTop: "8px", fontWeight: "600" }}>
                      * These are the minimum grades required to reach your target. You are always welcome to aim higher! 🚀
                    </p>
                  </div>

                  {results.underestimated && (
                    <div style={{ padding: "20px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "16px", border: "1px solid rgba(16, 185, 129, 0.2)", marginBottom: "30px", textAlign: "center" }}>
                      <span style={{ fontSize: "24px" }}>🌟</span>
                      <h4 style={{ color: "#10b981", margin: "8px 0" }}>Wait, {results.userName}, You're Already Beating This!</h4>
                      <p style={{ fontSize: "14px", color: "var(--text-main)" }}>You are underestimating your potential! Even with base performance, you exceed {targetCGPA}. Why not aim higher? You're doing amazing!</p>
                    </div>
                  )}

                  {!results.isPossible && (
                    <div style={{ padding: "20px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "16px", border: "1px solid rgba(239, 68, 68, 0.2)", marginBottom: "30px", textAlign: "center" }}>
                      <span style={{ fontSize: "24px" }}>⚠️</span>
                      <h4 style={{ color: "#ef4444", margin: "8px 0" }}>Beyond Math Limits</h4>
                      <p style={{ fontSize: "14px", color: "var(--text-main)" }}>To reach {targetCGPA}, {results.userName}, you'd need {results.requiredSGPA} SGPA. We've shifted your plan to the <b>Maximum Achievable</b> of {results.maxPossibleCGPA} CGPA.</p>
                    </div>
                  )}

                  <div style={{
                    padding: "30px",
                    background: results.isPossible ? "rgba(99, 102, 241, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    borderRadius: "24px",
                    border: "1px solid",
                    borderColor: results.isPossible ? "rgba(99, 102, 241, 0.2)" : "rgba(239, 68, 68, 0.2)",
                    textAlign: "center",
                    marginBottom: "40px",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: results.isPossible ? "linear-gradient(90deg, #6366f1, #a855f7)" : "#ef4444" }} />
                    <div style={{ fontSize: "14px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "700" }}>
                      {results.isPossible ? "Required Semester SGPA" : "Maximum Potential SGPA"}
                    </div>
                    <div style={{ fontSize: "64px", fontWeight: "900", color: results.isPossible ? "#6366f1" : "#ef4444", margin: "10px 0" }}>
                      {results.isPossible ? results.achievedSGPA : "10.00"}
                    </div>
                    {results.isPossible && parseFloat(results.achievedSGPA) > parseFloat(results.requiredSGPA) && (
                      <div style={{ fontSize: "14px", color: "var(--accent-primary)", marginBottom: "12px", fontWeight: "500" }}>
                        Note: {results.achievedSGPA} is the next possible SGPA to reach or exceed your target.
                      </div>
                    )}
                    <div style={{ color: results.isPossible ? "#10b981" : "#ef4444", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <span>{results.isPossible ? "✅ MATHEMATICALLY FEASIBLE" : "⚠️ LIMIT REACHED (MAX SGPA: 10.0)"}</span>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px", textAlign: "left" }}>
                    <div>
                      <h3 style={{ marginBottom: "20px", fontSize: "18px" }}>Grade Allocation Path</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {results.gradePath.map(c => (
                          <div key={c.id} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "16px",
                            background: "rgba(255,255,255,0.03)",
                            borderRadius: "16px",
                            border: "1px solid rgba(255,255,255,0.05)"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <span style={{ fontSize: "20px" }}>{c.icon || '📚'}</span>
                              <div>
                                <div style={{ fontWeight: "600" }}>{c.name}</div>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <div style={{ fontSize: "9px", color: c.difficulty === 'easy' ? '#10b981' : c.difficulty === 'medium' ? '#eab308' : '#ef4444', fontWeight: "800", textTransform: "uppercase" }}>{c.difficulty}</div>
                                  <div style={{ fontSize: "9px", color: "#818cf8", fontWeight: "800", textTransform: "uppercase" }}>• {c.competition} competition</div>
                                </div>
                              </div>
                            </div>
                            <div style={{
                              fontSize: "24px",
                              fontWeight: "900",
                              color: c.gradeValue >= 10 ? "#10b981" : c.gradeValue >= 9 ? "#6366f1" : c.gradeValue >= 8 ? "#eab308" : "#f97316"
                            }}>
                              {c.gradeName}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 style={{ marginBottom: "20px", fontSize: "18px" }}>Execution Strategy ⚔️</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ padding: "20px", background: "rgba(16, 185, 129, 0.05)", borderRadius: "16px", borderLeft: "4px solid #10b981" }}>
                          <strong style={{ display: "block", marginBottom: "6px", color: "#10b981" }}>Phase 1: Easy Wins</strong>
                          <p style={{ fontSize: "14px", color: "var(--text-main)" }}>Secure your 10/10 benchmarks in Easy subjects first. They anchor your point bank.</p>
                        </div>
                        <div style={{ padding: "20px", background: "rgba(99, 102, 241, 0.05)", borderRadius: "16px", borderLeft: "4px solid #6366f1" }}>
                          <strong style={{ display: "block", marginBottom: "6px", color: "#6366f1" }}>Phase 2: Balanced Core</strong>
                          <p style={{ fontSize: "14px", color: "var(--text-main)" }}>The hierarchy and competition factor ensure your Medium subjects are pushed effectively to hit the target.</p>
                        </div>
                        <div style={{ padding: "20px", background: "rgba(239, 68, 68, 0.05)", borderRadius: "16px", borderLeft: "4px solid #ef4444" }}>
                          <strong style={{ display: "block", marginBottom: "6px", color: "#ef4444" }}>Phase 3: Risk Mitigation</strong>
                          <p style={{ fontSize: "14px", color: "var(--text-main)" }}>Hard and high-competition subjects are adjusted last, keeping your stress levels manageable.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {results.isPossible === false && (
                    <div style={{ padding: "20px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "16px", border: "1px solid rgba(239, 68, 68, 0.2)", marginBottom: "30px", textAlign: "left" }}>
                      <h4 style={{ color: "#ef4444", marginBottom: "10px" }}>Consider these adjustments:</h4>
                      <ul style={{ listStyleType: "disc", marginLeft: "20px", fontSize: "14px", color: "var(--text-main)" }}>
                        <li>Aim for a realistic target of {(parseFloat(targetCGPA) - 0.1).toFixed(2)} CGPA instead.</li>
                        <li>Extend your recovery plan over the next two semesters.</li>
                        <li>Check if your historical credit entries are correct.</li>
                      </ul>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "16px", marginTop: "40px" }}>
                    <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1, padding: "16px", border: "2px solid rgba(255,255,255,0.2)" }}>🔄 Restart Planning</button>
                    <Link to="/dashboard" className="action-btn" style={{ flex: 1, padding: "16px", justifyContent: "center", textDecoration: "none", border: "2px solid rgba(255,255,255,0.3)" }}>Go to Dashboard →</Link>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <style>{`
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        
        /* Placeholder visibility fix */
        input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        /* Hide number input spinners for cleaner UI */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }

        /* Prevent horizontal overflow globally on this page */
        .dashboard-container {
          max-width: 100vw;
          overflow-x: hidden;
          box-sizing: border-box;
        }
        .dashboard-overlay {
          max-width: 100%;
          overflow-x: hidden;
          box-sizing: border-box;
        }
        .main-content {
          max-width: 100%;
          overflow-x: hidden;
        }

        /* Mobile responsiveness for GPA Strategizer */
        @media (max-width: 768px) {
          .gpa-card {
            padding: 20px !important;
            min-height: auto !important;
          }
          .gpa-card h2 {
            font-size: 22px !important;
          }
          .gpa-card h3 {
            font-size: 16px !important;
          }
          .gpa-card .action-btn {
            width: 100% !important;
            justify-content: center !important;
          }
          .gpa-card .btn-secondary {
            width: 100% !important;
          }
          /* Fix 2-column strategy grid to stack on mobile */
          .gpa-card > div > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .dashboard-container {
            padding: 10px !important;
          }
          .dashboard-overlay {
            padding: 10px !important;
          }
          .main-content > div {
            padding: 0 10px !important;
            margin: 10px auto !important;
          }
          .gpa-card {
            padding: 16px !important;
          }
          .gpa-card h2 {
            font-size: 20px !important;
          }
          /* Ensure content fits on mobile */
          .gpa-card > div {
             width: 100%;
             overflow-x: hidden;
          }
          /* Fix Difficulty Buttons wrapping */
          .gpa-card .difficulty-buttons {
            flex-wrap: wrap !important;
          }
          /* Stack Options Grid */
          .gpa-grid-options {
            grid-template-columns: 1fr !important;
          }
          /* Strategy report grid - stack columns */
          .gpa-card div[style*="grid-template-columns: 1fr 1fr"] {
            display: flex !important;
            flex-direction: column !important;
            gap: 24px !important;
          }
          /* Reduce large SGPA font on mobile */
          .gpa-card div[style*="font-size: 64px"] {
            font-size: 48px !important;
          }
        }
        @media (max-width: 400px) {
          .gpa-card {
            padding: 12px !important;
          }
          .gpa-card h2 {
            font-size: 18px !important;
          }
          .gpa-card div[style*="font-size: 64px"] {
            font-size: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}

const labelStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "var(--text-muted)",
  marginBottom: "4px"
};

const inputStyle = {
  padding: "16px",
  borderRadius: "12px",
  background: "rgba(15, 23, 42, 0.7)", // Slightly more opaque
  border: "2px solid rgba(255, 255, 255, 0.3)", // Prominent border
  color: "#ffffff",
  fontSize: "16px",
  outline: "none",
  width: "100%",
  transition: "all 0.2s"
};

const CustomNumberInput = ({ value, onChange, placeholder, min, step, style }) => {
  const handleIncrement = () => {
    const newVal = (parseFloat(value) || 0) + (parseFloat(step) || 1);
    onChange({ target: { value: newVal.toFixed(2).replace(/\.?0+$/, '') } });
  };
  const handleDecrement = () => {
    const newVal = Math.max(min || 0, (parseFloat(value) || 0) - (parseFloat(step) || 1));
    onChange({ target: { value: newVal.toFixed(2).replace(/\.?0+$/, '') } });
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="number"
        style={{ ...style, paddingRight: "40px" }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        step={step}
      />
      <div style={{
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        zIndex: 10
      }}>
        <button
          type="button"
          onClick={handleIncrement}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            fontSize: "12px",
            padding: "2px"
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
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            fontSize: "12px",
            padding: "2px"
          }}
        >
          ▼
        </button>
      </div>
    </div>
  );
};

export default GPAStrategizer;
