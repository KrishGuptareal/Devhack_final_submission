import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useApp } from "./context";
import { useAuth } from "@clerk/clerk-react";
import { taskApi } from "./api";

// --- CUSTOM DROPDOWN COMPONENT ---
const CustomSelect = ({ value, options, onChange, labelMap }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: "relative", minWidth: "160px" }}>
      {/* Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          fontWeight: "600",
          borderRadius: "14px",
          border: isOpen ? "2px solid #818cf8" : "2px solid #6366f1",
          background: "#fff",
          color: "#1e293b",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "all 0.2s ease"
        }}
      >
        <span>{labelMap ? labelMap[value] : value}</span>
        <span style={{
          fontSize: "12px",
          color: "#6366f1",
          transition: "transform 0.3s ease",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
        }}>
          ▼
        </span>
      </div>

      {/* Dropdown List - FIXED Z-INDEX */}
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "115%",
          left: 0,
          width: "100%",
          maxHeight: "300px",
          overflowY: "auto",
          background: "rgba(255, 255, 255, 0.95)", // Slightly transparent
          backdropFilter: "blur(10px)",
          borderRadius: "14px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          padding: "8px",
          border: "1px solid #e2e8f0",
          // FIX: High Z-Index ensures it floats ON TOP of the calendar
          zIndex: 1000
        }}>
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "500",
                color: "#333",
                transition: "background 0.2s",
                background: value === option.value ? "#e0e7ff" : "transparent"
              }}
              onMouseEnter={(e) => e.target.style.background = "#e0e7ff"}
              onMouseLeave={(e) => e.target.style.background = value === option.value ? "#e0e7ff" : "transparent"}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN CALENDAR COMPONENT ---

function Calendar() {
  const { subjects, subjectsLoading } = useApp();
  const { getToken } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleYearChange = (newYear) => setCurrentDate(new Date(newYear, month, 1));
  const handleMonthChange = (newMonthIndex) => setCurrentDate(new Date(year, newMonthIndex, 1));

  const handleDayClick = (dateKey, dayEvents) => {
    if (dayEvents && dayEvents.length > 0) {
      setSelectedDayEvents({ date: dateKey, events: dayEvents });
    }
  };

  const closeModal = () => setSelectedDayEvents(null);

  // Fetch tasks and subjects for the current month
  useEffect(() => {
    // Wait for subjects to load
    if (subjectsLoading || !getToken) {
      setLoading(true);
      return;
    }

    const fetchCalendarData = async () => {
      setLoading(true);
      try {
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        // Fetch tasks for the month
        const tasks = await taskApi.getTasksByDateRange(
          startOfMonth.toISOString(),
          endOfMonth.toISOString(),
          getToken
        );

        // Deduplicate events using a Set of unique signatures
        const uniqueSignatures = new Set();
        const dedupedEvents = {};

        // Helper to add unique event
        const addEvent = (date, event) => {
          const signature = `${date}-${event.label}-${event.type}`;
          if (!uniqueSignatures.has(signature)) {
            uniqueSignatures.add(signature);
            if (!dedupedEvents[date]) dedupedEvents[date] = [];
            dedupedEvents[date].push(event);
          }
        };

        // Add tasks
        tasks.forEach(task => {
          if (task.scheduledDate) {
            const taskDate = new Date(task.scheduledDate);
            if (taskDate.getMonth() === month && taskDate.getFullYear() === year) {
              const dateKey = taskDate.toISOString().split('T')[0];
              let eventType = 'Practice';
              if (task.priority === 'high') eventType = 'Exam';
              else if (task.priority === 'medium') eventType = 'Assignment';

              addEvent(dateKey, {
                type: eventType,
                label: task.title || task.subjectId?.name || 'Study Session',
                taskId: task._id,
                color: task.subjectId?.color || '#6366f1',
                isDeadline: false,
                status: task.status
              });
            }
          }
        });

        // Add deadlines
        subjects.forEach(subject => {
          if (subject.deadline?.date) {
            const deadlineDate = new Date(subject.deadline.date);
            if (deadlineDate.getMonth() === month && deadlineDate.getFullYear() === year) {
              const dateKey = deadlineDate.toISOString().split('T')[0];
              addEvent(dateKey, {
                type: subject.deadline.type === 'exam' ? 'Exam' : 'Assignment',
                label: `${subject.name} - ${subject.deadline.type === 'exam' ? 'Exam' : 'Assignment'}`,
                subjectId: subject._id,
                color: subject.color || '#6366f1',
                isDeadline: true
              });
            }
          }
        });

        // Sort events: Deadlines first
        Object.keys(dedupedEvents).forEach(key => {
          dedupedEvents[key].sort((a, b) => (a.isDeadline === b.isDeadline) ? 0 : a.isDeadline ? -1 : 1);
        });

        setEvents(dedupedEvents);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [year, month, subjects, subjectsLoading, getToken]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthOptions = months.map((m, idx) => ({ value: idx, label: m }));
  const yearOptions = years.map((y) => ({ value: y, label: y.toString() }));

  return (
    <div className="dashboard-container" style={{ padding: "20px", height: "100vh", overflow: "visible" }}>
      {/* Event Details Modal */}
      {selectedDayEvents && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(5px)"
        }} onClick={closeModal}>
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            width: "400px",
            maxWidth: "90%",
            padding: "24px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            animation: "popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", color: "#1f2937" }}>
                {new Date(selectedDayEvents.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <button onClick={closeModal} style={{
                background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#6b7280"
              }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "60vh", overflowY: "auto" }}>
              {selectedDayEvents.events.map((evt, idx) => (
                <div key={idx} style={{
                  padding: "12px",
                  borderRadius: "12px",
                  background: evt.isDeadline ? "rgba(239, 68, 68, 0.05)" : "rgba(99, 102, 241, 0.05)",
                  borderLeft: `4px solid ${evt.color}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "600", color: "#374151" }}>{evt.label}</span>
                    <span style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: evt.isDeadline ? "#fee2e2" : "#e0e7ff",
                      color: evt.isDeadline ? "#ef4444" : "#6366f1",
                      fontWeight: "600"
                    }}>
                      {evt.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <style>{`
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
      )}

      {/* FIX: Moved Blur to this Overlay so the WHOLE page is blurred */}
      <div className="dashboard-overlay" style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        backdropFilter: "blur(20px)",         // Strong global blur
        WebkitBackdropFilter: "blur(20px)",
        backgroundColor: "rgba(0, 0, 0, 0.4)", // Darker tint for better contrast
        zIndex: 1,
        padding: "20px"
      }}>
        {/* CALENDAR CONTROLS SECTION */}
        <div className="glass-panel calendar-controls" style={{
          marginBottom: "20px",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          position: "relative",
          zIndex: 100,
          overflow: "visible",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            {/* Back to Dashboard Button */}
            <Link to="/dashboard" style={{
              display: "flex",
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
              transition: "all 0.2s ease"
            }}>
              ← Dashboard
            </Link>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#fff" }}>
              Academic Calendar
              {loading && <span style={{ fontSize: "12px", marginLeft: "12px", color: "#818cf8" }}>Loading...</span>}
            </h2>

            <div style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              paddingLeft: "24px",
              borderLeft: "1px solid rgba(255,255,255,0.1)"
            }}>
              <CustomSelect
                value={month}
                options={monthOptions}
                onChange={handleMonthChange}
                labelMap={months}
              />
              <CustomSelect
                value={year}
                options={yearOptions}
                onChange={handleYearChange}
              />
            </div>
          </div>
        </div>

        {/* CALENDAR GRID */}
        <div className="glass-panel calendar-grid-container" style={{
          padding: "20px",
          background: "rgba(255, 255, 255, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          position: "relative",
          zIndex: 1,
          overflowX: "auto"
        }}>
          <div className="calendar-header-row" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "16px", textAlign: "center" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="calendar-day-header" style={{ fontWeight: "800", color: "#4b5563", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>{d}</div>
            ))}
          </div>

          <div className="calendar-days-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="calendar-day-cell" style={{ minHeight: "80px" }}></div>
            ))}

            {days.map((day) => {
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events[dateKey] || [];

              return (
                <div
                  key={day}
                  className="calendar-day-cell"
                  onClick={() => handleDayClick(dateKey, dayEvents)}
                  style={{
                    minHeight: "80px",
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "12px",
                    padding: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: "4px",
                    transition: "all 0.2s ease",
                    cursor: dayEvents.length > 0 ? "pointer" : "default",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                  }}
                  onMouseEnter={(e) => {
                    if (dayEvents.length > 0) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                      e.currentTarget.style.background = "white";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
                  }}
                >
                  <span style={{ fontSize: "16px", fontWeight: "700", color: "#333" }}>{day}</span>

                  {dayEvents.length > 0 && (
                    <div style={{ width: "100%", marginTop: "auto" }}>
                      <div style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        color: "#6366f1",
                        background: "rgba(99, 102, 241, 0.1)",
                        padding: "3px 6px",
                        borderRadius: "6px",
                        textAlign: "center"
                      }}>
                        {dayEvents.length} {dayEvents.length === 1 ? 'Event' : 'Events'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Calendar Page Responsive Styles */}
      <style>{`
        /* Ensure no horizontal overflow on mobile */
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
        
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 10px !important;
          }
          .dashboard-overlay {
            padding: 10px !important;
          }
          .calendar-controls {
            padding: 12px !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .calendar-controls > div {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .calendar-controls > div > div {
            padding-left: 0 !important;
            border-left: none !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
          }
          .calendar-grid-container {
            padding: 12px !important;
            overflow-x: auto !important;
          }
          .calendar-header-row, .calendar-days-grid {
            min-width: 100% !important;
            grid-template-columns: repeat(7, 1fr) !important;
          }
          .calendar-day-header {
            font-size: 10px !important;
            letter-spacing: 0 !important;
          }
          .calendar-day-cell {
            min-height: 50px !important;
            padding: 4px !important;
            border-radius: 8px !important;
          }
          .calendar-day-cell span {
            font-size: 12px !important;
          }
          .calendar-day-cell > div > div {
            font-size: 8px !important;
            padding: 2px 4px !important;
          }
        }
        @media (max-width: 400px) {
          .calendar-day-cell {
            min-height: 40px !important;
            padding: 2px !important;
          }
          .calendar-day-cell span {
            font-size: 11px !important;
          }
          .calendar-day-cell > div > div {
            font-size: 7px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Calendar;