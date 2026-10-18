import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  playBreathInTone,
  playBreathInTopUpTone,
  playBreathHoldTone,
  playBreathOutTone,
  playBreathCompleteCelebration,
  triggerHapticPulse,
  isSoundEnabled
} from "../../services/soundService";

// ═══════════════════════════════════════════════════════════════════════
// SOMATIC BREATHWORK PATTERNS & PROTOCOLS
// ═══════════════════════════════════════════════════════════════════════

export const BREATH_PATTERNS = [
  {
    id: "sigh",
    name: "Physiological Sigh",
    subtitle: "Fastest neurobiological stress de-escalator (Huberman Protocol)",
    category: "Rapid Nervous System Reset",
    icon: "🌊",
    color: "#06b6d4",
    bgGradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
    glowColor: "rgba(6, 182, 212, 0.45)",
    phases: [
      { key: "in1", label: "Inhale Deeply", duration: 3.0, instruction: "Breathe in deeply through your nose, expanding your belly and ribs..." },
      { key: "in2", label: "Top-Up Sip", duration: 1.2, instruction: "Quick extra sip of air at the top to fully pop open lung alveoli!" },
      { key: "out", label: "Long Sigh Out", duration: 6.0, instruction: "Slow, releasing sigh out through your mouth like blowing a gentle candle..." },
      { key: "rest", label: "Stillness & Ease", duration: 1.8, instruction: "Rest in natural stillness. Notice your heart rate gently slowing down..." }
    ],
    science: "Stanford Neurobiology research demonstrates that the two-inhale physiological sigh is the fastest real-time tool to trigger the parasympathetic brake on heart rate.",
    affirmation: "My nervous system is naturally designed to restore calm and safety."
  },
  {
    id: "box",
    name: "4-4-4-4 Navy SEAL Box",
    subtitle: "Mental clarity, emotional poise & executive stress resistance",
    category: "Focus & Poise",
    icon: "📦",
    color: "#3b82f6",
    bgGradient: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
    glowColor: "rgba(59, 130, 246, 0.45)",
    phases: [
      { key: "in", label: "Breathe In", duration: 4.0, instruction: "Breathe in smooth and steady through your nose..." },
      { key: "hold", label: "Hold Full", duration: 4.0, instruction: "Hold full lungs gently without straining, softening your jaw and shoulders..." },
      { key: "out", label: "Breathe Out", duration: 4.0, instruction: "Exhale with smooth control through your nose or lips..." },
      { key: "hold2", label: "Hold Empty", duration: 4.0, instruction: "Hold empty in serene quiet. You are grounded, focused, and in control..." }
    ],
    science: "Equalizing the four quadrants of the breath cycle stabilizes sympathetic tone and sharpens executive focus under high pressure.",
    affirmation: "I meet every challenge from a place of deep, unshakeable poise."
  },
  {
    id: "relax",
    name: "4-7-8 Vagal Sleep Reset",
    subtitle: "Natural tranquilizer for evening calm & deep nervous release",
    category: "Deep Sleep & Anxiety Relief",
    icon: "🌙",
    color: "#8b5cf6",
    bgGradient: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
    glowColor: "rgba(139, 92, 246, 0.45)",
    phases: [
      { key: "in", label: "Quiet Inhale", duration: 4.0, instruction: "Inhale quietly through your nose to a count of four..." },
      { key: "hold", label: "Sacred Hold", duration: 7.0, instruction: "Hold your breath gently. Allow the oxygen to saturate every cell..." },
      { key: "out", label: "Whoosh Exhale", duration: 8.0, instruction: "Whoosh exhale completely through your mouth, releasing all physical fatigue..." },
      { key: "rest", label: "Natural Pause", duration: 1.0, instruction: "Soften into stillness before the next cycle begins..." }
    ],
    science: "Dr. Andrew Weil's 4-7-8 ratio significantly increases vagal nerve stimulation and carbon dioxide tolerance, preparing the body for deep rest.",
    affirmation: "I release the day with gratitude. My body and mind deserve restful peace."
  },
  {
    id: "coherent",
    name: "Coherent Resonant (0.1 Hz)",
    subtitle: "5.5s in, 5.5s out for peak cardiovascular & emotional coherence",
    category: "Heart Rate Variability (HRV)",
    icon: "💓",
    color: "#ec4899",
    bgGradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
    glowColor: "rgba(236, 72, 153, 0.45)",
    phases: [
      { key: "in", label: "Heart Inhale", duration: 5.5, instruction: "Breathe in smoothly into the center of your heart, feeling gentle warmth..." },
      { key: "out", label: "Heart Exhale", duration: 5.5, instruction: "Breathe out compassion and ease, radiating calm throughout your body..." }
    ],
    science: "Rhythmic breathing at 5.5 breaths per minute entrains respiratory sinus arrhythmia with baroreflex oscillations, maximizing HRV.",
    affirmation: "My heart and mind beat in harmonious resonance."
  },
  {
    id: "calm",
    name: "4-4-6 Everyday Serenity",
    subtitle: "Gentle soothing cadence for tension release throughout the day",
    category: "Daily Balance",
    icon: "🌿",
    color: "#10b981",
    bgGradient: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    glowColor: "rgba(16, 185, 129, 0.45)",
    phases: [
      { key: "in", label: "Smooth Inhale", duration: 4.0, instruction: "Draw in clean, fresh breath through your nostrils..." },
      { key: "hold", label: "Peaceful Pause", duration: 4.0, instruction: "Rest at the peak of your breath, enjoying the stillness..." },
      { key: "out", label: "Extended Release", duration: 6.0, instruction: "Let go with an extended, effortless exhale..." }
    ],
    science: "Extending the exhalation phase relative to inhalation activates parasympathetic acetylcholine release, gently lowering blood pressure.",
    affirmation: "With every breath I let go of what I cannot control."
  },
  {
    id: "energize",
    name: "3-3-3 Awakening Breath",
    subtitle: "Quick invigorating oxygen boost for morning or afternoon slump",
    category: "Alertness & Energy",
    icon: "⚡",
    color: "#f59e0b",
    bgGradient: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
    glowColor: "rgba(245, 158, 11, 0.45)",
    phases: [
      { key: "in", label: "Invigorating Inhale", duration: 3.0, instruction: "Deep energetic breath in, waking up your alertness..." },
      { key: "hold", label: "Bright Hold", duration: 3.0, instruction: "Hold the vibrant oxygen in your chest..." },
      { key: "out", label: "Crisp Exhale", duration: 3.0, instruction: "Exhale cleanly, clearing mental brain fog..." }
    ],
    science: "Brief rhythmic breath sprints increase cerebral oxygen delivery and mental clarity without causing sympathetic overload.",
    affirmation: "I am alert, energized, and ready for what lies ahead."
  }
];

// Helper to retrieve breathing history stats
export const getBreathingStats = () => {
  try {
    const raw = localStorage.getItem("saathi_breath_stats");
    if (!raw) {
      return { totalSessions: 0, totalMinutes: 0, totalCycles: 0, lastDate: null, streakDays: 0 };
    }
    return JSON.parse(raw);
  } catch {
    return { totalSessions: 0, totalMinutes: 0, totalCycles: 0, lastDate: null, streakDays: 0 };
  }
};

const recordCompletedBreathingSession = (patternId, durationSeconds, cyclesCount) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const prev = getBreathingStats();
    const prevLastDate = prev.lastDate;

    let newStreak = prev.streakDays || 0;
    if (prevLastDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yestStr = yesterday.toISOString().split("T")[0];
      newStreak = prevLastDate === yestStr ? newStreak + 1 : 1;
    }

    const updated = {
      totalSessions: (prev.totalSessions || 0) + 1,
      totalMinutes: Math.round(((prev.totalMinutes || 0) + (durationSeconds / 60)) * 10) / 10,
      totalCycles: (prev.totalCycles || 0) + cyclesCount,
      lastDate: todayStr,
      streakDays: newStreak,
      lastPattern: patternId
    };
    localStorage.setItem("saathi_breath_stats", JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════════════════
// BREATHING STUDIO COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function BreathingStudio({
  initialPatternId = "sigh",
  onClose,
  isModal = false,
  onSaveToNotes,
  showToast
}) {
  const [selectedPatternId, setSelectedPatternId] = useState(initialPatternId);
  const [sessionState, setSessionState] = useState("idle"); // 'idle' | 'active' | 'paused' | 'completed'
  const [targetCycles, setTargetCycles] = useState(5); // 3, 5, 8, 12, or continuous (999)
  const [completedCycles, setCompletedCycles] = useState(0);

  // Phase tracking
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0); // in seconds (float)
  const [sessionTotalSeconds, setSessionTotalSeconds] = useState(0);

  // Audio & Haptics preferences
  const [soundGuided, setSoundGuided] = useState(isSoundEnabled());
  const [hapticGuided, setHapticGuided] = useState(true);

  // Pre & Post Somatic Check-In
  const [preTension, setPreTension] = useState("neutral"); // 'high' | 'neutral' | 'calm'
  const [postFeeling, setPostFeeling] = useState("");
  const [savedToJournal, setSavedToJournal] = useState(false);

  // Real-time animation loop refs
  const animFrameRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const currentPhaseIndexRef = useRef(0);
  const phaseElapsedRef = useRef(0);
  const completedCyclesRef = useRef(0);
  const activePatternRef = useRef(null);

  const pattern = useMemo(() => {
    return BREATH_PATTERNS.find(p => p.id === selectedPatternId) || BREATH_PATTERNS[0];
  }, [selectedPatternId]);

  activePatternRef.current = pattern;

  // Calculate simulated HRV Coherence (starts around 64%, climbs smoothly towards 96% with cycles)
  const hrvCoherence = useMemo(() => {
    if (sessionState === "idle") return 68;
    const base = 65;
    const bonus = Math.min(30, completedCycles * 5 + Math.round(phaseElapsed * 1.5));
    return Math.min(98, base + bonus);
  }, [sessionState, completedCycles, phaseElapsed]);

  // Play audio cue for phase change
  const triggerPhaseAudio = useCallback((phaseKey, duration) => {
    if (!soundGuided) return;
    if (phaseKey === "in" || phaseKey === "in1") {
      playBreathInTone(duration);
    } else if (phaseKey === "in2") {
      playBreathInTopUpTone();
    } else if (phaseKey === "hold" || phaseKey === "hold2") {
      playBreathHoldTone(duration);
    } else if (phaseKey === "out") {
      playBreathOutTone(duration);
    }
  }, [soundGuided]);

  // Haptic feedback pulse on phase change
  const triggerPhaseHaptics = useCallback((phaseKey) => {
    if (!hapticGuided) return;
    if (phaseKey === "in2") {
      triggerHapticPulse([20, 30, 20]);
    } else if (phaseKey === "out") {
      triggerHapticPulse([40]);
    } else {
      triggerHapticPulse([25]);
    }
  }, [hapticGuided]);

  // Stop session
  const stopSession = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    lastTimestampRef.current = null;
    setSessionState("idle");
    setPhaseIndex(0);
    setPhaseElapsed(0);
    currentPhaseIndexRef.current = 0;
    phaseElapsedRef.current = 0;
  }, []);

  // Finish session
  const finishSession = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setSessionState("completed");
    playBreathCompleteCelebration();
    triggerHapticPulse([50, 60, 80]);
    recordCompletedBreathingSession(pattern.id, sessionTotalSeconds, completedCyclesRef.current);
    if (showToast) showToast("Completed Somatic Breathwork Session! 🌸");
  }, [pattern.id, sessionTotalSeconds, showToast]);

  // Main animation / timing tick loop
  const updateLoop = useCallback((timestamp) => {
    if (!lastTimestampRef.current) {
      lastTimestampRef.current = timestamp;
    }
    const delta = (timestamp - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = timestamp;

    setSessionTotalSeconds(s => s + delta);

    const currentPatt = activePatternRef.current;
    const currentPhase = currentPatt.phases[currentPhaseIndexRef.current];
    const newElapsed = phaseElapsedRef.current + delta;

    if (newElapsed >= currentPhase.duration) {
      // Phase completed, move to next phase
      const nextIndex = currentPhaseIndexRef.current + 1;
      if (nextIndex >= currentPatt.phases.length) {
        // Cycle completed!
        const nextCycles = completedCyclesRef.current + 1;
        completedCyclesRef.current = nextCycles;
        setCompletedCycles(nextCycles);

        if (nextCycles >= targetCycles) {
          // All target cycles completed!
          finishSession();
          return;
        }

        // Restart with first phase of next cycle
        currentPhaseIndexRef.current = 0;
        phaseElapsedRef.current = 0;
        setPhaseIndex(0);
        setPhaseElapsed(0);
        triggerPhaseAudio(currentPatt.phases[0].key, currentPatt.phases[0].duration);
        triggerPhaseHaptics(currentPatt.phases[0].key);
      } else {
        // Next phase within current cycle
        currentPhaseIndexRef.current = nextIndex;
        phaseElapsedRef.current = 0;
        setPhaseIndex(nextIndex);
        setPhaseElapsed(0);
        triggerPhaseAudio(currentPatt.phases[nextIndex].key, currentPatt.phases[nextIndex].duration);
        triggerPhaseHaptics(currentPatt.phases[nextIndex].key);
      }
    } else {
      phaseElapsedRef.current = newElapsed;
      setPhaseElapsed(newElapsed);
    }

    animFrameRef.current = requestAnimationFrame(updateLoop);
  }, [targetCycles, triggerPhaseAudio, triggerPhaseHaptics, finishSession]);

  // Start / Resume session
  const startSession = () => {
    setSessionState("active");
    setCompletedCycles(0);
    completedCyclesRef.current = 0;
    setPhaseIndex(0);
    currentPhaseIndexRef.current = 0;
    setPhaseElapsed(0);
    phaseElapsedRef.current = 0;
    setSessionTotalSeconds(0);
    setSavedToJournal(false);

    const firstPhase = pattern.phases[0];
    triggerPhaseAudio(firstPhase.key, firstPhase.duration);
    triggerPhaseHaptics(firstPhase.key);

    lastTimestampRef.current = null;
    animFrameRef.current = requestAnimationFrame(updateLoop);
  };

  const pauseSession = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    lastTimestampRef.current = null;
    setSessionState("paused");
  };

  const resumeSession = () => {
    setSessionState("active");
    lastTimestampRef.current = null;
    animFrameRef.current = requestAnimationFrame(updateLoop);
  };

  // Cleanup on unmount or pattern change
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const handleSelectPattern = (id) => {
    stopSession();
    setSelectedPatternId(id);
  };

  // Current phase calculation
  const currentPhase = pattern.phases[phaseIndex] || pattern.phases[0];
  const phaseProgress = Math.min(1, phaseElapsed / (currentPhase.duration || 1));
  const remainingSeconds = Math.max(0, Math.ceil(currentPhase.duration - phaseElapsed));

  // Visual Ring Scale & Visual State
  // Inhale expands (scale 1.0 -> 1.45), Hold pulses gently, Exhale contracts (1.45 -> 1.0), Rest softens
  let ringScale = 1.0;
  if (currentPhase.key === "in" || currentPhase.key === "in1") {
    ringScale = 1.0 + phaseProgress * 0.42;
  } else if (currentPhase.key === "in2") {
    ringScale = 1.42 + phaseProgress * 0.12;
  } else if (currentPhase.key === "hold") {
    ringScale = 1.45 + Math.sin(phaseElapsed * 2) * 0.02;
  } else if (currentPhase.key === "hold2") {
    ringScale = 0.98 + Math.sin(phaseElapsed * 2) * 0.02;
  } else if (currentPhase.key === "out") {
    ringScale = 1.45 - phaseProgress * 0.45;
  } else if (currentPhase.key === "rest") {
    ringScale = 1.0;
  }

  // Handle saving post-session note into Daily Notes
  const handleSaveToDailyNotes = () => {
    if (!onSaveToNotes) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const today = new Date().toISOString().split("T")[0];

    const tensionMap = {
      high: "😣 High Stress & Tightness",
      neutral: "😐 Scattered / Restless",
      calm: "😌 Mildly Calm"
    };

    const noteContent = `
---
### 🌬️ Somatic Breathwork Session: ${pattern.name}
- **Timestamp**: ${nowTime}
- **Rhythm**: ${pattern.subtitle}
- **Cycles Completed**: ${completedCycles} of ${targetCycles} (~${Math.round(sessionTotalSeconds)}s)
- **HRV Coherence**: ${hrvCoherence}% (${hrvCoherence >= 85 ? "High Coherence" : "Moderate Coherence"})
- **Somatic Shift**: ${tensionMap[preTension] || "Neutral"} ➡️ ${postFeeling || "Grounded & Present"}
> *"${pattern.affirmation}"*
---
`.trim();

    onSaveToNotes({ date: today, text: noteContent });
    setSavedToJournal(true);
    if (showToast) showToast("Saved Somatic Breathwork Log to Daily Journal! 📝");
  };

  return (
    <div
      className="breathing-studio-root fade-in"
      style={{
        position: isModal ? "fixed" : "relative",
        top: isModal ? 0 : "auto",
        left: isModal ? 0 : "auto",
        right: isModal ? 0 : "auto",
        bottom: isModal ? 0 : "auto",
        width: "100%",
        height: isModal ? "100vh" : "auto",
        zIndex: isModal ? 1000 : 1,
        background: isModal ? "var(--bg-card, rgba(20, 24, 33, 0.96))" : "transparent",
        backdropFilter: isModal ? "blur(30px)" : "none",
        WebkitBackdropFilter: isModal ? "blur(30px)" : "none",
        overflowY: isModal ? "auto" : "visible",
        padding: isModal ? "24px 20px 60px" : "8px 0 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* HEADER / NAVIGATION */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                background: pattern.bgGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                boxShadow: `0 6px 20px ${pattern.glowColor}`
              }}
            >
              {pattern.icon}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary, #2d3748)" }}>
                  Somatic Breath Studio
                </h3>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 8,
                    background: pattern.glowColor,
                    color: pattern.color
                  }}
                >
                  {pattern.category}
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-secondary, #718096)" }}>
                Neurobiological breathwork & HRV resonance
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundGuided(!soundGuided)}
              title={soundGuided ? "Audio cues active" : "Audio muted"}
              style={{
                background: soundGuided ? "rgba(255, 154, 118, 0.18)" : "var(--bg-glass, rgba(255, 255, 255, 0.15))",
                border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.2))",
                borderRadius: 10,
                padding: "6px 10px",
                fontSize: 12,
                cursor: "pointer",
                color: soundGuided ? "#ff9a76" : "var(--text-secondary, #718096)",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}
            >
              {soundGuided ? "🔔 Sound" : "🔕 Mute"}
            </button>

            {/* Haptics Toggle */}
            <button
              onClick={() => setHapticGuided(!hapticGuided)}
              title={hapticGuided ? "Haptic vibration active" : "Haptics off"}
              style={{
                background: hapticGuided ? "rgba(6, 182, 212, 0.18)" : "var(--bg-glass, rgba(255, 255, 255, 0.15))",
                border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.2))",
                borderRadius: 10,
                padding: "6px 10px",
                fontSize: 12,
                cursor: "pointer",
                color: hapticGuided ? "#06b6d4" : "var(--text-secondary, #718096)",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}
            >
              {hapticGuided ? "📳 Haptic" : "📴 Off"}
            </button>

            {isModal && onClose && (
              <button
                onClick={onClose}
                style={{
                  background: "var(--bg-glass, rgba(255, 255, 255, 0.15))",
                  border: "none",
                  borderRadius: 12,
                  width: 34,
                  height: 34,
                  cursor: "pointer",
                  fontSize: 16,
                  color: "var(--text-secondary, #718096)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* PATTERN SELECTOR CAROUSEL / PILLS */}
        {sessionState === "idle" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
              {BREATH_PATTERNS.map(p => {
                const isSelected = p.id === selectedPatternId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPattern(p.id)}
                    style={{
                      flex: "0 0 auto",
                      padding: "8px 14px",
                      borderRadius: 14,
                      background: isSelected ? p.bgGradient : "var(--bg-card, rgba(255, 255, 255, 0.6))",
                      border: isSelected ? `2px solid ${p.color}` : "1px solid var(--border-glass, rgba(0,0,0,0.06))",
                      color: isSelected ? "#ffffff" : "var(--text-primary, #2d3748)",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: isSelected ? 700 : 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: isSelected ? `0 6px 18px ${p.glowColor}` : "none",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Pattern Card Summary */}
            <div
              className="glass"
              style={{
                marginTop: 12,
                borderRadius: 16,
                padding: "14px 16px",
                background: "var(--bg-card, rgba(255, 255, 255, 0.5))",
                border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.4))",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary, #2d3748)" }}>
                    {pattern.name}
                  </h4>
                  <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "var(--text-secondary, #718096)", lineHeight: 1.4 }}>
                    {pattern.subtitle}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {pattern.phases.map(ph => (
                    <span
                      key={ph.key}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "3px 6px",
                        borderRadius: 6,
                        background: pattern.glowColor,
                        color: pattern.color
                      }}
                    >
                      {ph.label.split(" ")[0]} {ph.duration}s
                    </span>
                  ))}
                </div>
              </div>

              {/* Science brief */}
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "rgba(0, 0, 0, 0.03)",
                  fontSize: 11,
                  color: "var(--text-secondary, #4a5568)",
                  lineHeight: 1.45
                }}
              >
                🔬 <strong>Neurobiology:</strong> {pattern.science}
              </div>
            </div>

            {/* PRE-SESSION TENSION CHECK-IN */}
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #718096)" }}>
                Current Body Tension:
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { id: "high", label: "😣 High Stress", color: "#f87171" },
                  { id: "neutral", label: "😐 Scattered", color: "#fbbf24" },
                  { id: "calm", label: "😌 Mildly Calm", color: "#34d399" }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setPreTension(item.id)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 8,
                      border: preTension === item.id ? `1.5px solid ${item.color}` : "1px solid rgba(0,0,0,0.08)",
                      background: preTension === item.id ? "var(--bg-glass, rgba(255, 255, 255, 0.4))" : "transparent",
                      color: preTension === item.id ? item.color : "var(--text-secondary, #718096)",
                      fontSize: 10.5,
                      fontWeight: preTension === item.id ? 700 : 500,
                      cursor: "pointer"
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TARGET CYCLES SELECTOR */}
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary, #718096)" }}>
                Target Session Cycles:
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { c: 3, label: "3 (~1 min)" },
                  { c: 5, label: "5 (~2 min)" },
                  { c: 8, label: "8 (~3 min)" },
                  { c: 12, label: "12 (~5 min)" }
                ].map(opt => (
                  <button
                    key={opt.c}
                    onClick={() => setTargetCycles(opt.c)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 10,
                      border: targetCycles === opt.c ? `1.5px solid ${pattern.color}` : "1px solid var(--border-glass, rgba(0,0,0,0.08))",
                      background: targetCycles === opt.c ? pattern.glowColor : "var(--bg-glass, rgba(255, 255, 255, 0.4))",
                      color: targetCycles === opt.c ? pattern.color : "var(--text-secondary, #718096)",
                      fontSize: 11,
                      fontWeight: targetCycles === opt.c ? 700 : 500,
                      cursor: "pointer"
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* INTERACTIVE SOMATIC BREATHING RING (HERO CANVAS) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: "relative",
            width: "100%",
            minHeight: 280,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: "12px 0 20px"
          }}
        >
          {/* Concentric Aura Glow Circles */}
          <div
            style={{
              position: "absolute",
              width: 250,
              height: 250,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${pattern.glowColor} 0%, rgba(255,255,255,0) 70%)`,
              transform: `scale(${ringScale})`,
              transition: sessionState === "active" ? "transform 0.15s ease-out" : "transform 0.6s ease",
              opacity: sessionState === "active" ? 0.85 : 0.35,
              pointerEvents: "none"
            }}
          />

          {/* SVG Pacing Ring */}
          <div
            style={{
              position: "relative",
              width: 220,
              height: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: "rotate(-90deg)", position: "absolute" }}>
              {/* Background ring */}
              <circle
                cx="110"
                cy="110"
                r="95"
                fill="none"
                stroke="var(--border-glass, rgba(255, 255, 255, 0.15))"
                strokeWidth="6"
              />
              {/* Active phase progress circle */}
              <circle
                cx="110"
                cy="110"
                r="95"
                fill="none"
                stroke={pattern.color}
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 95}
                strokeDashoffset={(2 * Math.PI * 95) * (1 - phaseProgress)}
                strokeLinecap="round"
                style={{
                  transition: sessionState === "active" ? "stroke-dashoffset 0.1s linear" : "none"
                }}
              />
            </svg>

            {/* Inner Scaling Breathing Sphere */}
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: pattern.bgGradient,
                transform: `scale(${ringScale})`,
                transition: sessionState === "active" ? "transform 0.15s ease-out" : "transform 0.6s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 10px 32px ${pattern.glowColor}`,
                color: "#ffffff",
                textAlign: "center",
                padding: 10,
                cursor: sessionState === "idle" ? "pointer" : "default"
              }}
              onClick={sessionState === "idle" ? startSession : undefined}
            >
              {sessionState === "idle" && (
                <>
                  <span style={{ fontSize: 32 }}>{pattern.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, marginTop: 4 }}>
                    Tap to Begin
                  </span>
                </>
              )}

              {sessionState === "active" && (
                <>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, opacity: 0.9 }}>
                    {currentPhase.label}
                  </span>
                  <span style={{ fontSize: 36, fontWeight: 800, margin: "2px 0", lineHeight: 1 }}>
                    {remainingSeconds}s
                  </span>
                  <span style={{ fontSize: 10, opacity: 0.85, fontWeight: 600 }}>
                    Cycle {completedCycles + 1} of {targetCycles}
                  </span>
                </>
              )}

              {sessionState === "paused" && (
                <>
                  <span style={{ fontSize: 28 }}>⏸️</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Paused</span>
                </>
              )}

              {sessionState === "completed" && (
                <>
                  <span style={{ fontSize: 32 }}>✨</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Complete</span>
                </>
              )}
            </div>
          </div>

          {/* REAL-TIME SOMATIC INSTRUCTION TEXT */}
          <div style={{ textAlign: "center", marginTop: 16, minHeight: 44, padding: "0 20px" }}>
            {sessionState === "active" ? (
              <p
                className="fade-in"
                key={currentPhase.key}
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary, #2d3748)",
                  lineHeight: 1.45
                }}
              >
                {currentPhase.instruction}
              </p>
            ) : sessionState === "idle" ? (
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-secondary, #718096)" }}>
                Rest your shoulders, unclench your jaw, and settle comfortably.
              </p>
            ) : sessionState === "paused" ? (
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-secondary, #718096)" }}>
                Session is paused. Take your time.
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#10b981" }}>
                Session complete. Notice the spacious calmness in your chest.
              </p>
            )}
          </div>

          {/* HRV RESONANCE BAR */}
          <div
            style={{
              width: "100%",
              maxWidth: 320,
              marginTop: 10,
              background: "var(--bg-glass, rgba(0, 0, 0, 0.05))",
              borderRadius: 20,
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12 }}>💓</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary, #718096)" }}>
                HRV Coherence:
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, maxWidth: 140 }}>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  background: "rgba(0,0,0,0.08)",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: `${hrvCoherence}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: pattern.bgGradient,
                    transition: "width 0.4s ease"
                  }}
                />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: pattern.color, minWidth: 32 }}>
                {hrvCoherence}%
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* SESSION CONTROLS */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 6, marginBottom: 16 }}>
          {sessionState === "idle" && (
            <button
              onClick={startSession}
              style={{
                padding: "12px 36px",
                borderRadius: 16,
                background: pattern.bgGradient,
                border: "none",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 8px 24px ${pattern.glowColor}`,
                transition: "all 0.2s ease"
              }}
            >
              ▶ Start {pattern.name}
            </button>
          )}

          {sessionState === "active" && (
            <>
              <button
                onClick={pauseSession}
                style={{
                  padding: "10px 24px",
                  borderRadius: 14,
                  background: "var(--bg-glass, rgba(255, 255, 255, 0.4))",
                  border: "1px solid var(--border-glass, rgba(0,0,0,0.1))",
                  color: "var(--text-primary, #2d3748)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                ⏸️ Pause
              </button>
              <button
                onClick={stopSession}
                style={{
                  padding: "10px 24px",
                  borderRadius: 14,
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#ef4444",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                ⏹ Stop
              </button>
            </>
          )}

          {sessionState === "paused" && (
            <>
              <button
                onClick={resumeSession}
                style={{
                  padding: "10px 24px",
                  borderRadius: 14,
                  background: pattern.bgGradient,
                  border: "none",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: `0 6px 18px ${pattern.glowColor}`
                }}
              >
                ▶ Resume
              </button>
              <button
                onClick={stopSession}
                style={{
                  padding: "10px 24px",
                  borderRadius: 14,
                  background: "var(--bg-glass, rgba(255, 255, 255, 0.4))",
                  border: "1px solid var(--border-glass, rgba(0,0,0,0.1))",
                  color: "var(--text-secondary, #718096)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Reset
              </button>
            </>
          )}

          {sessionState === "completed" && (
            <button
              onClick={() => {
                setSessionState("idle");
                setCompletedCycles(0);
              }}
              style={{
                padding: "10px 28px",
                borderRadius: 14,
                background: pattern.bgGradient,
                border: "none",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 6px 18px ${pattern.glowColor}`
              }}
            >
              🔄 Another Round
            </button>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* POST-SESSION REFLECTION & JOURNAL SAVE MODAL */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {sessionState === "completed" && (
          <div
            className="glass fade-in"
            style={{
              borderRadius: 20,
              padding: "18px 20px",
              marginTop: 10,
              background: "var(--bg-card, rgba(255, 255, 255, 0.7))",
              border: `2px solid ${pattern.color}`,
              boxShadow: `0 10px 32px ${pattern.glowColor}`
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>🌸</span>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary, #2d3748)" }}>
                  Somatic Shift Check-In
                </h4>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-secondary, #718096)" }}>
                  Take a moment to notice how your body feels right now
                </p>
              </div>
            </div>

            {/* Post feeling choices */}
            <p style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary, #718096)", margin: "0 0 8px 0" }}>
              How does your chest and head feel?
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginBottom: 14 }}>
              {[
                { id: "calm", label: "🌿 Centered & Grounded" },
                { id: "light", label: "✨ Noticeably Lighter" },
                { id: "sleepy", label: "😴 Soft & Sleepy" },
                { id: "clear", label: "⚡ Sharp & Alert" }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setPostFeeling(opt.label)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: postFeeling === opt.label ? `1.5px solid ${pattern.color}` : "1px solid var(--border-glass, rgba(0,0,0,0.08))",
                    background: postFeeling === opt.label ? pattern.glowColor : "var(--bg-glass, rgba(255, 255, 255, 0.4))",
                    color: postFeeling === opt.label ? pattern.color : "var(--text-primary, #2d3748)",
                    fontSize: 11,
                    fontWeight: postFeeling === opt.label ? 700 : 500,
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Anchor Affirmation */}
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(0, 0, 0, 0.03)",
                borderLeft: `3px solid ${pattern.color}`,
                marginBottom: 14
              }}
            >
              <p style={{ margin: 0, fontSize: 11.5, fontStyle: "italic", color: "var(--text-primary, #2d3748)", lineHeight: 1.4 }}>
                "{pattern.affirmation}"
              </p>
            </div>

            {/* 1-Click Save to Journal */}
            {onSaveToNotes && (
              <button
                onClick={handleSaveToDailyNotes}
                disabled={savedToJournal}
                style={{
                  width: "100%",
                  padding: "11px 0",
                  borderRadius: 12,
                  background: savedToJournal ? "#10b981" : pattern.bgGradient,
                  border: "none",
                  color: "#ffffff",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: savedToJournal ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: `0 6px 18px ${pattern.glowColor}`
                }}
              >
                <span>{savedToJournal ? "✓ Logged to Daily Journal" : "📝 Log Session to Daily Journal"}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// QUICK BREATHING LAUNCHER CARD (FOR HOMESCREEN & DASHBOARDS)
// ═══════════════════════════════════════════════════════════════════════

export function QuickBreathingLauncherCard({ onOpenBreathing }) {
  const stats = getBreathingStats();

  return (
    <div
      className="glass"
      style={{
        borderRadius: 20,
        padding: "16px 20px",
        marginBottom: 20,
        background: "var(--bg-card, rgba(255, 255, 255, 0.6))",
        border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.5))",
        boxShadow: "0 8px 30px rgba(6, 182, 212, 0.08)",
        transition: "all 0.3s ease"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              boxShadow: "0 6px 18px rgba(6, 182, 212, 0.35)"
            }}
          >
            🌊
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary, #2d3748)" }}>
              Somatic Breathwork
            </h4>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-secondary, #718096)" }}>
              Physiological Sigh, 4-7-8 & HRV Resonance
            </p>
          </div>
        </div>

        {/* Total Mindful Minutes badge */}
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 10,
            background: "rgba(6, 182, 212, 0.12)",
            color: "#0891b2",
            fontSize: 11,
            fontWeight: 700,
            textAlign: "right"
          }}
        >
          {stats.totalMinutes || 0}m mindful
        </div>
      </div>

      {/* Quick Launch Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
        <button
          onClick={() => onOpenBreathing("sigh")}
          style={{
            padding: "9px 12px",
            borderRadius: 12,
            border: "1px solid rgba(6, 182, 212, 0.3)",
            background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))",
            color: "var(--text-primary, #2d3748)",
            fontSize: 11.5,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <span>🌊</span>
          <span>Physiological Sigh</span>
        </button>

        <button
          onClick={() => onOpenBreathing("relax")}
          style={{
            padding: "9px 12px",
            borderRadius: 12,
            border: "1px solid rgba(139, 92, 246, 0.3)",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))",
            color: "var(--text-primary, #2d3748)",
            fontSize: 11.5,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <span>🌙</span>
          <span>4-7-8 Sleep Reset</span>
        </button>
      </div>
    </div>
  );
}
