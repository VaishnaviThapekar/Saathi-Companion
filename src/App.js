import { useState, useEffect, useRef, useCallback } from "react";
import HomeScreen from "./components/screens/HomeScreen";

// ═══════════════════════════════════════════════════════════════════════
// STORAGE MOCK - Makes name & data persist permanently
// ═══════════════════════════════════════════════════════════════════════

if (!window.storage) {
  window.storage = {
    get: async (key) => {
      const val = localStorage.getItem(key);
      return val ? { value: val } : null;
    },
    set: async (key, value) => {
      localStorage.setItem(key, value);
      return true;
    },
    delete: async (key) => {
      localStorage.removeItem(key);
      return true;
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════
const Icon = ({ name, size = 22, color = "currentColor", sw = 1.8 }) => {
  const icons = {
    home: <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H15v-7H9v7H4a1 1 0 01-1-1V9.5z" />,
    tasks: <><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M7 9h10M7 13h6" /></>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />,
    memories: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>,
    chat: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>,
    check: <path d="M20 6L9 17l-5-5" />,
    trash: <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />,
    spark: <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />,
    send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
    camera: <><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></>,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></>,
    smile: <><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></>,
    cloud: <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />,
    sun: <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>,
    droplet: <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />,
    zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    wind: <><path d="M9.59 4.59a2 2 0 113.77 1.41L3 12h9" /><path d="M11.37 16.37a2 2 0 102.77.66L9 7" /><path d="M14.5 20.5a2 2 0 103.77-1.41L8 12h9" /></>,
    mic: <><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>,
    brain: <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-5 0v-8a2.5 2.5 0 015 0M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 005 0v-8a2.5 2.5 0 00-5 0" />,
    target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,

  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ═════════════════════════════════════════════════════════════════════════
// UTILS
// ═════════════════════════════════════════════════════════════════════════
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const now = () => new Date();
const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const todayKey = () => localDateKey(now());
const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;
const normalizeDailyNotes = (notes) => {
  if (!notes || typeof notes !== "object" || Array.isArray(notes)) {
    return {};
  }

  const normalized = { ...notes };

  Object.keys(notes).forEach(key => {
    if (!dateKeyPattern.test(key)) return;
    const utcDate = new Date(`${key}T00:00:00Z`);
    if (Number.isNaN(utcDate.getTime())) return;
    const localKey = localDateKey(utcDate);
    if (!normalized[localKey]) {
      normalized[localKey] = notes[key];
    }
  });

  return normalized;
};
const fmtTime = d => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtDate = d => new Date(d).toLocaleDateString([], { month: "short", day: "numeric" });
const isOverdue = t => !t.done && t.dueDate && new Date(t.dueDate + "T23:59:59") < now();
const ensureArray = value => (Array.isArray(value) ? value : []);
const getLegacyPin = () => {
  try {
    const candidates = [
      localStorage.getItem("lockPinBackup"),
      localStorage.getItem("lockPin"),
      localStorage.getItem("privacyPin"),
      localStorage.getItem("pin")
    ];

    return candidates.find(pin => pin && pin !== "null" && pin !== "undefined") || "";
  } catch {
    return "";
  }
};
const normalizeLockState = (enabled, pin) => {
  const normalizedPin = pin || getLegacyPin();
  const normalizedEnabled = normalizedPin ? true : Boolean(enabled);
  return { normalizedEnabled, normalizedPin };
};

const load = async (k, fb) => { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : fb; } catch { return fb; } };
const save = async (k, v) => { try { await window.storage.set(k, JSON.stringify(v)); } catch (e) { console.error(e); } };

const callAI = async (prompt, maxTokens = 800) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] })
  });
  const data = await res.json();
  return data.content[0].text;
};

const pickFrom = (items, seed) => items[seed % items.length];
const normalize = (text) => (text || "").toLowerCase();
const truncateText = (text, max = 80) => (text.length > max ? `${text.slice(0, max - 3)}...` : text);

const getLocalChatReply = ({ userName, meaningfulMoments, message }) => {
  const msg = normalize(message);
  const name = userName || "there";
  const lastMoment = meaningfulMoments.slice().reverse().find(m => m && m.text);
  const memoryLine = lastMoment
    ? `I remember you noted: "${truncateText(lastMoment.text)}". `
    : "";

  let reply = "";

  if (/^(hi|hello|hey)\b/.test(msg)) {
    reply = `Hi ${name}. I'm here with you. How are you feeling right now?`;
  } else if (/(sad|down|lonely|depress|upset|cry|anx|stress|overwhelm)/.test(msg)) {
    reply = `I'm really sorry you're feeling that way. ${memoryLine}Do you want to share what's weighing on you most?`;
  } else if (/(happy|good|great|excited|proud|grateful|relieved)/.test(msg)) {
    reply = `I'm glad to hear that. ${memoryLine}Want to capture what made it feel good?`;
  } else if (/(tired|exhaust|sleep|burnout)/.test(msg)) {
    reply = "Sounds like your body is asking for rest. Want to talk about what's draining you or try a quick reset?";
  } else if (/(task|todo|plan|habit|goal|focus|procrast)/.test(msg)) {
    reply = "We can break it into one small step. What's the tiniest next action you can do in 5 minutes?";
  } else if (/thank|thanks/.test(msg)) {
    reply = "You're welcome. I'm here for you. Want to keep going or pause for a breath?";
  } else if (/help|what should i do|advice/.test(msg)) {
    reply = "Let's keep it gentle and practical. What do you want to feel by the end of today?";
  } else if (msg.length < 4) {
    reply = "I'm here. If you want, tell me a little more about what's on your mind.";
  } else {
    reply = `Thanks for sharing that. ${memoryLine}What feels most important to you right now?`;
  }

  const followUps = [
    "If you'd like, we can do a 4-4-6 breath together.",
    "Want me to save this as a meaningful moment?",
    "Should I turn this into a small task or habit?"
  ];

  const extra = pickFrom(followUps, message.length || 1);
  return `${reply} ${extra}`.replace(/\s+/g, " ").trim();
};

const playNotificationSound = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.frequency.value = 800; gain.gain.value = 0.3;
  osc.start(); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  osc.stop(ctx.currentTime + 0.5);
};

// ═══════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("home");
  const [userName, setUserName] = useState(() => {
    try {
      const raw = localStorage.getItem("userName");
      return raw ? JSON.parse(raw) : "";
    } catch {
      return "";
    }
  });
  const [booted, setBooted] = useState(false);

  // Core data
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [notes, setNotes] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [meaningfulMoments, setMeaningfulMoments] = useState([]);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [dailyCheckIn, setDailyCheckIn] = useState(null);
  const [lastCheckInDate, setLastCheckInDate] = useState(null);
  const [dailyNotes, setDailyNotes] = useState({});

  // Privacy
  const [lockEnabled, setLockEnabled] = useState(false);
  const [lockPin, setLockPin] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  // Phase 1 features
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [gratitude, setGratitude] = useState({});
  const [energyLog, setEnergyLog] = useState({});
  const [moodLog, setMoodLog] = useState([]);
  const [affirmations, setAffirmations] = useState([]);
  const [weeklyReflection, setWeeklyReflection] = useState(null);
  const [emotionalPatterns, setEmotionalPatterns] = useState(null);
  const [autoSuggestions, setAutoSuggestions] = useState([]);
  const [toast, setToast] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [activeTaskAlarm, setActiveTaskAlarm] = useState(null);
  const toastTimerRef = useRef(null);
  const alarmIntervalRef = useRef(null);
  const alarmTimeoutRef = useRef(null);

  // ── Boot ──
  useEffect(() => {
    (async () => {
      const [n, t, hb, nt, ph, mm, ch, dc, lcd, dn, vn, gr, el, ml, af, wr, ep, as, le, lp, lsa] = await Promise.all([
        load("userName", ""), load("tasks", []), load("habits", []), load("notes", []), load("photos", []),
        load("meaningfulMoments", []), load("chatMsgs", []), load("dailyCheckIn", null),
        load("lastCheckInDate", null), load("dailyNotes", {}), load("voiceNotes", []), load("gratitude", {}),
        load("energyLog", {}), load("moodLog", []), load("affirmations", []), load("weeklyReflection", null),
        load("emotionalPatterns", null), load("autoSuggestions", []), load("lockEnabled", false), load("lockPin", ""),
        load("lastSavedAt", null),
      ]);

      const normalizedTasks = ensureArray(t);
      const normalizedHabits = ensureArray(hb);
      const normalizedNotes = ensureArray(nt);
      const normalizedPhotos = ensureArray(ph);
      const normalizedMoments = ensureArray(mm);
      const normalizedChatMsgs = ensureArray(ch);
      const normalizedVoiceNotes = ensureArray(vn);
      const normalizedMoodLog = ensureArray(ml);
      const normalizedAffirmations = ensureArray(af);
      const normalizedAutoSuggestions = ensureArray(as);

      setUserName(n); setTasks(normalizedTasks); setHabits(normalizedHabits); setNotes(normalizedNotes); setPhotos(normalizedPhotos); setMeaningfulMoments(normalizedMoments);
      const normalizedDailyNotes = normalizeDailyNotes(dn);
      setChatMsgs(normalizedChatMsgs); setDailyCheckIn(dc); setLastCheckInDate(lcd); setDailyNotes(normalizedDailyNotes); setVoiceNotes(normalizedVoiceNotes);
      setGratitude(gr); setEnergyLog(el); setMoodLog(normalizedMoodLog); setAffirmations(normalizedAffirmations); setWeeklyReflection(wr);
      setEmotionalPatterns(ep); setAutoSuggestions(normalizedAutoSuggestions);
      setLastSavedAt(lsa);
      const { normalizedEnabled, normalizedPin } = normalizeLockState(le, lp);
      setLockEnabled(normalizedEnabled); setLockPin(normalizedPin);
      if (le && lp) setIsLocked(true);

      setBooted(true);
      if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
    })();
  }, []);

  // ── Persist ──
  useEffect(() => { if (booted) save("userName", userName); }, [userName, booted]);
  useEffect(() => { if (booted) save("tasks", tasks); }, [tasks, booted]);
  useEffect(() => { if (booted) save("habits", habits); }, [habits, booted]);
  useEffect(() => { if (booted) save("notes", notes); }, [notes, booted]);
  useEffect(() => { if (booted) save("photos", photos); }, [photos, booted]);
  useEffect(() => { if (booted) save("meaningfulMoments", meaningfulMoments); }, [meaningfulMoments, booted]);
  useEffect(() => { if (booted) save("chatMsgs", chatMsgs); }, [chatMsgs, booted]);
  useEffect(() => { if (booted) save("dailyCheckIn", dailyCheckIn); }, [dailyCheckIn, booted]);
  useEffect(() => { if (booted) save("lastCheckInDate", lastCheckInDate); }, [lastCheckInDate, booted]);
  useEffect(() => { if (booted) save("dailyNotes", dailyNotes); }, [dailyNotes, booted]);
  useEffect(() => { if (booted) save("voiceNotes", voiceNotes); }, [voiceNotes, booted]);
  useEffect(() => { if (booted) save("gratitude", gratitude); }, [gratitude, booted]);
  useEffect(() => { if (booted) save("energyLog", energyLog); }, [energyLog, booted]);
  useEffect(() => { if (booted) save("moodLog", moodLog); }, [moodLog, booted]);
  useEffect(() => { if (booted) save("affirmations", affirmations); }, [affirmations, booted]);
  useEffect(() => { if (booted) save("weeklyReflection", weeklyReflection); }, [weeklyReflection, booted]);
  useEffect(() => { if (booted) save("emotionalPatterns", emotionalPatterns); }, [emotionalPatterns, booted]);
  useEffect(() => { if (booted) save("autoSuggestions", autoSuggestions); }, [autoSuggestions, booted]);
  useEffect(() => { if (booted) save("lockEnabled", lockEnabled); }, [lockEnabled, booted]);
  useEffect(() => {
    if (!booted) return;
    save("lockPin", lockPin);
    if (lockPin) {
      try {
        localStorage.setItem("lockPinBackup", lockPin);
      } catch {
        // ignore backup failures
      }
    }
  }, [lockPin, booted]);

  useEffect(() => {
    if (!booted) return;
    const ts = now().toISOString();
    setLastSavedAt(ts);
    save("lastSavedAt", ts);
  }, [
    booted,
    userName,
    tasks,
    habits,
    notes,
    photos,
    meaningfulMoments,
    chatMsgs,
    dailyCheckIn,
    lastCheckInDate,
    dailyNotes,
    voiceNotes,
    gratitude,
    energyLog,
    moodLog,
    affirmations,
    weeklyReflection,
    emotionalPatterns,
    autoSuggestions,
    lockEnabled,
    lockPin,
  ]);

  // ── Habit reminders ──
  useEffect(() => {
    if (!booted) return;

    const pad = (n) => String(n).padStart(2, "0");
    const getNowTime = () => {
      const d = now();
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const check = () => {
      const time = getNowTime();
      const today = todayKey();
      habits.forEach(h => {
        if (h.archived) return;
        if (!h.reminderEnabled || !h.reminderTime) return;
        if (h.lastRemindedDate === today) return;
        if (h.reminderTime !== time) return;
        if ((h.completions || []).includes(today)) return;

        playNotificationSound();
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Habit Reminder", { body: `"${h.title}" is waiting for you.` });
        }
        setHabits(p => p.map(x => x.id === h.id ? { ...x, lastRemindedDate: today } : x));
      });
    };

    check();
    const iv = setInterval(check, 60000);
    return () => clearInterval(iv);
  }, [booted, habits]);

  const triggerAlarmSignal = useCallback(() => {
    playNotificationSound();
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, []);

  const startTaskAlarm = useCallback((task) => {
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
    setActiveTaskAlarm({ id: task.id, title: task.title, dueDate: task.dueDate, dueTime: task.dueTime, snoozedUntil: null });
    triggerAlarmSignal();
    alarmIntervalRef.current = setInterval(triggerAlarmSignal, 4000);
  }, [triggerAlarmSignal]);

  const snoozeTaskAlarm = (minutes) => {
    if (!activeTaskAlarm) return;
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
    const until = Date.now() + minutes * 60 * 1000;
    setActiveTaskAlarm(p => (p ? { ...p, snoozedUntil: until } : p));
    alarmTimeoutRef.current = setTimeout(() => {
      setActiveTaskAlarm(p => (p ? { ...p, snoozedUntil: null } : p));
      triggerAlarmSignal();
      alarmIntervalRef.current = setInterval(triggerAlarmSignal, 4000);
    }, minutes * 60 * 1000);
  };

  // ── Task notifications ──
  useEffect(() => {
    const check = () => {
      tasks.forEach(t => {
        if (!t.done && !t.notified && t.dueDate && t.dueTime) {
          const dueDateTime = new Date(`${t.dueDate}T${t.dueTime}`);
          if (dueDateTime <= now()) {
            triggerAlarmSignal();
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("🔔 Task Reminder", { body: `"${t.title}" is due now!` });
            }
            const isSameAlarm = activeTaskAlarm && activeTaskAlarm.id === t.id;
            const snoozed = isSameAlarm && activeTaskAlarm.snoozedUntil && Date.now() < activeTaskAlarm.snoozedUntil;
            if (!snoozed && (!activeTaskAlarm || activeTaskAlarm.id !== t.id)) {
              startTaskAlarm(t);
            }
            setTasks(p => p.map(tk => tk.id === t.id ? { ...tk, notified: true } : tk));
          }
        }
        if (isOverdue(t) && !t.overdueNotified) {
          playNotificationSound();
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("⚠️ Overdue", { body: `"${t.title}" is overdue` });
          }
          setTasks(p => p.map(tk => tk.id === t.id ? { ...tk, overdueNotified: true } : tk));
        }
      });
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, [tasks, activeTaskAlarm, startTaskAlarm, triggerAlarmSignal]);

  useEffect(() => {
    if (!activeTaskAlarm) return;
    const current = tasks.find(t => t.id === activeTaskAlarm.id);
    if (!current || current.done) {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
      if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
      alarmIntervalRef.current = null;
      alarmTimeoutRef.current = null;
      setActiveTaskAlarm(null);
    }
  }, [tasks, activeTaskAlarm]);

  // ── Daily check-in ──
  useEffect(() => {
    if (!booted || !userName) return;
    const today = todayKey();
    if (lastCheckInDate !== today) {
      const questions = [
        "How are you really feeling today?",
        "Did anything feel heavy today?",
        "What did you need but didn't get?",
        "What made you smile, even a little?",
        "Is there something you're carrying that you'd like to put down?",
        "What felt good today?",
      ];
      setDailyCheckIn({ date: today, question: questions[Math.floor(Math.random() * questions.length)], answer: "" });
    }
  }, [booted, userName, lastCheckInDate]);

  // ── AI: Generate affirmation ──
  const generateAffirmation = async () => {
    const struggles = meaningfulMoments.filter(m => m.type === "struggle").slice(-3).map(m => m.text).join("; ");
    if (!struggles) {
      setAffirmations(p => [...p, { id: uid(), text: "You are doing your best, and that is enough.", date: now().toISOString() }]);
      return;
    }
    try {
      const prompt = `Based on these struggles: "${struggles}", create 1 warm, personalized affirmation for ${userName}. Make it specific. 1 sentence.`;
      const text = await callAI(prompt, 100);
      setAffirmations(p => [...p, { id: uid(), text: text.replace(/"/g, ""), date: now().toISOString() }]);
    } catch (e) {
      setAffirmations(p => [...p, { id: uid(), text: "You're stronger than you know.", date: now().toISOString() }]);
    }
  };

  const resetAccount = () => {
    localStorage.clear();
    setUserName("");
    setTasks([]);
    setHabits([]);
    setNotes([]);
    setPhotos([]);
    setMeaningfulMoments([]);
    setChatMsgs([]);
    setDailyCheckIn(null);
    setLastCheckInDate(null);
    setDailyNotes({});
    setVoiceNotes([]);
    setGratitude({});
    setEnergyLog({});
    setMoodLog([]);
    setAffirmations([]);
    setWeeklyReflection(null);
    setEmotionalPatterns(null);
    setAutoSuggestions([]);
    setLockEnabled(false);
    setLockPin("");
    setIsLocked(false);
    setLastSavedAt(null);
    setTab("home");
  };

  const showToast = (message) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 2500);
  };

  const dismissTaskAlarm = () => {
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
    alarmIntervalRef.current = null;
    alarmTimeoutRef.current = null;
    setActiveTaskAlarm(null);
  };

  if (!booted) return <div style={{ background: "linear-gradient(135deg, #fef3e2 0%, #fde8f4 50%, #e8f5e9 100%)", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#8b7e74", fontSize: 15 }}>Loading…</span></div>;
  if (lockEnabled && lockPin && isLocked) return <LockScreen onUnlock={() => setIsLocked(false)} lockPin={lockPin} onReset={() => { setLockEnabled(false); setLockPin(""); setIsLocked(false); }} />;
  if (!userName) return <NameSetup onSet={setUserName} />;

  const shared = { userName, tasks, setTasks, habits, setHabits, notes, setNotes, photos, setPhotos, meaningfulMoments, setMeaningfulMoments, chatMsgs, setChatMsgs, dailyCheckIn, setDailyCheckIn, lastCheckInDate, setLastCheckInDate, dailyNotes, setDailyNotes, voiceNotes, setVoiceNotes, gratitude, setGratitude, energyLog, setEnergyLog, moodLog, setMoodLog, affirmations, setAffirmations, generateAffirmation, weeklyReflection, setWeeklyReflection, emotionalPatterns, setEmotionalPatterns, autoSuggestions, setAutoSuggestions, Icon, setTab, lockEnabled, setLockEnabled, lockPin, setLockPin, setIsLocked, resetAccount, lastSavedAt };

  const screens = {
    home: <HomeScreen {...shared} />,
    tasks: <TasksScreen {...shared} onTaskAdded={showToast} />,
    habits: <HabitsScreen {...shared} />,
    wellness: <WellnessScreen {...shared} />,
    memories: <MemoriesScreen {...shared} />,
    notes: <DailyNotesScreen dailyNotes={dailyNotes} setDailyNotes={setDailyNotes} />,
    heart: <MeaningfulMomentsScreen {...shared} />,
    chat: <ChatScreen {...shared} />,
    settings: <SettingsScreen {...shared} />,
  };

  return (
    <div className="app-shell">
      {activeTaskAlarm && (
        <div style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(255, 255, 255, 0.95)", border: "1px solid rgba(255, 195, 160, 0.5)", borderRadius: 16, padding: "12px 14px", color: "#5a4a42", fontSize: 13, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)", zIndex: 250, width: "calc(100% - 32px)", maxWidth: 420, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <strong style={{ fontSize: 13 }}>Task due now</strong>
            <span style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.8)" }}>{activeTaskAlarm.title}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setTasks(p => p.map(t => t.id === activeTaskAlarm.id ? { ...t, done: true } : t)); dismissTaskAlarm(); }} style={{ padding: "6px 10px", borderRadius: 10, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Mark done</button>
            <button onClick={() => snoozeTaskAlarm(5)} style={{ padding: "6px 10px", borderRadius: 10, background: "rgba(139, 126, 116, 0.12)", border: "none", color: "rgba(139, 126, 116, 0.8)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Snooze</button>
            <button onClick={dismissTaskAlarm} style={{ padding: "6px 10px", borderRadius: 10, background: "rgba(139, 126, 116, 0.12)", border: "none", color: "rgba(139, 126, 116, 0.8)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Dismiss</button>
          </div>
        </div>
      )}
      {toast && (
        <div style={{ position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)", background: "rgba(255, 255, 255, 0.9)", border: "1px solid rgba(255, 195, 160, 0.4)", borderRadius: 14, padding: "10px 14px", color: "#5a4a42", fontSize: 13, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)", zIndex: 200 }}>
          {toast}
        </div>
      )}
      <div style={{ paddingBottom: 90 }}>{screens[tab]}</div>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// NAME SETUP
// ═══════════════════════════════════════════════════════════════════════
function NameSetup({ onSet }) {
  const [name, setName] = useState("");
  return (
    <div style={{ background: "linear-gradient(135deg, #fef3e2 0%, #fde8f4 50%, #e8f5e9 100%)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ width: 100, height: 100, borderRadius: 50, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32, boxShadow: "0 8px 24px rgba(255, 175, 189, 0.3)" }}>
        <Icon name="heart" size={45} color="#fff" sw={1.5} />
      </div>
      <h1 style={{ color: "#8b7e74", fontSize: 32, fontFamily: "'Crimson Text', serif", marginBottom: 12, fontStyle: "italic" }}>Your Companion</h1>
      <p style={{ color: "rgba(139, 126, 116, 0.6)", fontSize: 15, textAlign: "center", lineHeight: 1.7, marginBottom: 40, maxWidth: 300 }}>I'm here to remember, support, and walk beside you.</p>
      <input autoFocus placeholder="What's your name?" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && name.trim() && onSet(name.trim())}
        style={{ width: "100%", maxWidth: 320, padding: "16px 20px", borderRadius: 16, border: "2px solid rgba(255, 195, 160, 0.3)", background: "rgba(255, 255, 255, 0.8)", color: "#5a4a42", fontSize: 16, outline: "none" }} />
      <button onClick={() => name.trim() && onSet(name.trim())} style={{ marginTop: 16, width: "100%", maxWidth: 320, padding: "15px 0", borderRadius: 16, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 16px rgba(255, 175, 189, 0.3)" }}>
        Let's Begin
      </button>
    </div>
  );
}

function LockScreen({ onUnlock, lockPin, onReset }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (pin === lockPin) {
      setError("");
      setPin("");
      onUnlock();
      return;
    }
    setError("Incorrect PIN");
  };

  return (
    <div style={{ background: "linear-gradient(135deg, #fef3e2 0%, #fde8f4 50%, #e8f5e9 100%)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ width: 90, height: 90, borderRadius: 45, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 8px 24px rgba(255, 175, 189, 0.3)" }}>
        <Icon name="lock" size={42} color="#fff" sw={1.6} />
      </div>
      <h1 style={{ color: "#8b7e74", fontSize: 28, fontFamily: "'Crimson Text', serif", marginBottom: 12, fontStyle: "italic" }}>Unlock</h1>
      <p style={{ color: "rgba(139, 126, 116, 0.6)", fontSize: 14, textAlign: "center", lineHeight: 1.7, marginBottom: 20 }}>Enter your PIN to continue.</p>
      <input autoFocus type="password" inputMode="numeric" placeholder="PIN" value={pin} onChange={e => { setPin(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && submit()}
        style={{ width: "100%", maxWidth: 240, padding: "14px 18px", borderRadius: 14, border: "2px solid rgba(255, 195, 160, 0.3)", background: "rgba(255, 255, 255, 0.8)", color: "#5a4a42", fontSize: 16, outline: "none", textAlign: "center", letterSpacing: 3 }} />
      {error && <p style={{ color: "#ff9a76", fontSize: 12, marginTop: 8 }}>{error}</p>}
      <button onClick={submit} style={{ marginTop: 16, width: "100%", maxWidth: 240, padding: "12px 0", borderRadius: 14, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        Unlock
      </button>
      <button onClick={onReset} style={{ marginTop: 10, background: "none", border: "none", color: "rgba(139, 126, 116, 0.6)", fontSize: 12, cursor: "pointer" }}>
        Reset lock
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// BOTTOM NAV
// ═══════════════════════════════════════════════════════════════════════
function BottomNav({ tab, setTab }) {
  const tabs = [
    { id: "home", icon: "home", label: "Home" },
    { id: "tasks", icon: "tasks", label: "Tasks" },
    { id: "habits", icon: "target", label: "Habits" },
    { id: "wellness", icon: "heart", label: "Wellness" },
    { id: "memories", icon: "memories", label: "Memories" },
    { id: "notes", icon: "calendar", label: "Notes" },
    { id: "chat", icon: "chat", label: "Chat" },
    { id: "settings", icon: "lock", label: "Settings" },
  ];
  return (
    <div className="bottom-nav" style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 430,
      background: "linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.95) 100%)",
      backdropFilter: "blur(30px)",
      WebkitBackdropFilter: "blur(30px)",
      borderTop: "1.5px solid rgba(255, 255, 255, 0.6)",
      display: "flex",
      justifyContent: "space-around",
      padding: "12px 0 24px",
      zIndex: 100,
      boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.08)"
    }}>
      {
        tabs.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`bottom-nav-btn${active ? " is-active" : ""}`}
              style={{
                background: "none",
                border: "none",
                color: active ? "#ff9a76" : "rgba(139, 126, 116, 0.5)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                cursor: "pointer",
                position: "relative",
                padding: "6px 12px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                borderRadius: 12
              }}
            >
              <span className="bottom-nav-icon">
                <Icon name={t.icon} size={22} color="currentColor" sw={active ? 2.4 : 1.8} />
              </span>
              <span className="bottom-nav-label" style={{
                fontSize: 10,
                fontWeight: active ? 700 : 600,
                letterSpacing: "0.3px",
                transition: "all 0.3s ease",
                opacity: active ? 1 : 0.8
              }}>
                {t.label}
              </span>
              {active && (
                <div style={{
                  position: "absolute",
                  top: -8,
                  width: 28,
                  height: 3,
                  borderRadius: 2,
                  background: "linear-gradient(90deg, #ffc3a0, #ffafbd)",
                  boxShadow: "0 2px 8px rgba(255, 175, 189, 0.3)",
                  animation: "slideDown 0.4s ease both"
                }} />
              )}
            </button>
          );
        })
      }
    </div >
  );
}

function SettingsScreen({
  userName,
  tasks,
  habits,
  notes,
  photos,
  meaningfulMoments,
  chatMsgs,
  dailyCheckIn,
  lastCheckInDate,
  dailyNotes,
  voiceNotes,
  gratitude,
  energyLog,
  moodLog,
  affirmations,
  weeklyReflection,
  emotionalPatterns,
  autoSuggestions,
  lastSavedAt,
  lockEnabled,
  setLockEnabled,
  lockPin,
  setLockPin,
  setIsLocked,
  resetAccount,
}) {
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [changingPin, setChangingPin] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [exportSelection, setExportSelection] = useState({
    tasks: true,
    habits: true,
    notes: true,
    meaningfulMoments: true,
    moodLog: true,
    energyLog: true,
    gratitude: true,
    dailyNotes: true,
  });

  const download = (filename, content, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const csvEscape = (v) => {
    const s = String(v ?? "");
    if (s.includes("\"")) return `"${s.replace(/"/g, '""')}"`;
    if (s.includes(",") || s.includes("\n")) return `"${s}"`;
    return s;
  };

  const toCsv = (header, rows) => {
    const lines = [header.join(",")];
    rows.forEach(r => lines.push(r.map(csvEscape).join(",")));
    return lines.join("\n");
  };

  const exportJson = () => {
    const data = { userName, photos, chatMsgs, dailyCheckIn, lastCheckInDate, voiceNotes, affirmations, weeklyReflection, emotionalPatterns, autoSuggestions };
    if (exportSelection.tasks) data.tasks = tasks;
    if (exportSelection.habits) data.habits = habits;
    if (exportSelection.notes) data.notes = notes;
    if (exportSelection.meaningfulMoments) data.meaningfulMoments = meaningfulMoments;
    if (exportSelection.moodLog) data.moodLog = moodLog;
    if (exportSelection.energyLog) data.energyLog = energyLog;
    if (exportSelection.gratitude) data.gratitude = gratitude;
    if (exportSelection.dailyNotes) data.dailyNotes = dailyNotes;
    download("ai-companion-export.json", JSON.stringify(data, null, 2), "application/json");
  };

  const exportCsv = () => {
    if (exportSelection.tasks) {
      download("tasks.csv", toCsv(
        ["id", "title", "done", "dueDate", "dueTime", "createdAt", "notified", "overdueNotified"],
        tasks.map(t => [t.id, t.title, t.done, t.dueDate, t.dueTime, t.createdAt, t.notified, t.overdueNotified])
      ), "text/csv");
    }

    if (exportSelection.habits) {
      download("habits.csv", toCsv(
        ["id", "title", "schedule", "goalPerWeek", "color", "archived", "reminderEnabled", "reminderTime", "completions"],
        habits.map(h => [h.id, h.title, h.schedule, h.goalPerWeek, h.color, h.archived, h.reminderEnabled, h.reminderTime, (h.completions || []).join("|")])
      ), "text/csv");
    }

    if (exportSelection.notes) {
      download("notes.csv", toCsv(
        ["id", "title", "body", "date"],
        notes.map(n => [n.id, n.title, n.body, n.date])
      ), "text/csv");
    }

    if (exportSelection.meaningfulMoments) {
      download("moments.csv", toCsv(
        ["id", "type", "text", "emotion", "date"],
        meaningfulMoments.map(m => [m.id, m.type, m.text, m.emotion, m.date])
      ), "text/csv");
    }

    if (exportSelection.moodLog) {
      download("mood.csv", toCsv(
        ["id", "date", "mood", "struggles", "timestamp"],
        moodLog.map(m => [m.id, m.date, m.mood, m.struggles, m.timestamp])
      ), "text/csv");
    }

    if (exportSelection.energyLog) {
      const energyRows = Object.entries(energyLog).flatMap(([date, entries]) =>
        (entries || []).map(e => [date, e.time, e.level])
      );
      download("energy.csv", toCsv(["date", "time", "level"], energyRows), "text/csv");
    }

    if (exportSelection.gratitude) {
      const gratitudeRows = Object.entries(gratitude).map(([date, text]) => [date, text]);
      download("gratitude.csv", toCsv(["date", "text"], gratitudeRows), "text/csv");
    }

    if (exportSelection.dailyNotes) {
      const dailyNotesRows = Object.entries(dailyNotes).map(([date, text]) => [date, text]);
      download("daily-notes.csv", toCsv(["date", "text"], dailyNotesRows), "text/csv");
    }
  };

  const handlePinSave = () => {
    setPinError("");
    if (!/^[0-9]{4,6}$/.test(pin)) {
      setPinError("PIN must be 4-6 digits");
      return;
    }
    if (pin !== pinConfirm) {
      setPinError("PINs do not match");
      return;
    }
    setLockPin(pin);
    setLockEnabled(true);
    setChangingPin(false);
    setCurrentPin("");
    setPin("");
    setPinConfirm("");
  };

  const handlePinChange = () => {
    setPinError("");
    if (currentPin !== lockPin) {
      setPinError("Current PIN is incorrect");
      return;
    }
    handlePinSave();
  };

  const formatSavedAt = (value) => {
    if (!value) return "Not saved yet";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "Unknown";
    return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ padding: "32px 24px 90px" }}>
      <h2 style={{ fontSize: 24, fontFamily: "'Crimson Text', serif", fontWeight: 400, fontStyle: "italic", color: "#8b7e74", marginBottom: 16 }}>Privacy & Export</h2>

      <div className="glass" style={{ borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: "#5a4a42", fontWeight: 600, marginBottom: 6 }}>Data status</p>
        <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.6)", marginBottom: 10 }}>Last saved: {formatSavedAt(lastSavedAt)}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.6)" }}>Tasks: {tasks.length}</span>
          <span style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.6)" }}>Notes: {notes.length}</span>
          <span style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.6)" }}>Daily notes: {Object.keys(dailyNotes || {}).length}</span>
        </div>
      </div>

      <div className="glass" style={{ borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 14, color: "#5a4a42", fontWeight: 600 }}>App Lock</p>
            <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.5)" }}>Protect your data with a PIN</p>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(139, 126, 116, 0.7)" }}>
            <input type="checkbox" checked={lockEnabled} onChange={e => setLockEnabled(e.target.checked)} />
            Enabled
          </label>
        </div>

        {lockEnabled && !lockPin && (
          <div>
            <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.6)", marginBottom: 8 }}>Set your PIN</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input type="password" inputMode="numeric" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value)}
                style={{ flex: 1, background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "8px 12px", color: "#5a4a42", fontSize: 12, outline: "none" }} />
              <input type="password" inputMode="numeric" placeholder="Confirm" value={pinConfirm} onChange={e => setPinConfirm(e.target.value)}
                style={{ flex: 1, background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "8px 12px", color: "#5a4a42", fontSize: 12, outline: "none" }} />
            </div>
            {pinError && <p style={{ fontSize: 11, color: "#ff9a76", marginBottom: 6 }}>{pinError}</p>}
            <button onClick={handlePinSave} style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save PIN</button>
          </div>
        )}

        {lockEnabled && lockPin && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button onClick={() => setIsLocked(true)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: "rgba(139, 126, 116, 0.1)", border: "none", color: "rgba(139, 126, 116, 0.7)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Lock now</button>
              <button onClick={() => { setLockEnabled(false); setLockPin(""); setChangingPin(false); }} style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: "rgba(255, 154, 118, 0.15)", border: "1px solid rgba(255, 154, 118, 0.3)", color: "#ff9a76", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Disable lock</button>
            </div>
            {!changingPin ? (
              <button onClick={() => setChangingPin(true)} style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Change PIN</button>
            ) : (
              <div>
                <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.6)", marginBottom: 8 }}>Change PIN</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input type="password" inputMode="numeric" placeholder="Current" value={currentPin} onChange={e => setCurrentPin(e.target.value)}
                    style={{ flex: 1, background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "8px 12px", color: "#5a4a42", fontSize: 12, outline: "none" }} />
                  <input type="password" inputMode="numeric" placeholder="New PIN" value={pin} onChange={e => setPin(e.target.value)}
                    style={{ flex: 1, background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "8px 12px", color: "#5a4a42", fontSize: 12, outline: "none" }} />
                  <input type="password" inputMode="numeric" placeholder="Confirm" value={pinConfirm} onChange={e => setPinConfirm(e.target.value)}
                    style={{ flex: 1, background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "8px 12px", color: "#5a4a42", fontSize: 12, outline: "none" }} />
                </div>
                {pinError && <p style={{ fontSize: 11, color: "#ff9a76", marginBottom: 6 }}>{pinError}</p>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setChangingPin(false); setPin(""); setPinConfirm(""); setCurrentPin(""); setPinError(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: "rgba(139, 126, 116, 0.1)", border: "none", color: "rgba(139, 126, 116, 0.7)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  <button onClick={handlePinChange} style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Save</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="glass" style={{ borderRadius: 16, padding: 16 }}>
        <p style={{ fontSize: 14, color: "#5a4a42", fontWeight: 600, marginBottom: 10 }}>Export your data</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button onClick={() => setExportSelection({
            tasks: true,
            habits: true,
            notes: true,
            meaningfulMoments: true,
            moodLog: true,
            energyLog: true,
            gratitude: true,
            dailyNotes: true,
          })} style={{ flex: 1, padding: "8px 0", borderRadius: 10, background: "rgba(139, 126, 116, 0.1)", border: "none", color: "rgba(139, 126, 116, 0.7)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Select all</button>
          <button onClick={() => setExportSelection({
            tasks: false,
            habits: false,
            notes: false,
            meaningfulMoments: false,
            moodLog: false,
            energyLog: false,
            gratitude: false,
            dailyNotes: false,
          })} style={{ flex: 1, padding: "8px 0", borderRadius: 10, background: "rgba(255, 154, 118, 0.12)", border: "1px solid rgba(255, 154, 118, 0.25)", color: "#ff9a76", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Select none</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            { key: "tasks", label: "Tasks" },
            { key: "habits", label: "Habits" },
            { key: "notes", label: "Notes" },
            { key: "meaningfulMoments", label: "Moments" },
            { key: "moodLog", label: "Mood" },
            { key: "energyLog", label: "Energy" },
            { key: "gratitude", label: "Gratitude" },
            { key: "dailyNotes", label: "Daily Notes" },
          ].map(item => (
            <label key={item.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(139, 126, 116, 0.7)" }}>
              <input type="checkbox" checked={exportSelection[item.key]} onChange={e => setExportSelection(p => ({ ...p, [item.key]: e.target.checked }))} />
              {item.label}
            </label>
          ))}
        </div>
        <button onClick={exportJson} style={{ width: "100%", marginBottom: 10, padding: "10px 0", borderRadius: 10, background: "linear-gradient(135deg, #a8e6cf, #dcedc1)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Export JSON</button>
        <button onClick={exportCsv} style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Export CSVs</button>
        <p style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.5)", marginTop: 8 }}>CSV export downloads multiple files.</p>
      </div>

      <div className="glass" style={{ borderRadius: 16, padding: 16, marginTop: 16, border: "1px solid rgba(255, 154, 118, 0.3)" }}>
        <p style={{ fontSize: 14, color: "#ff9a76", fontWeight: 600, marginBottom: 6 }}>Delete account</p>
        <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.6)", marginBottom: 10 }}>This clears all local data and returns to the name setup.</p>
        <button onClick={() => {
          if (window.confirm("Delete all data and start fresh?")) resetAccount();
        }} style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: "rgba(255, 154, 118, 0.15)", border: "1px solid rgba(255, 154, 118, 0.35)", color: "#ff9a76", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Delete account & logout</button>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════
// TASKS SCREEN
// ═══════════════════════════════════════════════════════════════════════
function TasksScreen({ tasks, setTasks, onTaskAdded }) {
  const [showForm, setShowForm] = useState(false);
  const sorted = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (isOverdue(a) !== isOverdue(b)) return isOverdue(a) ? -1 : 1;
    return 0;
  });

  return (
    <div style={{ padding: "32px 24px 90px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontFamily: "'Crimson Text', serif", fontWeight: 400, fontStyle: "italic", color: "#8b7e74" }}>Tasks</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ width: 42, height: 42, borderRadius: 21, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 175, 189, 0.25)" }}>
          <Icon name="plus" size={20} color="#fff" sw={2.5} />
        </button>
      </div>

      {showForm && <TaskForm onAdd={t => { setTasks(p => [...p, t]); setShowForm(false); }} onTaskAdded={onTaskAdded} />}

      {sorted.length === 0 ? <p style={{ color: "rgba(139, 126, 116, 0.4)", fontSize: 14, textAlign: "center", padding: "40px 0" }}>No tasks — enjoy the calm 🌸</p> :
        sorted.map(t => (
          <div key={t.id} className="glass" style={{ borderRadius: 14, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, borderLeft: `3px solid ${t.done ? "#a8e6cf" : isOverdue(t) ? "#ff9a76" : "#ffc3a0"}` }}>
            <button onClick={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} style={{ width: 24, height: 24, borderRadius: 12, border: `2px solid ${t.done ? "#a8e6cf" : "rgba(139, 126, 116, 0.25)"}`, background: t.done ? "#a8e6cf" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}>
              {t.done && <Icon name="check" size={12} color="#fff" sw={3} />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: t.done ? "rgba(139, 126, 116, 0.4)" : "#5a4a42", fontSize: 14, fontWeight: 500, textDecoration: t.done ? "line-through" : "none" }}>{t.title}</p>
              {(t.dueDate || t.dueTime) && <p style={{ color: isOverdue(t) ? "#ff9a76" : "rgba(139, 126, 116, 0.4)", fontSize: 11, marginTop: 2 }}>{isOverdue(t) ? "⚠ " : ""}Due {fmtDate(t.dueDate)}{t.dueTime ? ` at ${fmtTime(`${t.dueDate}T${t.dueTime}`)}` : ""}</p>}
            </div>
            <button onClick={() => setTasks(p => p.filter(x => x.id !== t.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(139, 126, 116, 0.25)", padding: 4 }}>
              <Icon name="trash" size={16} />
            </button>
          </div>
        ))
      }
    </div>
  );
}

function TaskForm({ onAdd, onTaskAdded }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    playNotificationSound();
    const msg = `"${title.trim()}" was added.`;
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("✅ Task Added", { body: msg });
    } else if (onTaskAdded) {
      onTaskAdded(msg);
    }
    onAdd({ id: uid(), title: title.trim(), dueDate: dueDate || null, dueTime: dueTime || null, done: false, createdAt: now().toISOString(), notified: false, overdueNotified: false });
    setTitle(""); setDueDate(""); setDueTime("");
  };

  return (
    <div className="glass" style={{ borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <input autoFocus placeholder="Task title…" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
        style={{ width: "100%", background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "10px 14px", color: "#5a4a42", fontSize: 14, outline: "none" }} />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ flex: 1, background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "8px 12px", color: dueDate ? "#5a4a42" : "rgba(139, 126, 116, 0.4)", fontSize: 12, outline: "none", colorScheme: "light" }} />
        <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} style={{ flex: 1, background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "8px 12px", color: dueTime ? "#5a4a42" : "rgba(139, 126, 116, 0.4)", fontSize: 12, outline: "none", colorScheme: "light" }} />
      </div>
      <button onClick={submit} style={{ width: "100%", marginTop: 12, padding: "11px 0", borderRadius: 12, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Add Task</button>
    </div>
  );
}

// HABITS SCREEN - Fuller habit tracker with streaks
function HabitsScreen({ habits, setHabits }) {
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [reminderQuery, setReminderQuery] = useState("");
  const [reminderFilter, setReminderFilter] = useState("enabled");

  const today = todayKey();
  const visibleHabits = habits.filter(h => (showArchived ? true : !h.archived));

  const toggleCompletion = (habit) => {
    setHabits(p => p.map(h => {
      if (h.id !== habit.id) return h;
      const hasToday = h.completions.includes(today);
      const next = hasToday ? h.completions.filter(d => d !== today) : [...h.completions, today];
      return { ...h, completions: next };
    }));
  };

  const toggleArchive = (habit) => {
    setHabits(p => p.map(h => h.id === habit.id ? { ...h, archived: !h.archived } : h));
  };

  const removeHabit = (habit) => {
    setHabits(p => p.filter(h => h.id !== habit.id));
  };

  const dateKeyFrom = (d) => d.toISOString().slice(0, 10);
  const weekStart = (d) => {
    const w = new Date(d);
    w.setDate(w.getDate() - w.getDay());
    return w;
  };

  const countWeekCompletions = (habit, refDate) => {
    const start = weekStart(refDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return habit.completions.filter(k => {
      const kd = new Date(`${k}T00:00:00`);
      return kd >= start && kd <= end;
    }).length;
  };

  const getDailyStreak = (habit) => {
    const set = new Set(habit.completions);
    let streak = 0;
    const d = now();
    while (true) {
      const key = dateKeyFrom(d);
      if (!set.has(key)) break;
      streak += 1;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  };

  const getWeeklyStreak = (habit) => {
    let streak = 0;
    const d = now();
    while (true) {
      const count = countWeekCompletions(habit, d);
      if (count < (habit.goalPerWeek || 1)) break;
      streak += 1;
      d.setDate(d.getDate() - 7);
    }
    return streak;
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = now();
    d.setDate(d.getDate() - (6 - i));
    return dateKeyFrom(d);
  });

  const doneToday = habits.filter(h => h.completions.includes(today) && !h.archived).length;

  const withReminders = habits.filter(h => h.reminderTime || h.reminderEnabled);
  const enabledReminders = withReminders.filter(h => h.reminderEnabled && !h.archived);
  const disabledReminders = withReminders.filter(h => !h.reminderEnabled && !h.archived);
  const archivedReminders = habits.filter(h => h.archived);

  const reminderMatches = (h) => h.title.toLowerCase().includes(reminderQuery.trim().toLowerCase());

  const filteredReminders = (
    reminderFilter === "enabled" ? enabledReminders :
      reminderFilter === "disabled" ? disabledReminders :
        reminderFilter === "archived" ? archivedReminders :
          withReminders
  ).filter(reminderMatches);

  const toggleReminderEnabled = (habit) => {
    setHabits(p => p.map(h => h.id === habit.id ? { ...h, reminderEnabled: !h.reminderEnabled } : h));
  };

  const updateReminderTime = (habit, time) => {
    setHabits(p => p.map(h => h.id === habit.id ? { ...h, reminderTime: time, reminderEnabled: !!time } : h));
  };

  const todayDueReminders = enabledReminders.filter(h => h.reminderTime).length;
  const completedTodayReminders = enabledReminders.filter(h => (h.completions || []).includes(today)).length;

  const upcomingReminders = enabledReminders
    .filter(h => h.reminderTime)
    .slice()
    .sort((a, b) => a.reminderTime.localeCompare(b.reminderTime));

  return (
    <div style={{ padding: "32px 24px 90px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontFamily: "'Crimson Text', serif", fontWeight: 400, fontStyle: "italic", color: "#8b7e74" }}>Habits</h2>
          <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.5)", marginTop: 4 }}>{doneToday} completed today</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ width: 42, height: 42, borderRadius: 21, background: "linear-gradient(135deg, #a8e6cf, #dcedc1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(168, 230, 207, 0.3)" }}>
          <Icon name="plus" size={20} color="#fff" sw={2.5} />
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={() => setShowArchived(s => !s)} style={{ background: "none", border: "none", color: "rgba(139, 126, 116, 0.6)", fontSize: 12, cursor: "pointer" }}>
          {showArchived ? "Hide archived" : "Show archived"}
        </button>
      </div>

      {showForm && <HabitForm onAdd={h => { setHabits(p => [...p, h]); setShowForm(false); }} />}

      {visibleHabits.length === 0 ? (
        <p style={{ color: "rgba(139, 126, 116, 0.4)", fontSize: 14, textAlign: "center", padding: "40px 0" }}>
          No habits yet. Start with something small.
        </p>
      ) : (
        visibleHabits.map(h => {
          const isDoneToday = h.completions.includes(today);
          const weekCount = countWeekCompletions(h, now());
          const streak = h.schedule === "weekly" ? getWeeklyStreak(h) : getDailyStreak(h);
          return (
            <div key={h.id} className="glass" style={{ borderRadius: 16, padding: "14px 16px", marginBottom: 12, borderLeft: `4px solid ${h.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => toggleCompletion(h)} style={{ width: 26, height: 26, borderRadius: 13, border: `2px solid ${h.color}`, background: isDoneToday ? h.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  {isDoneToday && <Icon name="check" size={12} color="#fff" sw={3} />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#5a4a42", fontSize: 15, fontWeight: 600 }}>{h.title}</p>
                  <p style={{ color: "rgba(139, 126, 116, 0.5)", fontSize: 11, marginTop: 2 }}>
                    {h.schedule === "weekly" ? `${weekCount}/${h.goalPerWeek} this week` : (isDoneToday ? "Done today" : "Not done today")}
                  </p>
                  {h.reminderEnabled && h.reminderTime && (
                    <p style={{ color: "rgba(139, 126, 116, 0.5)", fontSize: 11, marginTop: 2 }}>
                      Reminder at {h.reminderTime}
                    </p>
                  )}
                </div>
                <button onClick={() => toggleArchive(h)} style={{ background: "none", border: "none", color: "rgba(139, 126, 116, 0.45)", fontSize: 11, cursor: "pointer" }}>
                  {h.archived ? "Unarchive" : "Archive"}
                </button>
                <button onClick={() => removeHabit(h)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(139, 126, 116, 0.25)", padding: 4 }}>
                  <Icon name="trash" size={16} />
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {last7Days.map(d => (
                    <div key={d} style={{ width: 10, height: 10, borderRadius: 5, background: h.completions.includes(d) ? h.color : "rgba(139, 126, 116, 0.2)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.6)" }}>
                  {streak} {h.schedule === "weekly" ? "week" : "day"} streak
                </div>
              </div>
            </div>
          );
        })
      )}

      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 20, fontFamily: "'Crimson Text', serif", fontWeight: 600, color: "#8b7e74", marginBottom: 12, fontStyle: "italic" }}>Reminders</h3>

        <div className="glass" style={{ borderRadius: 16, padding: 14, marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.5)" }}>Enabled</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#5a4a42" }}>{enabledReminders.length}</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.5)" }}>Due today</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#5a4a42" }}>{todayDueReminders}</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.5)" }}>Completed</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#5a4a42" }}>{completedTodayReminders}</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {["enabled", "disabled", "archived", "all"].map(t => (
            <button key={t} onClick={() => setReminderFilter(t)} style={{ flex: 1, padding: "8px 0", borderRadius: 12, border: "none", background: reminderFilter === t ? "linear-gradient(135deg, #ffc3a0, #ffafbd)" : "rgba(255, 255, 255, 0.6)", color: reminderFilter === t ? "#fff" : "rgba(139, 126, 116, 0.6)", fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>

        <input placeholder="Search reminders..." value={reminderQuery} onChange={e => setReminderQuery(e.target.value)}
          style={{ width: "100%", background: "rgba(255, 255, 255, 0.7)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 12, padding: "10px 12px", color: "#5a4a42", fontSize: 13, outline: "none", marginBottom: 14 }} />

        {upcomingReminders.length > 0 && (
          <div className="glass" style={{ borderRadius: 16, padding: 14, marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.5)", marginBottom: 8 }}>Upcoming today</p>
            {upcomingReminders.slice(0, 4).map(h => (
              <div key={h.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed rgba(139, 126, 116, 0.15)" }}>
                <div>
                  <p style={{ fontSize: 13, color: "#5a4a42", fontWeight: 600 }}>{h.title}</p>
                  <p style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.5)" }}>{h.reminderTime}</p>
                </div>
                <button onClick={() => toggleReminderEnabled(h)} style={{ background: "none", border: "none", color: "#ff9a76", fontSize: 12, cursor: "pointer" }}>
                  {h.reminderEnabled ? "Disable" : "Enable"}
                </button>
              </div>
            ))}
          </div>
        )}

        {filteredReminders.length === 0 ? (
          <p style={{ color: "rgba(139, 126, 116, 0.4)", fontSize: 14, textAlign: "center", padding: "30px 0" }}>No reminders found.</p>
        ) : (
          filteredReminders.map(h => (
            <div key={h.id} className="glass" style={{ borderRadius: 14, padding: "12px 14px", marginBottom: 10, borderLeft: `4px solid ${h.color || "#ffc3a0"}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#5a4a42", fontSize: 14, fontWeight: 600 }}>{h.title}</p>
                  <p style={{ color: "rgba(139, 126, 116, 0.5)", fontSize: 11 }}>{h.reminderEnabled ? "Enabled" : "Disabled"}{h.archived ? " · Archived" : ""}</p>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(139, 126, 116, 0.6)" }}>
                  <input type="checkbox" checked={!!h.reminderEnabled} onChange={() => toggleReminderEnabled(h)} />
                  On
                </label>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input type="time" value={h.reminderTime || ""} onChange={e => updateReminderTime(h, e.target.value)}
                  style={{ flex: 1, background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "8px 12px", color: h.reminderTime ? "#5a4a42" : "rgba(139, 126, 116, 0.4)", fontSize: 12, outline: "none", colorScheme: "light" }} />
                <button onClick={() => updateReminderTime(h, "")} style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(139, 126, 116, 0.1)", border: "none", color: "rgba(139, 126, 116, 0.6)", fontSize: 11, cursor: "pointer" }}>
                  Clear
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function HabitForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [schedule, setSchedule] = useState("daily");
  const [goalPerWeek, setGoalPerWeek] = useState(3);
  const [color, setColor] = useState("#ffc3a0");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("");

  const colors = ["#ffc3a0", "#ffafbd", "#a8e6cf", "#dcedc1", "#ffd3b6", "#c3aed6"];

  const submit = () => {
    if (!title.trim()) return;
    onAdd({
      id: uid(),
      title: title.trim(),
      schedule,
      goalPerWeek: schedule === "weekly" ? Number(goalPerWeek) : 1,
      color,
      reminderEnabled: reminderEnabled && !!reminderTime,
      reminderTime: reminderEnabled ? reminderTime : "",
      lastRemindedDate: null,
      createdAt: now().toISOString(),
      completions: [],
      archived: false
    });
    setTitle("");
    setSchedule("daily");
    setGoalPerWeek(3);
    setColor("#ffc3a0");
    setReminderEnabled(false);
    setReminderTime("");
  };

  return (
    <div className="glass" style={{ borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <input autoFocus placeholder="Habit title…" value={title} onChange={e => setTitle(e.target.value)}
        style={{ width: "100%", background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "10px 14px", color: "#5a4a42", fontSize: 14, outline: "none", marginBottom: 10 }} />

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <select value={schedule} onChange={e => setSchedule(e.target.value)}
          style={{ flex: 1, background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "8px 12px", color: "#5a4a42", fontSize: 12, outline: "none" }}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly goal</option>
        </select>
        {schedule === "weekly" && (
          <select value={goalPerWeek} onChange={e => setGoalPerWeek(e.target.value)}
            style={{ flex: 1, background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "8px 12px", color: "#5a4a42", fontSize: 12, outline: "none" }}>
            {[1, 2, 3, 4, 5, 6, 7].map(n => (
              <option key={n} value={n}>{n} times</option>
            ))}
          </select>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {colors.map(c => (
          <button key={c} onClick={() => setColor(c)} style={{ width: 24, height: 24, borderRadius: 12, border: c === color ? "2px solid rgba(90, 74, 66, 0.6)" : "2px solid transparent", background: c, cursor: "pointer" }} />
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(139, 126, 116, 0.7)" }}>
          <input type="checkbox" checked={reminderEnabled} onChange={e => setReminderEnabled(e.target.checked)} />
          Reminder
        </label>
        <input type="time" value={reminderTime} onChange={e => { setReminderTime(e.target.value); if (e.target.value) setReminderEnabled(true); }}
          style={{ flex: 1, background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "8px 12px", color: reminderTime ? "#5a4a42" : "rgba(139, 126, 116, 0.4)", fontSize: 12, outline: "none", colorScheme: "light" }} />
      </div>

      <button onClick={submit} style={{ width: "100%", padding: "11px 0", borderRadius: 12, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Add Habit</button>
    </div>
  );
}

// WELLNESS SCREEN - Features 3, 5, 6, 7, 8, 9
function WellnessScreen({ gratitude, setGratitude, energyLog, setEnergyLog, moodLog, affirmations, generateAffirmation, voiceNotes, setVoiceNotes }) {
  const [sub, setSub] = useState("gratitude");
  const today = todayKey();

  return (
    <div style={{ padding: "32px 24px 90px" }}>
      <h2 style={{ fontSize: 24, fontFamily: "'Crimson Text', serif", fontWeight: 400, fontStyle: "italic", color: "#8b7e74", marginBottom: 16 }}>Wellness</h2>

      <div style={{ display: "flex", gap: 5, marginBottom: 16, background: "rgba(255, 255, 255, 0.5)", borderRadius: 12, padding: 4, overflowX: "auto" }}>
        {["gratitude", "energy", "mood", "affirmations", "breathe", "voice"].map(t => (
          <button key={t} onClick={() => setSub(t)} style={{ flex: "0 0 auto", background: sub === t ? "linear-gradient(135deg, #ffc3a0, #ffafbd)" : "transparent", border: "none", color: sub === t ? "#fff" : "rgba(139, 126, 116, 0.5)", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s", whiteSpace: "nowrap" }}>{t}</button>
        ))}
      </div>

      {sub === "gratitude" && <GratitudePanel gratitude={gratitude} setGratitude={setGratitude} today={today} />}
      {sub === "energy" && <EnergyPanel energyLog={energyLog} setEnergyLog={setEnergyLog} today={today} />}
      {sub === "mood" && <MoodTimelinePanel moodLog={moodLog} />}
      {sub === "affirmations" && <AffirmationsPanel affirmations={affirmations} generateAffirmation={generateAffirmation} />}
      {sub === "breathe" && <BreathePanel />}
      {sub === "voice" && <VoicePanel voiceNotes={voiceNotes} setVoiceNotes={setVoiceNotes} />}
    </div>
  );
}

function GratitudePanel({ gratitude, setGratitude, today }) {
  const [input, setInput] = useState(gratitude[today] || "");

  const save = () => {
    if (!input.trim()) return;
    setGratitude(p => ({ ...p, [today]: input.trim() }));
    setInput("");
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: "rgba(139, 126, 116, 0.6)", marginBottom: 12, lineHeight: 1.6 }}>What's one small thing you're grateful for today?</p>
      {!gratitude[today] ? (
        <div className="glass" style={{ borderRadius: 14, padding: 14 }}>
          <textarea rows={3} placeholder="I'm grateful for..." value={input} onChange={e => setInput(e.target.value)} style={{ width: "100%", background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "10px 13px", color: "#5a4a42", fontSize: 13, outline: "none", resize: "none" }} />
          <button onClick={save} style={{ marginTop: 10, padding: "9px 20px", borderRadius: 10, background: "linear-gradient(135deg, #a8e6cf, #dcedc1)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: 14, padding: "14px 16px" }}>
          <p style={{ color: "#5a4a42", fontSize: 14, lineHeight: 1.6 }}>{gratitude[today]}</p>
          <button onClick={() => setGratitude(p => { const n = { ...p }; delete n[today]; return n; })} style={{ marginTop: 10, fontSize: 11, color: "rgba(139, 126, 116, 0.5)", background: "none", border: "none", cursor: "pointer" }}>Clear</button>
        </div>
      )}

      <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(139, 126, 116, 0.5)", marginTop: 20, marginBottom: 10 }}>Past Week</p>
      {Object.entries(gratitude).slice(-7).reverse().filter(([d]) => d !== today).map(([date, text]) => (
        <div key={date} className="glass" style={{ borderRadius: 12, padding: "10px 12px", marginBottom: 6 }}>
          <p style={{ fontSize: 10, color: "rgba(139, 126, 116, 0.5)", marginBottom: 4 }}>{fmtDate(date)}</p>
          <p style={{ color: "#5a4a42", fontSize: 13 }}>{text}</p>
        </div>
      ))}
    </div>
  );
}

function EnergyPanel({ energyLog, setEnergyLog, today }) {
  const addEnergy = (level) => {
    setEnergyLog(p => ({
      ...p,
      [today]: [...(p[today] || []), { time: now().toISOString(), level }]
    }));
  };

  const todayLog = energyLog[today] || [];

  return (
    <div>
      <p style={{ fontSize: 13, color: "rgba(139, 126, 116, 0.6)", marginBottom: 14, lineHeight: 1.6 }}>Track your energy throughout the day to spot patterns.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map(level => (
          <button key={level} onClick={() => addEnergy(level)} style={{ flex: 1, height: 50, borderRadius: 12, background: `rgba(${255 - level * 30}, ${100 + level * 30}, 150, 0.15)`, border: "1px solid rgba(255, 195, 160, 0.2)", color: "#5a4a42", fontSize: 20, cursor: "pointer", fontWeight: 600 }}>
            {level}
          </button>
        ))}
      </div>

      {todayLog.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(139, 126, 116, 0.5)", marginBottom: 8 }}>Today's Log</p>
          {todayLog.map((e, i) => (
            <div key={i} className="glass" style={{ borderRadius: 10, padding: "8px 12px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.5)" }}>{fmtTime(e.time)}</span>
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: 5 }, (_, j) => (
                  <div key={j} style={{ width: 8, height: 16, borderRadius: 2, background: j < e.level ? "#a8e6cf" : "rgba(139, 126, 116, 0.15)" }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MoodTimelinePanel({ moodLog }) {
  const moodMeta = {
    amazing: { label: "Amazing", color: "#a8e6cf", emoji: "😄" },
    good: { label: "Good", color: "#dcedc1", emoji: "😊" },
    okay: { label: "Okay", color: "#ffd3b6", emoji: "😐" },
    struggling: { label: "Struggling", color: "#ffafbd", emoji: "😔" },
    overwhelmed: { label: "Overwhelmed", color: "#ff9a76", emoji: "😰" },
  };

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = now();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { key, label: fmtDate(key) };
  });

  const recentEntries = moodLog.filter(m => m.date && days.some(d => d.key === m.date));
  const moodCounts = recentEntries.reduce((acc, m) => {
    if (!m.mood) return acc;
    acc[m.mood] = (acc[m.mood] || 0) + 1;
    return acc;
  }, {});

  const topMood = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0];

  return (
    <div>
      <p style={{ fontSize: 13, color: "rgba(139, 126, 116, 0.6)", marginBottom: 14, lineHeight: 1.6 }}>
        Track your mood over the last week and spot patterns.
      </p>

      <div className="glass" style={{ borderRadius: 14, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {days.map(d => {
            const dayEntry = recentEntries.filter(m => m.date === d.key).slice(-1)[0];
            const meta = dayEntry ? moodMeta[dayEntry.mood] : null;
            return (
              <div key={d.key} style={{ textAlign: "center" }}>
                <div style={{ width: 28, height: 28, borderRadius: 14, margin: "0 auto 6px", background: meta ? meta.color : "rgba(139, 126, 116, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                  {meta ? meta.emoji : "·"}
                </div>
                <div style={{ fontSize: 9, color: "rgba(139, 126, 116, 0.5)" }}>{d.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {topMood ? (
        <div className="glass" style={{ borderRadius: 12, padding: "12px 14px" }}>
          <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.5)", marginBottom: 6 }}>Weekly Insight</p>
          <p style={{ fontSize: 14, color: "#5a4a42" }}>
            Most common mood this week: {moodMeta[topMood]?.emoji} {moodMeta[topMood]?.label}
          </p>
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: 12, padding: "12px 14px" }}>
          <p style={{ fontSize: 13, color: "rgba(139, 126, 116, 0.6)" }}>
            No check-ins yet. Use the daily check-in on the home screen to start tracking.
          </p>
        </div>
      )}
    </div>
  );
}

function AffirmationsPanel({ affirmations, generateAffirmation }) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    await generateAffirmation();
    setLoading(false);
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: "rgba(139, 126, 116, 0.6)", marginBottom: 14, lineHeight: 1.6 }}>Personalized affirmations based on what you're going through.</p>

      <button onClick={generate} disabled={loading} style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 16, opacity: loading ? 0.6 : 1 }}>
        {loading ? "Generating..." : "✨ Generate New Affirmation"}
      </button>

      {affirmations.slice(-10).reverse().map(a => (
        <div key={a.id} className="glass" style={{ borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
          <p style={{ color: "#5a4a42", fontSize: 14, lineHeight: 1.6, fontStyle: "italic" }}>"{a.text}"</p>
          <p style={{ fontSize: 10, color: "rgba(139, 126, 116, 0.4)", marginTop: 6 }}>{fmtDate(a.date)}</p>
        </div>
      ))}
    </div>
  );
}

function BreathePanel() {
  const [phase, setPhase] = useState("idle"); // idle | in | hold | out
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);

  const start = () => {
    setPhase("in");
    setCount(4);
    setCycles(0);

    intervalRef.current = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          setPhase(p => {
            if (p === "in") { setCount(4); return "hold"; }
            if (p === "hold") { setCount(6); return "out"; }
            if (p === "out") {
              setCycles(cy => {
                if (cy >= 4) { stop(); return cy; }
                setCount(4);
                return cy + 1;
              });
              return "in";
            }
            return p;
          });
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    setPhase("idle");
    setCycles(0);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const colors = { idle: "#dcedc1", in: "#a8e6cf", hold: "#ffd3b6", out: "#ffafbd" };

  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <p style={{ fontSize: 13, color: "rgba(139, 126, 116, 0.6)", marginBottom: 24, lineHeight: 1.6 }}>Follow the circle. Breathe in, hold, breathe out.</p>

      <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto 30px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: phase === "in" ? 160 : phase === "hold" ? 160 : 100, height: phase === "in" ? 160 : phase === "hold" ? 160 : 100, borderRadius: "50%", background: colors[phase], transition: phase === "idle" ? "none" : "all 1s ease-in-out", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px ${colors[phase]}` }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#fff", fontSize: 32, fontWeight: 700 }}>{phase === "idle" ? "Ready" : count}</p>
            <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 12, marginTop: 4, textTransform: "capitalize" }}>{phase === "idle" ? "" : phase === "in" ? "Breathe In" : phase === "hold" ? "Hold" : "Breathe Out"}</p>
          </div>
        </div>
      </div>

      {phase === "idle" ? (
        <button onClick={start} style={{ padding: "12px 32px", borderRadius: 12, background: "linear-gradient(135deg, #a8e6cf, #dcedc1)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Start (5 cycles)
        </button>
      ) : (
        <div>
          <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.5)", marginBottom: 10 }}>Cycle {cycles + 1} / 5</p>
          <button onClick={stop} style={{ padding: "10px 24px", borderRadius: 10, background: "rgba(255, 154, 118, 0.15)", border: "1px solid rgba(255, 154, 118, 0.3)", color: "#ff9a76", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Stop</button>
        </div>
      )}
    </div>
  );
}

function VoicePanel({ voiceNotes, setVoiceNotes }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + " " + event.results[i][0].transcript);
        }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecording(false);

    if (transcript.trim()) {
      setVoiceNotes(p => [...p, { id: uid(), transcript: transcript.trim(), date: now().toISOString() }]);
      setTranscript("");
    }
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: "rgba(139, 126, 116, 0.6)", marginBottom: 14, lineHeight: 1.6 }}>Speak your thoughts. I'll transcribe them for you.</p>

      <div className="glass" style={{ borderRadius: 14, padding: 16, marginBottom: 16, textAlign: "center" }}>
        <button onClick={recording ? stopRecording : startRecording} style={{ width: 80, height: 80, borderRadius: 40, background: recording ? "linear-gradient(135deg, #ff9a76, #ffafbd)" : "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", margin: "0 auto", boxShadow: recording ? "0 0 30px rgba(255, 154, 118, 0.5)" : "none", animation: recording ? "pulse 1.5s infinite" : "none" }}>
          <Icon name="mic" size={32} color="#fff" sw={2} />
        </button>
        <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.5)", marginTop: 12 }}>{recording ? "Listening..." : "Tap to record"}</p>
        {transcript && <p style={{ fontSize: 13, color: "#5a4a42", marginTop: 12, lineHeight: 1.5 }}>{transcript}</p>}
      </div>

      {voiceNotes.slice(-10).reverse().map(v => (
        <div key={v.id} className="glass" style={{ borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <Icon name="mic" size={14} color="#ffc3a0" />
            <span style={{ fontSize: 10, color: "rgba(139, 126, 116, 0.4)" }}>{fmtDate(v.date)}</span>
          </div>
          <p style={{ color: "#5a4a42", fontSize: 13, lineHeight: 1.5 }}>{v.transcript}</p>
        </div>
      ))}
    </div>
  );
}

// MEMORIES & MOMENTS SCREENS - Keep from previous version
function MemoriesScreen({ photos, setPhotos, notes, setNotes }) {
  const [sub, setSub] = useState("photos");
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const caption = prompt("Add a caption:");
      const emotion = prompt("How did this make you feel?");
      setPhotos(p => [...p, { id: uid(), dataUrl, caption: caption || "", emotion: emotion || "", date: now().toISOString() }]);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: "32px 24px 90px" }}>
      <h2 style={{ fontSize: 24, fontFamily: "'Crimson Text', serif", fontWeight: 400, fontStyle: "italic", color: "#8b7e74", marginBottom: 24 }}>Memories</h2>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "rgba(255, 255, 255, 0.5)", borderRadius: 12, padding: 4 }}>
        {["photos", "notes"].map(t => (
          <button key={t} onClick={() => setSub(t)} style={{ flex: 1, background: sub === t ? "linear-gradient(135deg, #ffc3a0, #ffafbd)" : "transparent", border: "none", color: sub === t ? "#fff" : "rgba(139, 126, 116, 0.5)", borderRadius: 10, padding: "8px 0", fontSize: 13, fontWeight: 500, cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s" }}>{t}</button>
        ))}
      </div>

      {sub === "photos" && (
        <div>
          <button onClick={() => fileInputRef.current.click()} style={{ width: "100%", padding: "14px 0", borderRadius: 14, background: "linear-gradient(135deg, #a8e6cf, #dcedc1)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon name="camera" size={18} color="#fff" sw={2} />
            Add Photo Memory
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {photos.slice().reverse().map(ph => (
              <div key={ph.id} className="glass" style={{ borderRadius: 14, overflow: "hidden" }}>
                <img src={ph.dataUrl} alt={ph.caption} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                <div style={{ padding: "8px 10px" }}>
                  <p style={{ fontSize: 12, color: "#5a4a42", fontWeight: 500 }}>{ph.caption || "Untitled"}</p>
                  <p style={{ fontSize: 10, color: "rgba(139, 126, 116, 0.5)", marginTop: 2 }}>{fmtDate(ph.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sub === "notes" && (
        <div>
          <NoteForm onAdd={n => setNotes(p => [...p, n])} />
          {notes.slice().reverse().map(n => (
            <div key={n.id} className="glass" style={{ borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
              <p style={{ color: "#5a4a42", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{n.title}</p>
              <p style={{ color: "rgba(90, 74, 66, 0.7)", fontSize: 13, lineHeight: 1.5 }}>{n.body}</p>
              <p style={{ color: "rgba(139, 126, 116, 0.4)", fontSize: 10, marginTop: 6 }}>{fmtDate(n.date)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <div className="glass" style={{ borderRadius: 14, padding: 14, marginBottom: 14 }}>
      <input placeholder="Title…" value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%", background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "9px 13px", color: "#5a4a42", fontSize: 13, outline: "none", marginBottom: 8 }} />
      <textarea rows={3} placeholder="Your thoughts…" value={body} onChange={e => setBody(e.target.value)} style={{ width: "100%", background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "9px 13px", color: "#5a4a42", fontSize: 13, outline: "none", resize: "none" }} />
      <button onClick={() => { if (title.trim()) { onAdd({ id: uid(), title: title.trim(), body, date: now().toISOString() }); setTitle(""); setBody(""); } }} style={{ width: "100%", marginTop: 10, padding: "10px 0", borderRadius: 10, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save Note</button>
    </div>
  );
}

function MeaningfulMomentsScreen({ meaningfulMoments, setMeaningfulMoments }) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("proud");

  const addMoment = (text, emotion) => {
    setMeaningfulMoments(p => [...p, { id: uid(), date: now().toISOString(), type, text, emotion }]);
    setShowForm(false);
  };

  return (
    <div style={{ padding: "32px 24px 90px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontFamily: "'Crimson Text', serif", fontWeight: 400, fontStyle: "italic", color: "#8b7e74" }}>Meaningful Moments</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ width: 42, height: 42, borderRadius: 21, background: "linear-gradient(135deg, #a8e6cf, #dcedc1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="plus" size={20} color="#fff" sw={2.5} />
        </button>
      </div>

      <p style={{ color: "rgba(139, 126, 116, 0.6)", fontSize: 13, lineHeight: 1.6, marginBottom: 18, fontStyle: "italic" }}>I remember what matters — proud moments, struggles, and what helped.</p>

      {showForm && <MomentForm type={type} setType={setType} onAdd={addMoment} onCancel={() => setShowForm(false)} />}

      {meaningfulMoments.slice().reverse().map(m => (
        <div key={m.id} className="glass fade-in" style={{ borderRadius: 16, padding: "14px 16px", marginBottom: 12, borderLeft: `4px solid ${m.type === "proud" ? "#a8e6cf" : m.type === "struggle" ? "#ffafbd" : "#ffd3b6"}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon name={m.type === "proud" ? "star" : m.type === "struggle" ? "cloud" : "sun"} size={16} color={m.type === "proud" ? "#a8e6cf" : m.type === "struggle" ? "#ffafbd" : "#ffd3b6"} sw={1.8} />
            <p style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.5)" }}>{fmtDate(m.date)}</p>
          </div>
          <p style={{ color: "#5a4a42", fontSize: 14, lineHeight: 1.5 }}>{m.text}</p>
          {m.emotion && <p style={{ color: "rgba(139, 126, 116, 0.5)", fontSize: 11, marginTop: 4, fontStyle: "italic" }}>Felt: {m.emotion}</p>}
        </div>
      ))}
    </div>
  );
}

function MomentForm({ type, setType, onAdd, onCancel }) {
  const [text, setText] = useState("");
  const [emotion, setEmotion] = useState("");

  return (
    <div className="glass" style={{ borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#8b7e74", marginBottom: 10 }}>What kind of moment?</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[{ id: "proud", label: "Proud", color: "#a8e6cf" }, { id: "struggle", label: "Struggle", color: "#ffafbd" }, { id: "helped", label: "What Helped", color: "#ffd3b6" }].map(t => (
          <button key={t.id} onClick={() => setType(t.id)} style={{ flex: 1, background: type === t.id ? t.color : "rgba(255, 255, 255, 0.5)", border: "none", color: type === t.id ? "#fff" : "rgba(139, 126, 116, 0.5)", borderRadius: 10, padding: "8px 0", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>{t.label}</button>
        ))}
      </div>
      <textarea rows={3} placeholder="Describe this moment…" value={text} onChange={e => setText(e.target.value)} style={{ width: "100%", background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "10px 13px", color: "#5a4a42", fontSize: 13, outline: "none", resize: "none", marginBottom: 8 }} />
      <input placeholder="How did this make you feel? (optional)" value={emotion} onChange={e => setEmotion(e.target.value)} style={{ width: "100%", background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 10, padding: "9px 13px", color: "#5a4a42", fontSize: 12, outline: "none", marginBottom: 10 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: "rgba(139, 126, 116, 0.1)", border: "none", color: "rgba(139, 126, 116, 0.6)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Cancel</button>
        <button onClick={() => text.trim() && onAdd(text.trim(), emotion)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: "linear-gradient(135deg, #a8e6cf, #dcedc1)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>
      </div>
    </div>
  );
}

function ChatScreen({ chatMsgs, setChatMsgs, meaningfulMoments, userName }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = { role: "user", content: input, time: now().toISOString() };
    const updated = [...chatMsgs, msg];
    setChatMsgs(updated);
    setInput("");
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 350));
    const reply = getLocalChatReply({ userName, meaningfulMoments, message: msg.content });
    setChatMsgs(p => (Array.isArray(p) ? [...p, { role: "assistant", content: reply, time: now().toISOString() }] : [{ role: "assistant", content: reply, time: now().toISOString() }]));
    setLoading(false);
  };

  const clearChat = () => {
    if (!chatMsgs.length) return;
    if (window.confirm("Clear this chat history?")) {
      setChatMsgs([]);
      setInput("");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 90px)" }}>
      <div style={{ padding: "32px 24px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontFamily: "'Crimson Text', serif", fontWeight: 400, fontStyle: "italic", color: "#8b7e74" }}>Chat</h2>
          <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.5)", marginTop: 2 }}>I'm here, just for you</p>
        </div>
        <button onClick={clearChat} disabled={!chatMsgs.length} style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(255, 154, 118, 0.12)", border: "1px solid rgba(255, 154, 118, 0.35)", color: "#ff9a76", fontSize: 12, fontWeight: 600, cursor: chatMsgs.length ? "pointer" : "default", opacity: chatMsgs.length ? 1 : 0.5 }}>
          Clear chat
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 8px" }}>
        {chatMsgs.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Icon name="heart" size={40} color="rgba(255, 195, 160, 0.3)" sw={1} />
            <p style={{ color: "rgba(139, 126, 116, 0.4)", fontSize: 14, marginTop: 12, lineHeight: 1.5 }}>Start a conversation.<br />I remember what matters.</p>
          </div>
        )}
        {chatMsgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? "linear-gradient(135deg, #ffc3a0, #ffafbd)" : "rgba(255, 255, 255, 0.7)", border: m.role === "assistant" ? "1px solid rgba(255, 195, 160, 0.2)" : "none" }}>
              <p style={{ color: m.role === "user" ? "#fff" : "#5a4a42", fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.content}</p>
              <p style={{ color: m.role === "user" ? "rgba(255, 255, 255, 0.6)" : "rgba(139, 126, 116, 0.4)", fontSize: 9, marginTop: 4, textAlign: m.role === "user" ? "right" : "left" }}>{fmtTime(m.time)}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "10px 14px", borderRadius: "18px 18px 18px 4px", background: "rgba(255, 255, 255, 0.7)", border: "1px solid rgba(255, 195, 160, 0.2)" }}>
              <span style={{ color: "rgba(139, 126, 116, 0.5)", fontSize: 18 }}>⋯</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "12px 20px 8px", borderTop: "1px solid rgba(255, 195, 160, 0.2)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Message…"
            style={{ flex: 1, background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 22, padding: "10px 16px", color: "#5a4a42", fontSize: 14, outline: "none" }} disabled={loading} />
          <button onClick={send} disabled={loading || !input.trim()} style={{ width: 44, height: 44, borderRadius: 22, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: loading || !input.trim() ? 0.4 : 1 }}>
            <Icon name="send" size={18} color="#fff" sw={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DAILY NOTES SCREEN WITH CALENDAR - AUTO-FETCHES REAL DATES
// ═══════════════════════════════════════════════════════════════════════
function DailyNotesScreen({ dailyNotes, setDailyNotes }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [noteText, setNoteText] = useState("");

  const dateKey = useCallback((date) => localDateKey(date), []);
  const getNoteForDate = useCallback((date) => {
    const localKey = dateKey(date);
    return dailyNotes[localKey] || "";
  }, [dailyNotes, dateKey]);

  useEffect(() => {
    setNoteText(getNoteForDate(selectedDate));
  }, [selectedDate, getNoteForDate]);

  const saveNote = () => {
    const key = dateKey(selectedDate);
    if (noteText.trim()) {
      setDailyNotes(prev => ({ ...prev, [key]: noteText.trim() }));
    } else {
      const updated = { ...dailyNotes };
      delete updated[key];
      setDailyNotes(updated);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const today = new Date();
    const todayKey = dateKey(today);

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: 10 }} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const key = dateKey(date);
      const isSelected = dateKey(selectedDate) === key;
      const isToday = todayKey === key;
      const hasNote = dailyNotes[key];

      days.push(
        <button key={day} onClick={() => setSelectedDate(date)}
          style={{
            padding: 10, borderRadius: 8,
            border: isSelected ? "2px solid #ffc3a0" : "1px solid rgba(139, 126, 116, 0.1)",
            background: isSelected ? "linear-gradient(135deg, #ffc3a0, #ffafbd)" : isToday ? "rgba(255, 195, 160, 0.1)" : hasNote ? "rgba(168, 230, 207, 0.1)" : "transparent",
            color: isSelected ? "#fff" : "#5a4a42",
            fontSize: 13, fontWeight: isToday ? 700 : 500,
            cursor: "pointer", position: "relative", transition: "all 0.2s"
          }}>
          {day}
          {hasNote && !isSelected && (
            <div style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: 2, background: "#a8e6cf" }} />
          )}
        </button>
      );
    }
    return days;
  };

  const changeMonth = (dir) => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
  const goToToday = () => { const t = new Date(); setCurrentMonth(t); setSelectedDate(t); };

  return (
    <div style={{ padding: "32px 24px 90px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontFamily: "'Crimson Text', serif", fontWeight: 400, fontStyle: "italic", color: "#8b7e74" }}>Daily Notes</h2>
        <button onClick={goToToday} style={{ padding: "8px 16px", borderRadius: 12, background: "rgba(168, 230, 207, 0.15)", border: "1px solid rgba(168, 230, 207, 0.3)", color: "#a8e6cf", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="calendar" size={14} /> Today
        </button>
      </div>

      <div className="glass" style={{ borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => changeMonth(-1)} style={{ width: 32, height: 32, borderRadius: 16, border: "1px solid rgba(139, 126, 116, 0.2)", background: "rgba(255, 255, 255, 0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#5a4a42", fontSize: 16, fontWeight: 600 }}>←</button>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#8b7e74", fontFamily: "'Crimson Text', serif" }}>
            {currentMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </p>
          <button onClick={() => changeMonth(1)} style={{ width: 32, height: 32, borderRadius: 16, border: "1px solid rgba(139, 126, 116, 0.2)", background: "rgba(255, 255, 255, 0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#5a4a42", fontSize: 16, fontWeight: 600 }}>→</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, color: "rgba(139, 126, 116, 0.5)", fontWeight: 600, padding: "4px 0" }}>{d}</div>)}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>{renderCalendar()}</div>

        <div style={{ display: "flex", gap: 12, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(139, 126, 116, 0.1)", fontSize: 11, color: "rgba(139, 126, 116, 0.6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 4, background: "#a8e6cf" }} />Has note</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 4, border: "2px solid #ffc3a0" }} />Selected</div>
        </div>
      </div>

      <div className="glass" style={{ borderRadius: 16, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#8b7e74" }}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {noteText && <span style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.5)" }}>{noteText.length} characters</span>}
        </div>

        <textarea value={noteText} onChange={e => setNoteText(e.target.value)} onBlur={saveNote} placeholder="Write your thoughts for this day..." rows={8}
          style={{ width: "100%", background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 12, padding: "12px 14px", color: "#5a4a42", fontSize: 14, outline: "none", resize: "vertical", lineHeight: 1.6, fontFamily: "'Quicksand', sans-serif" }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <button onClick={saveNote} style={{ padding: "10px 24px", borderRadius: 12, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save Note</button>
          {dailyNotes[dateKey(selectedDate)] && (
            <button onClick={() => { setNoteText(""); const u = { ...dailyNotes }; delete u[dateKey(selectedDate)]; setDailyNotes(u); }}
              style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(255, 154, 118, 0.1)", border: "1px solid rgba(255, 154, 118, 0.2)", color: "#ff9a76", fontSize: 12, cursor: "pointer" }}>Delete Note</button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(168, 230, 207, 0.1)", borderRadius: 12, border: "1px solid rgba(168, 230, 207, 0.2)" }}>
        <p style={{ fontSize: 12, color: "#5a4a42" }}>
          📝 <strong>{Object.keys(dailyNotes).length}</strong> notes saved •
          <strong> {Object.keys(dailyNotes).filter(k => { const d = new Date(k); return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear(); }).length}</strong> this month
        </p>
      </div>
    </div>
  );
}