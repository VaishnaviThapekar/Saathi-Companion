import { useState, useEffect, useRef } from "react";
import {
  startAmbientSound,
  stopAmbientSound,
  setAmbientVolume,
  playFocusCompleteChime,
  playChimeSound
} from "../../services/soundService";

const PRESETS = {
  pomodoro: { name: "Classic Pomodoro", work: 25, shortBreak: 5, longBreak: 15, icon: "🍅" },
  deepwork: { name: "Deep Work Sprint", work: 50, shortBreak: 10, longBreak: 20, icon: "⚡" },
  sprint: { name: "Power Sprint", work: 15, shortBreak: 3, longBreak: 10, icon: "🏃" },
  custom: { name: "Custom Timer", work: 30, shortBreak: 5, longBreak: 15, icon: "⚙️" },
};

const SOUNDSCAPES = [
  { id: "none", name: "Silence", icon: "🔇", desc: "No background audio" },
  { id: "alpha", name: "Alpha 10Hz", icon: "🧘", desc: "Effortless flow state" },
  { id: "beta", name: "Beta 18Hz", icon: "⚡", desc: "High alert problem solving" },
  { id: "rain", name: "Raindrops", icon: "🌧️", desc: "Soft soothing rainfall" },
  { id: "ocean", name: "Ocean Tides", icon: "🌊", desc: "Rhythmic calming waves" },
  { id: "lofi", name: "Warm Lo-Fi", icon: "☕", desc: "Cozy café drone" },
];

export default function PomodoroFocusTimer({
  tasks = [],
  setTasks,
  showToast,
  isOpen = false,
  onClose,
  accentColor = "coral",
  initialTaskId = ""
}) {
  const [preset, setPreset] = useState("pomodoro");
  const [mode, setMode] = useState("work"); // "work" | "shortBreak" | "longBreak"
  const [customWorkMin, setCustomWorkMin] = useState(25);
  const [customBreakMin, setCustomBreakMin] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId);
  const [soundscape, setSoundscape] = useState("none");
  const [soundVolume, setSoundVolume] = useState(0.35);
  const [cycleCount, setCycleCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [completedTaskPrompt, setCompletedTaskPrompt] = useState(null);

  useEffect(() => {
    if (initialTaskId) {
      setSelectedTaskId(initialTaskId);
    }
  }, [initialTaskId]);

  // Daily focus stats key
  const todayKey = new Date().toISOString().split("T")[0];
  const [todayFocusStats, setTodayFocusStats] = useState(() => {
    try {
      const saved = localStorage.getItem(`saathi_focus_stats_${todayKey}`);
      return saved ? JSON.parse(saved) : { minutes: 0, sessions: 0 };
    } catch (e) {
      return { minutes: 0, sessions: 0 };
    }
  });

  const timerRef = useRef(null);
  const handleTimerCompleteRef = useRef(null);

  // Total duration in seconds for progress computation
  const getTotalSeconds = () => {
    if (preset === "custom") {
      return mode === "work" ? customWorkMin * 60 : customBreakMin * 60;
    }
    const p = PRESETS[preset] || PRESETS.pomodoro;
    if (mode === "work") return p.work * 60;
    if (mode === "shortBreak") return p.shortBreak * 60;
    return p.longBreak * 60;
  };

  const totalSeconds = getTotalSeconds();

  // Reset timer on preset or mode change
  const applyPresetAndMode = (newPreset, newMode) => {
    setIsActive(false);
    stopAmbientSound();
    if (newPreset === "custom") {
      setTimeLeft((newMode === "work" ? customWorkMin : customBreakMin) * 60);
    } else {
      const p = PRESETS[newPreset] || PRESETS.pomodoro;
      if (newMode === "work") setTimeLeft(p.work * 60);
      else if (newMode === "shortBreak") setTimeLeft(p.shortBreak * 60);
      else setTimeLeft(p.longBreak * 60);
    }
  };

  const handleSelectPreset = (pKey) => {
    setPreset(pKey);
    applyPresetAndMode(pKey, mode);
  };

  const handleSelectMode = (newMode) => {
    setMode(newMode);
    applyPresetAndMode(preset, newMode);
  };

  // Soundscape management
  useEffect(() => {
    if (isActive && soundscape !== "none") {
      startAmbientSound(soundscape, soundVolume);
    } else {
      stopAmbientSound();
    }
  }, [isActive, soundscape, soundVolume]);

  // Timer Tick
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (handleTimerCompleteRef.current) handleTimerCompleteRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleTimerComplete = () => {
    setIsActive(false);
    stopAmbientSound();
    playFocusCompleteChime();

    if (mode === "work") {
      const sessionMinutes = Math.round(totalSeconds / 60);
      const updatedStats = {
        minutes: todayFocusStats.minutes + sessionMinutes,
        sessions: todayFocusStats.sessions + 1
      };
      setTodayFocusStats(updatedStats);
      try {
        localStorage.setItem(`saathi_focus_stats_${todayKey}`, JSON.stringify(updatedStats));
      } catch (e) {}

      const newCycle = cycleCount + 1;
      setCycleCount(newCycle);

      // Check linked task
      if (selectedTaskId) {
        const found = tasks.find(t => t.id === selectedTaskId);
        if (found) {
          setCompletedTaskPrompt(found);
        }
      }

      if (showToast) {
        showToast(`🎉 Focus session complete (+${sessionMinutes}m logged)! Time for a break.`);
      }

      // Next auto mode
      const nextMode = newCycle % 4 === 0 ? "longBreak" : "shortBreak";
      setMode(nextMode);
      applyPresetAndMode(preset, nextMode);
    } else {
      if (showToast) {
        showToast("✨ Break ended! Refreshed and ready to focus?");
      }
      setMode("work");
      applyPresetAndMode(preset, "work");
    }
  };

  handleTimerCompleteRef.current = handleTimerComplete;

  const handleTogglePlay = () => {
    if (!isActive) {
      playChimeSound(600, 0.2, 0.15);
      setIsActive(true);
    } else {
      setIsActive(false);
      stopAmbientSound();
    }
  };

  const handleReset = () => {
    setIsActive(false);
    stopAmbientSound();
    applyPresetAndMode(preset, mode);
  };

  const handleCompleteLinkedTask = () => {
    if (!completedTaskPrompt || !setTasks) return;
    setTasks(prev =>
      prev.map(t =>
        t.id === completedTaskPrompt.id
          ? { ...t, done: true, lastCompleted: new Date().toISOString() }
          : t
      )
    );
    if (showToast) showToast(`✓ Completed "${completedTaskPrompt.title}"!`);
    setCompletedTaskPrompt(null);
  };

  // Format MM:SS
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  // SVG circular progress calculation
  const radius = 105;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const linkedTask = tasks.find(t => t.id === selectedTaskId);

  // If minimized or timer active while modal is closed, render Floating Mini-Pill
  const showFloatingPill = (isActive || isMinimized) && (!isOpen || isMinimized);

  return (
    <>
      {/* FLOATING MINI PILL (Visible when running across all screens) */}
      {showFloatingPill && (
        <div
          style={{
            position: "fixed",
            bottom: 84,
            right: 18,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            background: "var(--glass-bg, rgba(20, 20, 25, 0.9))",
            backdropFilter: "blur(20px)",
            borderRadius: 30,
            border: "1.5px solid var(--glass-border, rgba(255, 255, 255, 0.3))",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25), var(--glow-shadow)",
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            cursor: "pointer"
          }}
          onClick={() => {
            setIsMinimized(false);
            if (onClose) onClose(false); // toggle/open
          }}
        >
          <span style={{ fontSize: 18, animation: isActive ? "spin 6s linear infinite" : "none" }}>
            {mode === "work" ? "🍅" : "☕"}
          </span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--card-text, #fff)", letterSpacing: "0.5px" }}>
                {timeFormatted}
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 8, background: "var(--accent-gradient)", color: "#fff", textTransform: "uppercase" }}>
                {mode === "work" ? "Focus" : "Break"}
              </span>
            </div>
            {linkedTask && (
              <p style={{ fontSize: 10, color: "var(--text-muted, rgba(255, 255, 255, 0.7))", margin: 0, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {linkedTask.title}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePlay();
            }}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--accent-gradient)",
              border: "none",
              color: "#fff",
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {isActive ? "⏸" : "▶"}
          </button>
        </div>
      )}

      {/* FULL FOCUS MODE MODAL */}
      {isOpen && !isMinimized && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(18px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            animation: "fadeIn 0.25s ease-out"
          }}
          onClick={() => {
            if (isActive) {
              setIsMinimized(true);
            } else if (onClose) {
              onClose();
            }
          }}
        >
          <div
            className="glass"
            style={{
              width: "100%",
              maxWidth: 440,
              maxHeight: "92vh",
              overflowY: "auto",
              borderRadius: 28,
              padding: "24px 22px",
              background: "var(--glass-bg)",
              border: "1.5px solid var(--glass-border)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.35)",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header & Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>🍅</span>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--card-text, #5a4a42)", margin: 0 }}>
                    Focus & Pomodoro Studio
                  </h3>
                  <p style={{ fontSize: 11, color: "var(--text-muted, rgba(139, 126, 116, 0.7))", margin: 0 }}>
                    Deep work timeboxing & soundscapes
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                {isActive && (
                  <button
                    onClick={() => setIsMinimized(true)}
                    title="Minimize to floating pill"
                    style={{
                      border: "none",
                      background: "rgba(0, 0, 0, 0.08)",
                      borderRadius: 10,
                      padding: "6px 10px",
                      fontSize: 12,
                      cursor: "pointer",
                      color: "var(--card-text, #5a4a42)",
                      fontWeight: 700
                    }}
                  >
                    🗗 Minimize
                  </button>
                )}
                <button
                  onClick={() => {
                    if (isActive) stopAmbientSound();
                    if (onClose) onClose();
                  }}
                  style={{
                    border: "none",
                    background: "rgba(0, 0, 0, 0.08)",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                    cursor: "pointer",
                    color: "var(--card-text, #5a4a42)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* PRESET CHIPS */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
              {Object.entries(PRESETS).map(([key, p]) => {
                const active = preset === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectPreset(key)}
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      borderRadius: 12,
                      background: active ? "var(--accent-gradient)" : "rgba(0, 0, 0, 0.05)",
                      border: active ? "1.5px solid #fff" : "1px solid var(--glass-border)",
                      color: active ? "#fff" : "var(--card-text, #5a4a42)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {p.icon} {p.name.split(" ")[0]} ({p.work}m)
                  </button>
                );
              })}
            </div>

            {/* CUSTOM TIME INTERVAL STEPPER */}
            {preset === "custom" && !isActive && (
              <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", marginBottom: 14, padding: "8px 12px", borderRadius: 12, background: "rgba(0, 0, 0, 0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--card-text, #5a4a42)" }}>Focus:</span>
                  <button onClick={() => { const val = Math.max(5, customWorkMin - 5); setCustomWorkMin(val); if (mode === "work") setTimeLeft(val * 60); }} style={{ padding: "2px 8px", borderRadius: 6, border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.06)", cursor: "pointer", fontWeight: 700 }}>-</button>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--card-text, #5a4a42)" }}>{customWorkMin}m</span>
                  <button onClick={() => { const val = Math.min(120, customWorkMin + 5); setCustomWorkMin(val); if (mode === "work") setTimeLeft(val * 60); }} style={{ padding: "2px 8px", borderRadius: 6, border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.06)", cursor: "pointer", fontWeight: 700 }}>+</button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--card-text, #5a4a42)" }}>Break:</span>
                  <button onClick={() => { const val = Math.max(1, customBreakMin - 1); setCustomBreakMin(val); if (mode !== "work") setTimeLeft(val * 60); }} style={{ padding: "2px 8px", borderRadius: 6, border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.06)", cursor: "pointer", fontWeight: 700 }}>-</button>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--card-text, #5a4a42)" }}>{customBreakMin}m</span>
                  <button onClick={() => { const val = Math.min(60, customBreakMin + 1); setCustomBreakMin(val); if (mode !== "work") setTimeLeft(val * 60); }} style={{ padding: "2px 8px", borderRadius: 6, border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.06)", cursor: "pointer", fontWeight: 700 }}>+</button>
                </div>
              </div>
            )}

            {/* MODE SELECTOR (Work / Short Break / Long Break) */}
            <div style={{ display: "flex", background: "rgba(0, 0, 0, 0.06)", borderRadius: 14, padding: 3, marginBottom: 20 }}>
              {[
                { id: "work", label: "Focus Work", icon: "🎯" },
                { id: "shortBreak", label: "Short Break", icon: "☕" },
                { id: "longBreak", label: "Long Break", icon: "🌿" }
              ].map(m => {
                const isCurrent = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMode(m.id)}
                    style={{
                      flex: 1,
                      padding: "7px 4px",
                      borderRadius: 11,
                      background: isCurrent ? "var(--accent-gradient)" : "transparent",
                      border: "none",
                      color: isCurrent ? "#fff" : "var(--card-text, #5a4a42)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {m.icon} {m.label}
                  </button>
                );
              })}
            </div>

            {/* CIRCULAR SVG PROGRESS TIMER */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", margin: "10px 0 20px" }}>
              <svg width="240" height="240" style={{ transform: "rotate(-90deg)" }}>
                {/* Track circle */}
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  stroke="rgba(0, 0, 0, 0.08)"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Progress bar */}
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  stroke="var(--accent-primary, #ff9a76)"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{
                    transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease",
                    filter: "drop-shadow(0 0 8px var(--accent-primary, #ff9a76))"
                  }}
                />
              </svg>

              {/* Center Content */}
              <div
                style={{
                  position: "absolute",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center"
                }}
              >
                <span style={{ fontSize: 44, fontWeight: 900, color: "var(--card-text, #5a4a42)", fontFamily: "monospace", letterSpacing: "1px" }}>
                  {timeFormatted}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-primary, #ff9a76)", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {mode === "work" ? "🎯 Focus Session" : "☕ Recharge Rest"}
                </span>
                {cycleCount > 0 && (
                  <span style={{ fontSize: 10, color: "var(--text-muted, rgba(139, 126, 116, 0.7))", marginTop: 4 }}>
                    Cycle {cycleCount} Completed
                  </span>
                )}
              </div>
            </div>

            {/* ACTION CONTROLS */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
              <button
                onClick={handleReset}
                title="Reset timer"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(0, 0, 0, 0.06)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--card-text, #5a4a42)",
                  fontSize: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ↺
              </button>

              <button
                onClick={handleTogglePlay}
                style={{
                  padding: "14px 36px",
                  borderRadius: 30,
                  background: "var(--accent-gradient)",
                  border: "none",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "var(--glow-shadow)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transform: "scale(1.05)"
                }}
              >
                <span>{isActive ? "⏸ Pause" : "▶ Start Focus"}</span>
              </button>

              <button
                onClick={handleTimerComplete}
                title="Skip to next session"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(0, 0, 0, 0.06)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--card-text, #5a4a42)",
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ⏭
              </button>
            </div>

            {/* LINKED TASK SECTION */}
            <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 14, background: "rgba(0, 0, 0, 0.03)", border: "1px solid var(--glass-border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--card-text, #5a4a42)" }}>
                  🎯 Linked Focus Task
                </span>
                {selectedTaskId && (
                  <button
                    onClick={() => setSelectedTaskId("")}
                    style={{ border: "none", background: "transparent", color: "var(--text-muted)", fontSize: 11, cursor: "pointer" }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--input-border, rgba(0, 0, 0, 0.15))",
                  background: "var(--input-bg, #fff)",
                  color: "var(--card-text, #5a4a42)",
                  fontSize: 13,
                  fontWeight: 600,
                  outline: "none"
                }}
              >
                <option value="">-- Select a task to focus on --</option>
                {tasks.filter(t => !t.done).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* FOCUS SOUNDSCAPES & BINAURAL BEATS */}
            <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 14, background: "rgba(0, 0, 0, 0.03)", border: "1px solid var(--glass-border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--card-text, #5a4a42)" }}>
                    🎧 Focus Soundscape & Binaural Beats
                  </span>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "1px 0 0 0" }}>
                    Synthesized real-time audio (Zero internet required)
                  </p>
                </div>
                {soundscape !== "none" && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-primary)" }}>
                    Active
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 8 }}>
                {SOUNDSCAPES.map(s => {
                  const isSelected = soundscape === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSoundscape(s.id)}
                      title={s.desc}
                      style={{
                        padding: "6px 4px",
                        borderRadius: 10,
                        background: isSelected ? "var(--accent-gradient)" : "rgba(0, 0, 0, 0.04)",
                        border: isSelected ? "1.5px solid #fff" : "1px solid transparent",
                        color: isSelected ? "#fff" : "var(--card-text, #5a4a42)",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                        transition: "all 0.2s ease"
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{s.icon}</span>
                      <span style={{ fontSize: 10 }}>{s.name}</span>
                    </button>
                  );
                })}
              </div>

              {soundscape !== "none" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: 12 }}>🔊</span>
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setSoundVolume(v);
                      setAmbientVolume(v);
                    }}
                    style={{ flex: 1, accentColor: "var(--accent-primary, #ff9a76)" }}
                  />
                  <span style={{ fontSize: 10, color: "var(--text-muted)", width: 28 }}>
                    {Math.round(soundVolume * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* TODAY'S FOCUS STATS SUMMARY */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "10px 14px", borderRadius: 14, background: "var(--accent-gradient)", color: "#fff" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px", margin: 0, opacity: 0.9 }}>Today's Focus</p>
                <p style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>{todayFocusStats.minutes} mins</p>
              </div>
              <div style={{ width: 1, height: 28, background: "rgba(255, 255, 255, 0.3)" }}></div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px", margin: 0, opacity: 0.9 }}>Sessions Done</p>
                <p style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>{todayFocusStats.sessions} 🍅</p>
              </div>
            </div>

            {/* TASK COMPLETION PROMPT POPUP */}
            {completedTaskPrompt && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 14,
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1.5px solid #10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8
                }}
              >
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#10b981", margin: 0 }}>
                    🎯 Session Finished!
                  </p>
                  <p style={{ fontSize: 11, color: "var(--card-text, #5a4a42)", margin: "2px 0 0 0" }}>
                    Mark "<strong>{completedTaskPrompt.title}</strong>" completed?
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={handleCompleteLinkedTask}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 10,
                      background: "#10b981",
                      border: "none",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    ✓ Yes, Done
                  </button>
                  <button
                    onClick={() => setCompletedTaskPrompt(null)}
                    style={{
                      padding: "6px 8px",
                      borderRadius: 10,
                      background: "transparent",
                      border: "1px solid rgba(0, 0, 0, 0.15)",
                      color: "var(--card-text, #5a4a42)",
                      fontSize: 11,
                      cursor: "pointer"
                    }}
                  >
                    Later
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Compact Quick Focus Launcher Card (for HomeScreen or TasksScreen)
export function QuickFocusLauncherCard({ onOpenFocus, todayStats }) {
  const todayKey = new Date().toISOString().split("T")[0];
  let stats = todayStats;
  if (!stats) {
    try {
      const saved = localStorage.getItem(`saathi_focus_stats_${todayKey}`);
      stats = saved ? JSON.parse(saved) : { minutes: 0, sessions: 0 };
    } catch (e) {
      stats = { minutes: 0, sessions: 0 };
    }
  }

  return (
    <div
      className="glass"
      style={{
        borderRadius: 20,
        padding: "16px 18px",
        margin: "0 20px 24px",
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        boxShadow: "var(--glass-shadow)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        cursor: "pointer"
      }}
      onClick={onOpenFocus}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "var(--accent-gradient)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            boxShadow: "var(--glow-shadow)"
          }}
        >
          🍅
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: "var(--card-text, #5a4a42)", margin: 0 }}>
              Pomodoro Focus Studio
            </h4>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 8, background: "rgba(0,0,0,0.06)", color: "var(--accent-primary)" }}>
              Alpha Beats
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted, rgba(139, 126, 116, 0.7))", margin: "2px 0 0 0" }}>
            {stats.minutes > 0 ? `${stats.minutes} mins focused today (${stats.sessions} sessions)` : "Start a 25-min deep focus session"}
          </p>
        </div>
      </div>

      <button
        style={{
          padding: "8px 14px",
          borderRadius: 12,
          background: "var(--accent-gradient)",
          border: "none",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "var(--glow-shadow)",
          whiteSpace: "nowrap"
        }}
      >
        Focus ▶
      </button>
    </div>
  );
}
