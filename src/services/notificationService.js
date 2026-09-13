// ═══════════════════════════════════════════════════════════════════════
// SAATHI LOCAL BROWSER NOTIFICATION & HABIT REMINDER SERVICE
// ═══════════════════════════════════════════════════════════════════════

export const isNotificationSupported = () => {
  return typeof window !== "undefined" && "Notification" in window;
};

export const getNotificationPermission = () => {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return "unsupported";
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn("Error requesting notification permission:", err);
    return "denied";
  }
};

export const sendLocalNotification = (title, body, icon = "/icons/icon-192.svg") => {
  if (!isNotificationSupported()) return false;

  if (Notification.permission === "granted") {
    try {
      const options = {
        body,
        icon,
        badge: "/favicon-96x96.png",
        vibrate: [100, 50, 100],
        silent: false,
        tag: "saathi-reminder"
      };

      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, options);
        });
      } else {
        new Notification(title, options);
      }
      return true;
    } catch (err) {
      console.warn("Failed to dispatch browser notification:", err);
      return false;
    }
  }
  return false;
};

// Scheduler helper that checks pending tasks and daily wellness reminder
export const checkScheduledReminders = ({ tasks = [], lastMoodLogDate = null }) => {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;

  const now = new Date();
  const currentHour = now.getHours();
  const todayStr = now.toISOString().split("T")[0];

  // 1. Daily Evening Wellness Check-in (8:00 PM - 9:00 PM)
  const lastCheckinAlert = localStorage.getItem("saathi_last_checkin_alert");
  if (currentHour >= 20 && currentHour < 21 && lastCheckinAlert !== todayStr && lastMoodLogDate !== todayStr) {
    sendLocalNotification(
      "🌸 Time for your Evening Reflection",
      "Take 1 minute with Saathi to log your mood and unwind your day."
    );
    localStorage.setItem("saathi_last_checkin_alert", todayStr);
  }

  // 2. High-priority Overdue Task Alerts
  const overdueHighTasks = tasks.filter(t => !t.completed && t.priority === "high" && t.date && t.date < todayStr);
  const lastTaskAlert = localStorage.getItem("saathi_last_task_alert");
  
  if (overdueHighTasks.length > 0 && lastTaskAlert !== todayStr) {
    sendLocalNotification(
      "🔴 High Priority Task Reminder",
      `You have ${overdueHighTasks.length} pending high-priority task${overdueHighTasks.length > 1 ? "s" : ""}: "${overdueHighTasks[0].text}"`
    );
    localStorage.setItem("saathi_last_task_alert", todayStr);
  }
};
