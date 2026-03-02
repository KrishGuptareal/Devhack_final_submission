import { useState, useEffect } from 'react';
import { useApp } from './context';
import { useAuth } from '@clerk/clerk-react';
import { taskApi } from './api';

function CalendarWidget() {
  const { subjects, subjectsLoading } = useApp();
  const { getToken } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch tasks for current month
  useEffect(() => {
    // Wait for subjects to load
    if (subjectsLoading || !getToken) {
      setLoading(true);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        const tasks = await taskApi.getTasksByDateRange(
          startOfMonth.toISOString(),
          endOfMonth.toISOString(),
          getToken
        );

        // Build events map
        const eventsMap = {};
        tasks.forEach(task => {
          if (task.scheduledDate) {
            const day = new Date(task.scheduledDate).getDate();
            if (!eventsMap[day]) {
              eventsMap[day] = [];
            }
            const eventType = task.priority === 'high' ? 'exam' : 
                            task.priority === 'medium' ? 'assignment' : 'practice';
            eventsMap[day].push(eventType);
          }
        });

        // Add subject deadlines - prioritize these
        subjects.forEach(subject => {
          if (subject.deadline?.date) {
            const deadlineDate = new Date(subject.deadline.date);
            if (deadlineDate.getMonth() === month && deadlineDate.getFullYear() === year) {
              const day = deadlineDate.getDate();
              if (!eventsMap[day]) {
                eventsMap[day] = [];
              }
              // Prioritize deadlines - add at beginning
              const deadlineType = subject.deadline.type === 'exam' ? 'exam' : 'assignment';
              eventsMap[day].unshift(deadlineType);
            }
          }
        });

        // Convert to simple format (use first event type for each day)
        const simpleEvents = {};
        Object.keys(eventsMap).forEach(day => {
          simpleEvents[day] = eventsMap[day][0]; // Use first event type
        });

        setEvents(simpleEvents);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentDate, subjects, subjectsLoading, getToken]);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = getFirstDayOfMonth(currentDate);
  const emptySlots = Array.from({ length: startDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="glass-panel" style={{ padding: "24px", marginTop: "24px" }}>

      {/* Widget Header with Mini Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "16px" }}>{monthName}</h3>
        <div style={{ display: "flex", gap: "4px" }}>
          <button onClick={() => changeMonth(-1)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>&lt;</button>
          <button onClick={() => changeMonth(1)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>&gt;</button>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "8px",
        textAlign: "center",
        fontSize: "14px",
        marginTop: "16px"
      }}>
        {["S", "M", "T", "W", "T", "F", "S"].map(d => (
          <div key={d} style={{ color: "var(--text-muted)", fontWeight: "600" }}>{d}</div>
        ))}

        {/* Empty Slots */}
        {emptySlots.map((_, index) => <div key={`empty-${index}`} />)}

        {/* Days */}
        {days.map(day => {
          const eventType = events[day];
          let bg = "transparent";
          let color = "var(--text-main)";

          if (eventType === 'exam') {
            bg = "rgba(239, 68, 68, 0.2)";
            color = "#ef4444";
          } else if (eventType === 'assignment') {
            bg = "rgba(234, 179, 8, 0.2)";
            color = "#eab308";
          } else if (eventType === 'practice') {
            bg = "rgba(16, 185, 129, 0.2)";
            color = "#10b981";
          }

          return (
            <div key={day} style={{
              padding: "8px",
              borderRadius: "50%",
              background: bg,
              color: color,
              fontWeight: eventType ? "700" : "400",
              cursor: "pointer",
              position: "relative"
            }}>
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: "16px", display: "flex", gap: "12px", fontSize: "12px", justifyContent: "center" }}>
        <span style={{ color: "#ef4444" }}>● Exam</span>
        <span style={{ color: "#eab308" }}>● Assign</span>
        <span style={{ color: "#10b981" }}>● Pract</span>
      </div>
    </div>
  );
}

export default CalendarWidget;