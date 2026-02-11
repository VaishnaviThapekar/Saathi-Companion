//  ═══════════════════════════════════════════════════════════════════════

/**
 * Generate unique ID
 */
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

/**
 * Get current date/time
 */
export const now = () => new Date();

/**
 * Get today's date key (YYYY-MM-DD)
 */
export const todayKey = () => now().toISOString().slice(0, 10);

/**
 * Get start of current week (YYYY-MM-DD)
 */
export const weekKey = () => {
  const d = now();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
};

/**
 * Get current month key (YYYY-MM)
 */
export const monthKey = () => now().toISOString().slice(0, 7);

/**
 * Format time (HH:MM AM/PM)
 */
export const fmtTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};

/**
 * Format date (Month Day)
 */
export const fmtDate = (dateString) => {
  return new Date(dateString).toLocaleDateString([], {
    month: "short",
    day: "numeric"
  });
};

/**
 * Format date long (Month Day, Year)
 */
export const fmtDateLong = (dateString) => {
  return new Date(dateString).toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
};

/**
 * Check if task is overdue
 */
export const isOverdue = (task) => {
  if (task.done || !task.dueDate) return false;
  const dueDateTime = new Date(task.dueDate + "T23:59:59");
  return dueDateTime < now();
};

/**
 * Play notification sound (bell chime)
 */
export const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();

    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
  } catch (error) {
    console.error("Audio error:", error);
  }
};

/**
 * Calculate streak from date-based log
 */
export const calculateStreak = (log, currentDate) => {
  let streak = 0;
  let d = new Date(currentDate || todayKey());

  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10);
    if (log[key]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (i > 0) {
      break;
    } else {
      d.setDate(d.getDate() - 1);
    }
  }

  return streak;
};

/**
 * Get greeting based on time of day
 */
export const getGreeting = () => {
  const hour = now().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};
