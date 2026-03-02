export const SLOT_DEFINITIONS = {
  // Monday, Wednesday, Friday intervals (55 mins)
  MWF: [
    { start: "08:30", end: "09:25", label: "Slot 1" },
    { start: "09:30", end: "10:25", label: "Slot 2" },
    { start: "10:30", end: "11:25", label: "Slot 3" },
    { start: "11:30", end: "12:25", label: "Slot 4" },
    { start: "14:00", end: "14:55", label: "Slot 5" },
    { start: "15:00", end: "15:55", label: "Slot 6" },
    { start: "16:00", end: "16:55", label: "Slot 7" },
    { start: "17:00", end: "17:55", label: "Slot 8" },
    { start: "18:05", end: "19:30", label: "Co-curricular" }
  ],
  // Tuesday, Thursday intervals (85 mins / mixed)
  TTH: [
    { start: "08:30", end: "09:55", label: "Long Slot 1" },
    { start: "10:00", end: "11:25", label: "Long Slot 2" },
    { start: "11:30", end: "12:25", label: "Short Slot 3" },
    { start: "14:00", end: "15:25", label: "Long Slot 4" },
    { start: "15:30", end: "16:55", label: "Long Slot 5" },
    { start: "17:00", end: "17:55", label: "Short Slot 6" },
    { start: "18:05", end: "19:30", label: "Co-curricular" }
  ]
};

export const TIMETABLE_MATRIX = {
  Monday: {
    "08:30": "A1", "09:30": "B1", "10:30": "C1", "11:30": "S1",
    "14:00": "H1", "15:00": "I1", "16:00": "J1", "17:00": "K1"
  },
  Wednesday: {
    "08:30": "D2", "09:30": "A2", "10:30": "B2", "11:30": "C2",
    "14:00": "J2", "15:00": "H2", "16:00": "I2", "17:00": "K2"
  },
  Friday: {
    "08:30": "C3", "09:30": "D3", "10:30": "A3", "11:30": "B3",
    "14:00": "I3", "15:00": "J3", "16:00": "H3", "17:00": "K3"
  },
  Tuesday: {
    "08:30": "E1", "10:00": "F1", "11:30": "D1",
    "14:00": "L1", "15:30": "L2", "17:00": "Q1"
  },
  Thursday: {
    "08:30": "F2", "10:00": "E2", "11:30": "S2",
    "14:00": "M1", "15:30": "M2", "17:00": "Q2"
  },
  Saturday: {
    "09:30": "Co-curricular", "11:00": "Co-curricular"
  }
};

// Helper: Get all specific time windows for a Slot ID
// Example: Slot "A" covers (Mon 08:30, Wed 09:30, Fri 10:30)
export const getSlotWindows = (slotId) => {
  const result = [];
  Object.keys(TIMETABLE_MATRIX).forEach(day => {
    Object.keys(TIMETABLE_MATRIX[day]).forEach(time => {
      if (TIMETABLE_MATRIX[day][time].startsWith(slotId)) {
        result.push({ day, time });
      }
    });
  });
  return result;
};
