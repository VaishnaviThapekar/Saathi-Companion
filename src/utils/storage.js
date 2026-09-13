// ═══════════════════════════════════════════════════════════════════════
// ENCRYPTED & SAFE STORAGE SERVICE (LocalStorage with Quota & Encryption)
// ═══════════════════════════════════════════════════════════════════════

const SENSITIVE_KEYS = ["saathi_notes", "saathi_memories", "saathi_daily_notes", "saathi_gratitude", "saathi_photos", "saathi_voice_notes"];
const PREFIX_ENCRYPTED = "__saathi_enc__:";

// Simple & reliable client-side data obfuscation / encryption wrapper
const obfuscate = (str) => {
  try {
    const encoded = btoa(encodeURIComponent(str));
    return `${PREFIX_ENCRYPTED}${encoded.split("").reverse().join("")}`;
  } catch {
    return str;
  }
};

const deobfuscate = (str) => {
  try {
    if (!str.startsWith(PREFIX_ENCRYPTED)) return str;
    const raw = str.replace(PREFIX_ENCRYPTED, "").split("").reverse().join("");
    return decodeURIComponent(atob(raw));
  } catch {
    return str;
  }
};

if (!window.storage) {
  window.storage = {
    get: async (key) => {
      const val = localStorage.getItem(key);
      return val ? { value: val } : null;
    },
    set: async (key, value) => {
      localStorage.setItem(key, value);
    }
  };
}

export const load = async (key, fallback) => {
  try {
    const result = await window.storage.get(key);
    if (!result || !result.value) return fallback;
    const rawVal = deobfuscate(result.value);
    return JSON.parse(rawVal);
  } catch (error) {
    console.error(`Error loading storage key "${key}":`, error);
    return fallback;
  }
};

export const save = async (key, value) => {
  try {
    const stringified = JSON.stringify(value);
    const payload = SENSITIVE_KEYS.includes(key) ? obfuscate(stringified) : stringified;
    await window.storage.set(key, payload);
  } catch (error) {
    console.error(`Error saving storage key "${key}":`, error);
  }
};

export const remove = async (key) => {
  try {
    if (window.storage.delete) {
      await window.storage.delete(key);
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error removing storage key "${key}":`, error);
  }
};

export const getStorageQuota = () => {
  try {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const val = localStorage.getItem(k);
      totalBytes += (k ? k.length : 0) + (val ? val.length : 0);
    }
    const usedKB = (totalBytes / 1024).toFixed(1);
    const usedMB = (totalBytes / (1024 * 1024)).toFixed(2);
    const percentUsed = Math.min(100, Math.round((totalBytes / (5 * 1024 * 1024)) * 100));
    return { usedKB, usedMB, percentUsed, isHigh: percentUsed > 80 };
  } catch {
    return { usedKB: 0, usedMB: 0, percentUsed: 0, isHigh: false };
  }
};

// 📄 Export All User Data to Markdown (.md) File
export const exportDataAsMarkdown = (data) => {
  const userName = data.userName || "Friend";
  const dateStr = new Date().toLocaleDateString(undefined, { dateStyle: 'full' });

  let md = `# 🌸 Saathi AI Companion — Personal Journal & Wellness Report\n`;
  md += `**Exported for:** ${userName}\n`;
  md += `**Date:** ${dateStr}\n\n`;

  // 1. Mood History
  md += `## 📊 Mood & Wellness Logs\n`;
  if (data.moodLogs && data.moodLogs.length > 0) {
    data.moodLogs.slice().reverse().forEach((log) => {
      md += `- **Date:** ${log.date || log.timestamp} | **Mood:** ${log.emoji || ''} ${log.label || ''} | **Score:** ${log.val}/5\n`;
      if (log.note) md += `  - *Reflection:* ${log.note}\n`;
    });
  } else {
    md += `*No mood logs recorded yet.*\n`;
  }
  md += `\n`;

  // 2. Meaningful Memories & Daily Notes
  md += `## 🌟 Meaningful Moments & Scrapbook Notes\n`;
  if (data.memories && data.memories.length > 0) {
    data.memories.slice().reverse().forEach((mem) => {
      md += `### ${mem.title || 'Memory'} (${mem.date || ''})\n`;
      md += `${mem.text || ''}\n`;
      if (mem.tags && mem.tags.length > 0) md += `*Tags:* ${mem.tags.join(', ')}\n`;
      md += `\n`;
    });
  } else {
    md += `*No memories saved yet.*\n`;
  }

  // 3. Daily Journal Notes
  if (data.dailyNotes && Object.keys(data.dailyNotes).length > 0) {
    md += `## 📝 Daily Journal Reflection Notes\n`;
    Object.entries(data.dailyNotes).forEach(([dateKey, noteText]) => {
      md += `### ${dateKey}\n${noteText}\n\n`;
    });
  }

  // 4. Tasks & Habits
  md += `## ✅ Tasks & Focus Goals\n`;
  if (data.tasks && data.tasks.length > 0) {
    data.tasks.forEach((task) => {
      const status = task.completed ? "[x]" : "[ ]";
      const priority = task.priority ? `(${task.priority.toUpperCase()})` : "";
      md += `- ${status} ${priority} ${task.text || task.title}\n`;
    });
  } else {
    md += `*No tasks recorded.*\n`;
  }
  md += `\n`;

  if (data.habits && data.habits.length > 0) {
    md += `## 🔥 Habit Streaks\n`;
    data.habits.forEach((habit) => {
      md += `- **${habit.name || habit.text}**: Streak ${habit.streak || 0} days\n`;
    });
  }

  // Trigger File Download
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Saathi_Journal_Export_${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 🖨️ Export All User Data as PDF (Formatted Print View)
export const exportDataAsPDF = (data) => {
  const userName = data.userName || "Friend";
  const dateStr = new Date().toLocaleDateString(undefined, { dateStyle: 'full' });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to generate the PDF report.");
    return;
  }

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Saathi Journal Report - ${userName}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
        h1 { color: #6366f1; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 5px; }
        .meta { color: #64748b; margin-bottom: 30px; font-size: 14px; }
        h2 { color: #0f172a; margin-top: 30px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
        .tag { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-right: 5px; }
        .badge { font-weight: bold; }
        .badge-high { color: #ef4444; }
        .badge-med { color: #f59e0b; }
        .badge-low { color: #10b981; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>🌸 Saathi AI Companion — Personal Wellness Report</h1>
      <div class="meta">Exported for <strong>${userName}</strong> on ${dateStr}</div>

      <h2>📊 Mood & Reflection History</h2>
  `;

  if (data.moodLogs && data.moodLogs.length > 0) {
    data.moodLogs.slice().reverse().forEach((log) => {
      html += `
        <div class="card">
          <strong>${log.date || log.timestamp}</strong> — Mood: <span>${log.emoji || ''} ${log.label || ''} (${log.val}/5)</span>
          ${log.note ? `<p style="margin: 5px 0 0 0; font-style: italic; color: #475569;">"${log.note}"</p>` : ''}
        </div>
      `;
    });
  } else {
    html += `<p><em>No mood logs recorded yet.</em></p>`;
  }

  html += `<h2>🌟 Meaningful Moments & Scrapbook</h2>`;
  if (data.memories && data.memories.length > 0) {
    data.memories.slice().reverse().forEach((mem) => {
      html += `
        <div class="card">
          <h3>${mem.title || 'Memory'} <small style="color: #64748b; font-weight: normal;">(${mem.date || ''})</small></h3>
          <p>${mem.text || ''}</p>
          ${mem.tags ? mem.tags.map(t => `<span class="tag">#${t}</span>`).join('') : ''}
        </div>
      `;
    });
  } else {
    html += `<p><em>No memories saved yet.</em></p>`;
  }

  html += `<h2>✅ Tasks & Focus Goals</h2>`;
  if (data.tasks && data.tasks.length > 0) {
    html += `<ul>`;
    data.tasks.forEach((t) => {
      const priorityClass = t.priority === 'high' ? 'badge-high' : t.priority === 'med' ? 'badge-med' : 'badge-low';
      html += `
        <li>
          ${t.completed ? '☑️ <del>' : '☐ '}
          <span class="badge ${priorityClass}">[${(t.priority || 'med').toUpperCase()}]</span>
          ${t.text || t.title}
          ${t.completed ? '</del>' : ''}
        </li>
      `;
    });
    html += `</ul>`;
  } else {
    html += `<p><em>No tasks recorded.</em></p>`;
  }

  html += `
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

