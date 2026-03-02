import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "./context";
import { flashcardApi } from "./api";
import { useAuth } from "@clerk/clerk-react";

function FlashcardsPage() {
  const { subjects, subjectsLoading } = useApp();
  const { getToken } = useAuth();

  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New card state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [difficulty, setDifficulty] = useState("medium");

  // Quiz state
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ mastered: 0, learning: 0 });
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const filters = selectedSubject !== "all" ? { subjectId: selectedSubject } : {};
      const data = await flashcardApi.getAll(getToken, filters);
      setFlashcards(data);
    } catch (err) {
      console.error("Error fetching flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [selectedSubject]);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!question || !answer || !subjectId) return;

    setIsSubmitting(true);
    try {
      await flashcardApi.create({
        question,
        answer,
        subjectId,
        difficulty
      }, getToken);

      setQuestion("");
      setAnswer("");
      setShowAddForm(false);
      fetchCards();
    } catch (err) {
      console.error("Error creating flashcard:", err);
      alert("Failed to create flashcard");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCard = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await flashcardApi.delete(id, getToken);
      fetchCards();
    } catch (err) {
      console.error("Error deleting flashcard:", err);
    }
  };

  const startQuiz = () => {
    if (flashcards.length === 0) return;
    setIsQuizMode(true);
    setIsSessionFinished(false);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setScore({ mastered: 0, learning: 0 });
  };

  const handleRateCard = (mastered) => {
    if (mastered) {
      setScore(prev => ({ ...prev, mastered: prev.mastered + 1 }));
    } else {
      setScore(prev => ({ ...prev, learning: prev.learning + 1 }));
    }

    if (currentCardIndex < flashcards.length - 1) {
      setShowAnswer(false);
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setIsSessionFinished(true);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay">
        <div className="main-content">
          {/* Top Bar Navigation */}
          <div className="glass-panel" style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <h2 style={{ color: "var(--text-main)", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px" }}>
              <span>🃏</span> Flashcard Study
            </h2>
            <Link to="/dashboard" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: "600", padding: "8px 16px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.1)" }}>
              ← Return Dashboard
            </Link>
          </div>

          {!isQuizMode ? (
            <div className="dashboard-grid">
              {/* Left Panel: Filters & Add */}
              <div className="left-panel">
                <div className="glass-panel" style={{ padding: "24px", marginBottom: "20px" }}>
                  <h3>Study Session</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                    <button
                      className="action-btn"
                      onClick={() => setShowAddForm(!showAddForm)}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      {showAddForm ? "Close Creator" : "+ Create New Card"}
                    </button>
                    {flashcards.length > 0 && (
                      <button
                        className="action-btn"
                        onClick={startQuiz}
                        style={{
                          width: "100%",
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          justifyContent: "center",
                          fontSize: "16px",
                          padding: "16px"
                        }}
                      >
                        🚀 Start Study Session
                      </button>
                    )}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: "24px" }}>
                  <h3>Subjects</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
                    <button
                      onClick={() => setSelectedSubject("all")}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        borderRadius: "10px",
                        background: selectedSubject === "all" ? "rgba(99, 102, 241, 0.15)" : "rgba(255,255,255,0.05)",
                        border: "1px solid",
                        borderColor: selectedSubject === "all" ? "var(--accent-primary)" : "rgba(255,255,255,0.1)",
                        color: selectedSubject === "all" ? "var(--accent-primary)" : "var(--text-main)",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "all 0.2s"
                      }}
                    >
                      All Decks ({flashcards.length})
                    </button>
                    {subjects.map(subject => (
                      <button
                        key={subject._id}
                        onClick={() => setSelectedSubject(subject._id)}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          borderRadius: "10px",
                          background: selectedSubject === subject._id ? "rgba(99, 102, 241, 0.15)" : "rgba(255,255,255,0.05)",
                          border: "1px solid",
                          borderColor: selectedSubject === subject._id ? "var(--accent-primary)" : "rgba(255,255,255,0.1)",
                          color: selectedSubject === subject._id ? "var(--accent-primary)" : "var(--text-main)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          fontWeight: "600",
                          transition: "all 0.2s"
                        }}
                      >
                        <span style={{ fontSize: "18px" }}>{subject.icon || '📚'}</span>
                        <span>{subject.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel: List */}
              <div className="right-panel">
                {showAddForm && (
                  <div className="glass-panel" style={{ padding: "24px", marginBottom: "24px", borderLeft: "4px solid var(--accent-primary)" }}>
                    <h3 style={{ marginBottom: "20px" }}>Create New Flashcard</h3>
                    <form onSubmit={handleAddCard} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <label style={{ fontSize: "14px", color: "var(--text-muted)" }}>Subject Deck</label>
                          <select
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            style={inputStyle}
                            required
                          >
                            <option value="">Select a subject...</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                          </select>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <label style={{ fontSize: "14px", color: "var(--text-muted)" }}>Difficulty Level</label>
                          <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            style={inputStyle}
                          >
                            <option value="easy">Easy (Lvl 1)</option>
                            <option value="medium">Medium (Lvl 2)</option>
                            <option value="hard">Hard (Lvl 3)</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "14px", color: "var(--text-muted)" }}>Prompt / Question</label>
                        <textarea
                          placeholder="What would you like to memorize?"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          style={{ ...inputStyle, minHeight: "100px" }}
                          required
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "14px", color: "var(--text-muted)" }}>Answer / Definition</label>
                        <textarea
                          placeholder="Provide the correct information..."
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          style={{ ...inputStyle, minHeight: "100px" }}
                          required
                        />
                      </div>

                      <button type="submit" className="action-btn" disabled={isSubmitting} style={{ justifyContent: "center", padding: "16px" }}>
                        {isSubmitting ? "Creating Card..." : "✨ Generate Flashcard"}
                      </button>
                    </form>
                  </div>
                )}

                <div className="glass-panel" style={{ padding: "24px" }}>
                  <h3 style={{ marginBottom: "20px" }}>Your Collection</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                    {loading ? (
                      <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
                        <div className="loading-spinner" style={{ margin: "auto" }} />
                        <p style={{ marginTop: "10px" }}>Gathering your cards...</p>
                      </div>
                    ) : flashcards.length === 0 ? (
                      <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", background: "rgba(255,255,255,0.02)", borderRadius: "20px" }}>
                        <div style={{ fontSize: "32px", marginBottom: "16px" }}>📭</div>
                        <p style={{ color: "var(--text-muted)", fontSize: "18px" }}>Your deck is empty. Create some cards to start studying!</p>
                      </div>
                    ) : (
                      flashcards.map(card => (
                        <div key={card._id} className="card-item" style={{
                          padding: "24px",
                          position: "relative",
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: "16px",
                          border: "1px solid rgba(255,255,255,0.1)",
                          transition: "all 0.3s"
                        }}>
                          <button style={{
                            position: "absolute",
                            top: "16px",
                            right: "16px",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "16px",
                            opacity: 0.4
                          }} onClick={() => handleDeleteCard(card._id)}>🗑️</button>

                          <div style={{ marginBottom: "20px" }}>
                            <span style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              background: card.difficulty === 'hard' ? 'rgba(239, 68, 68, 0.1)' : card.difficulty === 'medium' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: card.difficulty === 'hard' ? '#ef4444' : card.difficulty === 'medium' ? '#eab308' : '#10b981',
                              padding: "4px 8px",
                              borderRadius: "6px"
                            }}>
                              {card.difficulty}
                            </span>
                          </div>

                          <p style={{ fontWeight: "600", marginBottom: "12px", fontSize: "16px", color: "var(--text-main)" }}>{card.question}</p>
                          <p style={{ fontSize: "14px", color: "var(--text-muted)", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
                            <span style={{ fontWeight: "700", color: "#6366f1", marginRight: "6px" }}>A:</span>
                            {card.answer}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Enhanced Quiz Mode Overlay */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "75vh" }}>
              {!isSessionFinished ? (
                <>
                  <div style={{ width: "100%", maxWidth: "600px", position: "relative", perspective: "1000px" }}>
                    {/* The 3D Flashcard */}
                    <div
                      style={{
                        width: "100%",
                        height: "380px",
                        cursor: "pointer",
                        position: "relative",
                        transformStyle: "preserve-3d",
                        transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: showAnswer ? "rotateY(180deg)" : "rotateY(0deg)"
                      }}
                      onClick={() => setShowAnswer(!showAnswer)}
                    >
                      {/* Front Side */}
                      <div style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        backfaceVisibility: "hidden",
                        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                        borderRadius: "24px",
                        border: "2px solid rgba(99, 102, 241, 0.3)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "40px",
                        textAlign: "center",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                      }}>
                        <div style={{ position: "absolute", top: "24px", color: "var(--accent-primary)", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px" }}>
                          Question
                        </div>
                        <p style={{ fontSize: "28px", fontWeight: "600", color: "white", lineHeight: "1.4" }}>
                          {flashcards[currentCardIndex]?.question}
                        </p>
                        <div style={{ position: "absolute", bottom: "30px", color: "var(--text-muted)", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ transform: "rotateY(0deg) rotate(45deg)", display: "inline-block" }}>☝️</span> Tap to show answer
                        </div>
                      </div>

                      {/* Back Side */}
                      <div style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        backfaceVisibility: "hidden",
                        background: "linear-gradient(135deg, #1e1b4b 0%, #1e1b4b 100%)",
                        borderRadius: "24px",
                        border: "2px solid rgba(16, 185, 129, 0.4)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "40px",
                        textAlign: "center",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                        transform: "rotateY(180deg)"
                      }}>
                        <div style={{ position: "absolute", top: "24px", color: "#10b981", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px" }}>
                          Correct Answer
                        </div>
                        <p style={{ fontSize: "24px", color: "white", lineHeight: "1.6" }}>
                          {flashcards[currentCardIndex]?.answer}
                        </p>
                        <div style={{ position: "absolute", bottom: "30px", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
                          Flip back to see question
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div style={{ marginTop: "50px", width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
                    {!showAnswer ? (
                      <div style={{ height: "64px" }}>
                        <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Recall the answer then flip the card</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "20px", width: "100%" }}>
                        <button
                          onClick={() => handleRateCard(false)}
                          style={{
                            flex: 1,
                            padding: "16px",
                            borderRadius: "16px",
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#ef4444",
                            fontWeight: "700",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          ❌ Need Practice
                        </button>
                        <button
                          onClick={() => handleRateCard(true)}
                          style={{
                            flex: 1,
                            padding: "16px",
                            borderRadius: "16px",
                            background: "rgba(16, 185, 129, 0.15)",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            color: "#10b981",
                            fontWeight: "700",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          ✅ Got It!
                        </button>
                      </div>
                    )}

                    <div style={{ width: "100%", background: "rgba(255,255,255,0.05)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%`, height: "100%", background: "#6366f1", transition: "width 0.3s" }} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", color: "var(--text-muted)", fontSize: "14px" }}>
                      <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
                      <button onClick={() => setIsQuizMode(false)} style={{ background: "transparent", border: "none", color: "#f43f5e", cursor: "pointer", fontWeight: "600" }}>Cancel Quiz</button>
                    </div>
                  </div>
                </>
              ) : (
                /* Session Summary */
                <div className="glass-panel" style={{ width: "100%", maxWidth: "500px", padding: "40px", textAlign: "center", borderRadius: "24px" }}>
                  <div style={{ fontSize: "60px", marginBottom: "20px" }}>🏆</div>
                  <h2 style={{ fontSize: "28px", marginBottom: "8px" }}>Session Complete!</h2>
                  <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>Way to go! You've reviewed {flashcards.length} cards.</p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "40px" }}>
                    <div style={{ padding: "16px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "16px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                      <div style={{ fontSize: "24px", fontWeight: "800", color: "#10b981" }}>{score.mastered}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Mastered</div>
                    </div>
                    <div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "16px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                      <div style={{ fontSize: "24px", fontWeight: "800", color: "#ef4444" }}>{score.learning}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Learning</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <button className="action-btn" onClick={startQuiz} style={{ justifyContent: "center", padding: "14px" }}>Restart Deck</button>
                    <button className="btn-secondary" onClick={() => setIsQuizMode(false)} style={{ padding: "14px" }}>Finish Review</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(99, 102, 241, 0.2);
          border-top: 4px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .card-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          border-color: rgba(99, 102, 241, 0.4);
        }

        /* Mobile responsiveness for FlashcardsPage */
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
          .card-item {
            padding: 16px !important;
          }
        }
        @media (max-width: 480px) {
          .card-item {
            padding: 12px !important;
          }
          .card-item p {
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  color: "#1e293b",
  outline: "none",
  width: "100%",
  fontSize: "14px",
  transition: "border-color 0.2s"
};

export default FlashcardsPage;
