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

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready
          .then((registration) => {
            registration.showNotification(title, options);
          })
          .catch(() => {
            new Notification(title, options);
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
  const currentMinute = now.getMinutes();
  const currentTimeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;
  const todayStr = now.toISOString().split("T")[0];

  const morningAlarmTime = localStorage.getItem("saathi_morning_alarm") || "08:00";
  const eveningAlarmTime = localStorage.getItem("saathi_evening_alarm") || "21:00";

  // 1. Morning Reflection Alarm
  const lastMorningAlert = localStorage.getItem("saathi_last_morning_alert");
  if (currentTimeStr === morningAlarmTime && lastMorningAlert !== todayStr) {
    sendLocalNotification(
      "🌅 Good Morning! Time for Morning Reflection",
      "Start your day with Saathi. Set your daily goals and mindfulness focus."
    );
    localStorage.setItem("saathi_last_morning_alert", todayStr);
  }

  // 2. Evening Wind-Down Alarm
  const lastEveningAlert = localStorage.getItem("saathi_last_evening_alert");
  if ((currentTimeStr === eveningAlarmTime || (currentHour >= 20 && currentHour < 21)) && lastEveningAlert !== todayStr && lastMoodLogDate !== todayStr) {
    sendLocalNotification(
      "🌸 Evening Reflection & Wind-Down",
      "Take 1 minute with Saathi to log your mood, review habit streaks, and unwind."
    );
    localStorage.setItem("saathi_last_evening_alert", todayStr);
  }

  // 3. High-priority Overdue Task Alerts
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
