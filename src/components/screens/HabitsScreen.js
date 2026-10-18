import { useState, useMemo } from "react";
import Icon from "../common/Icon";
import { LIFE_DOMAINS } from "../../App";
import { playTaskComplete, playStreakUnlock, playChimeSound } from "../../services/soundService";

// Helper functions for dates
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const now = () => new Date();
const dateKeyFrom = (d) => d.toISOString().slice(0, 10);
const todayKey = () => dateKeyFrom(now());

const weekStart = (d) => {
  const w = new Date(d);
  w.setDate(w.getDate() - w.getDay());
  return w;
};

// ═══════════════════════════════════════════════════════════════════════
// CURATED ATOMIC HABIT STACK TEMPLATES (James Clear Protocol)
// ═══════════════════════════════════════════════════════════════════════
export const CURATED_HABIT_STACKS = [
  {
    id: "stack_coffee_journal",
    anchor: "☕ Pouring morning coffee",
    title: "Write 1 sentence of morning intention",
    duration: "2 min",
    domain: "mind",
    color: "#ffc3a0",
    desc: "Anchor your journaling to your automatic morning caffeine ritual."
  },
  {
    id: "stack_desk_water",
    anchor: "💻 Sitting at my work desk",
    title: "Drink 1 full glass of cold water",
    duration: "1 min",
    domain: "health",
    color: "#60a5fa",
    desc: "Instantly hydrate before opening email or Slack."
  },
  {
    id: "stack_lunch_breath",
    anchor: "🥗 Finishing my lunch",
    title: "Take 3 Physiological Sighs",
    duration: "1 min",
    domain: "mind",
    color: "#06b6d4",
    desc: "Reset nervous system for the afternoon focus block."
  },
  {
    id: "stack_laptop_walk",
    anchor: "🚪 Closing work laptop for the day",
    title: "Step outside for a 10-minute walk",
    duration: "10 min",
    domain: "health",
    color: "#a8e6cf",
    desc: "Create a physical psychological buffer between work and evening."
  },
  {
    id: "stack_bed_read",
    anchor: "🛏️ Getting under the covers",
    title: "Read 2 pages of a physical book",
    duration: "5 min",
    domain: "learning",
    color: "#c3aed6",
    desc: "Displace late-night screen scrolling with calming literature."
  },
  {
    id: "stack_teeth_stretch",
    anchor: "🪥 Brushing evening teeth",
    title: "Do 3 gentle neck & shoulder rolls",
    duration: "2 min",
    domain: "health",
    color: "#ffafbd",
    desc: "Release daytime tension before sleep."
  }
];

// Helper to retrieve streak shield state from localStorage
export const getStreakShieldState = () => {
  try {
    const raw = localStorage.getItem("saathi_habit_shields");
    if (!raw) {
      return { availableShields: 2, totalRepairs: 0, lastRechargeDate: null };
    }
    return JSON.parse(raw);
  } catch {
    return { availableShields: 2, totalRepairs: 0, lastRechargeDate: null };
  }
};

export const saveStreakShieldState = (state) => {
  try {
    localStorage.setItem("saathi_habit_shields", JSON.stringify(state));
  } catch {}
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN HABITS SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function HabitsScreen({
  habits = [],
  setHabits,
  showToast,
  triggerConfetti
}) {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'stacks' | 'shields'
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [filterDomain, setFilterDomain] = useState("all");
  const [selectedHabitForCalendar, setSelectedHabitForCalendar] = useState(null);
  const [shieldState, setShieldState] = useState(getStreakShieldState);
  const [rechargeModal, setRechargeModal] = useState(false);
  const [rechargeStep, setRechargeStep] = useState(0);

  // Reminders state
  const [reminderQuery, setReminderQuery] = useState("");
  const [reminderFilter, setReminderFilter] = useState("enabled");

  const today = todayKey();

  // Streak calculations
  const countWeekCompletions = (habit, refDate) => {
    const start = weekStart(refDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return (habit.completions || []).filter(k => {
      const kd = new Date(`${k}T00:00:00`);
      return kd >= start && kd <= end;
    }).length;
  };

  const getDailyStreak = (habit) => {
    const set = new Set([...(habit.completions || []), ...(habit.freezesUsed || []), ...(habit.shieldUsedDates || [])]);
    let streak = 0;
    const d = now();
    const todayStr = dateKeyFrom(d);
    if (!set.has(todayStr)) {
      d.setDate(d.getDate() - 1);
    }
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

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = now();
      d.setDate(d.getDate() - (6 - i));
      return dateKeyFrom(d);
    });
  }, []);

  const visibleHabits = habits.filter(h => {
    const matchArchived = showArchived ? true : !h.archived;
    const matchDomain = filterDomain === "all" || (h.domain || "health") === filterDomain;
    const matchStack = activeTab === "stacks" ? !!h.anchorHabit : true;
    return matchArchived && matchDomain && matchStack;
  });

  const doneToday = habits.filter(h => (h.completions || []).includes(today) && !h.archived).length;
  const totalActive = habits.filter(h => !h.archived).length;
  const maxStreak = Math.max(0, ...habits.map(h => getDailyStreak(h)));

  // Habit completion toggle
  const toggleCompletion = (habit) => {
    const hasToday = (habit.completions || []).includes(today);
    if (!hasToday) {
      playTaskComplete();
      if (triggerConfetti) triggerConfetti();

      // Check if this unlocks milestone
      const newStreak = getDailyStreak(habit) + 1;
      if ([3, 7, 14, 30, 60].includes(newStreak)) {
        setTimeout(() => {
          playStreakUnlock();
          if (showToast) showToast(`🏆 Unlocked ${newStreak}-Day Streak Milestone!`);
        }, 300);
      }
    }

    setHabits(p => p.map(h => {
      if (h.id !== habit.id) return h;
      const next = hasToday
        ? h.completions.filter(d => d !== today)
        : [...(h.completions || []), today];
      return { ...h, completions: next };
    }));
  };

  // Toggle archive
  const toggleArchive = (habit) => {
    setHabits(p => p.map(h => h.id === habit.id ? { ...h, archived: !h.archived } : h));
  };

  // Remove habit
  const removeHabit = (habit) => {
    setHabits(p => p.filter(h => h.id !== habit.id));
    if (showToast) {
      showToast("Habit deleted", () => {
        setHabits(p => [...p, habit]);
      });
    }
  };

  // 🛡️ Apply Streak Shield Repair
  const applyStreakShield = (habitId, targetDateKey) => {
    if (shieldState.availableShields <= 0) {
      if (showToast) showToast("No streak shields available! Complete a 60-sec recharge quest. 🛡️");
      return;
    }

    const updatedShields = {
      ...shieldState,
      availableShields: shieldState.availableShields - 1,
      totalRepairs: (shieldState.totalRepairs || 0) + 1
    };
    saveStreakShieldState(updatedShields);
    setShieldState(updatedShields);

    setHabits(p => p.map(h => {
      if (h.id !== habitId) return h;
      const shieldUsed = [...(h.shieldUsedDates || []), targetDateKey];
      return { ...h, shieldUsedDates: shieldUsed };
    }));

    playChimeSound(659.25, 0.8, 0.25);
    if (showToast) showToast(`🛡️ Streak Shield applied for ${targetDateKey}! Streak saved!`);
  };

  // Recharge Shield Quest
  const completeRechargeQuest = () => {
    const updated = {
      ...shieldState,
      availableShields: Math.min(3, shieldState.availableShields + 1),
      lastRechargeDate: today
    };
    saveStreakShieldState(updated);
    setShieldState(updated);
    setRechargeModal(false);
    setRechargeStep(0);
    playStreakUnlock();
    if (showToast) showToast("🛡️ Streak Shield Recharged (+1 Shield)! Keep the momentum!");
  };

  // 1-Click Adopt Curated Habit Stack
  const adoptCuratedStack = (stack) => {
    const newHabit = {
      id: uid(),
      title: stack.title,
      anchorHabit: stack.anchor,
      stackDuration: stack.duration,
      schedule: "daily",
      goalPerWeek: 1,
      color: stack.color,
      domain: stack.domain,
      reminderEnabled: false,
      reminderTime: "",
      lastRemindedDate: null,
      createdAt: now().toISOString(),
      completions: [],
      shieldUsedDates: [],
      freezesUsed: [],
      archived: false
    };

    setHabits(p => [...p, newHabit]);
    playChimeSound(528, 0.8, 0.2);
    if (showToast) showToast(`Added Atomic Stack: "${stack.title}"! 🔗`);
  };

  // Reminders filtered list
  const withReminders = habits.filter(h => h.reminderTime || h.reminderEnabled);
  const enabledReminders = withReminders.filter(h => h.reminderEnabled && !h.archived);
  const disabledReminders = withReminders.filter(h => !h.reminderEnabled && !h.archived);
  const archivedReminders = habits.filter(h => h.archived);

  const filteredReminders = (
    reminderFilter === "enabled" ? enabledReminders :
      reminderFilter === "disabled" ? disabledReminders :
        reminderFilter === "archived" ? archivedReminders :
          withReminders
  ).filter(h => h.title.toLowerCase().includes(reminderQuery.trim().toLowerCase()));

  const toggleReminderEnabled = (habit) => {
    setHabits(p => p.map(h => h.id === habit.id ? { ...h, reminderEnabled: !h.reminderEnabled } : h));
  };

  const updateReminderTime = (habit, time) => {
    setHabits(p => p.map(h => h.id === habit.id ? { ...h, reminderTime: time, reminderEnabled: !!time } : h));
  };

  return (
    <div className="fade-in" style={{ padding: "0 0 90px 0", position: "relative" }}>
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HERO BANNER WITH STREAK & SHIELD STATUS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          background: "linear-gradient(135deg, #a8e6cf 0%, #dcedc1 45%, #ffc3a0 100%)",
          padding: "32px 24px 36px",
          borderRadius: "0 0 36px 36px",
          marginBottom: 20,
          boxShadow: "0 12px 40px rgba(168, 230, 207, 0.25)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h2 style={{ fontSize: 26, fontFamily: "'Crimson Text', serif", fontWeight: 400, fontStyle: "italic", color: "#5a4a42", margin: 0 }}>
                Habits & Atomic Stacks
              </h2>
            </div>
            <p style={{ fontSize: 13, color: "rgba(90, 74, 66, 0.85)", marginTop: 4, fontWeight: 500 }}>
              {doneToday} of {totalActive} completed today · Top streak: {maxStreak}d 🔥
            </p>
          </div>

          {/* Plus Add Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: "rgba(255, 255, 255, 0.95)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
              transition: "transform 0.2s"
            }}
            title="Create Habit or Atomic Stack"
          >
            <Icon name="plus" size={22} color="#5a4a42" sw={2.5} />
          </button>
        </div>

        {/* SHIELD QUICK STATUS PILL ON HERO */}
        <div
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "blur(10px)",
            borderRadius: 16,
            padding: "8px 14px",
            border: "1px solid rgba(255, 255, 255, 0.8)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🛡️</span>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>
                {shieldState.availableShields} Streak Shields
              </span>
              <span style={{ fontSize: 11, color: "rgba(90, 74, 66, 0.7)", marginLeft: 6 }}>
                (Protects against broken streaks)
              </span>
            </div>
          </div>

          <button
            onClick={() => setRechargeModal(true)}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
              border: "none",
              borderRadius: 10,
              padding: "5px 10px",
              color: "#ffffff",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            + Recharge
          </button>
        </div>
      </div>

      <div style={{ padding: "0 22px" }}>
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* SUB-VIEW NAVIGATION PILLS */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "rgba(255, 255, 255, 0.5)", borderRadius: 14, padding: 4 }}>
          {[
            { id: "all", label: "📋 Daily Tracker" },
            { id: "stacks", label: "🔗 Habit Stacks" },
            { id: "shields", label: "🛡️ Shield Vault" }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 10,
                border: "none",
                background: activeTab === t.id ? "linear-gradient(135deg, #a8e6cf, #dcedc1)" : "transparent",
                color: activeTab === t.id ? "#2d6a4f" : "rgba(139, 126, 116, 0.65)",
                fontSize: 12,
                fontWeight: activeTab === t.id ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* VIEW 1: DAILY TRACKER & HABIT CARDS */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "all" && (
          <>
            {/* STREAK TROPHY CABINET */}
            {(() => {
              const badges = [
                { name: "3d Spark", threshold: 3, icon: "🥉", bg: "linear-gradient(135deg, #cd7f32, #e9967a)" },
                { name: "7d Master", threshold: 7, icon: "🥈", bg: "linear-gradient(135deg, #94a3b8, #cbd5e1)" },
                { name: "14d Pioneer", threshold: 14, icon: "🥇", bg: "linear-gradient(135deg, #f59e0b, #fbbf24)" },
                { name: "30d Legend", threshold: 30, icon: "👑", bg: "linear-gradient(135deg, #ec4899, #f43f5e)" }
              ];

              return (
                <div className="glass" style={{ borderRadius: 18, padding: 14, marginBottom: 16, background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 243, 226, 0.8))" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#8b5e3c", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                      🏆 Streak Milestone Badges
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.6)", fontWeight: 600 }}>
                      Top Streak: {maxStreak} Days 🔥
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {badges.map(b => {
                      const unlocked = maxStreak >= b.threshold;
                      return (
                        <div
                          key={b.threshold}
                          style={{
                            padding: "8px 4px",
                            borderRadius: 14,
                            background: unlocked ? b.bg : "rgba(139, 126, 116, 0.08)",
                            color: unlocked ? "#fff" : "rgba(139, 126, 116, 0.4)",
                            textAlign: "center",
                            border: unlocked ? "none" : "1px dashed rgba(139, 126, 116, 0.2)",
                            boxShadow: unlocked ? "0 4px 12px rgba(0,0,0,0.12)" : "none",
                            filter: unlocked ? "none" : "grayscale(80%)",
                            opacity: unlocked ? 1 : 0.65
                          }}
                          title={unlocked ? `Unlocked! (${b.name})` : `Reach ${b.threshold}-day streak to unlock`}
                        >
                          <div style={{ fontSize: 18 }}>{b.icon}</div>
                          <div style={{ fontSize: 9.5, fontWeight: 700, marginTop: 2 }}>{b.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* DOMAIN FILTER BAR */}
            <div style={{ display: "flex", gap: 5, marginBottom: 14, overflowX: "auto", paddingBottom: 2 }}>
              <button
                onClick={() => setFilterDomain("all")}
                style={{
                  flex: "0 0 auto",
                  padding: "5px 12px",
                  borderRadius: 20,
                  border: filterDomain === "all" ? "none" : "1px solid rgba(139, 126, 116, 0.2)",
                  background: filterDomain === "all" ? "linear-gradient(135deg, #a8e6cf, #dcedc1)" : "rgba(255, 255, 255, 0.6)",
                  color: filterDomain === "all" ? "#2d6a4f" : "#5a4a42",
                  fontSize: 11,
                  fontWeight: filterDomain === "all" ? 700 : 500,
                  cursor: "pointer"
                }}
              >
                All Domains
              </button>
              {Object.entries(LIFE_DOMAINS).map(([k, d]) => (
                <button
                  key={k}
                  onClick={() => setFilterDomain(k)}
                  style={{
                    flex: "0 0 auto",
                    padding: "5px 12px",
                    borderRadius: 20,
                    border: filterDomain === k ? `2px solid ${d.color}` : "1px solid rgba(139, 126, 116, 0.2)",
                    background: filterDomain === k ? d.bg : "rgba(255, 255, 255, 0.6)",
                    color: "#5a4a42",
                    fontSize: 11,
                    fontWeight: filterDomain === k ? 700 : 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  {d.label}
                </button>
              ))}
              <button
                onClick={() => setShowArchived(!showArchived)}
                style={{
                  flex: "0 0 auto",
                  padding: "5px 10px",
                  borderRadius: 20,
                  border: showArchived ? "1.5px solid rgba(139, 126, 116, 0.4)" : "1px solid rgba(139, 126, 116, 0.15)",
                  background: showArchived ? "rgba(139, 126, 116, 0.15)" : "transparent",
                  color: "rgba(139, 126, 116, 0.7)",
                  fontSize: 10.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                {showArchived ? "📁 Hide Archived" : "📁 Show Archived"}
              </button>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* VIEW 2: ATOMIC HABIT STACKS (James Clear Library) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "stacks" && (
          <div style={{ marginBottom: 18 }}>
            <div
              className="glass"
              style={{
                borderRadius: 18,
                padding: "16px 18px",
                marginBottom: 16,
                background: "linear-gradient(135deg, rgba(255, 195, 160, 0.15), rgba(255, 175, 189, 0.15))",
                border: "1px solid rgba(255, 195, 160, 0.4)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>🔗</span>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#5a4a42" }}>
                  Atomic Habit Stacking Protocol
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(90, 74, 66, 0.8)", lineHeight: 1.5 }}>
                <em>"The easiest way to build a new habit is to identify a current habit you already do each day and stack your new behavior on top."</em> — James Clear, <strong>Atomic Habits</strong>
              </p>
            </div>

            {/* Curated Stack Starter Library */}
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(90, 74, 66, 0.8)", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              ⚡ 1-Click Starter Stacks Library
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {CURATED_HABIT_STACKS.map(stack => {
                const alreadyAdded = habits.some(h => h.title.toLowerCase() === stack.title.toLowerCase());
                return (
                  <div
                    key={stack.id}
                    className="glass"
                    style={{
                      borderRadius: 16,
                      padding: "14px 16px",
                      borderLeft: `4px solid ${stack.color}`,
                      background: "rgba(255, 255, 255, 0.8)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        {/* Anchor */}
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 8, background: "rgba(0, 0, 0, 0.05)", fontSize: 11, fontWeight: 600, color: "#5a4a42", marginBottom: 6 }}>
                          <span>⚓ After:</span>
                          <strong>{stack.anchor}</strong>
                        </div>

                        {/* Stacking Rule */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "2px 0 4px" }}>
                          <span style={{ color: "#f59e0b", fontSize: 14 }}>🔗 ➡️</span>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: "#2d3748" }}>{stack.title}</span>
                          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "1px 6px", borderRadius: 6, background: "rgba(168, 230, 207, 0.4)", color: "#2d6a4f" }}>
                            ⏱️ {stack.duration}
                          </span>
                        </div>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(139, 126, 116, 0.75)" }}>{stack.desc}</p>
                      </div>

                      <button
                        onClick={() => adoptCuratedStack(stack)}
                        disabled={alreadyAdded}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 10,
                          border: "none",
                          background: alreadyAdded ? "rgba(139, 126, 116, 0.15)" : "linear-gradient(135deg, #a8e6cf, #dcedc1)",
                          color: alreadyAdded ? "rgba(139, 126, 116, 0.5)" : "#2d6a4f",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: alreadyAdded ? "default" : "pointer",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {alreadyAdded ? "✓ Active" : "+ Add Stack"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* VIEW 3: STREAK SHIELD VAULT */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "shields" && (
          <div style={{ marginBottom: 20 }}>
            {/* Shield Inventory Banner */}
            <div
              className="glass"
              style={{
                borderRadius: 20,
                padding: "20px 22px",
                marginBottom: 16,
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(99, 102, 241, 0.12))",
                border: "2px solid rgba(59, 130, 246, 0.3)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    SHIELD VAULT
                  </span>
                  <h3 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800, color: "#1e3a8a" }}>
                    {shieldState.availableShields} of 3 Available
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(30, 58, 138, 0.8)" }}>
                    {shieldState.totalRepairs || 0} streaks successfully rescued
                  </p>
                </div>
                <div style={{ fontSize: 44 }}>🛡️</div>
              </div>

              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed rgba(59, 130, 246, 0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11.5, color: "rgba(30, 58, 138, 0.75)" }}>
                  Need more shields? Complete a 60-second recovery quest.
                </span>
                <button
                  onClick={() => setRechargeModal(true)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                    border: "none",
                    color: "#ffffff",
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  ⚡ Recharge Quest
                </button>
              </div>
            </div>

            {/* Neuroscience explanation */}
            <div className="glass" style={{ borderRadius: 16, padding: "14px 16px", marginBottom: 16, background: "rgba(255, 255, 255, 0.6)" }}>
              <h4 style={{ margin: "0 0 6px 0", fontSize: 13, fontWeight: 700, color: "#5a4a42" }}>
                🧠 The Science of Streak Forgiveness
              </h4>
              <p style={{ margin: 0, fontSize: 11.5, color: "rgba(90, 74, 66, 0.8)", lineHeight: 1.5 }}>
                Research shows that rigid "all-or-nothing" streaks lead to discouragement after a single sick or busy day. <strong>Streak Shields</strong> protect your neural momentum by honoring consistency over perfection.
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* ADD HABIT / STACK FORM */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {showForm && (
          <HabitForm
            onAdd={h => {
              setHabits(p => [...p, h]);
              setShowForm(false);
              playChimeSound(528, 0.8, 0.25);
              if (showToast) showToast(`Added habit: "${h.title}"! 🔥`);
            }}
            existingHabits={habits}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* HABIT LIST CARDS (With Atomic Stacking & Shield Badges) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {visibleHabits.length === 0 ? (
          <div className="glass" style={{ borderRadius: 18, padding: "28px 20px", textAlign: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 36 }}>🌱</span>
            <p style={{ color: "#5a4a42", fontSize: 15, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>
              {activeTab === "stacks" ? "No atomic habit stacks yet" : "No habits tracked in this view"}
            </p>
            <p style={{ color: "rgba(139, 126, 116, 0.6)", fontSize: 12, marginBottom: 14 }}>
              {activeTab === "stacks" ? "Adopt a stack from the library above or create your own!" : "Start with an atomic daily routine:"}
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: "9px 20px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #a8e6cf, #dcedc1)",
                border: "none",
                color: "#2d6a4f",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              + Create New Habit
            </button>
          </div>
        ) : (
          visibleHabits.map(h => {
            const isDoneToday = (h.completions || []).includes(today);
            const weekCount = countWeekCompletions(h, now());
            const streak = h.schedule === "weekly" ? getWeeklyStreak(h) : getDailyStreak(h);
            const dom = LIFE_DOMAINS[h.domain || "health"] || LIFE_DOMAINS.health;

            // Yesterday shield status
            const yst = new Date();
            yst.setDate(yst.getDate() - 1);
            const ystKey = dateKeyFrom(yst);
            const isShieldedYesterday = (h.shieldUsedDates || []).includes(ystKey) || (h.freezesUsed || []).includes(ystKey);
            const canShieldYesterday = !isDoneToday && !(h.completions || []).includes(ystKey) && !isShieldedYesterday && (h.completions || []).length > 0;

            return (
              <div
                key={h.id}
                className="glass"
                style={{
                  borderRadius: 18,
                  padding: "16px 18px",
                  marginBottom: 14,
                  borderLeft: `4px solid ${h.color}`,
                  background: isDoneToday ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.7)",
                  boxShadow: isDoneToday ? "0 4px 16px rgba(168, 230, 207, 0.15)" : "none",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  {/* Checkbox Button */}
                  <button
                    onClick={() => toggleCompletion(h)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      border: `2px solid ${h.color}`,
                      background: isDoneToday ? h.color : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                      marginTop: 2,
                      transition: "all 0.2s"
                    }}
                    title={isDoneToday ? "Mark uncompleted" : "Mark completed today!"}
                  >
                    {isDoneToday && <Icon name="check" size={14} color="#fff" sw={3} />}
                  </button>

                  {/* Habit Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Anchor pill if it's an Atomic Stack */}
                    {h.anchorHabit && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: "rgba(0,0,0,0.06)", color: "#4a5568" }}>
                          ⚓ After: {h.anchorHabit}
                        </span>
                        <span style={{ fontSize: 11, color: "#f59e0b" }}>🔗 ➡️</span>
                        {h.stackDuration && (
                          <span style={{ fontSize: 9.5, fontWeight: 700, padding: "1px 5px", borderRadius: 6, background: "rgba(59, 130, 246, 0.12)", color: "#2563eb" }}>
                            {h.stackDuration}
                          </span>
                        )}
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <p style={{ color: "#2d3748", fontSize: 15, fontWeight: 700, margin: 0, textDecoration: isDoneToday ? "line-through" : "none", opacity: isDoneToday ? 0.8 : 1 }}>
                        {h.title}
                      </p>
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 6, background: dom.bg, color: dom.color, fontWeight: 700 }}>
                        {dom.label}
                      </span>

                      {/* Streak Badges */}
                      {streak >= 3 && (
                        <button
                          onClick={() => setSelectedHabitForCalendar(h)}
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                          title="View streak details & calendar"
                        >
                          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 6, background: streak >= 30 ? "rgba(255, 195, 160, 0.35)" : streak >= 7 ? "rgba(255, 175, 189, 0.35)" : "rgba(168, 230, 207, 0.35)", color: "#5a4a42", fontWeight: 700 }}>
                            {streak >= 30 ? `👑 ${streak}d Legend` : streak >= 7 ? `🔥 ${streak}d Streak` : `🏆 ${streak}d Streak`}
                          </span>
                        </button>
                      )}

                      {isShieldedYesterday && (
                        <span style={{ fontSize: 9.5, padding: "2px 6px", borderRadius: 6, background: "rgba(59, 130, 246, 0.15)", color: "#2563eb", fontWeight: 700 }}>
                          🛡️ Shield Protected
                        </span>
                      )}
                    </div>

                    <p style={{ color: "rgba(139, 126, 116, 0.65)", fontSize: 11, marginTop: 3 }}>
                      {h.schedule === "weekly" ? `${weekCount}/${h.goalPerWeek} this week` : (isDoneToday ? "Done today ✨" : "Due today")}
                    </p>

                    {/* Quick Missed Streak Repair Button */}
                    {canShieldYesterday && (
                      <button
                        onClick={() => applyStreakShield(h.id, ystKey)}
                        style={{
                          marginTop: 4,
                          padding: "3px 9px",
                          borderRadius: 8,
                          background: "rgba(59, 130, 246, 0.12)",
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          color: "#2563eb",
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        🛡️ Use Shield to Protect Missed Day ({shieldState.availableShields} left)
                      </button>
                    )}

                    {h.reminderEnabled && h.reminderTime && (
                      <p style={{ color: "rgba(139, 126, 116, 0.6)", fontSize: 10.5, marginTop: 3 }}>
                        🔔 Reminder set for {h.reminderTime}
                      </p>
                    )}
                  </div>

                  {/* Actions (Archive / Delete) */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button
                      onClick={() => toggleArchive(h)}
                      style={{ background: "none", border: "none", color: "rgba(139, 126, 116, 0.45)", fontSize: 11, cursor: "pointer" }}
                    >
                      {h.archived ? "Unarchive" : "Archive"}
                    </button>
                    <button
                      onClick={() => removeHabit(h)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(139, 126, 116, 0.3)", padding: 4 }}
                      title="Delete habit"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>

                {/* 7-DAY VISUAL PROGRESS TRACKER */}
                <div
                  onClick={() => setSelectedHabitForCalendar(h)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 12,
                    paddingTop: 8,
                    borderTop: "1px dashed rgba(139, 126, 116, 0.15)",
                    cursor: "pointer"
                  }}
                  title="Click to view full 7-day streak calendar & apply shields"
                >
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {last7Days.map(d => {
                      const isDone = (h.completions || []).includes(d);
                      const isShielded = (h.shieldUsedDates || []).includes(d) || (h.freezesUsed || []).includes(d);
                      return (
                        <div
                          key={d}
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            background: isDone ? h.color : isShielded ? "#3b82f6" : "rgba(139, 126, 116, 0.18)",
                            boxShadow: isDone ? `0 2px 6px ${h.color}66` : "none"
                          }}
                          title={`${d}: ${isDone ? "Completed" : isShielded ? "Shield Protected" : "Missed"}`}
                        />
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.7)", fontWeight: 600 }}>
                    {streak} {h.schedule === "weekly" ? "wk" : "day"} streak 📅
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* REMINDERS & AUTOMATIONS ACCORDION */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 18, fontFamily: "'Crimson Text', serif", fontWeight: 600, color: "#8b7e74", marginBottom: 12, fontStyle: "italic" }}>
            Scheduled Reminders
          </h3>

          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {["enabled", "disabled", "archived", "all"].map(t => (
              <button
                key={t}
                onClick={() => setReminderFilter(t)}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  borderRadius: 10,
                  border: "none",
                  background: reminderFilter === t ? "linear-gradient(135deg, #a8e6cf, #dcedc1)" : "rgba(255, 255, 255, 0.6)",
                  color: reminderFilter === t ? "#2d6a4f" : "rgba(139, 126, 116, 0.6)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize"
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <input
            placeholder="Search reminders..."
            value={reminderQuery}
            onChange={e => setReminderQuery(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.7)",
              border: "1px solid rgba(255, 195, 160, 0.25)",
              borderRadius: 12,
              padding: "9px 12px",
              color: "#5a4a42",
              fontSize: 12.5,
              outline: "none",
              marginBottom: 12
            }}
          />

          {filteredReminders.length === 0 ? (
            <p style={{ color: "rgba(139, 126, 116, 0.4)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
              No reminders found in this filter.
            </p>
          ) : (
            filteredReminders.map(h => (
              <div
                key={h.id}
                className="glass"
                style={{
                  borderRadius: 14,
                  padding: "12px 14px",
                  marginBottom: 10,
                  borderLeft: `4px solid ${h.color || "#ffc3a0"}`
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#5a4a42", fontSize: 13.5, fontWeight: 600, margin: 0 }}>{h.title}</p>
                    <p style={{ color: "rgba(139, 126, 116, 0.5)", fontSize: 10.5, margin: "2px 0 0" }}>
                      {h.reminderEnabled ? "Active" : "Paused"}{h.archived ? " · Archived" : ""}
                    </p>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(139, 126, 116, 0.6)" }}>
                    <input type="checkbox" checked={!!h.reminderEnabled} onChange={() => toggleReminderEnabled(h)} />
                    On
                  </label>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input
                    type="time"
                    value={h.reminderTime || ""}
                    onChange={e => updateReminderTime(h, e.target.value)}
                    style={{
                      flex: 1,
                      background: "rgba(255, 255, 255, 0.6)",
                      border: "1px solid rgba(255, 195, 160, 0.25)",
                      borderRadius: 10,
                      padding: "6px 10px",
                      color: h.reminderTime ? "#5a4a42" : "rgba(139, 126, 116, 0.4)",
                      fontSize: 12,
                      outline: "none",
                      colorScheme: "light"
                    }}
                  />
                  <button
                    onClick={() => updateReminderTime(h, "")}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 10,
                      background: "rgba(139, 126, 116, 0.1)",
                      border: "none",
                      color: "rgba(139, 126, 116, 0.6)",
                      fontSize: 11,
                      cursor: "pointer"
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* STREAK PROTECTION CALENDAR MODAL OVERLAY */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {selectedHabitForCalendar && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
          >
            <div
              className="glass fade-in"
              style={{
                width: "100%",
                maxWidth: 380,
                borderRadius: 24,
                padding: 22,
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(255, 195, 160, 0.5)",
                boxShadow: "0 16px 44px rgba(0,0,0,0.2)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#2d3748", margin: 0 }}>
                    📅 7-Day Streak & Shield Manager
                  </h3>
                  <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.7)", margin: "3px 0 0 0" }}>
                    {selectedHabitForCalendar.title}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedHabitForCalendar(null)}
                  style={{ background: "none", border: "none", fontSize: 18, color: "rgba(139, 126, 116, 0.5)", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {last7Days.map(dayKey => {
                  const d = new Date(`${dayKey}T00:00:00`);
                  const dayLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                  const isDone = (selectedHabitForCalendar.completions || []).includes(dayKey);
                  const isShielded = (selectedHabitForCalendar.shieldUsedDates || []).includes(dayKey) || (selectedHabitForCalendar.freezesUsed || []).includes(dayKey);

                  return (
                    <div
                      key={dayKey}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "9px 12px",
                        borderRadius: 12,
                        background: isDone ? "rgba(168, 230, 207, 0.22)" : isShielded ? "rgba(96, 165, 250, 0.15)" : "rgba(139, 126, 116, 0.08)"
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#2d3748" }}>
                        {dayLabel} {dayKey === today ? "(Today)" : ""}
                      </span>

                      {isDone ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#2d6a4f" }}>✅ Completed</span>
                      ) : isShielded ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb" }}>🛡️ Shielded</span>
                      ) : dayKey === today ? (
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#d97706" }}>Pending</span>
                      ) : (
                        <button
                          onClick={() => {
                            applyStreakShield(selectedHabitForCalendar.id, dayKey);
                            setSelectedHabitForCalendar(p => ({
                              ...p,
                              shieldUsedDates: [...(p.shieldUsedDates || []), dayKey]
                            }));
                          }}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 8,
                            background: "rgba(59, 130, 246, 0.15)",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            color: "#2563eb",
                            fontSize: 10.5,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          🛡️ Rescue ({shieldState.availableShields} left)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setSelectedHabitForCalendar(null)}
                style={{
                  width: "100%",
                  padding: "11px 0",
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #a8e6cf, #dcedc1)",
                  border: "none",
                  color: "#2d6a4f",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* RECHARGE SHIELD 60-SEC QUEST MODAL */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {rechargeModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
          >
            <div
              className="glass fade-in"
              style={{
                width: "100%",
                maxWidth: 380,
                borderRadius: 24,
                padding: 24,
                background: "rgba(255,255,255,0.98)",
                border: "2px solid #3b82f6",
                boxShadow: "0 18px 48px rgba(59, 130, 246, 0.25)",
                textAlign: "center"
              }}
            >
              <span style={{ fontSize: 44 }}>🛡️⚡</span>
              <h3 style={{ margin: "10px 0 4px", fontSize: 18, fontWeight: 800, color: "#1e3a8a" }}>
                60-Second Shield Recharge Quest
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: "rgba(30, 58, 138, 0.8)", lineHeight: 1.45 }}>
                To earn a bonus Streak Shield, complete one mindful micro-action to reset your mental baseline:
              </p>

              {rechargeStep === 0 && (
                <div>
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: "rgba(59, 130, 246, 0.08)",
                      border: "1px dashed #3b82f6",
                      marginBottom: 16
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e3a8a" }}>
                      Take 3 Slow Deep Breaths Right Now
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(30, 58, 138, 0.7)" }}>
                      Fill your lungs, soften your jaw, and let out an extended releasing sigh.
                    </p>
                  </div>
                  <button
                    onClick={() => setRechargeStep(1)}
                    style={{
                      width: "100%",
                      padding: "12px 0",
                      borderRadius: 14,
                      background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
                      border: "none",
                      color: "#ffffff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    I did my 3 breaths! ➡️
                  </button>
                </div>
              )}

              {rechargeStep === 1 && (
                <div>
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px dashed #10b981",
                      marginBottom: 16
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#065f46" }}>
                      Affirm Consistency Over Perfection
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 11.5, fontStyle: "italic", color: "#047857" }}>
                      "Missing one day is an accident. Missing two days is the start of a new habit. I always return to my rhythm."
                    </p>
                  </div>
                  <button
                    onClick={completeRechargeQuest}
                    style={{
                      width: "100%",
                      padding: "12px 0",
                      borderRadius: 14,
                      background: "linear-gradient(135deg, #10b981, #34d399)",
                      border: "none",
                      color: "#ffffff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 6px 18px rgba(16, 185, 129, 0.3)"
                    }}
                  >
                    Claim Recharged Shield 🛡️
                  </button>
                </div>
              )}

              <button
                onClick={() => { setRechargeModal(false); setRechargeStep(0); }}
                style={{
                  marginTop: 12,
                  background: "none",
                  border: "none",
                  color: "rgba(139, 126, 116, 0.6)",
                  fontSize: 11.5,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// HABIT & ATOMIC STACK CREATION FORM
// ═══════════════════════════════════════════════════════════════════════
export function HabitForm({ onAdd, existingHabits = [] }) {
  const [title, setTitle] = useState("");
  const [isStack, setIsStack] = useState(false);
  const [anchorHabit, setAnchorHabit] = useState("");
  const [customAnchor, setCustomAnchor] = useState("");
  const [stackDuration, setStackDuration] = useState("2 min");
  const [schedule, setSchedule] = useState("daily");
  const [goalPerWeek, setGoalPerWeek] = useState(3);
  const [color, setColor] = useState("#a8e6cf");
  const [domain, setDomain] = useState("health");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("");

  const colors = ["#a8e6cf", "#ffc3a0", "#ffafbd", "#dcedc1", "#60a5fa", "#c3aed6", "#f59e0b"];

  // Anchor presets
  const anchorPresets = [
    "☕ Pouring morning coffee",
    "💻 Sitting down at my work desk",
    "🚪 Closing work laptop",
    "🥗 Finishing lunch",
    "🪥 Brushing my teeth",
    "🛏️ Getting into bed",
    ...existingHabits.map(h => `📌 After: ${h.title}`)
  ];

  const submit = () => {
    if (!title.trim()) return;

    const chosenAnchor = isStack
      ? (anchorHabit === "custom" ? customAnchor.trim() : anchorHabit)
      : "";

    onAdd({
      id: uid(),
      title: title.trim(),
      anchorHabit: chosenAnchor,
      stackDuration: isStack ? stackDuration : "",
      schedule,
      goalPerWeek: schedule === "weekly" ? Number(goalPerWeek) : 1,
      color,
      domain: domain || "health",
      reminderEnabled: reminderEnabled && !!reminderTime,
      reminderTime: reminderEnabled ? reminderTime : "",
      lastRemindedDate: null,
      createdAt: now().toISOString(),
      completions: [],
      shieldUsedDates: [],
      freezesUsed: [],
      archived: false
    });
  };

  return (
    <div
      className="glass fade-in"
      style={{
        borderRadius: 20,
        padding: "18px 20px",
        marginBottom: 20,
        border: isStack ? "2px solid #f59e0b" : "1px solid rgba(255, 195, 160, 0.4)",
        background: "rgba(255, 255, 255, 0.85)",
        boxShadow: "0 10px 32px rgba(0, 0, 0, 0.06)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#2d3748" }}>
          {isStack ? "🔗 Create Atomic Habit Stack" : "✨ Create New Habit"}
        </h4>

        {/* Stack Toggle Button */}
        <button
          type="button"
          onClick={() => setIsStack(!isStack)}
          style={{
            padding: "4px 10px",
            borderRadius: 10,
            border: isStack ? "1.5px solid #f59e0b" : "1px solid rgba(139, 126, 116, 0.2)",
            background: isStack ? "rgba(245, 158, 11, 0.15)" : "transparent",
            color: isStack ? "#d97706" : "rgba(139, 126, 116, 0.7)",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4
          }}
        >
          <span>🔗</span>
          <span>{isStack ? "Atomic Stack Active" : "Chain to Existing Habit"}</span>
        </button>
      </div>

      {/* STACK ANCHOR SELECTOR (When Stack Mode is Active) */}
      {isStack && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 14,
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px dashed rgba(245, 158, 11, 0.4)",
            marginBottom: 14
          }}
        >
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#b45309", marginBottom: 6 }}>
            ⚓ THE ANCHOR (What automatic routine happens right before?):
          </label>
          <select
            value={anchorHabit}
            onChange={e => setAnchorHabit(e.target.value)}
            style={{
              width: "100%",
              background: "#ffffff",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: 10,
              padding: "8px 10px",
              color: "#5a4a42",
              fontSize: 12.5,
              outline: "none",
              marginBottom: anchorHabit === "custom" ? 8 : 0
            }}
          >
            <option value="">-- Choose Anchor Routine --</option>
            {anchorPresets.map((p, idx) => (
              <option key={idx} value={p}>{p}</option>
            ))}
            <option value="custom">✍️ Custom Anchor...</option>
          </select>

          {anchorHabit === "custom" && (
            <input
              placeholder="E.g., After I step onto the morning subway..."
              value={customAnchor}
              onChange={e => setCustomAnchor(e.target.value)}
              style={{
                width: "100%",
                background: "#ffffff",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: 10,
                padding: "8px 10px",
                color: "#5a4a42",
                fontSize: 12,
                outline: "none"
              }}
            />
          )}

          {/* Micro-Duration Picker */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 11, color: "#b45309", fontWeight: 600 }}>Micro-Commitment:</span>
            {["1 min", "2 min", "5 min", "10 min"].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setStackDuration(d)}
                style={{
                  padding: "3px 8px",
                  borderRadius: 8,
                  border: stackDuration === d ? "1.5px solid #d97706" : "1px solid rgba(245, 158, 11, 0.2)",
                  background: stackDuration === d ? "#fef3c7" : "transparent",
                  color: stackDuration === d ? "#b45309" : "#78350f",
                  fontSize: 10.5,
                  fontWeight: stackDuration === d ? 700 : 500,
                  cursor: "pointer"
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Habit Title Input */}
      <input
        autoFocus
        placeholder={isStack ? "I will... (e.g. Meditate for 2 minutes)" : "Habit title (e.g. Read 10 pages)..."}
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{
          width: "100%",
          background: "rgba(255, 255, 255, 0.7)",
          border: "1px solid rgba(255, 195, 160, 0.3)",
          borderRadius: 12,
          padding: "10px 14px",
          color: "#2d3748",
          fontSize: 14,
          fontWeight: 600,
          outline: "none",
          marginBottom: 12
        }}
      />

      {/* Schedule Selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select
          value={schedule}
          onChange={e => setSchedule(e.target.value)}
          style={{
            flex: 1,
            background: "rgba(255, 255, 255, 0.7)",
            border: "1px solid rgba(255, 195, 160, 0.3)",
            borderRadius: 10,
            padding: "8px 12px",
            color: "#5a4a42",
            fontSize: 12,
            outline: "none"
          }}
        >
          <option value="daily">Daily Habit</option>
          <option value="weekly">Weekly Target Goal</option>
        </select>
        {schedule === "weekly" && (
          <select
            value={goalPerWeek}
            onChange={e => setGoalPerWeek(e.target.value)}
            style={{
              flex: 1,
              background: "rgba(255, 255, 255, 0.7)",
              border: "1px solid rgba(255, 195, 160, 0.3)",
              borderRadius: 10,
              padding: "8px 12px",
              color: "#5a4a42",
              fontSize: 12,
              outline: "none"
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7].map(n => (
              <option key={n} value={n}>{n} times / week</option>
            ))}
          </select>
        )}
      </div>

      {/* Domain Category Selector */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.8)", fontWeight: 700, display: "block", marginBottom: 6 }}>
          Life Domain:
        </span>
        <div style={{ display: "flex", gap: 5, overflowX: "auto" }}>
          {Object.entries(LIFE_DOMAINS).map(([k, d]) => (
            <button
              key={k}
              type="button"
              onClick={() => setDomain(k)}
              style={{
                flex: "0 0 auto",
                padding: "4px 9px",
                borderRadius: 8,
                border: domain === k ? `2px solid ${d.color}` : "1px solid rgba(139, 126, 116, 0.2)",
                background: domain === k ? d.bg : "rgba(255, 255, 255, 0.6)",
                color: "#5a4a42",
                fontSize: 11,
                fontWeight: domain === k ? 700 : 500,
                cursor: "pointer"
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Accent Picker */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {colors.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              border: c === color ? "2px solid #2d3748" : "2px solid transparent",
              background: c,
              cursor: "pointer"
            }}
          />
        ))}
      </div>

      {/* Reminder Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(139, 126, 116, 0.8)", fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={e => setReminderEnabled(e.target.checked)}
          />
          Daily Reminder
        </label>
        <input
          type="time"
          value={reminderTime}
          onChange={e => {
            setReminderTime(e.target.value);
            if (e.target.value) setReminderEnabled(true);
          }}
          style={{
            flex: 1,
            background: "rgba(255, 255, 255, 0.6)",
            border: "1px solid rgba(255, 195, 160, 0.25)",
            borderRadius: 10,
            padding: "6px 10px",
            color: reminderTime ? "#5a4a42" : "rgba(139, 126, 116, 0.4)",
            fontSize: 12,
            outline: "none",
            colorScheme: "light"
          }}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={submit}
        style={{
          width: "100%",
          padding: "11px 0",
          borderRadius: 14,
          background: isStack ? "linear-gradient(135deg, #f59e0b, #fbbf24)" : "linear-gradient(135deg, #a8e6cf, #dcedc1)",
          border: "none",
          color: isStack ? "#ffffff" : "#2d6a4f",
          fontSize: 13.5,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: isStack ? "0 6px 18px rgba(245, 158, 11, 0.3)" : "0 6px 18px rgba(168, 230, 207, 0.35)"
        }}
      >
        {isStack ? "🔗 Save Atomic Stack" : "✨ Add Habit"}
      </button>
    </div>
  );
}
