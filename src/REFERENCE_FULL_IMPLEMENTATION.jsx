import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════
const Icon = ({ name, size = 22, color = "currentColor", sw = 1.8 }) => {
  const icons = {
    home:<path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H15v-7H9v7H4a1 1 0 01-1-1V9.5z"/>,
    tasks:<><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M7 9h10M7 13h6"/></>,
    heart:<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>,
    memories:<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></>,
    chat:<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>,
    plus:<path d="M12 5v14M5 12h14"/>,
    bell:<><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    check:<path d="M20 6L9 17l-5-5"/>,
    trash:<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>,
    spark:<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/>,
    send:<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>,
    camera:<><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></>,
    star:<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,
    smile:<><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>,
    cloud:<path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>,
    sun:<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    droplet:<path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>,
    zap:<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>,
    wind:<><path d="M9.59 4.59a2 2 0 113.77 1.41L3 12h9"/><path d="M11.37 16.37a2 2 0 102.77.66L9 7"/><path d="M14.5 20.5a2 2 0 103.77-1.41L8 12h9"/></>,
    mic:<><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>,
    brain:<path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-5 0v-8a2.5 2.5 0 015 0M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 005 0v-8a2.5 2.5 0 00-5 0"/>,
    target:<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
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
const todayKey = () => now().toISOString().slice(0, 10);
const weekKey = () => { const d = now(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().slice(0, 10); };
const fmtTime = d => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtDate = d => new Date(d).toLocaleDateString([], { month: "short", day: "numeric" });
const isOverdue = t => !t.done && t.dueDate && new Date(t.dueDate + "T23:59:59") < now();

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
  const [userName, setUserName] = useState("");
  const [booted, setBooted] = useState(false);

  // Core data
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [meaningfulMoments, setMeaningfulMoments] = useState([]);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [dailyCheckIn, setDailyCheckIn] = useState(null);
  const [lastCheckInDate, setLastCheckInDate] = useState(null);

  // Phase 1 features
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [gratitude, setGratitude] = useState({});
  const [energyLog, setEnergyLog] = useState({});
  const [affirmations, setAffirmations] = useState([]);
  const [weeklyReflection, setWeeklyReflection] = useState(null);
  const [emotionalPatterns, setEmotionalPatterns] = useState(null);
  const [autoSuggestions, setAutoSuggestions] = useState([]);

  // ── Boot ──
  useEffect(() => {
    (async () => {
      const [n, t, nt, ph, mm, ch, dc, lcd, vn, gr, el, af, wr, ep, as] = await Promise.all([
        load("userName", ""), load("tasks", []), load("notes", []), load("photos", []),
        load("meaningfulMoments", []), load("chatMsgs", []), load("dailyCheckIn", null),
        load("lastCheckInDate", null), load("voiceNotes", []), load("gratitude", {}),
        load("energyLog", {}), load("affirmations", []), load("weeklyReflection", null),
        load("emotionalPatterns", null), load("autoSuggestions", []),
      ]);
      
      setUserName(n); setTasks(t); setNotes(nt); setPhotos(ph); setMeaningfulMoments(mm);
      setChatMsgs(ch); setDailyCheckIn(dc); setLastCheckInDate(lcd); setVoiceNotes(vn);
      setGratitude(gr); setEnergyLog(el); setAffirmations(af); setWeeklyReflection(wr);
      setEmotionalPatterns(ep); setAutoSuggestions(as);
      
      setBooted(true);
      if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
    })();
  }, []);

  // ── Persist ──
  useEffect(() => { if (booted) save("userName", userName); }, [userName, booted]);
  useEffect(() => { if (booted) save("tasks", tasks); }, [tasks, booted]);
  useEffect(() => { if (booted) save("notes", notes); }, [notes, booted]);
  useEffect(() => { if (booted) save("photos", photos); }, [photos, booted]);
  useEffect(() => { if (booted) save("meaningfulMoments", meaningfulMoments); }, [meaningfulMoments, booted]);
  useEffect(() => { if (booted) save("chatMsgs", chatMsgs); }, [chatMsgs, booted]);
  useEffect(() => { if (booted) save("dailyCheckIn", dailyCheckIn); }, [dailyCheckIn, booted]);
  useEffect(() => { if (booted) save("lastCheckInDate", lastCheckInDate); }, [lastCheckInDate, booted]);
  useEffect(() => { if (booted) save("voiceNotes", voiceNotes); }, [voiceNotes, booted]);
  useEffect(() => { if (booted) save("gratitude", gratitude); }, [gratitude, booted]);
  useEffect(() => { if (booted) save("energyLog", energyLog); }, [energyLog, booted]);
  useEffect(() => { if (booted) save("affirmations", affirmations); }, [affirmations, booted]);
  useEffect(() => { if (booted) save("weeklyReflection", weeklyReflection); }, [weeklyReflection, booted]);
  useEffect(() => { if (booted) save("emotionalPatterns", emotionalPatterns); }, [emotionalPatterns, booted]);
  useEffect(() => { if (booted) save("autoSuggestions", autoSuggestions); }, [autoSuggestions, booted]);

  // ── Task notifications ──
  useEffect(() => {
    const check = () => {
      tasks.forEach(t => {
        if (!t.done && !t.notified && t.dueDate && t.dueTime) {
          const dueDateTime = new Date(`${t.dueDate}T${t.dueTime}`);
          if (dueDateTime <= now()) {
            playNotificationSound();
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("🔔 Task Reminder", { body: `"${t.title}" is due now!` });
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
  }, [tasks]);

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

  if (!booted) return <div style={{ background: "linear-gradient(135deg, #fef3e2 0%, #fde8f4 50%, #e8f5e9 100%)", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#8b7e74", fontSize: 15 }}>Loading…</span></div>;
  if (!userName) return <NameSetup onSet={setUserName} />;

  const shared = { userName, tasks, setTasks, notes, setNotes, photos, setPhotos, meaningfulMoments, setMeaningfulMoments, chatMsgs, setChatMsgs, dailyCheckIn, setDailyCheckIn, lastCheckInDate, setLastCheckInDate, voiceNotes, setVoiceNotes, gratitude, setGratitude, energyLog, setEnergyLog, affirmations, setAffirmations, generateAffirmation, weeklyReflection, setWeeklyReflection, emotionalPatterns, setEmotionalPatterns, autoSuggestions, setAutoSuggestions };
  
  const screens = {
    home: <HomeScreen {...shared} />,
    tasks: <TasksScreen {...shared} />,
    wellness: <WellnessScreen {...shared} />,
    memories: <MemoriesScreen {...shared} />,
    heart: <MeaningfulMomentsScreen {...shared} />,
    chat: <ChatScreen {...shared} />,
  };

  return (
    <div style={{ background: "linear-gradient(135deg, #fef3e2 0%, #fde8f4 50%, #e8f5e9 100%)", minHeight: "100vh", color: "#5a4a42", fontFamily: "'Quicksand', sans-serif", maxWidth: 430, margin: "0 auto", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Crimson+Text:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: linear-gradient(135deg, #fef3e2 0%, #fde8f4 50%, #e8f5e9 100%); }
        ::-webkit-scrollbar { width: 0; }
        .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06); }
        .fade-in { animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder, textarea::placeholder { color: rgba(139, 126, 116, 0.4); }
        @keyframes breathe { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.2); opacity: 1; } }
        @keyframes breatheIn { from { transform: scale(1); } to { transform: scale(1.3); } }
        @keyframes breatheOut { from { transform: scale(1.3); } to { transform: scale(1); } }
      `}</style>
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
      <h1 style={{ color: "#8b7e74", fontSize: 32, fontFamily: "'Crimson Text', serif", marginBottom: 12, fontStyle: "italic" }}>Your AI Companion</h1>
      <p style={{ color: "rgba(139, 126, 116, 0.6)", fontSize: 15, textAlign: "center", lineHeight: 1.7, marginBottom: 40, maxWidth: 300 }}>I'm here to remember, support, and walk beside you.</p>
      <input autoFocus placeholder="What's your name?" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && name.trim() && onSet(name.trim())}
        style={{ width: "100%", maxWidth: 320, padding: "16px 20px", borderRadius: 16, border: "2px solid rgba(255, 195, 160, 0.3)", background: "rgba(255, 255, 255, 0.8)", color: "#5a4a42", fontSize: 16, outline: "none" }} />
      <button onClick={() => name.trim() && onSet(name.trim())} style={{ marginTop: 16, width: "100%", maxWidth: 320, padding: "15px 0", borderRadius: 16, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 16px rgba(255, 175, 189, 0.3)" }}>
        Let's Begin
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// BOTTOM NAV
// ═══════════════════════════════════════════════════════════════════════
function BottomNav({ tab, setTab }) {
  const tabs = [
    { id: "home", icon: "home" },
    { id: "tasks", icon: "tasks" },
    { id: "wellness", icon: "heart" },
    { id: "memories", icon: "memories" },
    { id: "chat", icon: "chat" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255, 255, 255, 0.5)", display: "flex", justifyContent: "space-around", padding: "12px 0 24px", zIndex: 100, boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.04)" }}>
      {tabs.map(t => {
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", color: active ? "#ff9a76" : "rgba(139, 126, 116, 0.5)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", position: "relative", padding: "4px 16px", transition: "color 0.2s" }}>
            <Icon name={t.icon} size={22} color="currentColor" sw={active ? 2.2 : 1.7} />
            {active && <div style={{ position: "absolute", top: -6, width: 28, height: 3, borderRadius: 2, background: "linear-gradient(90deg, #ffc3a0, #ffafbd)" }} />}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// HOME SCREEN
// ═══════════════════════════════════════════════════════════════════════
function HomeScreen({ userName, tasks, dailyCheckIn, setDailyCheckIn, setLastCheckInDate, autoSuggestions, setAutoSuggestions, emotionalPatterns, weeklyReflection, affirmations, gratitude }) {
  const greeting = (() => { const h = now().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; })();
  const overdue = tasks.filter(isOverdue);
  const todayTasks = tasks.filter(t => !t.done && t.dueDate === todayKey());
  const todayGratitude = gratitude[todayKey()];
  const latestAffirmation = affirmations[affirmations.length - 1];

  const handleCheckInSubmit = () => {
    if (!dailyCheckIn.answer.trim()) return;
    setLastCheckInDate(dailyCheckIn.date);
    setDailyCheckIn(null);
  };

  return (
    <div style={{ padding: "24px 20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <p style={{ color: "rgba(139, 126, 116, 0.5)", fontSize: 14 }}>{greeting}</p>
          <h1 style={{ fontSize: 30, fontFamily: "'Crimson Text', serif", fontWeight: 400, color: "#8b7e74", marginTop: 4, fontStyle: "italic" }}>{userName} 🌸</h1>
        </div>
        <div style={{ width: 50, height: 50, borderRadius: 25, background: "linear-gradient(135deg, #a8e6cf, #dcedc1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="spark" size={22} color="#fff" sw={1.5} />
        </div>
      </div>

      {/* Daily Check-in */}
      {dailyCheckIn && !dailyCheckIn.answer && (
        <div className="glass fade-in" style={{ borderRadius: 18, padding: "18px 20px", marginBottom: 18, borderLeft: "4px solid #ffc3a0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Icon name="heart" size={20} color="#ff9a76" sw={1.8} />
            <p style={{ fontSize: 13, fontWeight: 600, color: "#8b7e74" }}>Daily Check-in</p>
          </div>
          <p style={{ color: "#5a4a42", fontSize: 15, lineHeight: 1.6, marginBottom: 12, fontStyle: "italic" }}>"{dailyCheckIn.question}"</p>
          <textarea rows={3} placeholder="Take your time..." value={dailyCheckIn.answer} onChange={e => setDailyCheckIn({ ...dailyCheckIn, answer: e.target.value })}
            style={{ width: "100%", background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255, 195, 160, 0.25)", borderRadius: 12, padding: "12px 14px", color: "#5a4a42", fontSize: 14, outline: "none", resize: "none" }} />
          <button onClick={handleCheckInSubmit} style={{ marginTop: 10, padding: "10px 24px", borderRadius: 12, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Save
          </button>
        </div>
      )}

      {/* Weekly Reflection */}
      {weeklyReflection && (
        <div className="glass fade-in" style={{ borderRadius: 16, padding: "16px 18px", marginBottom: 16, borderLeft: "4px solid #a8e6cf" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Icon name="brain" size={18} color="#a8e6cf" sw={1.8} />
            <p style={{ fontSize: 12, fontWeight: 600, color: "#8b7e74" }}>Weekly Reflection</p>
          </div>
          <p style={{ color: "#5a4a42", fontSize: 14, lineHeight: 1.6 }}>{weeklyReflection.text}</p>
        </div>
      )}

      {/* Emotional Patterns */}
      {emotionalPatterns && (
        <div className="glass fade-in" style={{ borderRadius: 16, padding: "14px 16px", marginBottom: 16, borderLeft: "4px solid #ffafbd" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon name="target" size={18} color="#ffafbd" sw={1.8} />
            <p style={{ fontSize: 12, fontWeight: 600, color: "#8b7e74" }}>Pattern I Noticed</p>
          </div>
          <p style={{ color: "#5a4a42", fontSize: 13, lineHeight: 1.5, fontStyle: "italic" }}>{emotionalPatterns.text}</p>
        </div>
      )}

      {/* Today's Affirmation */}
      {latestAffirmation && (
        <div style={{ background: "linear-gradient(135deg, rgba(255, 195, 160, 0.15), rgba(255, 175, 189, 0.1))", borderRadius: 16, padding: "14px 18px", marginBottom: 16, border: "1px solid rgba(255, 195, 160, 0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon name="star" size={16} color="#ff9a76" sw={1.8} />
            <p style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.6)" }}>Affirmation for you</p>
          </div>
          <p style={{ color: "#5a4a42", fontSize: 14, lineHeight: 1.5, fontStyle: "italic" }}>"{latestAffirmation.text}"</p>
        </div>
      )}

      {/* Auto-Suggestions */}
      {autoSuggestions.slice(-3).reverse().map(s => (
        <div key={s.id} className="glass" style={{ borderRadius: 14, padding: "12px 14px", marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <Icon name="zap" size={16} color="#ffd3b6" sw={1.8} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, color: "#5a4a42", lineHeight: 1.5 }}>{s.text}</p>
          </div>
          <button onClick={() => setAutoSuggestions(p => p.filter(x => x.id !== s.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(139, 126, 116, 0.25)" }}>
            <Icon name="check" size={14} />
          </button>
        </div>
      ))}

      {/* Today's Gratitude */}
      {todayGratitude && (
        <div className="glass" style={{ borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.5)", marginBottom: 6 }}>Today I'm grateful for:</p>
          <p style={{ color: "#5a4a42", fontSize: 14, lineHeight: 1.5 }}>{todayGratitude}</p>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <div className="glass" style={{ borderRadius: 16, padding: "14px 16px", marginBottom: 16, borderLeft: "4px solid #ff9a76", background: "rgba(255, 154, 118, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="bell" size={20} color="#ff9a76" sw={2} />
            <p style={{ color: "#ff9a76", fontSize: 13, fontWeight: 600 }}>{overdue.length} overdue</p>
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#8b7e74", marginBottom: 10 }}>📌 Due Today</p>
          {todayTasks.map(t => (
            <div key={t.id} className="glass" style={{ borderRadius: 14, padding: "12px 14px", marginBottom: 8, borderLeft: "3px solid #ffc3a0" }}>
              <p style={{ color: "#5a4a42", fontSize: 14, fontWeight: 500 }}>{t.title}</p>
              {t.dueTime && <p style={{ color: "rgba(139, 126, 116, 0.5)", fontSize: 11, marginTop: 3 }}>🕐 {fmtTime(`${t.dueDate}T${t.dueTime}`)}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TASKS SCREEN
// ═══════════════════════════════════════════════════════════════════════
function TasksScreen({ tasks, setTasks }) {
  const [showForm, setShowForm] = useState(false);
  const sorted = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (isOverdue(a) !== isOverdue(b)) return isOverdue(a) ? -1 : 1;
    return 0;
  });

  return (
    <div style={{ padding: "24px 20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ fontSize: 24, fontFamily: "'Crimson Text', serif", fontWeight: 400, fontStyle: "italic", color: "#8b7e74" }}>Tasks</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ width: 42, height: 42, borderRadius: 21, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 175, 189, 0.25)" }}>
          <Icon name="plus" size={20} color="#fff" sw={2.5} />
        </button>
      </div>

      {showForm && <TaskForm onAdd={t => { setTasks(p => [...p, t]); setShowForm(false); }} />}

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

function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  const submit = () => {
    if (!title.trim()) return;
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

// WELLNESS SCREEN - Features 3, 5, 6, 7, 8, 9
function WellnessScreen({ gratitude, setGratitude, energyLog, setEnergyLog, affirmations, generateAffirmation, voiceNotes, setVoiceNotes }) {
  const [sub, setSub] = useState("gratitude");
  const today = todayKey();

  return (
    <div style={{ padding: "24px 20px 0" }}>
      <h2 style={{ fontSize: 24, fontFamily: "'Crimson Text', serif", fontWeight: 400, fontStyle: "italic", color: "#8b7e74", marginBottom: 16 }}>Wellness</h2>

      <div style={{ display: "flex", gap: 5, marginBottom: 16, background: "rgba(255, 255, 255, 0.5)", borderRadius: 12, padding: 4, overflowX: "auto" }}>
        {["gratitude", "energy", "affirmations", "breathe", "voice"].map(t => (
          <button key={t} onClick={() => setSub(t)} style={{ flex: "0 0 auto", background: sub === t ? "linear-gradient(135deg, #ffc3a0, #ffafbd)" : "transparent", border: "none", color: sub === t ? "#fff" : "rgba(139, 126, 116, 0.5)", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s", whiteSpace: "nowrap" }}>{t}</button>
        ))}
      </div>

      {sub === "gratitude" && <GratitudePanel gratitude={gratitude} setGratitude={setGratitude} today={today} />}
      {sub === "energy" && <EnergyPanel energyLog={energyLog} setEnergyLog={setEnergyLog} today={today} />}
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
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + " " + event.results[i][0].transcript);
        } else {
          interim += event.results[i][0].transcript;
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
    <div style={{ padding: "24px 20px 0" }}>
      <h2 style={{ fontSize: 24, fontFamily: "'Crimson Text', serif", fontWeight: 400, fontStyle: "italic", color: "#8b7e74", marginBottom: 18 }}>Memories</h2>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "rgba(255, 255, 255, 0.5)", borderRadius: 12, padding: 4 }}>
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {photos.slice().reverse().map(ph => (
              <div key={ph.id} className="glass" style={{ borderRadius: 14, overflow: "hidden" }}>
                <img src={ph.dataUrl} alt={ph.caption} style={{ width: "100%", height: 140, objectFit: "cover" }} />
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
    <div style={{ padding: "24px 20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
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

    try {
      const momentsContext = meaningfulMoments.slice(-10).map(m => `${m.type}: "${m.text}" (${m.emotion})`).join("\n");
      const systemPrompt = `You are ${userName}'s empathetic AI companion. You remember their meaningful moments:\n${momentsContext}\n\nWhen they share struggles or feelings, gently recall similar past moments if relevant. Be warm, present, supportive. Keep responses brief.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 600,
          system: systemPrompt,
          messages: updated.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      setChatMsgs(p => [...p, { role: "assistant", content: data.content[0].text, time: now().toISOString() }]);
    } catch {
      setChatMsgs(p => [...p, { role: "assistant", content: "I'm having trouble connecting. Try again?", time: now().toISOString() }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 90px)" }}>
      <div style={{ padding: "24px 20px 12px" }}>
        <h2 style={{ fontSize: 24, fontFamily: "'Crimson Text', serif", fontWeight: 400, fontStyle: "italic", color: "#8b7e74" }}>Chat</h2>
        <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.5)", marginTop: 2 }}>I'm here, just for you</p>
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
