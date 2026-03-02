import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { DSA_QUESTIONS, WEEKLY_SCHEDULE, STREAK_MILESTONES, CONTEST_PLATFORMS, TOPICS } from "./constants/dsaQuestions";

function DSAPractice() {
    const { user } = useUser();
    const [currentStreak, setCurrentStreak] = useState(0);  // Consecutive days
    const [totalDays, setTotalDays] = useState(0);          // Total active days
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [todaysProblem, setTodaysProblem] = useState(null);
    const [weeklyProblems, setWeeklyProblems] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState("All");
    const [showHint, setShowHint] = useState(false);
    const [activeTab, setActiveTab] = useState("today");
    const [todaySolved, setTodaySolved] = useState(false);  // Track if solved today

    // Get day of week
    const getDayName = () => {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        return days[new Date().getDay()];
    };

    // Get today's difficulty based on schedule
    const getTodaysDifficulty = () => {
        return WEEKLY_SCHEDULE[getDayName()].difficulty;
    };

    // Get motivational message
    const getTodaysMessage = () => {
        return WEEKLY_SCHEDULE[getDayName()].message;
    };

    // Get today's date string (YYYY-MM-DD)
    const getTodayDateString = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Get yesterday's date string
    const getYesterdayDateString = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    };

    // Reset all progress
    const resetProgress = () => {
        if (!window.confirm("Reset all DSA progress? This cannot be undone.")) return;
        Object.keys(localStorage).filter(k => k.startsWith('dsa_')).forEach(k => localStorage.removeItem(k));
        setCurrentStreak(0);
        setTotalDays(0);
        setSolvedProblems([]);
        setTodaySolved(false);
        const newProblem = selectTodaysProblem();
        setTodaysProblem(newProblem);
        localStorage.setItem(`dsa_today_${user?.id}`, JSON.stringify({ date: getTodayDateString(), problem: newProblem, solved: false }));
        setWeeklyProblems(generateWeeklyProblems());
    };

    // Select a random problem for today based on difficulty
    const selectTodaysProblem = (excludeIds = []) => {
        const difficulty = getTodaysDifficulty();
        const problems = DSA_QUESTIONS[difficulty];
        const unsolvedProblems = problems.filter(p =>
            !solvedProblems.includes(p.id) && !excludeIds.includes(p.id)
        );

        if (unsolvedProblems.length === 0) {
            return problems[Math.floor(Math.random() * problems.length)];
        }

        // Topic rotation - prefer different topics each day
        const topicIndex = new Date().getDate() % TOPICS.length;
        const preferredTopic = TOPICS[topicIndex];

        const topicFiltered = unsolvedProblems.filter(p => p.topics.includes(preferredTopic));
        if (topicFiltered.length > 0) {
            return topicFiltered[Math.floor(Math.random() * topicFiltered.length)];
        }

        return unsolvedProblems[Math.floor(Math.random() * unsolvedProblems.length)];
    };

    // Generate weekly problems (stored per week)
    const generateWeeklyProblems = () => {
        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

        // Check if we have stored weekly problems for this week
        const weekKey = `dsa_weekly_${user?.id}_${getWeekNumber()}`;
        const savedWeekly = localStorage.getItem(weekKey);

        if (savedWeekly) {
            return JSON.parse(savedWeekly);
        }

        const problems = days.map(day => {
            const difficulty = WEEKLY_SCHEDULE[day].difficulty;
            const dayProblems = DSA_QUESTIONS[difficulty];
            const problem = dayProblems[Math.floor(Math.random() * dayProblems.length)];
            return { day, ...problem, difficulty };
        });

        localStorage.setItem(weekKey, JSON.stringify(problems));
        return problems;
    };

    // Get week number of the year
    const getWeekNumber = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now - start;
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.floor(diff / oneWeek);
    };

    // Load saved data and today's problem
    useEffect(() => {
        if (!user?.id) return;

        const today = getTodayDateString();
        const yesterday = getYesterdayDateString();

        // Load progress data
        const saved = localStorage.getItem(`dsa_progress_${user.id}`);
        let savedSolvedProblems = [];
        let savedStreak = 0;
        let savedTotalDays = 0;
        let lastSolvedDate = null;
        let activeDays = [];

        if (saved) {
            const data = JSON.parse(saved);
            savedSolvedProblems = data.solvedProblems || [];
            savedTotalDays = data.totalDays || 0;
            lastSolvedDate = data.lastSolvedDate ? data.lastSolvedDate.split('T')[0] : null;
            activeDays = data.activeDays || [];

            // Calculate consecutive streak
            if (lastSolvedDate === today) {
                // Already solved today - keep streak
                savedStreak = data.currentStreak || 0;
                setTodaySolved(true);
            } else if (lastSolvedDate === yesterday) {
                // Solved yesterday - streak continues (but not added yet)
                savedStreak = data.currentStreak || 0;
            } else if (lastSolvedDate) {
                // Missed a day - reset streak
                savedStreak = 0;
            }

            setSolvedProblems(savedSolvedProblems);
            setCurrentStreak(savedStreak);
            setTotalDays(savedTotalDays);
        }

        // Load or generate today's problem
        const todayKey = `dsa_today_${user.id}`;
        const savedToday = localStorage.getItem(todayKey);

        if (savedToday) {
            const todayData = JSON.parse(savedToday);
            // Check if it's still the same day
            if (todayData.date === today) {
                setTodaysProblem(todayData.problem);
                if (todayData.solved) {
                    setTodaySolved(true);
                }
            } else {
                // New day - generate new problem
                const newProblem = selectTodaysProblem();
                setTodaysProblem(newProblem);
                localStorage.setItem(todayKey, JSON.stringify({
                    date: today,
                    problem: newProblem,
                    solved: false
                }));
            }
        } else {
            // First time - generate problem
            const newProblem = selectTodaysProblem();
            setTodaysProblem(newProblem);
            localStorage.setItem(todayKey, JSON.stringify({
                date: today,
                problem: newProblem,
                solved: false
            }));
        }

        setWeeklyProblems(generateWeeklyProblems());
    }, [user]);

    // Skip and get new problem (explicit user action)
    const skipAndGetNewProblem = () => {
        if (todaySolved) return; // Can't skip if already solved today

        const newProblem = selectTodaysProblem([todaysProblem?.id]);
        setTodaysProblem(newProblem);

        // Update localStorage with new problem for today
        localStorage.setItem(`dsa_today_${user?.id}`, JSON.stringify({
            date: getTodayDateString(),
            problem: newProblem,
            solved: false
        }));
    };

    // Mark problem as solved
    const markAsSolved = (problemId) => {
        if (todaySolved) return; // Already solved today

        const today = getTodayDateString();
        const yesterday = getYesterdayDateString();

        // Load current data
        const saved = localStorage.getItem(`dsa_progress_${user?.id}`);
        let data = saved ? JSON.parse(saved) : {};

        const lastSolvedDate = data.lastSolvedDate ? data.lastSolvedDate.split('T')[0] : null;
        const activeDays = data.activeDays || [];

        // Calculate new streak
        let newStreak;
        if (lastSolvedDate === yesterday) {
            // Consecutive - increment streak
            newStreak = (data.currentStreak || 0) + 1;
        } else if (lastSolvedDate === today) {
            // Already solved today (shouldn't happen but safety check)
            newStreak = data.currentStreak || 0;
        } else {
            // Streak broken or first time - start at 1
            newStreak = 1;
        }

        // Add today to active days if not already there
        const newActiveDays = activeDays.includes(today) ? activeDays : [...activeDays, today];
        const newTotalDays = newActiveDays.length;

        const newSolved = [...solvedProblems, problemId];

        // Update state
        setSolvedProblems(newSolved);
        setCurrentStreak(newStreak);
        setTotalDays(newTotalDays);
        setTodaySolved(true);

        // Save to localStorage
        localStorage.setItem(`dsa_progress_${user?.id}`, JSON.stringify({
            solvedProblems: newSolved,
            currentStreak: newStreak,
            totalDays: newTotalDays,
            activeDays: newActiveDays,
            lastSolvedDate: new Date().toISOString()
        }));

        // Update today's problem as solved
        localStorage.setItem(`dsa_today_${user?.id}`, JSON.stringify({
            date: today,
            problem: todaysProblem,
            solved: true
        }));

        // Check for milestone
        if (STREAK_MILESTONES[newStreak]) {
            alert(STREAK_MILESTONES[newStreak].message);
        }
    };

    // Get streak badge
    const getStreakBadge = () => {
        const milestones = Object.keys(STREAK_MILESTONES).map(Number).sort((a, b) => b - a);
        for (const milestone of milestones) {
            if (currentStreak >= milestone) {
                return STREAK_MILESTONES[milestone].badge;
            }
        }
        return "🔥";
    };

    // Difficulty colors
    const difficultyColors = {
        easy: { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.4)", text: "#10b981" },
        medium: { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.4)", text: "#f59e0b" },
        hard: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.4)", text: "#ef4444" }
    };

    const cardStyle = {
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "24px",
        marginBottom: "20px"
    };

    const buttonStyle = {
        padding: "12px 24px",
        borderRadius: "12px",
        border: "none",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s ease",
        fontSize: "14px"
    };

    return (
        <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
            {/* Header Section */}
            <div style={{ ...cardStyle, background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                            <h1 style={{
                                fontSize: "32px",
                                fontWeight: "800",
                                color: "#f1f5f9",
                                margin: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: "12px"
                            }}>
                                🧠 DSA Practice
                            </h1>
                            <Link
                                to="/dashboard"
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "10px",
                                    background: "rgba(99, 102, 241, 0.2)",
                                    border: "1px solid rgba(99, 102, 241, 0.4)",
                                    color: "#818cf8",
                                    textDecoration: "none",
                                    fontSize: "13px",
                                    fontWeight: "600"
                                }}
                            >
                                ← Dashboard
                            </Link>
                            <button
                                onClick={resetProgress}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "10px",
                                    background: "rgba(239, 68, 68, 0.1)",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    color: "#ef4444",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    cursor: "pointer"
                                }}
                            >
                                🔄 Reset
                            </button>
                        </div>
                        <p style={{ color: "#94a3b8", fontSize: "16px", margin: 0 }}>{getTodaysMessage()}</p>
                    </div>

                    <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                        {/* Consecutive Streak */}
                        <div style={{
                            background: "rgba(251, 191, 36, 0.15)",
                            border: "1px solid rgba(251, 191, 36, 0.3)",
                            borderRadius: "16px",
                            padding: "16px 24px",
                            textAlign: "center"
                        }}>
                            <div style={{ fontSize: "32px", fontWeight: "800", color: "#fbbf24" }}>
                                {currentStreak} {getStreakBadge()}
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
                                Streak
                            </div>
                            <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>
                                consecutive days
                            </div>
                        </div>

                        {/* Total Active Days */}
                        <div style={{
                            background: "rgba(99, 102, 241, 0.15)",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            borderRadius: "16px",
                            padding: "16px 24px",
                            textAlign: "center"
                        }}>
                            <div style={{ fontSize: "32px", fontWeight: "800", color: "#818cf8" }}>
                                {totalDays}
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
                                Total Days
                            </div>
                            <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>
                                practiced
                            </div>
                        </div>

                        {/* Problems Solved */}
                        <div style={{
                            background: "rgba(16, 185, 129, 0.15)",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            borderRadius: "16px",
                            padding: "16px 24px",
                            textAlign: "center"
                        }}>
                            <div style={{ fontSize: "32px", fontWeight: "800", color: "#10b981" }}>
                                {solvedProblems.length}
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
                                Problems
                            </div>
                            <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>
                                solved
                            </div>
                        </div>

                        {/* Today's Status */}
                        {todaySolved && (
                            <div style={{
                                background: "rgba(16, 185, 129, 0.2)",
                                border: "1px solid rgba(16, 185, 129, 0.4)",
                                borderRadius: "16px",
                                padding: "16px 24px",
                                textAlign: "center"
                            }}>
                                <div style={{ fontSize: "24px" }}>✅</div>
                                <div style={{ fontSize: "12px", color: "#10b981", fontWeight: "600" }}>
                                    Done Today!
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                {[
                    { id: "today", label: "📅 Today's Problem", icon: "📅" },
                    { id: "week", label: "📊 Weekly Plan", icon: "📊" },
                    { id: "contests", label: "🏆 Contests", icon: "🏆" },
                    { id: "all", label: "📚 All Problems", icon: "📚" }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            ...buttonStyle,
                            background: activeTab === tab.id
                                ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                                : "rgba(30, 41, 59, 0.8)",
                            color: activeTab === tab.id ? "#fff" : "#94a3b8",
                            border: activeTab === tab.id
                                ? "none"
                                : "1px solid rgba(255, 255, 255, 0.1)"
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Today's Problem Tab */}
            {activeTab === "today" && todaysProblem && (
                <div style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                <span style={{
                                    ...difficultyColors[getTodaysDifficulty()],
                                    padding: "6px 14px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    textTransform: "uppercase",
                                    letterSpacing: "1px",
                                    background: difficultyColors[getTodaysDifficulty()].bg,
                                    border: `1px solid ${difficultyColors[getTodaysDifficulty()].border}`,
                                    color: difficultyColors[getTodaysDifficulty()].text
                                }}>
                                    {getTodaysDifficulty()}
                                </span>
                                <span style={{ color: "#64748b", fontSize: "14px" }}>⏱️ {todaysProblem.estimatedTime} mins</span>
                            </div>
                            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#f1f5f9", marginBottom: "12px" }}>
                                {todaysProblem.title}
                            </h2>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {todaysProblem.topics.map(topic => (
                                    <span key={topic} style={{
                                        padding: "4px 12px",
                                        background: "rgba(99, 102, 241, 0.15)",
                                        border: "1px solid rgba(99, 102, 241, 0.3)",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                        color: "#818cf8"
                                    }}>
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: "rgba(30, 41, 59, 0.5)",
                        borderRadius: "12px",
                        padding: "16px",
                        marginBottom: "20px"
                    }}>
                        <h4 style={{ color: "#94a3b8", marginBottom: "8px", fontSize: "14px" }}>💡 Why This Problem?</h4>
                        <p style={{ color: "#e2e8f0", fontSize: "15px" }}>
                            This problem strengthens your understanding of <strong>{todaysProblem.topics[0]}</strong>.
                            It's commonly asked in technical interviews and helps build pattern recognition for similar problems.
                        </p>
                    </div>

                    {showHint && (
                        <div style={{
                            background: "rgba(251, 191, 36, 0.1)",
                            border: "1px solid rgba(251, 191, 36, 0.3)",
                            borderRadius: "12px",
                            padding: "16px",
                            marginBottom: "20px"
                        }}>
                            <h4 style={{ color: "#fbbf24", marginBottom: "8px", fontSize: "14px" }}>🎯 Hint</h4>
                            <p style={{ color: "#e2e8f0", fontSize: "14px" }}>
                                Think about using a {todaysProblem.topics.includes("Hashing") ? "hash map for O(1) lookups" :
                                    todaysProblem.topics.includes("Two Pointers") ? "two pointer technique" :
                                        todaysProblem.topics.includes("Binary Search") ? "binary search to optimize" :
                                            todaysProblem.topics.includes("DFS") ? "depth-first search approach" :
                                                "the most appropriate data structure"} to solve this efficiently.
                            </p>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <a
                            href={todaysProblem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                ...buttonStyle,
                                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                color: "#fff",
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                        >
                            🔗 Solve on {todaysProblem.platform}
                        </a>
                        <button
                            onClick={() => setShowHint(!showHint)}
                            style={{
                                ...buttonStyle,
                                background: "rgba(251, 191, 36, 0.15)",
                                border: "1px solid rgba(251, 191, 36, 0.3)",
                                color: "#fbbf24"
                            }}
                        >
                            {showHint ? "🙈 Hide Hint" : "💡 Show Hint"}
                        </button>
                        <button
                            onClick={() => markAsSolved(todaysProblem.id)}
                            disabled={solvedProblems.includes(todaysProblem.id)}
                            style={{
                                ...buttonStyle,
                                background: solvedProblems.includes(todaysProblem.id)
                                    ? "rgba(16, 185, 129, 0.3)"
                                    : "rgba(16, 185, 129, 0.15)",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                                color: "#10b981",
                                opacity: solvedProblems.includes(todaysProblem.id) ? 0.6 : 1
                            }}
                        >
                            {solvedProblems.includes(todaysProblem.id) ? "✅ Solved" : "✓ Mark as Solved"}
                        </button>
                        <button
                            onClick={() => skipAndGetNewProblem()}
                            disabled={todaySolved}
                            style={{
                                ...buttonStyle,
                                background: "rgba(30, 41, 59, 0.8)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                color: "#94a3b8",
                                opacity: todaySolved ? 0.4 : 1,
                                cursor: todaySolved ? "not-allowed" : "pointer"
                            }}
                        >
                            🔄 Skip (Get New)
                        </button>
                    </div>
                </div>
            )}

            {/* Weekly Plan Tab */}
            {activeTab === "week" && (
                <div style={cardStyle}>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#f1f5f9", marginBottom: "20px" }}>
                        📊 This Week's Plan
                    </h3>
                    <div style={{ display: "grid", gap: "12px" }}>
                        {weeklyProblems.map((problem, index) => (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "16px",
                                    background: problem.day === getDayName()
                                        ? "rgba(99, 102, 241, 0.15)"
                                        : "rgba(30, 41, 59, 0.5)",
                                    border: problem.day === getDayName()
                                        ? "1px solid rgba(99, 102, 241, 0.4)"
                                        : "1px solid rgba(255, 255, 255, 0.05)",
                                    borderRadius: "12px"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    <div style={{
                                        width: "50px",
                                        textAlign: "center",
                                        padding: "8px",
                                        background: "rgba(255, 255, 255, 0.05)",
                                        borderRadius: "8px"
                                    }}>
                                        <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>
                                            {problem.day.slice(0, 3)}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: "600", color: "#f1f5f9", marginBottom: "4px" }}>
                                            {problem.title}
                                        </div>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            {problem.topics.slice(0, 2).map(t => (
                                                <span key={t} style={{ fontSize: "11px", color: "#64748b" }}>{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{
                                        padding: "4px 10px",
                                        borderRadius: "6px",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        textTransform: "uppercase",
                                        ...difficultyColors[problem.difficulty],
                                        background: difficultyColors[problem.difficulty].bg,
                                        border: `1px solid ${difficultyColors[problem.difficulty].border}`,
                                        color: difficultyColors[problem.difficulty].text
                                    }}>
                                        {problem.difficulty}
                                    </span>
                                    {problem.day === getDayName() && (
                                        <span style={{
                                            background: "rgba(99, 102, 241, 0.2)",
                                            color: "#818cf8",
                                            padding: "4px 10px",
                                            borderRadius: "6px",
                                            fontSize: "11px",
                                            fontWeight: "600"
                                        }}>
                                            TODAY
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Contests Tab */}
            {activeTab === "contests" && (
                <div style={cardStyle}>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#f1f5f9", marginBottom: "20px" }}>
                        🏆 Upcoming Contests
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                        {CONTEST_PLATFORMS.map(platform => (
                            <a
                                key={platform.name}
                                href={platform.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "block",
                                    padding: "20px",
                                    background: "rgba(30, 41, 59, 0.5)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "16px",
                                    textDecoration: "none",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                    <span style={{ fontSize: "28px" }}>{platform.icon}</span>
                                    <span style={{ fontSize: "18px", fontWeight: "700", color: "#f1f5f9" }}>
                                        {platform.name}
                                    </span>
                                </div>
                                <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "12px" }}>
                                    View upcoming contests and register
                                </p>
                                <span style={{
                                    display: "inline-block",
                                    padding: "6px 12px",
                                    background: "rgba(99, 102, 241, 0.15)",
                                    border: "1px solid rgba(99, 102, 241, 0.3)",
                                    borderRadius: "8px",
                                    color: "#818cf8",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                }}>
                                    View Contests →
                                </span>
                            </a>
                        ))}
                    </div>

                    <div style={{
                        marginTop: "24px",
                        padding: "16px",
                        background: "rgba(99, 102, 241, 0.1)",
                        border: "1px solid rgba(99, 102, 241, 0.2)",
                        borderRadius: "12px"
                    }}>
                        <p style={{ color: "#e2e8f0", fontSize: "14px" }}>
                            💡 <strong>Tip:</strong> Participating in contests is great for practicing under time pressure and comparing yourself with others.
                            Start with LeetCode Weekly Contests or Codeforces Div 3/4 rounds if you're a beginner!
                        </p>
                    </div>
                </div>
            )}

            {/* All Problems Tab */}
            {activeTab === "all" && (
                <div style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                        <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#f1f5f9" }}>
                            📚 All Problems
                        </h3>
                        <select
                            value={selectedTopic}
                            onChange={(e) => setSelectedTopic(e.target.value)}
                            style={{
                                padding: "10px 16px",
                                background: "rgba(30, 41, 59, 0.8)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "10px",
                                color: "#e2e8f0",
                                fontSize: "14px",
                                cursor: "pointer"
                            }}
                        >
                            <option value="All">All Topics</option>
                            {TOPICS.map(topic => (
                                <option key={topic} value={topic}>{topic}</option>
                            ))}
                        </select>
                    </div>

                    {["easy", "medium", "hard"].map(difficulty => {
                        const problems = DSA_QUESTIONS[difficulty].filter(p =>
                            selectedTopic === "All" || p.topics.includes(selectedTopic)
                        );

                        return (
                            <div key={difficulty} style={{ marginBottom: "24px" }}>
                                <h4 style={{
                                    color: difficultyColors[difficulty].text,
                                    marginBottom: "12px",
                                    fontSize: "16px",
                                    fontWeight: "700",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}>
                                    <span style={{
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "50%",
                                        background: difficultyColors[difficulty].text
                                    }}></span>
                                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ({problems.length})
                                </h4>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "10px" }}>
                                    {problems.slice(0, 10).map(problem => (
                                        <a
                                            key={problem.id}
                                            href={problem.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "12px 16px",
                                                background: solvedProblems.includes(problem.id)
                                                    ? "rgba(16, 185, 129, 0.1)"
                                                    : "rgba(30, 41, 59, 0.5)",
                                                border: solvedProblems.includes(problem.id)
                                                    ? "1px solid rgba(16, 185, 129, 0.3)"
                                                    : "1px solid rgba(255, 255, 255, 0.05)",
                                                borderRadius: "10px",
                                                textDecoration: "none",
                                                color: "#e2e8f0",
                                                fontSize: "14px",
                                                transition: "all 0.2s ease"
                                            }}
                                        >
                                            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                {solvedProblems.includes(problem.id) && <span style={{ color: "#10b981" }}>✓</span>}
                                                {problem.title}
                                            </span>
                                            <span style={{ color: "#64748b", fontSize: "12px" }}>{problem.estimatedTime}m</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer with schedule info */}
            <div style={{
                ...cardStyle,
                background: "rgba(30, 41, 59, 0.4)",
                display: "flex",
                justifyContent: "space-around",
                flexWrap: "wrap",
                gap: "16px",
                textAlign: "center"
            }}>
                <div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Mon-Thu</div>
                    <div style={{ color: "#10b981", fontWeight: "600" }}>1 Easy/day</div>
                </div>
                <div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Fri-Sat</div>
                    <div style={{ color: "#f59e0b", fontWeight: "600" }}>1 Medium/day</div>
                </div>
                <div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Sunday</div>
                    <div style={{ color: "#ef4444", fontWeight: "600" }}>1 Hard</div>
                </div>
                <div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Weekly Total</div>
                    <div style={{ color: "#818cf8", fontWeight: "600" }}>7 Problems</div>
                </div>
            </div>
        </div>
    );
}

export default DSAPractice;
