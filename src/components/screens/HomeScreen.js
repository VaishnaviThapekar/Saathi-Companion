import { useState } from "react";



// Helper functions - these should match what's in your App.js
const todayKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const now = () => new Date();

// ═══════════════════════════════════════════════════════════════════════
// ENHANCED HOME SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function HomeScreen({
    userName,
    tasks,
    habits,
    setHabits,
    setTab,
    gratitude,
    dailyCheckIn,
    lastCheckInDate,
    setDailyCheckIn,
    setLastCheckInDate,
    setMoodLog,
    emotionalPatterns,
    autoSuggestions,
    energyLog,
    Icon // Pass Icon component as prop
}) {
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [mood, setMood] = useState("");
    const [struggles, setStruggles] = useState("");

    const today = todayKey();

    const activeTasks = tasks.filter(t => !t.done).length;
    const completedToday = tasks.filter(t => t.done && t.lastCompleted?.startsWith(today)).length;
    const todayGratitude = gratitude[today];
    const todayCheckIn = dailyCheckIn && dailyCheckIn.date === today ? dailyCheckIn : null;
    const todayEnergyEntries = energyLog[today] || [];
    const latestEnergy = todayEnergyEntries[todayEnergyEntries.length - 1]?.level;
    const activeHabits = habits.filter(h => !h.archived);
    const doneHabits = activeHabits.filter(h => (h.completions || []).includes(today));

    const needsCheckIn = !todayCheckIn || !todayCheckIn.mood;
    const hasSnapshot = Boolean(todayGratitude)
        || typeof latestEnergy === "number"
        || doneHabits.length > 0
        || Boolean(todayCheckIn && todayCheckIn.mood);

    const weekStart = (date) => {
        const d = new Date(date);
        d.setDate(d.getDate() - d.getDay());
        return d;
    };

    const countWeekCompletions = (habit, refDate) => {
        const start = weekStart(refDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return (habit.completions || []).filter(k => {
            const kd = new Date(`${k}T00:00:00`);
            return kd >= start && kd <= end;
        }).length;
    };

    const weeklyEligible = activeHabits.filter(h => h.schedule === "weekly");
    const weeklyOnTrack = weeklyEligible.filter(h => countWeekCompletions(h, now()) >= (h.goalPerWeek || 1));

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const submitCheckIn = () => {
        if (!mood) return;
        const entry = { id: now().toISOString(), date: today, mood, struggles, timestamp: now().toISOString() };
        setMoodLog(p => (Array.isArray(p) ? [...p, entry] : [entry]));
        setDailyCheckIn(entry);
        setLastCheckInDate(today);
        setShowCheckIn(false);
        setMood("");
        setStruggles("");
    };


    return (
        <div style={{ padding: "0 0 90px 0", position: "relative" }}>
            {/* HERO SECTION WITH GRADIENT */}
            <div style={{
                background: "linear-gradient(135deg, #ffc3a0 0%, #ffafbd 35%, #c3aed6 65%, #b4d4ff 100%)",
                padding: "32px 24px 40px",
                borderRadius: "0 0 40px 40px",
                marginBottom: 28,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 12px 48px rgba(255, 175, 189, 0.2)"
            }}>
                <button
                    onClick={() => setShowGuide(true)}
                    style={{
                        position: "absolute",
                        top: 20,
                        right: 20,
                        zIndex: 10,
                        padding: "6px 14px",
                        borderRadius: 20,
                        background: "rgba(255, 255, 255, 0.3)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.5)",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                    }}
                >
                    📖 Guide
                </button>
                {/* Animated background elements */}
                <div style={{
                    position: "absolute",
                    top: -60,
                    right: -40,
                    width: 180,
                    height: 180,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.12)",
                    backdropFilter: "blur(20px)",
                    animation: "float 6s ease-in-out infinite"
                }} />
                <div style={{
                    position: "absolute",
                    bottom: -80,
                    left: 20,
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(15px)",
                    animation: "float 8s ease-in-out infinite 1s"
                }} />

                {/* LOGO SECTION WITH DYNAMIC EMOTIONAL AURA VISUALIZER */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 2,
                    textAlign: "center"
                }}>
                {(() => {
                    const hour = new Date().getHours();
                    const currentMood = todayCheckIn?.mood;
                    let auraLabel = "🌸 Calm & Centered Aura";
                    let auraGradient = "linear-gradient(135deg, #ffc3a0, #ffafbd, #c3aed6)";
                    let auraShadow = "0 0 50px rgba(255, 175, 189, 0.6)";

                    if (currentMood === "amazing" || currentMood === "good") {
                        auraLabel = "✨ Joyful & Golden Aura";
                        auraGradient = "linear-gradient(135deg, #a8e6cf, #ffd3b6, #ffafbd)";
                        auraShadow = "0 0 50px rgba(168, 230, 207, 0.75)";
                    } else if (currentMood === "struggling" || currentMood === "overwhelmed") {
                        auraLabel = "🌿 Gentle Healing Aura";
                        auraGradient = "linear-gradient(135deg, #c3aed6, #b4d4ff, #ffafbd)";
                        auraShadow = "0 0 50px rgba(195, 174, 214, 0.75)";
                    } else if (hour >= 21 || hour < 4) {
                        auraLabel = "🌌 Night Rest Aura";
                        auraGradient = "linear-gradient(135deg, #4a3b5c, #6c527e, #ffafbd)";
                        auraShadow = "0 0 50px rgba(74, 59, 92, 0.85)";
                    }

                    return (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 14 }}>
                            <div style={{
                                width: 96,
                                height: 96,
                                borderRadius: 48,
                                background: auraGradient,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 12,
                                boxShadow: `${auraShadow}, inset 0 2px 8px rgba(255, 255, 255, 0.8)`,
                                border: "3px solid rgba(255, 255, 255, 0.7)",
                                animation: "glowPulse 2.5s ease-in-out infinite"
                            }}>
                                <Icon name="heart" size={48} color="#fff" sw={2} />
                            </div>
                            <span style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#ffffff",
                                background: "rgba(255, 255, 255, 0.25)",
                                backdropFilter: "blur(12px)",
                                padding: "4px 14px",
                                borderRadius: 20,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                letterSpacing: "0.5px"
                            }}>
                                {auraLabel}
                            </span>
                        </div>
                    );
                })()}

                    {/* App Name with Serif Font */}
                    <h1 style={{
                        fontSize: 40,
                        fontFamily: "'Crimson Text', serif",
                        fontWeight: 700,
                        color: "#ffffff",
                        marginBottom: 6,
                        textShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
                        letterSpacing: "2px"
                    }}>
                        Saathi
                    </h1>

                    {/* Tagline */}
                    <p style={{
                        fontSize: 15,
                        color: "rgba(255, 255, 255, 0.95)",
                        marginBottom: 20,
                        fontWeight: 500,
                        maxWidth: 280,
                        lineHeight: "1.6",
                        letterSpacing: "0.3px"
                    }}>
                        Your companion for growth & wellness
                    </p>

                    {/* Greeting Box */}
                    <div style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(15px)",
                        borderRadius: 18,
                        padding: "14px 28px",
                        border: "1.5px solid rgba(255, 255, 255, 0.35)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                        animation: "slideDown 0.6s ease both"
                    }}>
                        <p style={{
                            fontSize: 17,
                            color: "#ffffff",
                            fontWeight: 700,
                            letterSpacing: "0.5px"
                        }}>
                            {getGreeting()}, {userName}! ✨
                        </p>
                    </div>
                </div>
            </div>

            {/* 24/7 CIRCADIAN RHYTHM ENGINE CARDS */}
            {(() => {
                const hour = new Date().getHours();
                if (hour >= 6 && hour < 11) {
                    return (
                        <div className="glass" style={{
                            margin: "0 20px 24px",
                            borderRadius: 20,
                            padding: 20,
                            background: "linear-gradient(135deg, rgba(255, 195, 160, 0.25) 0%, rgba(255, 255, 255, 0.9) 100%)",
                            border: "1px solid rgba(255, 195, 160, 0.4)",
                            boxShadow: "0 10px 30px rgba(255, 195, 160, 0.15)"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                <span style={{ fontSize: 24 }}>🌅</span>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#5a4a42", margin: 0 }}>Morning Briefing</h3>
                                    <p style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.65)", marginTop: 2 }}>Your 24/7 Companion Start</p>
                                </div>
                            </div>
                            <p style={{ fontSize: 13, color: "#5a4a42", lineHeight: 1.5, marginBottom: 14 }}>
                                Good morning, <strong>{userName}</strong>! You have <strong>{activeTasks} pending task{activeTasks === 1 ? '' : 's'}</strong> today. Let's start with a clear mind and focus!
                            </p>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button onClick={() => setTab("tasks")} style={{ padding: "8px 14px", borderRadius: 12, background: "linear-gradient(135deg, #ffc3a0, #ffafbd)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                    📌 Focus Tasks ({activeTasks})
                                </button>
                                <button onClick={() => setTab("wellness")} style={{ padding: "8px 14px", borderRadius: 12, background: "rgba(168, 230, 207, 0.35)", border: "1px solid rgba(168, 230, 207, 0.6)", color: "#2d6a4f", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                    ✨ Affirmations
                                </button>
                            </div>
                        </div>
                    );
                }
                if (hour >= 21 || hour < 4) {
                    return (
                        <div className="glass" style={{
                            margin: "0 20px 24px",
                            borderRadius: 20,
                            padding: 20,
                            background: "linear-gradient(135deg, rgba(195, 174, 214, 0.25) 0%, rgba(255, 255, 255, 0.9) 100%)",
                            border: "1px solid rgba(195, 174, 214, 0.4)",
                            boxShadow: "0 10px 30px rgba(195, 174, 214, 0.18)"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                <span style={{ fontSize: 24 }}>🌌</span>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#5a4a42", margin: 0 }}>Night Wind-Down</h3>
                                    <p style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.65)", marginTop: 2 }}>Time to Rest & Unwind</p>
                                </div>
                            </div>
                            <p style={{ fontSize: 13, color: "#5a4a42", lineHeight: 1.5, marginBottom: 14 }}>
                                Good evening, <strong>{userName}</strong>. Take a moment to reflect on your day and relax your body before sleep.
                            </p>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button onClick={() => setTab("wellness")} style={{ padding: "8px 14px", borderRadius: 12, background: "linear-gradient(135deg, #c3aed6, #ffafbd)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                    🌬️ 4-4-6 Breathing Reset
                                </button>
                                <button onClick={() => setTab("wellness")} style={{ padding: "8px 14px", borderRadius: 12, background: "rgba(255, 195, 160, 0.35)", border: "1px solid rgba(255, 195, 160, 0.6)", color: "#8b5a2b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                    🌸 Gratitude Log
                                </button>
                            </div>
                        </div>
                    );
                }
                return null;
            })()}

            {/* QUICK STATS SECTION */}
            <div style={{ padding: "0 20px", marginBottom: 24 }}>
                <p style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "rgba(139, 126, 116, 0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "1.2px",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                }}>
                    <span style={{
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        background: "#ff9a76"
                    }}></span>
                    Today's Overview
                </p>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 12
                }}>
                    {/* Active Tasks Card */}
                    <div className="glass" style={{
                        borderRadius: 18,
                        padding: 18,
                        borderLeft: "4px solid #ffc3a0",
                        background: "linear-gradient(135deg, rgba(255, 195, 160, 0.05) 0%, rgba(255, 255, 255, 0.8) 100%)",
                        cursor: "pointer"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: "linear-gradient(135deg, rgba(255, 195, 160, 0.2), rgba(255, 175, 189, 0.1))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Icon name="tasks" size={18} color="#ffc3a0" sw={2} />
                            </div>
                            <div>
                                <p style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.65)", fontWeight: 700, letterSpacing: "0.5px" }}>ACTIVE TASKS</p>
                            </div>
                        </div>
                        <p style={{ fontSize: 32, fontWeight: 800, color: "#ff9a76", lineHeight: 1 }}>{activeTasks}</p>
                    </div>

                    {/* Completed Today Card */}
                    <div className="glass" style={{
                        borderRadius: 18,
                        padding: 18,
                        borderLeft: "4px solid #a8e6cf",
                        background: "linear-gradient(135deg, rgba(168, 230, 207, 0.05) 0%, rgba(255, 255, 255, 0.8) 100%)",
                        cursor: "pointer"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: "linear-gradient(135deg, rgba(168, 230, 207, 0.2), rgba(198, 245, 210, 0.1))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Icon name="check" size={18} color="#a8e6cf" sw={2} />
                            </div>
                            <div>
                                <p style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.65)", fontWeight: 700, letterSpacing: "0.5px" }}>COMPLETED</p>
                            </div>
                        </div>
                        <p style={{ fontSize: 32, fontWeight: 800, color: "#5aa377", lineHeight: 1 }}>{completedToday}</p>
                    </div>
                </div>
            </div>

            {/* DAILY CHECK-IN PROMPT */}
            {needsCheckIn && !showCheckIn && (
                <div style={{ padding: "0 20px", marginBottom: 24 }}>
                    <div className="glass" style={{
                        borderRadius: 20,
                        padding: 24,
                        background: "linear-gradient(135deg, rgba(255, 195, 160, 0.12), rgba(255, 175, 189, 0.12))",
                        border: "2px solid rgba(255, 195, 160, 0.4)",
                        animation: "slideDown 0.5s ease both"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                            <div style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                background: "linear-gradient(135deg, #ffc3a0, #ffafbd)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 8px 24px rgba(255, 175, 189, 0.3)",
                                animation: "bounce 2s ease-in-out infinite"
                            }}>
                                <Icon name="smile" size={28} color="#fff" sw={2} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#5a4a42", marginBottom: 6, letterSpacing: "0.3px" }}>
                                    Check In With Yourself
                                </h3>
                                <p style={{ fontSize: 14, color: "rgba(139, 126, 116, 0.75)", lineHeight: 1.4 }}>
                                    Take a moment to reflect on how you're feeling today
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCheckIn(true)}
                            className="btn-primary"
                            style={{
                                width: "100%",
                                padding: "14px",
                                background: "linear-gradient(135deg, #ffc3a0, #ffafbd)",
                                border: "none",
                                color: "#fff",
                                fontSize: 15,
                                fontWeight: 700,
                                cursor: "pointer",
                                boxShadow: "0 8px 20px rgba(255, 175, 189, 0.35)",
                                letterSpacing: "0.5px",
                                transition: "all 0.3s ease"
                            }}
                        >
                            Start Check-In ✨
                        </button>
                    </div>
                </div>
            )}

            {/* CHECK-IN FORM */}
            {showCheckIn && (
                <div style={{ padding: "0 20px", marginBottom: 24 }}>
                    <div className="glass" style={{
                        borderRadius: 20,
                        padding: 24,
                        background: "rgba(255, 255, 255, 0.9)"
                    }}>
                        <h3 style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#5a4a42",
                            marginBottom: 20,
                            fontFamily: "'Crimson Text', serif"
                        }}>
                            Daily Check-In
                        </h3>

                        <label style={{
                            display: "block",
                            fontSize: 14,
                            color: "#5a4a42",
                            fontWeight: 700,
                            marginBottom: 10,
                            letterSpacing: "0.3px"
                        }}>
                            How are you feeling today?
                        </label>
                        <select
                            value={mood}
                            onChange={e => setMood(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                borderRadius: 14,
                                border: "2px solid rgba(255, 195, 160, 0.3)",
                                background: "rgba(255, 255, 255, 0.8)",
                                fontSize: 15,
                                marginBottom: 18,
                                outline: "none",
                                color: "#5a4a42",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "all 0.3s ease"
                            }}
                        >
                            <option value="">Select your mood...</option>
                            <option value="amazing">😄 Amazing</option>
                            <option value="good">😊 Good</option>
                            <option value="okay">😐 Okay</option>
                            <option value="struggling">😔 Struggling</option>
                            <option value="overwhelmed">😰 Overwhelmed</option>
                        </select>

                        <label style={{
                            display: "block",
                            fontSize: 14,
                            color: "#5a4a42",
                            fontWeight: 700,
                            marginBottom: 10,
                            letterSpacing: "0.3px"
                        }}>
                            What's on your mind? (Optional)
                        </label>
                        <textarea
                            value={struggles}
                            onChange={e => setStruggles(e.target.value)}
                            placeholder="Share what you're experiencing..."
                            rows={4}
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                borderRadius: 14,
                                border: "2px solid rgba(255, 195, 160, 0.3)",
                                background: "rgba(255, 255, 255, 0.8)",
                                fontSize: 15,
                                marginBottom: 18,
                                outline: "none",
                                resize: "none",
                                color: "#5a4a42",
                                fontFamily: "'Quicksand', sans-serif",
                                lineHeight: 1.6,
                                transition: "all 0.3s ease"
                            }}
                        />

                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                onClick={() => setShowCheckIn(false)}
                                style={{
                                    flex: 1,
                                    padding: "13px",
                                    borderRadius: 14,
                                    background: "rgba(139, 126, 116, 0.08)",
                                    border: "2px solid rgba(139, 126, 116, 0.2)",
                                    color: "rgba(139, 126, 116, 0.8)",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    letterSpacing: "0.3px"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitCheckIn}
                                disabled={!mood}
                                style={{
                                    flex: 2,
                                    padding: "13px",
                                    borderRadius: 14,
                                    background: mood ? "linear-gradient(135deg, #ffc3a0, #ffafbd)" : "rgba(139, 126, 116, 0.15)",
                                    border: "none",
                                    color: "#fff",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: mood ? "pointer" : "not-allowed",
                                    boxShadow: mood ? "0 8px 20px rgba(255, 175, 189, 0.3)" : "none",
                                    transition: "all 0.3s ease",
                                    letterSpacing: "0.3px"
                                }}
                            >
                                Complete Check-In
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TODAY'S SNAPSHOT SECTION */}
            <div style={{ padding: "0 20px" }}>
                <p style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "rgba(139, 126, 116, 0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "1.2px",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                }}>
                    <span style={{
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        background: "#ff9a76"
                    }}></span>
                    Today's Snapshot
                </p>

                {/* Gratitude */}
                {todayGratitude && (
                    <div className="glass" style={{
                        borderRadius: 16,
                        padding: 18,
                        marginBottom: 12,
                        minHeight: 120,
                        borderLeft: "5px solid #a8e6cf",
                        background: "linear-gradient(135deg, rgba(168, 230, 207, 0.06) 0%, rgba(255, 255, 255, 0.9) 100%)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: "linear-gradient(135deg, rgba(168, 230, 207, 0.2), rgba(198, 245, 210, 0.1))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Icon name="star" size={18} color="#a8e6cf" sw={2} />
                            </div>
                            <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(139, 126, 116, 0.65)", letterSpacing: "0.5px" }}>
                                GRATITUDE
                            </p>
                        </div>
                        <p style={{ fontSize: 15, color: "#5a4a42", lineHeight: 1.7, fontWeight: 500 }}>
                            {todayGratitude}
                        </p>
                    </div>
                )}

                {/* Daily Check-In */}
                {todayCheckIn && (
                    <div className="glass" style={{
                        borderRadius: 16,
                        padding: 18,
                        marginBottom: 12,
                        minHeight: 120,
                        borderLeft: "5px solid #ffafbd",
                        background: "linear-gradient(135deg, rgba(255, 175, 189, 0.06) 0%, rgba(255, 255, 255, 0.9) 100%)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: "linear-gradient(135deg, rgba(255, 195, 160, 0.2), rgba(255, 175, 189, 0.1))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Icon name="smile" size={18} color="#ffafbd" sw={2} />
                            </div>
                            <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(139, 126, 116, 0.65)", letterSpacing: "0.5px" }}>
                                MOOD CHECK-IN
                            </p>
                        </div>
                        <p style={{ fontSize: 15, color: "#5a4a42", fontWeight: 600, marginBottom: 6 }}>
                            Mood: <span style={{ textTransform: "capitalize", color: "#ff9a76" }}>{todayCheckIn.mood}</span>
                        </p>
                        {todayCheckIn.struggles && (
                            <p style={{ fontSize: 13, color: "rgba(139, 126, 116, 0.7)", lineHeight: 1.6, fontStyle: "italic" }}>
                                "{todayCheckIn.struggles}"
                            </p>
                        )}
                    </div>
                )}

                {/* Energy Level */}
                {typeof latestEnergy === "number" && (
                    <div className="glass" style={{
                        borderRadius: 16,
                        padding: 18,
                        marginBottom: 12,
                        minHeight: 120,
                        borderLeft: "5px solid #ffd56b",
                        background: "linear-gradient(135deg, rgba(255, 213, 107, 0.06) 0%, rgba(255, 255, 255, 0.9) 100%)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: "linear-gradient(135deg, rgba(255, 213, 107, 0.2), rgba(255, 230, 170, 0.1))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Icon name="zap" size={18} color="#ffd56b" sw={2} />
                            </div>
                            <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(139, 126, 116, 0.65)", letterSpacing: "0.5px" }}>
                                ENERGY LEVEL
                            </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <p style={{ fontSize: 32, fontWeight: 800, color: "#ffd56b", lineHeight: 1 }}>{latestEnergy}</p>
                            <p style={{ fontSize: 13, color: "rgba(139, 126, 116, 0.6)" }}>out of 5</p>
                        </div>
                    </div>
                )}

                {/* Habits Summary */}
                {activeHabits.length > 0 && (
                    <div className="glass" style={{
                        borderRadius: 16,
                        padding: 18,
                        marginBottom: 12,
                        minHeight: 120,
                        borderLeft: "5px solid #a8e6cf",
                        background: "linear-gradient(135deg, rgba(168, 230, 207, 0.06) 0%, rgba(255, 255, 255, 0.9) 100%)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: "linear-gradient(135deg, rgba(168, 230, 207, 0.2), rgba(198, 245, 210, 0.1))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Icon name="target" size={18} color="#a8e6cf" sw={2} />
                            </div>
                            <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(139, 126, 116, 0.65)", letterSpacing: "0.5px" }}>
                                HABITS
                            </p>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <p style={{ fontSize: 16, color: "#5a4a42", fontWeight: 600 }}>
                                <span style={{ color: "#a8e6cf", fontSize: 18, fontWeight: 800 }}>{doneHabits.length}</span>/{activeHabits.length} completed
                            </p>
                        </div>
                        {weeklyEligible.length > 0 && (
                            <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.7)", paddingTop: 6, borderTop: "1px solid rgba(168, 230, 207, 0.2)" }}>
                                Weekly goals: <span style={{ fontWeight: 700, color: "#a8e6cf" }}>{weeklyOnTrack.length}/{weeklyEligible.length}</span> on track
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Empty State */}
            {!hasSnapshot && (
                <div className="glass" style={{
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 12,
                    borderLeft: "4px solid rgba(139, 126, 116, 0.2)"
                }}>
                    <p style={{ fontSize: 13, color: "rgba(139, 126, 116, 0.7)", lineHeight: 1.6 }}>
                        No snapshot yet. Add a check-in, gratitude, or energy log to see today here.
                    </p>
                    <button
                        onClick={() => setShowCheckIn(true)}
                        style={{
                            marginTop: 10,
                            padding: "8px 12px",
                            borderRadius: 10,
                            background: "linear-gradient(135deg, #ffc3a0, #ffafbd)",
                            border: "none",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer"
                        }}
                    >
                        Start Daily Check-In
                    </button>
                </div>
            )}

            {/* Emotional Patterns */}
            {emotionalPatterns && (
                <div className="glass" style={{
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 12,
                    background: "linear-gradient(135deg, rgba(167, 139, 250, 0.05), rgba(139, 92, 246, 0.05))"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <Icon name="brain" size={16} color="#a78bfa" />
                        <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(139, 126, 116, 0.7)" }}>
                            AI Insights
                        </p>
                    </div>
                    <p style={{ fontSize: 13, color: "#5a4a42", lineHeight: 1.7 }}>
                        {emotionalPatterns}
                    </p>
                </div>
            )}

            {/* Auto Suggestions */}
            {autoSuggestions && autoSuggestions.length > 0 && (
                <div className="glass" style={{
                    borderRadius: 14,
                    padding: 16
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <Icon name="spark" size={16} color="#ff9a76" />
                        <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(139, 126, 116, 0.7)" }}>
                            Suggestions for You
                        </p>
                    </div>
                    {autoSuggestions.slice(0, 3).map((suggestion, i) => (
                        <div
                            key={i}
                            style={{
                                padding: "10px 12px",
                                background: "rgba(255, 154, 118, 0.05)",
                                borderRadius: 10,
                                marginBottom: i < 2 ? 8 : 0,
                                borderLeft: "3px solid #ff9a76"
                            }}
                        >
                            <p style={{ fontSize: 13, color: "#5a4a42" }}>
                                {suggestion}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* 1-MINUTE APP GUIDE MODAL */}
            {showGuide && (
                <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
                    <div className="glass" style={{ borderRadius: 24, padding: 24, width: "100%", maxWidth: 380, maxHeight: "85vh", overflowY: "auto", background: "rgba(255, 255, 255, 0.98)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <h3 style={{ fontSize: 20, fontFamily: "'Crimson Text', serif", fontWeight: 700, color: "#5a4a42", margin: 0 }}>📖 Saathi 1-Minute Guide</h3>
                            <button onClick={() => setShowGuide(false)} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "rgba(139,126,116,0.6)" }}>✕</button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13, color: "#5a4a42", lineHeight: 1.6 }}>
                            <div>
                                <strong>🏠 Home Tab (1st Page):</strong> Displays your daily overview, 24/7 morning/night briefing cards, and live emotional aura.
                            </div>
                            <div>
                                <strong>📌 Tasks & Priorities:</strong> Organize daily todo items with 1-click starter suggestions.
                            </div>
                            <div>
                                <strong>🔥 Habits & Routines:</strong> Track streaks and schedule daily/weekly habits with reminders.
                            </div>
                            <div>
                                <strong>🌿 Wellness:</strong> Journal gratitude, log mood timelines, practice 4-4-6 breathing, and view weekly insights.
                            </div>
                            <div>
                                <strong>📸 Memories:</strong> Save photo memories, view your 🌌 constellation sky, and write 💌 future time capsule letters.
                            </div>
                            <div>
                                <strong>📅 Calendar Journal:</strong> Browse and write daily reflections by date.
                            </div>
                            <div>
                                <strong>💬 Chat Companion:</strong> Text or 🎙️ Voice Call 24/7 with 4 customizable AI companion personas.
                            </div>
                        </div>

                        <button onClick={() => setShowGuide(false)} style={{ width: "100%", marginTop: 20, padding: "12px 0", borderRadius: 12, background: "linear-gradient(135deg, #a8e6cf, #dcedc1)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                            Got It! ✨
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}