// ═══════════════════════════════════════════════════════════════════════
// SAATHI WEEKLY REFLECTION PDF REPORT EXPORTER (Zero Dependencies)
// Generates a 7-day mood breakdown, habit completion summary & proud moments
// ═══════════════════════════════════════════════════════════════════════

export const exportWeeklyReflectionPDF = ({
  userName = "Friend",
  moodLog = [],
  habits = [],
  tasks = [],
  meaningfulMoments = [],
  gratitude = {},
  dailyNotes = {}
}) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  // 1. Filter Past 7 Days Data
  const weeklyMoods = moodLog.filter(m => m.date >= sevenDaysAgoStr);
  const weeklyMoments = meaningfulMoments.filter(m => m.timestamp && new Date(m.timestamp) >= sevenDaysAgo);
  const completedTasksWeekly = tasks.filter(t => t.done);

  // Calculate 7-day habit completion stats
  let totalHabitCompletions = 0;
  habits.forEach(h => {
    if (h.completions) {
      const recentCompletions = h.completions.filter(dateKey => dateKey >= sevenDaysAgoStr);
      totalHabitCompletions += recentCompletions.length;
    }
  });

  // Calculate top mood
  const moodCounts = {};
  weeklyMoods.forEach(m => {
    const label = m.label || "Good";
    moodCounts[label] = (moodCounts[label] || 0) + 1;
  });
  let topMood = "Peaceful";
  let topMoodCount = 0;
  Object.entries(moodCounts).forEach(([label, count]) => {
    if (count > topMoodCount) {
      topMood = label;
      topMoodCount = count;
    }
  });

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate your Weekly Reflection PDF Report.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Saathi Weekly Reflection Report - ${userName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 36px;
          color: #2d3748;
          background: #faf5f0;
        }
        .header-card {
          background: linear-gradient(135deg, #ffc3a0 0%, #ffafbd 100%);
          border-radius: 20px;
          padding: 24px 30px;
          color: #ffffff;
          margin-bottom: 24px;
          box-shadow: 0 8px 24px rgba(255, 175, 189, 0.3);
        }
        .header-card h1 {
          margin: 0 0 6px 0;
          font-size: 26px;
          font-family: Georgia, serif;
          font-style: italic;
        }
        .header-card p {
          margin: 0;
          font-size: 13px;
          opacity: 0.95;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 16px 20px;
          border: 1px solid rgba(255, 195, 160, 0.4);
          text-align: center;
        }
        .stat-card .val {
          font-size: 24px;
          font-weight: 700;
          color: #6366f1;
          margin-bottom: 4px;
        }
        .stat-card .lbl {
          font-size: 11px;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .section-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255, 195, 160, 0.3);
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: #4a5568;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .moment-item {
          background: #fdf6f0;
          border-left: 4px solid #ff9a76;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 8px;
          font-size: 13px;
          color: #4a5568;
        }
        .footer {
          margin-top: 32px;
          text-align: center;
          font-size: 11px;
          color: #a0aec0;
        }
        @media print {
          body { background: #ffffff; padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header-card">
        <h1>🌸 Weekly Reflection Report</h1>
        <p>Prepared for <strong>${userName}</strong> &bull; ${sevenDaysAgo.toLocaleDateString()} &ndash; ${now.toLocaleDateString()}</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="val">${topMood}</div>
          <div class="lbl">Primary Mood</div>
        </div>
        <div class="stat-card">
          <div class="val">${totalHabitCompletions}</div>
          <div class="lbl">Habit Streaks Met</div>
        </div>
        <div class="stat-card">
          <div class="val">${completedTasksWeekly.length}</div>
          <div class="lbl">Tasks Completed</div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-title">🌟 Meaningful Moments Saved (${weeklyMoments.length})</div>
        ${weeklyMoments.length === 0 ? '<p style="font-size:12px; color:#a0aec0; font-style:italic;">No moments recorded this week.</p>' : ''}
        ${weeklyMoments.map(m => `
          <div class="moment-item">
            <strong>${m.emotion || "Reflection"}</strong> &ndash; "${m.text || ""}"
            <div style="font-size:10px; color:#a0aec0; margin-top:3px;">${new Date(m.timestamp).toLocaleDateString()}</div>
          </div>
        `).join("")}
      </div>

      <div class="section-card">
        <div class="section-title">🎯 Active Habit Summary (${habits.length})</div>
        ${habits.map(h => `
          <div style="display:flex; justify-content:space-between; font-size:13px; padding:8px 0; border-bottom:1px solid #edf2f7;">
            <span>${h.title}</span>
            <span style="font-weight:700; color:#6366f1;">${(h.completions || []).filter(k => k >= sevenDaysAgoStr).length} check-ins</span>
          </div>
        `).join("")}
      </div>

      <div class="footer">
        Generated with ❤️ by Saathi AI Companion &bull; Private & Offline Local Data
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
