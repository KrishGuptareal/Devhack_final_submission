import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { TIMETABLE_MATRIX, SLOT_DEFINITIONS } from "./constants/TimetableSlots";
import { EVEN_SEMESTER_ELECTIVES } from "./constants/EvenSemesterElectives";
import { ODD_SEMESTER_ELECTIVES } from "./constants/OddSemesterElectives";

// Final Combined Database
const ALL_ELECTIVES = [...ODD_SEMESTER_ELECTIVES, ...EVEN_SEMESTER_ELECTIVES];

function ElectivePlanner() {
  const [step, setStep] = useState(1); // 1: Profile, 2: Selection, 3: Confirmation
  const [profile, setProfile] = useState({ branch: "", career: [], fixedSlots: [], semester: "Odd" });
  const [selectedElectives, setSelectedElectives] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [manualCheck, setManualCheck] = useState({ name: "", slot: "" });
  const [showManualResult, setShowManualResult] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Mocked: Full range of slots from the Revised Slot Pattern
  const CORE_SLOTS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "Q", "S"];

  const handleSlotToggle = (slot) => {
    setProfile(prev => ({
      ...prev,
      fixedSlots: prev.fixedSlots.includes(slot)
        ? prev.fixedSlots.filter(s => s !== slot)
        : [...prev.fixedSlots, slot]
    }));
  };

  const handleCareerToggle = (career) => {
    setProfile(prev => ({
      ...prev,
      career: prev.career.includes(career)
        ? prev.career.filter(c => c !== career)
        : [...prev.career, career]
    }));
  };

  const recommendations = useMemo(() => {
    return ALL_ELECTIVES
      .filter(e => e.semester === profile.semester)
      .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.slot.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(elective => {
        let score = 0;
        let isRelevant = false;

        // FIX: Normalize profile careers to lowercase for comparison vs data tags
        const userCareersLower = profile.career.map(c => c.toLowerCase());
        const careerMatch = elective.careers.some(tag => userCareersLower.includes(tag.toLowerCase()));

        if (careerMatch) {
          score += 60;
          isRelevant = true;
        }

        const isCoreBranch = elective.branch.toUpperCase() === profile.branch.toUpperCase();
        if (isCoreBranch) {
          score += 30;
          isRelevant = true;
        }

        // Bonus for seats availability (Timebreaker only)
        if (elective.seats > 30) score += 10;

        const hasConflict = profile.fixedSlots.some(s => elective.slot.startsWith(s)) ||
          selectedElectives.some(e => e.slot === elective.slot && e.id !== elective.id);

        return { ...elective, score, hasConflict, isRelevant };
      })
      // Filter out completely irrelevant courses (neither branch nor career match)
      .filter(e => e.isRelevant)
      .sort((a, b) => {
        if (a.hasConflict && !b.hasConflict) return 1;
        if (!a.hasConflict && b.hasConflict) return -1;
        return b.score - a.score;
      });
  }, [profile, selectedElectives]);

  const toggleElective = (elective) => {
    if (elective.hasConflict && !selectedElectives.find(e => e.id === elective.id)) return;
    setSelectedElectives(prev =>
      prev.find(e => e.id === elective.id)
        ? prev.filter(e => e.id !== elective.id)
        : [...prev, elective]
    );
  };

  const checkManualSuitability = () => {
    if (!manualCheck.slot) return null;
    const isConflicting = profile.fixedSlots.some(s => manualCheck.slot.toUpperCase().startsWith(s)) ||
      selectedElectives.some(e => e.slot === manualCheck.slot.toUpperCase());
    return !isConflicting;
  };

  const formatSlot = (slot) => {
    if (!slot) return "";
    return slot.replace(/[0-9]/g, ""); // Strips numbers, e.g., L1 -> L, H2 -> H
  };

  // Rendering logic for steps...
  return (
    <div className="dashboard-container" style={{ padding: "20px" }}>
      <div className="dashboard-overlay" style={{ padding: "40px", backdropFilter: "blur(20px)" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <h1 style={{ fontSize: "32px", margin: 0 }}>Smart Elective Planner 🎓</h1>
            <Link to="/dashboard" className="btn-secondary" style={{ textDecoration: "none", fontSize: "13px" }}>
              ← Exit to Dashboard
            </Link>
          </div>
          {step > 1 && <button onClick={() => setStep(step - 1)} className="btn-secondary">← Previous Step</button>}
        </div>

        {step === 1 && (
          <div className="glass-panel" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px" }}>
            <h2 style={{ marginBottom: "20px" }}>Step 1: Your Profile</h2>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: "600" }}>Your Branch</label>
              <select
                value={profile.branch}
                onChange={(e) => setProfile(p => ({ ...p, branch: e.target.value }))}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
              >
                <option value="" style={{ background: "#1e293b" }}>Select Branch</option>
                <option value="CSE" style={{ background: "#1e293b" }}>CSE</option>
                <option value="MNC" style={{ background: "#1e293b" }}>MnC</option>
                <option value="MECH" style={{ background: "#1e293b" }}>Mech</option>
                <option value="CIVIL" style={{ background: "#1e293b" }}>Civil</option>
                <option value="CHEMICAL" style={{ background: "#1e293b" }}>Chemical</option>
                <option value="BSMS" style={{ background: "#1e293b" }}>BSMS</option>
                <option value="ELECTRICAL" style={{ background: "#1e293b" }}>Electrical</option>
                <option value="ECE" style={{ background: "#1e293b" }}>ECE</option>
                <option value="EP" style={{ background: "#1e293b" }}>Engineering Physics</option>
              </select>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: "600" }}>Semester Type</label>
              <div style={{ display: "flex", gap: "12px" }}>
                {["Odd", "Even"].map(sem => (
                  <button
                    key={sem}
                    onClick={() => setProfile(p => ({ ...p, semester: sem }))}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: profile.semester === sem ? "var(--accent-primary)" : "rgba(255,255,255,0.1)",
                      background: profile.semester === sem ? "rgba(99,102,241,0.2)" : "transparent",
                      color: "white",
                      cursor: "pointer"
                    }}
                  >
                    {sem} Semester
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: "600" }}>Career Interests</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {[
                  "Software Dev", "AI/ML", "Data Science", "Open Source",
                  "Robotics", "Automation", "Embedded Systems", "IoT",
                  "Heat Transfer", "Thermodynamics", "Fluid Mechanics", "Aerospace",
                  "Structural Design", "Geotechnical", "Transportation", "Const. Mgmt",
                  "Quantum Physics", "Photonics", "Materials Science", "Solid State",
                  "Bio-Tech", "Bioinformatics", "Medical Electronics", "Genetics",
                  "VLSI", "Power Systems", "Control Systems", "Communication",
                  "Finance/Quant", "Econometrics", "Management", "Civil Services"
                ].map(c => (
                  <button
                    key={c}
                    onClick={() => handleCareerToggle(c)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: "1px solid",
                      borderColor: profile.career.includes(c) ? "var(--accent-primary)" : "rgba(255,255,255,0.1)",
                      background: profile.career.includes(c) ? "rgba(99,102,241,0.2)" : "transparent",
                      color: "white",
                      cursor: "pointer"
                    }}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "40px" }}>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: "600" }}>Core Classes Slots (Taken)</label>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>Select the slots already occupied by your core courses.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                {CORE_SLOTS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSlotToggle(s)}
                    style={{
                      padding: "12px 8px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      border: "1px solid",
                      borderColor: profile.fixedSlots.includes(s) ? "#ef4444" : "rgba(255,255,255,0.1)",
                      background: profile.fixedSlots.includes(s) ? "rgba(239, 68, 68, 0.1)" : "rgba(255,255,255,0.05)",
                      color: "white",
                      cursor: "pointer"
                    }}
                  >
                    Slot {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="action-btn"
              style={{
                width: "100%",
                opacity: (!profile.branch || profile.career.length === 0) ? 0.4 : 1,
                cursor: (!profile.branch || profile.career.length === 0) ? "not-allowed" : "pointer",
                filter: (!profile.branch || profile.career.length === 0) ? "grayscale(1)" : "none"
              }}
              disabled={!profile.branch || profile.career.length === 0}
              onClick={() => setStep(2)}
            >
              Continue to Selection →
            </button>
            {(!profile.branch || profile.career.length === 0) && (
              <p style={{ color: "#ef4444", fontSize: "12px", textAlign: "center", marginTop: "12px", fontWeight: "600" }}>
                * Please select your Branch and at least one Interest to continue.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="elective-step2-grid" style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "30px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* TIMETABLE PREVIEW */}
              <div className="glass-panel" style={{ padding: "20px", background: "rgba(15, 23, 42, 0.4)", overflowX: "auto" }}>
                <h4 style={{ marginBottom: "16px", fontSize: "14px" }}>🗓 Current Weekly Schedule</h4>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "12px",
                  minWidth: "600px" // Prevent crushing
                }}>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                    <div key={day} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ fontWeight: "700", fontSize: "11px", textAlign: "center", marginBottom: "8px", opacity: 0.8 }}>{day.slice(0, 3)}</div>
                      {Object.keys(TIMETABLE_MATRIX[day] || {}).map(time => {
                        const slot = TIMETABLE_MATRIX[day][time];
                        const isFixed = slot && profile.fixedSlots.some(fs => slot.startsWith(fs));
                        const selectedCourse = selectedElectives.find(e => e.slot === slot || (slot && slot.startsWith(e.slot)));

                        return (
                          <div key={`${day}-${time}`} style={{
                            background: isFixed ? "rgba(239, 68, 68, 0.2)" : (selectedCourse ? "var(--accent-primary)" : "rgba(255,255,255,0.03)"),
                            border: "1px solid",
                            borderColor: isFixed ? "rgba(239, 68, 68, 0.4)" : (selectedCourse ? "var(--accent-primary)" : "rgba(255,255,255,0.05)"),
                            borderRadius: "6px",
                            padding: "8px 4px",
                            textAlign: "center",
                            fontSize: "10px",
                            transition: "all 0.3s ease",
                            position: "relative"
                          }}>
                            <div style={{ fontSize: "9px", opacity: 0.5, marginBottom: "2px" }}>{time}</div>
                            <div style={{ fontWeight: "bold" }}>{isFixed ? "CORE" : (selectedCourse ? "PICKED" : formatSlot(slot))}</div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "16px", marginTop: "16px", fontSize: "11px", opacity: 0.7 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "10px", height: "10px", background: "rgba(239, 68, 68, 0.4)", borderRadius: "2px" }} /> Fixed Core</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "10px", height: "10px", background: "var(--accent-primary)", borderRadius: "2px" }} /> Selected Elective</div>
                </div>
              </div>

              {/* ELECTIVES LIST */}
              <div className="glass-panel" style={{ padding: "30px" }}>
                <div style={{
                  background: "rgba(234, 179, 8, 0.1)",
                  border: "1px solid rgba(234, 179, 8, 0.4)",
                  padding: "16px",
                  borderRadius: "12px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <span style={{ fontSize: "20px" }}>⚠️</span>
                  <p style={{ margin: 0, fontSize: "13px", color: "#facc15", fontWeight: "600" }}>
                    IMPORTANT: Before choosing an elective, please check the prerequisites of the course on the official department portal.
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h2 style={{ margin: 0 }}>Available Electives ({profile.semester} Semester)</h2>
                  <input
                    type="text"
                    placeholder="🔍 Search course or slot..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                      width: "250px",
                      outline: "none"
                    }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
                  {recommendations.map(elective => (
                    <div
                      key={elective.id}
                      style={{
                        padding: "20px",
                        borderRadius: "16px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid",
                        borderColor: selectedElectives.find(e => e.id === elective.id) ? "var(--accent-primary)" : "rgba(255,255,255,0.1)",
                        opacity: elective.hasConflict && !selectedElectives.find(e => e.id === elective.id) ? 0.5 : 1,
                        cursor: elective.hasConflict && !selectedElectives.find(e => e.id === elective.id) ? "not-allowed" : "pointer"
                      }}
                      onClick={() => toggleElective(elective)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <h4 style={{ margin: 0, fontSize: "14px" }}>{elective.name}</h4>
                        <span style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: "800" }}>{elective.credits} Cr</span>
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "15px", height: "30px", overflow: "hidden" }}>{elective.description}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "10px", padding: "4px 8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px" }}>Slot {formatSlot(elective.slot)}</span>
                        {elective.hasConflict ? (
                          <span style={{ color: "#ef4444", fontSize: "10px", fontWeight: "700" }}>⚠️ Conflict</span>
                        ) : (
                          <span style={{ color: "#10b981", fontSize: "10px", fontWeight: "700" }}>✓ Compatible</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: "30px", background: "rgba(15, 23, 42, 0.9)" }}>
              {/* Manual Check Tool */}
              <div style={{ marginBottom: "30px", padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h4 style={{ marginBottom: "12px", fontSize: "14px" }}>⚡ Quick Suitability Check</h4>
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                  <input
                    type="text"
                    placeholder="Slot (e.g. H1)"
                    value={manualCheck.slot}
                    onChange={(e) => setManualCheck({ ...manualCheck, slot: e.target.value })}
                    style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "12px" }}
                  />
                  <button
                    onClick={() => setShowManualResult(true)}
                    className="action-btn"
                    style={{ padding: "8px 16px", fontSize: "12px", background: "var(--accent-secondary)" }}
                  >
                    Check
                  </button>
                </div>
                {showManualResult && manualCheck.slot && (
                  <div style={{
                    padding: "10px",
                    borderRadius: "8px",
                    textAlign: "center",
                    background: checkManualSuitability() ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    border: "1px solid",
                    borderColor: checkManualSuitability() ? "#10b981" : "#ef4444",
                    color: checkManualSuitability() ? "#10b981" : "#ef4444",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    {checkManualSuitability() ? "✅ SUITABLE" : "❌ CONFLICT"}
                  </div>
                )}
              </div>

              <h3>Selected: {selectedElectives.reduce((sum, e) => sum + e.credits, 0)} Cr</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                {selectedElectives.map(e => (
                  <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                    <span style={{ fontSize: "13px" }}>{e.name}</span>
                    <button onClick={() => toggleElective(e)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}>✕</button>
                  </div>
                ))}
                {selectedElectives.length === 0 && <p style={{ color: "var(--text-muted)", textAlign: "center" }}>No electives selected</p>}
              </div>
              <button
                className="action-btn"
                style={{ width: "100%", marginTop: "30px" }}
                disabled={selectedElectives.length === 0}
                onClick={() => setStep(3)}
              >
                Review Selection
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="glass-panel" style={{ maxWidth: "600px", margin: "0 auto", padding: "40px", textAlign: "center" }}>
            <h2 style={{ marginBottom: "20px" }}>Final Confirmation ✅</h2>
            <div style={{ textAlign: "left", background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "16px", marginBottom: "30px" }}>
              <p><strong>Branch:</strong> {profile.branch}</p>
              <p><strong>Interests:</strong> {profile.career.join(", ").toUpperCase()}</p>
              <p><strong>Selected Courses:</strong></p>
              <ul style={{ paddingLeft: "20px" }}>
                {selectedElectives.map(e => <li key={e.id}>{e.name} ({e.credits} Cr) - Slot {e.slot}</li>)}
              </ul>
            </div>
            <button className="action-btn" onClick={() => alert("Registration Submitted! (Mocked)")} style={{ width: "100%" }}>Confirm Selection</button>
            <button onClick={() => setStep(2)} className="btn-secondary" style={{ width: "100%", marginTop: "10px" }}>Back to Edit</button>
          </div>
        )}

      </div>

      <style>{`
        .btn-secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
        }

        /* Mobile responsiveness for ElectivePlanner */
        @media (max-width: 1200px) {
          .elective-step2-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 1024px) {
          .dashboard-overlay > div:first-child {
            flex-direction: column !important;
            gap: 12px;
            align-items: flex-start !important;
          }
        }
        @media (max-width: 768px) {
          .dashboard-overlay {
            padding: 16px !important;
          }
          .dashboard-overlay h1 {
            font-size: 22px !important;
          }
          .glass-panel {
            padding: 20px !important;
          }
        }
        @media (max-width: 480px) {
          .dashboard-overlay {
            padding: 12px !important;
          }
          .dashboard-overlay h1 {
            font-size: 18px !important;
          }
          .glass-panel {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ElectivePlanner;
