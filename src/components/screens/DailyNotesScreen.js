import { useState, useEffect } from "react";
import Icon from "../common/Icon";

/**
 * DAILY NOTES SCREEN
 * Interactive calendar with note-taking for each day
 * - Auto-selects today's date
 * - Navigate between months
 * - Highlights days with notes
 * - Auto-saves notes
 */

export default function DailyNotesScreen({ dailyNotes, setDailyNotes }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [noteText, setNoteText] = useState("");

    // Helper to get date key (YYYY-MM-DD)
    const dateKey = (date) => date.toISOString().slice(0, 10);

    // Load note for selected date
    useEffect(() => {
        const key = dateKey(selectedDate);
        setNoteText(dailyNotes[key] || "");
    }, [selectedDate, dailyNotes]);

    // Save note for selected date
    const saveNote = () => {
        const key = dateKey(selectedDate);
        if (noteText.trim()) {
            setDailyNotes(prev => ({ ...prev, [key]: noteText.trim() }));
        } else {
            // Remove note if empty
            const updated = { ...dailyNotes };
            delete updated[key];
            setDailyNotes(updated);
        }
    };

    // Calculate days in month
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    // Render calendar grid
    const renderCalendar = () => {
        const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
        const days = [];
        const today = new Date();
        const todayKey = dateKey(today);

        // Empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} style={{ padding: 10 }} />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const key = dateKey(date);
            const isSelected = dateKey(selectedDate) === key;
            const isToday = todayKey === key;
            const hasNote = dailyNotes[key];

            days.push(
                <button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    style={{
                        padding: 10,
                        borderRadius: 8,
                        border: isSelected ? "2px solid #ffc3a0" : "1px solid rgba(139, 126, 116, 0.1)",
                        background: isSelected
                            ? "linear-gradient(135deg, #ffc3a0, #ffafbd)"
                            : isToday
                                ? "rgba(255, 195, 160, 0.1)"
                                : hasNote
                                    ? "rgba(168, 230, 207, 0.1)"
                                    : "transparent",
                        color: isSelected ? "#fff" : "#5a4a42",
                        fontSize: 13,
                        fontWeight: isToday ? 700 : 500,
                        cursor: "pointer",
                        position: "relative",
                        transition: "all 0.2s"
                    }}
                >
                    {day}
                    {hasNote && !isSelected && (
                        <div style={{
                            position: "absolute",
                            bottom: 3,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            background: "#a8e6cf"
                        }} />
                    )}
                </button>
            );
        }

        return days;
    };

    // Navigate months
    const changeMonth = (direction) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    };

    // Jump to today
    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        setSelectedDate(today);
    };

    // Format selected date for display
    const formatSelectedDate = () => {
        return selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format month/year for calendar header
    const formatMonthYear = () => {
        return currentMonth.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    };

    return (
        <div style={{ padding: "24px 20px 0" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{
                    fontSize: 24,
                    fontFamily: "'Crimson Text', serif",
                    fontWeight: 400,
                    fontStyle: "italic",
                    color: "#8b7e74"
                }}>
                    Daily Notes
                </h2>
                <button
                    onClick={goToToday}
                    style={{
                        padding: "8px 16px",
                        borderRadius: 12,
                        background: "rgba(168, 230, 207, 0.15)",
                        border: "1px solid rgba(168, 230, 207, 0.3)",
                        color: "#a8e6cf",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                    }}
                >
                    <Icon name="calendar" size={14} />
                    Today
                </button>
            </div>

            {/* Calendar */}
            <div className="glass" style={{ borderRadius: 16, padding: 16, marginBottom: 16 }}>
                {/* Month Navigation */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16
                }}>
                    <button
                        onClick={() => changeMonth(-1)}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            border: "1px solid rgba(139, 126, 116, 0.2)",
                            background: "rgba(255, 255, 255, 0.5)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#5a4a42",
                            fontSize: 16,
                            fontWeight: 600
                        }}
                    >
                        ←
                    </button>

                    <p style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#8b7e74",
                        fontFamily: "'Crimson Text', serif"
                    }}>
                        {formatMonthYear()}
                    </p>

                    <button
                        onClick={() => changeMonth(1)}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            border: "1px solid rgba(139, 126, 116, 0.2)",
                            background: "rgba(255, 255, 255, 0.5)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#5a4a42",
                            fontSize: 16,
                            fontWeight: 600
                        }}
                    >
                        →
                    </button>
                </div>

                {/* Day Headers */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 4,
                    marginBottom: 8
                }}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div
                            key={day}
                            style={{
                                textAlign: "center",
                                fontSize: 11,
                                color: "rgba(139, 126, 116, 0.5)",
                                fontWeight: 600,
                                padding: "4px 0"
                            }}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 4
                }}>
                    {renderCalendar()}
                </div>

                {/* Legend */}
                <div style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(139, 126, 116, 0.1)",
                    fontSize: 11,
                    color: "rgba(139, 126, 116, 0.6)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            background: "#a8e6cf"
                        }} />
                        Has note
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            border: "2px solid #ffc3a0"
                        }} />
                        Selected
                    </div>
                </div>
            </div>

            {/* Note Editor */}
            <div className="glass" style={{ borderRadius: 16, padding: 16 }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12
                }}>
                    <p style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#8b7e74"
                    }}>
                        {formatSelectedDate()}
                    </p>
                    {noteText && (
                        <span style={{
                            fontSize: 11,
                            color: "rgba(139, 126, 116, 0.5)"
                        }}>
                            {noteText.length} characters
                        </span>
                    )}
                </div>

                <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onBlur={saveNote}
                    placeholder="Write your thoughts for this day..."
                    rows={8}
                    style={{
                        width: "100%",
                        background: "rgba(255, 255, 255, 0.6)",
                        border: "1px solid rgba(255, 195, 160, 0.25)",
                        borderRadius: 12,
                        padding: "12px 14px",
                        color: "#5a4a42",
                        fontSize: 14,
                        outline: "none",
                        resize: "vertical",
                        lineHeight: 1.6,
                        fontFamily: "'Quicksand', sans-serif"
                    }}
                />

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12
                }}>
                    <button
                        onClick={saveNote}
                        style={{
                            padding: "10px 24px",
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #ffc3a0, #ffafbd)",
                            border: "none",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer"
                        }}
                    >
                        Save Note
                    </button>

                    {dailyNotes[dateKey(selectedDate)] && (
                        <button
                            onClick={() => {
                                setNoteText("");
                                const updated = { ...dailyNotes };
                                delete updated[dateKey(selectedDate)];
                                setDailyNotes(updated);
                            }}
                            style={{
                                padding: "8px 16px",
                                borderRadius: 10,
                                background: "rgba(255, 154, 118, 0.1)",
                                border: "1px solid rgba(255, 154, 118, 0.2)",
                                color: "#ff9a76",
                                fontSize: 12,
                                cursor: "pointer"
                            }}
                        >
                            Delete Note
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{
                marginTop: 16,
                padding: "12px 16px",
                background: "rgba(168, 230, 207, 0.1)",
                borderRadius: 12,
                border: "1px solid rgba(168, 230, 207, 0.2)"
            }}>
                <p style={{ fontSize: 12, color: "#5a4a42" }}>
                    📝 <strong>{Object.keys(dailyNotes).length}</strong> notes saved •
                    <strong> {Object.keys(dailyNotes).filter(key => {
                        const noteDate = new Date(key);
                        return noteDate.getMonth() === currentMonth.getMonth() &&
                            noteDate.getFullYear() === currentMonth.getFullYear();
                    }).length}</strong> this month
                </p>
            </div>
        </div>
    );
}