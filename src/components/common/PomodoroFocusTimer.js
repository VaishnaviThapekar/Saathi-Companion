import { useState, useEffect, useRef } from "react";
import {
  playFocusCompleteChime,
  playChimeSound,
  startDualFocusAudio,
  stopDualFocusAudio,
  setDualFocusVolumes
} from "../../services/soundService";

const PRESETS = {
  pomodoro: { name: "Classic Pomodoro", work: 25, shortBreak: 5, longBreak: 15, icon: "🍅" },
  deepwork: { name: "Deep Work Sprint", work: 50, shortBreak: 10, longBreak: 20, icon: "⚡" },
  sprint: { name: "Power Sprint", work: 15, shortBreak: 3, longBreak: 10, icon: "🏃" },
  custom: { name: "Custom Timer", work: 30, shortBreak: 5, longBreak: 15, icon: "⚙️" },
};

const DUAL_SOUND_PRESETS = [
  { id: "alpha_rain", name: "Deep Flow", icon: "🧘🌧️", neural: "alpha", ambient: "rain", desc: "10Hz Alpha + Gentle Rainfall" },
  { id: "beta_lofi", name: "High Alert", icon: "⚡☕", neural: "beta", ambient: "lofi", desc: "18Hz Beta + Cozy Lo-Fi Drone" },
  { id: "theta_ocean", name: "Creative Tide", icon: "🌊✨", neural: "theta", ambient: "ocean", desc: "6Hz Theta + Rhythmic Ocean Waves" },
  { id: "pure_rain", name: "Pure Rain", icon: "🌧️", neural: "none", ambient: "rain", desc: "Filtered soothing rainfall" },
  { id: "pure_alpha", name: "Pure Alpha", icon: "🧠", neural: "alpha", ambient: "none", desc: "10Hz Pure binaural wave" },
  { id: "silence", name: "Silence", icon: "🔇", neural: "none", ambient: "none", desc: "Zero background sound" }
];

const NEURAL_LAYERS = [
  { id: "none", name: "None", icon: "🔇", desc: "No neural frequency" },
  { id: "alpha", name: "Alpha 10Hz", icon: "🧘", desc: "Effortless flow state" },
  { id: "beta", name: "Beta 18Hz", icon: "⚡", desc: "High alert problem-solving" },
  { id: "theta", name: "Theta 6Hz", icon: "✨", desc: "Creative intuition & calm" }
];

const AMBIENT_LAYERS = [
  { id: "none", name: "None", icon: "🔇", desc: "No ambient noise" },
  { id: "rain", name: "Raindrops", icon: "🌧️", desc: "Soft soothing rainfall" },
  { id: "ocean", name: "Ocean Tides", icon: "🌊", desc: "Rhythmic coastal waves" },
  { id: "lofi", name: "Warm Lo-Fi", icon: "☕", desc: "Cozy acoustic coffeehouse" },
  { id: "pink", name: "Pink Noise", icon: "💨", desc: "Even soothing sound blanket" }
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

  // Dual-Layer Soundscape Mixer state
  const [activeSoundPreset, setActiveSoundPreset] = useState("alpha_rain");
  const [neuralType, setNeuralType] = useState("alpha");
  const [ambientType, setAmbientType] = useState("rain");
  const [neuralVolume, setNeuralVolume] = useState(0.4);
  const [ambientVolume, setAmbientVolume] = useState(0.45);
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [mixerTab, setMixerTab] = useState("presets"); // "presets" | "mixer"

  // Thought Parking Lot state
  const [parkedThoughts, setParkedThoughts] = useState([]);
  const [thoughtInput, setThoughtInput] = useState("");
  const [showParkingLot, setShowParkingLot] = useState(false);

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
    stopDualFocusAudio();
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

  // Dual-Layer Soundscape management
  useEffect(() => {
    if (isActive && (neuralType !== "none" || ambientType !== "none")) {
      startDualFocusAudio({
        neuralType,
        ambientType,
        neuralVolume,
        ambientVolume,
        masterVolume: soundVolume
      });
    } else {
      stopDualFocusAudio();
    }
  }, [isActive, neuralType, ambientType, neuralVolume, ambientVolume, soundVolume]);

  useEffect(() => {
    return () => {
      stopDualFocusAudio();
    };
  }, []);

  const handleUpdateVolumes = (newNeuralVol, newAmbientVol, newMasterVol) => {
    if (newNeuralVol !== undefined) setNeuralVolume(newNeuralVol);
    if (newAmbientVol !== undefined) setAmbientVolume(newAmbientVol);
    if (newMasterVol !== undefined) setSoundVolume(newMasterVol);
    setDualFocusVolumes({
      neuralVolume: newNeuralVol !== undefined ? newNeuralVol : neuralVolume,
      ambientVolume: newAmbientVol !== undefined ? newAmbientVol : ambientVolume,
      masterVolume: newMasterVol !== undefined ? newMasterVol : soundVolume
    });
  };

  const handleSelectSoundPreset = (presetObj) => {
    setActiveSoundPreset(presetObj.id);
    setNeuralType(presetObj.neural);
    setAmbientType(presetObj.ambient);
  };

  // Thought Parking Lot handlers
  const handleParkThought = (e) => {
    if (e) e.preventDefault();
    if (!thoughtInput.trim()) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newThought = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      text: thoughtInput.trim(),
      time: nowTime,
      converted: false
    };
    setParkedThoughts(prev => [newThought, ...prev]);
    setThoughtInput("");
    playChimeSound(660, 0.25, 0.2);
    if (showToast) showToast("Thought parked! Mind cleared. 🧠✨");
  };

  const handleConvertThoughtToTask = (thought) => {
    if (setTasks) {
      setTasks(prev => [
        ...prev,
        {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2),
          title: thought.text,
          done: false,
          createdAt: new Date().toISOString()
        }
      ]);
      setParkedThoughts(prev =>
        prev.map(t => t.id === thought.id ? { ...t, converted: true } : t)
      );
      playChimeSound(528, 0.4, 0.2);
      if (showToast) showToast(`Added "${thought.text.slice(0, 30)}..." to Tasks! 🎯`);
    }
  };

  const handleDeleteParkedThought = (id) => {
    setParkedThoughts(prev => prev.filter(t => t.id !== id));
  };


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
    stopDualFocusAudio();
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
      stopDualFocusAudio();
    }
  };

  const handleReset = () => {
    setIsActive(false);
    stopDualFocusAudio();
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
                    if (isActive) stopDualFocusAudio();
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

            {/* THOUGHT PARKING LOT (DISTRACTION BLOCKER) */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 14,
                  background: showParkingLot ? "rgba(99, 102, 241, 0.12)" : "rgba(0, 0, 0, 0.04)",
                  border: showParkingLot ? "1.5px solid rgba(99, 102, 241, 0.3)" : "1px solid var(--glass-border)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onClick={() => setShowParkingLot(prev => !prev)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🧠</span>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--card-text, #5a4a42)" }}>
                      Thought Parking Lot
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 6 }}>
                      {parkedThoughts.length > 0 ? `${parkedThoughts.length} parked` : "Park intrusive thoughts"}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {parkedThoughts.length > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "2px 7px",
                        borderRadius: 10,
                        background: "rgba(99, 102, 241, 0.2)",
                        color: "#6366f1"
                      }}
                    >
                      {parkedThoughts.length}
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {showParkingLot ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {showParkingLot && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "12px",
                    borderRadius: 14,
                    background: "rgba(0, 0, 0, 0.03)",
                    border: "1px solid var(--glass-border)",
                    animation: "fadeIn 0.2s ease-out"
                  }}
                >
                  <form onSubmit={handleParkThought} style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <input
                      type="text"
                      placeholder="Got distracted? Park thought here..."
                      value={thoughtInput}
                      onChange={(e) => setThoughtInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid var(--input-border, rgba(0,0,0,0.15))",
                        background: "var(--input-bg, #fff)",
                        color: "var(--card-text, #5a4a42)",
                        fontSize: 12,
                        outline: "none"
                      }}
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!thoughtInput.trim()}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        background: thoughtInput.trim() ? "var(--accent-gradient)" : "rgba(0, 0, 0, 0.1)",
                        color: "#fff",
                        border: "none",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: thoughtInput.trim() ? "pointer" : "default"
                      }}
                    >
                      + Park
                    </button>
                  </form>

                  {parkedThoughts.length === 0 ? (
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0 2px", fontStyle: "italic" }}>
                      Clear your mind in 2 seconds and resume flow. Review later or convert to tasks!
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 130, overflowY: "auto", paddingRight: 4 }}>
                      {parkedThoughts.map(t => (
                        <div
                          key={t.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            padding: "6px 10px",
                            borderRadius: 8,
                            background: t.converted ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 255, 255, 0.6)",
                            border: t.converted ? "1px solid #10b981" : "1px solid rgba(0,0,0,0.06)",
                            fontSize: 11
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, overflow: "hidden" }}>
                            <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "monospace" }}>{t.time}</span>
                            <span style={{ textDecoration: t.converted ? "line-through" : "none", color: "var(--card-text, #5a4a42)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {t.text}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {!t.converted && setTasks && (
                              <button
                                type="button"
                                onClick={() => handleConvertThoughtToTask(t)}
                                title="Convert to Task"
                                style={{
                                  padding: "2px 6px",
                                  borderRadius: 6,
                                  background: "rgba(99, 102, 241, 0.15)",
                                  border: "none",
                                  color: "#6366f1",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  cursor: "pointer"
                                }}
                              >
                                🎯 Task
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteParkedThought(t.id)}
                              title="Dismiss"
                              style={{
                                border: "none",
                                background: "transparent",
                                color: "var(--text-muted)",
                                fontSize: 11,
                                cursor: "pointer",
                                padding: "2px 4px"
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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

            {/* FOCUS STUDIO DUAL-LAYER SOUND MIXER (Neural Waves + Atmosphere) */}
            <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 14, background: "rgba(0, 0, 0, 0.03)", border: "1px solid var(--glass-border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--card-text, #5a4a42)" }}>
                    🎧 Dual-Layer Focus Audio Studio
                  </span>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "1px 0 0 0" }}>
                    Mix Neural Frequency + Soundscape simultaneously (Zero asset offline Web Audio)
                  </p>
                </div>
                {(neuralType !== "none" || ambientType !== "none") && (
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 10, background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                    Active
                  </span>
                )}
              </div>

              {/* TABS: 1-Click Presets vs Custom Mixer */}
              <div style={{ display: "flex", background: "rgba(0, 0, 0, 0.05)", borderRadius: 10, padding: 2, marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => setMixerTab("presets")}
                  style={{
                    flex: 1,
                    padding: "5px 8px",
                    borderRadius: 8,
                    border: "none",
                    background: mixerTab === "presets" ? "var(--accent-gradient)" : "transparent",
                    color: mixerTab === "presets" ? "#fff" : "var(--card-text, #5a4a42)",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  ⚡ Dual Presets
                </button>
                <button
                  type="button"
                  onClick={() => setMixerTab("mixer")}
                  style={{
                    flex: 1,
                    padding: "5px 8px",
                    borderRadius: 8,
                    border: "none",
                    background: mixerTab === "mixer" ? "var(--accent-gradient)" : "transparent",
                    color: mixerTab === "mixer" ? "#fff" : "var(--card-text, #5a4a42)",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  🎛️ Custom Sound Mixer
                </button>
              </div>

              {mixerTab === "presets" ? (
                /* 1-Click Dual Presets Grid */
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 8 }}>
                  {DUAL_SOUND_PRESETS.map(p => {
                    const isSelected = activeSoundPreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectSoundPreset(p)}
                        title={p.desc}
                        style={{
                          padding: "8px 4px",
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
                          gap: 3,
                          transition: "all 0.2s ease"
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{p.icon}</span>
                        <span style={{ fontSize: 10, whiteSpace: "nowrap" }}>{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Custom Dual-Layer Controls */
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 }}>
                  {/* Layer 1: Neural Wave Selector */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--card-text, #5a4a42)", textTransform: "uppercase" }}>
                        Layer 1: Neural Frequency
                      </span>
                      {neuralType !== "none" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10 }}>🔊</span>
                          <input
                            type="range"
                            min="0.05"
                            max="1"
                            step="0.05"
                            value={neuralVolume}
                            onChange={(e) => handleUpdateVolumes(parseFloat(e.target.value), undefined, undefined)}
                            style={{ width: 60, accentColor: "var(--accent-primary, #ff9a76)" }}
                          />
                        </div>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
                      {NEURAL_LAYERS.map(n => {
                        const isSelected = neuralType === n.id;
                        return (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              setNeuralType(n.id);
                              setActiveSoundPreset("custom");
                            }}
                            title={n.desc}
                            style={{
                              padding: "5px 2px",
                              borderRadius: 8,
                              background: isSelected ? "var(--accent-gradient)" : "rgba(0,0,0,0.04)",
                              border: isSelected ? "1.5px solid #fff" : "1px solid transparent",
                              color: isSelected ? "#fff" : "var(--card-text, #5a4a42)",
                              fontSize: 10,
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            <div>{n.icon}</div>
                            <div style={{ fontSize: 9 }}>{n.name.split(" ")[0]}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Layer 2: Atmosphere Selector */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--card-text, #5a4a42)", textTransform: "uppercase" }}>
                        Layer 2: Atmosphere Soundscape
                      </span>
                      {ambientType !== "none" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10 }}>🌧️</span>
                          <input
                            type="range"
                            min="0.05"
                            max="1"
                            step="0.05"
                            value={ambientVolume}
                            onChange={(e) => handleUpdateVolumes(undefined, parseFloat(e.target.value), undefined)}
                            style={{ width: 60, accentColor: "var(--accent-primary, #ff9a76)" }}
                          />
                        </div>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
                      {AMBIENT_LAYERS.map(a => {
                        const isSelected = ambientType === a.id;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                              setAmbientType(a.id);
                              setActiveSoundPreset("custom");
                            }}
                            title={a.desc}
                            style={{
                              padding: "5px 2px",
                              borderRadius: 8,
                              background: isSelected ? "var(--accent-gradient)" : "rgba(0,0,0,0.04)",
                              border: isSelected ? "1.5px solid #fff" : "1px solid transparent",
                              color: isSelected ? "#fff" : "var(--card-text, #5a4a42)",
                              fontSize: 10,
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            <div>{a.icon}</div>
                            <div style={{ fontSize: 9 }}>{a.name.split(" ")[0]}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Master Volume Slider */}
              {(neuralType !== "none" || ambientType !== "none") && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, paddingTop: 6, borderTop: "1px dashed rgba(0,0,0,0.08)" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--card-text, #5a4a42)" }}>Master Volume:</span>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => handleUpdateVolumes(undefined, undefined, parseFloat(e.target.value))}
                    style={{ flex: 1, accentColor: "var(--accent-primary, #ff9a76)" }}
                  />
                  <span style={{ fontSize: 10, color: "var(--text-muted)", width: 28, textAlign: "right" }}>
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

            {/* PARKED THOUGHTS REVIEW (Post-Session Review & 1-Click Task Conversion) */}
            {parkedThoughts.some(t => !t.converted) && (
              <div
                style={{
                  marginTop: 14,
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "rgba(99, 102, 241, 0.1)",
                  border: "1.5px solid rgba(99, 102, 241, 0.3)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#6366f1" }}>
                    🧠 Parked Thoughts ({parkedThoughts.filter(t => !t.converted).length} Unsaved)
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    Convert to next actions
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 110, overflowY: "auto" }}>
                  {parkedThoughts.filter(t => !t.converted).map(t => (
                    <div
                      key={t.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 8px",
                        borderRadius: 8,
                        background: "rgba(255, 255, 255, 0.7)",
                        fontSize: 11
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 8, color: "var(--card-text, #5a4a42)" }}>
                        {t.text}
                      </span>
                      <div style={{ display: "flex", gap: 4 }}>
                        {setTasks && (
                          <button
                            type="button"
                            onClick={() => handleConvertThoughtToTask(t)}
                            style={{
                              padding: "3px 8px",
                              borderRadius: 6,
                              background: "var(--accent-gradient)",
                              border: "none",
                              color: "#fff",
                              fontSize: 10,
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            + To Task
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteParkedThought(t.id)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "var(--text-muted)",
                            fontSize: 11,
                            cursor: "pointer"
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
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
