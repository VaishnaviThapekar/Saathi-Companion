// ═══════════════════════════════════════════════════════════════════════
// HELPER UTILITIES (Timezone-Aware Date Keys, Overdue & Media Processing)
// ═══════════════════════════════════════════════════════════════════════

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

export const now = () => new Date();

// Guaranteed Local Date Key (YYYY-MM-DD) avoiding UTC timezone shift bugs
export const todayKey = (dateInput = new Date()) => {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const weekKey = (dateInput = new Date()) => {
  const d = new Date(dateInput);
  d.setDate(d.getDate() - d.getDay());
  return todayKey(d);
};

export const monthKey = (dateInput = new Date()) => {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const fmtTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const fmtDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString([], {
    month: "short",
    day: "numeric"
  });
};

export const fmtDateLong = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
};

// Accurate Overdue check with time precision
export const isOverdue = (task) => {
  if (!task || task.done || !task.dueDate) return false;
  const timePart = task.dueTime ? `${task.dueTime}:00` : "23:59:59";
  const dueDateTime = new Date(`${task.dueDate}T${timePart}`);
  return dueDateTime < now();
};

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

export const calculateStreak = (log, currentDate) => {
  if (!log) return 0;
  let streak = 0;
  let d = new Date(currentDate || todayKey());

  for (let i = 0; i < 365; i++) {
    const key = todayKey(d);
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

export const getGreeting = () => {
  const hour = now().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// Image Compression Helper to protect LocalStorage quota
export const compressImage = (dataUrl, maxWidth = 800, quality = 0.75) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};
