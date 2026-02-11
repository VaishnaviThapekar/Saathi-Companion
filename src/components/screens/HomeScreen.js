import { useState } from "react";



// Helper functions - these should match what's in your App.js
const todayKey = () => new Date().toISOString().slice(0, 10);
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
    const [mood, setMood] = useState("");
    const [struggles, setStruggles] = useState("");

    const today = todayKey();
    const needsCheckIn = lastCheckInDate !== today;

    const activeTasks = tasks.filter(t => !t.done).length;
    const completedToday = tasks.filter(t => t.done && t.lastCompleted?.startsWith(today)).length;
    const todayGratitude = gratitude[today];
    const todayEnergyEntries = energyLog[today] || [];
    const latestEnergy = todayEnergyEntries[todayEnergyEntries.length - 1]?.level;
    const activeHabits = habits.filter(h => !h.archived);
    const doneHabits = activeHabits.filter(h => (h.completions || []).includes(today));

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
        setMoodLog(p => [...p, entry]);
        setDailyCheckIn(entry);
        setLastCheckInDate(today);
        setShowCheckIn(false);
        setMood("");
        setStruggles("");
    };


    return (
        <div style={{ padding: "0 0 20px" }}>
            {/* HERO SECTION WITH LOGO */}
            <div style={{
                background: "linear-gradient(135deg, #ffc3a0 0%, #ffafbd 50%, #c3aed6 100%)",
                padding: "48px 24px 32px",
                borderRadius: "0 0 32px 32px",
                marginBottom: 24,
                position: "relative",
                overflow: "hidden"
            }}>
                {/* Decorative circles */}
                <div style={{
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)"
                }} />
                <div style={{
                    position: "absolute",
                    bottom: -30,
                    left: -30,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)"
                }} />

                {/* LOGO */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1
                }}>
                    {/* Logo Icon */}
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        background: "linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.9) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16,
                        boxShadow: "0 8px 32px rgba(255, 175, 189, 0.4)",
                        border: "3px solid rgba(255, 255, 255, 0.5)"
                    }}>
                        <Icon name="heart" size={40} color="#ff9a76" sw={2} />
                    </div>

                    {/* App Name */}
                    <h1 style={{
                        fontSize: 32,
                        fontFamily: "'Crimson Text', serif",
                        fontWeight: 600,
                        color: "#fff",
                        marginBottom: 8,
                        textShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        letterSpacing: "0.5px"
                    }}>
                        Saathi
                    </h1>

                    {/* Tagline */}
                    <p style={{
                        fontSize: 14,
                        color: "rgba(255, 255, 255, 0.9)",
                        marginBottom: 20,
                        textAlign: "center",
                        maxWidth: 280,
                        lineHeight: 1.5
                    }}>
                        Your personal space for growth, reflection, and wellness
                    </p>

                    {/* Greeting */}
                    <div style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 16,
                        padding: "12px 24px",
                        border: "1px solid rgba(255, 255, 255, 0.3)"
                    }}>
                        <p style={{
                            fontSize: 16,
                            color: "#fff",
                            fontWeight: 600
                        }}>
                            {getGreeting()}, {userName}! ✨
                        </p>
                    </div>
                </div>
            </div>

            {/* QUICK STATS CARDS */}
            <div style={{ padding: "0 20px", marginBottom: 20 }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 12
                }}>
                    {/* Active Tasks */}
                    <div className="glass" style={{
                        borderRadius: 16,
                        padding: 16,
                        borderLeft: "4px solid #ffc3a0"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <Icon name="tasks" size={18} color="#ffc3a0" />
                            <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.7)", fontWeight: 600 }}>Active Tasks</p>
                        </div>
                        <p style={{ fontSize: 28, fontWeight: 700, color: "#5a4a42" }}>{activeTasks}</p>
                    </div>

                    {/* Completed Today */}
                    <div className="glass" style={{
                        borderRadius: 16,
                        padding: 16,
                        borderLeft: "4px solid #a8e6cf"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <Icon name="check" size={18} color="#a8e6cf" />
                            <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.7)", fontWeight: 600 }}>Done Today</p>
                        </div>
                        <p style={{ fontSize: 28, fontWeight: 700, color: "#5a4a42" }}>{completedToday}</p>
                    </div>
                </div>
            </div>


            {/* DAILY CHECK-IN PROMPT */}
            {needsCheckIn && !showCheckIn && (
                <div style={{ padding: "0 20px", marginBottom: 20 }}>
                    <div className="glass" style={{
                        borderRadius: 16,
                        padding: 20,
                        background: "linear-gradient(135deg, rgba(255, 195, 160, 0.1), rgba(255, 175, 189, 0.1))",
                        border: "2px solid rgba(255, 195, 160, 0.3)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                background: "linear-gradient(135deg, #ffc3a0, #ffafbd)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Icon name="smile" size={24} color="#fff" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#5a4a42", marginBottom: 4 }}>
                                    How are you today?
                                </h3>
                                <p style={{ fontSize: 13, color: "rgba(139, 126, 116, 0.7)" }}>
                                    Take a moment to check in with yourself
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCheckIn(true)}
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: 12,
                                background: "linear-gradient(135deg, #ffc3a0, #ffafbd)",
                                border: "none",
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(255, 175, 189, 0.3)"
                            }}
                        >
                            Start Daily Check-In
                        </button>
                    </div>
                </div>
            )}

            {/* CHECK-IN FORM */}
            {showCheckIn && (
                <div style={{ padding: "0 20px", marginBottom: 20 }}>
                    <div className="glass" style={{ borderRadius: 16, padding: 20 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: "#8b7e74", marginBottom: 16 }}>
                            Daily Check-In
                        </h3>

                        <label style={{ display: "block", fontSize: 13, color: "#5a4a42", fontWeight: 600, marginBottom: 8 }}>
                            How are you feeling today?
                        </label>
                        <select
                            value={mood}
                            onChange={e => setMood(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: 12,
                                border: "1px solid rgba(255, 195, 160, 0.3)",
                                background: "rgba(255, 255, 255, 0.6)",
                                fontSize: 14,
                                marginBottom: 16,
                                outline: "none",
                                color: "#5a4a42"
                            }}
                        >
                            <option value="">Select your mood...</option>
                            <option value="amazing">😄 Amazing</option>
                            <option value="good">😊 Good</option>
                            <option value="okay">😐 Okay</option>
                            <option value="struggling">😔 Struggling</option>
                            <option value="overwhelmed">😰 Overwhelmed</option>
                        </select>

                        <label style={{ display: "block", fontSize: 13, color: "#5a4a42", fontWeight: 600, marginBottom: 8 }}>
                            What's on your mind? (Optional)
                        </label>
                        <textarea
                            value={struggles}
                            onChange={e => setStruggles(e.target.value)}
                            placeholder="Share what you're experiencing..."
                            rows={4}
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: 12,
                                border: "1px solid rgba(255, 195, 160, 0.3)",
                                background: "rgba(255, 255, 255, 0.6)",
                                fontSize: 14,
                                marginBottom: 16,
                                outline: "none",
                                resize: "none",
                                color: "#5a4a42",
                                fontFamily: "'Quicksand', sans-serif"
                            }}
                        />

                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={() => setShowCheckIn(false)}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: 12,
                                    background: "rgba(139, 126, 116, 0.1)",
                                    border: "none",
                                    color: "rgba(139, 126, 116, 0.7)",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: "pointer"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitCheckIn}
                                disabled={!mood}
                                style={{
                                    flex: 2,
                                    padding: "12px",
                                    borderRadius: 12,
                                    background: mood ? "linear-gradient(135deg, #ffc3a0, #ffafbd)" : "rgba(139, 126, 116, 0.2)",
                                    border: "none",
                                    color: "#fff",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: mood ? "pointer" : "not-allowed"
                                }}
                            >
                                Complete Check-In
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TODAY'S SNAPSHOT */}
            <div style={{ padding: "0 20px" }}>
                <h3 style={{
                    fontSize: 20,
                    fontFamily: "'Crimson Text', serif",
                    fontWeight: 600,
                    color: "#8b7e74",
                    marginBottom: 16,
                    fontStyle: "italic"
                }}>
                    Today's Snapshot
                </h3>

                {/* Gratitude */}
                {todayGratitude && (
                    <div className="glass" style={{
                        borderRadius: 14,
                        padding: 16,
                        marginBottom: 12,
                        borderLeft: "4px solid #a8e6cf"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <Icon name="star" size={16} color="#a8e6cf" />
                            <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(139, 126, 116, 0.7)" }}>
                                Today's Gratitude
                            </p>
                        </div>
                        <p style={{ fontSize: 14, color: "#5a4a42", lineHeight: 1.6 }}>
                            {todayGratitude}
                        </p>
                    </div>
                )}

                {/* Energy Level */}
                {typeof latestEnergy === "number" && (
                    <div className="glass" style={{
                        borderRadius: 14,
                        padding: 16,
                        marginBottom: 12,
                        borderLeft: "4px solid #ffd56b"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <Icon name="zap" size={16} color="#ffd56b" />
                            <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(139, 126, 116, 0.7)" }}>
                                Energy Level
                            </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                                flex: 1,
                                height: 8,
                                borderRadius: 4,
                                background: "rgba(255, 213, 107, 0.2)"
                            }}>
                                <div style={{
                                    width: `${latestEnergy * 20}%`,
                                    height: "100%",
                                    borderRadius: 4,
                                    background: "linear-gradient(90deg, #ffd56b, #ffa94d)",
                                    transition: "width 0.3s"
                                }} />
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#5a4a42" }}>
                                {latestEnergy}/5
                            </span>
                        </div>
                    </div>
                )}

                {/* Habits Summary */}
                {activeHabits.length > 0 && (
                    <div className="glass" style={{
                        borderRadius: 14,
                        padding: 16,
                        marginBottom: 12,
                        borderLeft: "4px solid #a8e6cf"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <Icon name="target" size={16} color="#a8e6cf" />
                            <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(139, 126, 116, 0.7)" }}>
                                Habits Today
                            </p>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <p style={{ fontSize: 14, color: "#5a4a42" }}>
                                {doneHabits.length}/{activeHabits.length} completed
                            </p>
                            <p style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.5)" }}>
                                Keep your streak alive
                            </p>
                        </div>
                        {weeklyEligible.length > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.7)" }}>
                                    Weekly goals on track
                                </p>
                                <p style={{ fontSize: 12, color: "#5a4a42", fontWeight: 600 }}>
                                    {weeklyOnTrack.length}/{weeklyEligible.length}
                                </p>
                            </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <p style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.5)" }}>View all habits</p>
                            <button onClick={() => setTab("habits")} style={{ background: "none", border: "none", color: "#ff9a76", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                Open
                            </button>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {activeHabits.slice(0, 4).map(h => {
                                const done = (h.completions || []).includes(today);
                                return (
                                    <button
                                        key={h.id}
                                        onClick={() => setHabits(p => p.map(x => {
                                            if (x.id !== h.id) return x;
                                            const hasToday = (x.completions || []).includes(today);
                                            const next = hasToday ? x.completions.filter(d => d !== today) : [...(x.completions || []), today];
                                            return { ...x, completions: next };
                                        }))}
                                        style={{ padding: "6px 8px", borderRadius: 10, border: "none", background: done ? "rgba(168, 230, 207, 0.25)" : "rgba(139, 126, 116, 0.08)", color: "#5a4a42", fontSize: 11, cursor: "pointer" }}
                                    >
                                        {done ? "✓" : "○"} {h.title}
                                    </button>
                                );
                            })}
                        </div>
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
            </div>
        </div>
    );
}