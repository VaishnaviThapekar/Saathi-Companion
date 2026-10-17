import { useState, useMemo } from "react";
import { analyzeJournalReflection } from "../../utils/ai";
import { playTaskComplete, playChimeSound } from "../../services/soundService";

export const JOURNAL_TEMPLATES = [
  {
    id: "cbt",
    name: "CBT Anxiety De-escalator",
    icon: "🧘",
    subtitle: "Untangle catastrophic worries with balanced evidence",
    category: "Mental Health & CBT",
    color: "#f59e0b",
    steps: [
      {
        id: "trigger",
        title: "1. The Trigger",
        prompt: "What situation, interaction, or thought triggered this wave of anxiety or stress?",
        placeholder: "E.g., I have an upcoming presentation and I'm worrying about making mistakes..."
      },
      {
        id: "catastrophe",
        title: "2. The Worst-Case Fear",
        prompt: "What is the extreme fear or catastrophic scenario your mind is predicting?",
        placeholder: "E.g., Everyone will think I'm unqualified, I'll freeze up, and it'll ruin my reputation..."
      },
      {
        id: "evidence",
        title: "3. Objective Evidence & Realistic Outcome",
        prompt: "What facts challenge this fear? What is the most realistic, probable outcome?",
        placeholder: "E.g., I've prepared thoroughly. Even if I stumble, people are understanding. Stumbling is human, not catastrophic..."
      },
      {
        id: "reframe",
        title: "4. Compassionate Balanced Reframe",
        prompt: "What is a supportive, balanced perspective you can repeat to yourself?",
        placeholder: "E.g., I am well-prepared. Perfection isn't required to deliver value. I can handle whatever happens..."
      }
    ]
  },
  {
    id: "stoic",
    name: "Stoic Evening Reflection",
    icon: "🏛️",
    subtitle: "Marcus Aurelius review of virtues & control",
    category: "Wisdom & Philosophy",
    color: "#8b5cf6",
    steps: [
      {
        id: "virtue",
        title: "1. Victories of Character",
        prompt: "What went well today, and where did you show patience, kindness, or discipline?",
        placeholder: "E.g., I stayed calm when an unexpected delay happened and didn't react with anger..."
      },
      {
        id: "control",
        title: "2. The Sphere of Control",
        prompt: "What caused you friction or frustration, and was it truly within your control?",
        placeholder: "E.g., Another person's rude mood bothered me. Their behavior is outside my control; my reaction is within my control..."
      },
      {
        id: "lesson",
        title: "3. The Guiding Lesson",
        prompt: "What lesson from today will make you more centered tomorrow?",
        placeholder: "E.g., Protect morning quiet time, and remember that other people's actions are reflections of their own struggles..."
      }
    ]
  },
  {
    id: "gratitude",
    name: "Deep Savoring & Gratitude",
    icon: "🌸",
    subtitle: "Anchor positive micro-moments to rewire your brain",
    category: "Joy & Mindfulness",
    color: "#ec4899",
    steps: [
      {
        id: "moments",
        title: "1. Three Micro-Moments",
        prompt: "Name 3 small, specific moments or simple things that brought warmth today.",
        placeholder: "1. The smell of fresh coffee in the morning\n2. A kind text from a friend\n3. The golden evening sunlight through the window"
      },
      {
        id: "sensory",
        title: "2. The Sensory Feeling",
        prompt: "Pick one moment and describe the exact feeling or sensation in your body.",
        placeholder: "E.g., Sitting with that warm cup felt grounding and peaceful; my shoulders finally relaxed..."
      },
      {
        id: "carry",
        title: "3. Carrying the Abundance",
        prompt: "How can you pass a little bit of this warmth to someone else or carry it forward tomorrow?",
        placeholder: "E.g., I'll send a genuine appreciation message to a teammate tomorrow..."
      }
    ]
  },
  {
    id: "clarity",
    name: "Morning Clarity Sprint",
    icon: "🚀",
    subtitle: "Single core priority, obstacle prep, and daily anchor",
    category: "Focus & Intentionality",
    color: "#06b6d4",
    steps: [
      {
        id: "priority",
        title: "1. The Core Priority",
        prompt: "If you could only accomplish ONE single priority today to feel satisfied, what is it?",
        placeholder: "E.g., Finalize the research summary draft..."
      },
      {
        id: "obstacle",
        title: "2. Anticipated Hurdle & Response",
        prompt: "What distraction or obstacle might arise, and how will you handle it?",
        placeholder: "E.g., Afternoon notifications. I will put my phone on Do Not Disturb for 45 minutes..."
      },
      {
        id: "anchor",
        title: "3. Daily Anchor Mantra",
        prompt: "What one word or intention will anchor your energy today?",
        placeholder: "E.g., 'Presence' — do one thing at a time with full care."
      }
    ]
  },
  {
    id: "free",
    name: "Heart Dump & Free Flow",
    icon: "✍️",
    subtitle: "Unfiltered stream of consciousness & heart check-in",
    category: "Self-Compassion",
    color: "#10b981",
    steps: [
      {
        id: "stream",
        title: "1. Unfiltered Brain Dump",
        prompt: "Write whatever is on your mind without filtering, judging, or correcting grammar.",
        placeholder: "Let your thoughts flow onto the page freely..."
      },
      {
        id: "heart",
        title: "2. Heart Check-In",
        prompt: "If your heart or inner child could speak right now, what does it need most?",
        placeholder: "E.g., It needs reassurance that it's okay to slow down and rest..."
      }
    ]
  }
];

export default function GuidedJournalingStudio({
  isOpen = false,
  onClose,
  onSaveToJournal,
  userName = "friend",
  dateStr = new Date().toISOString().slice(0, 10),
  showToast
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState("cbt");
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showCoachAnalysis, setShowCoachAnalysis] = useState(false);

  const template = useMemo(() => {
    return JOURNAL_TEMPLATES.find(t => t.id === selectedTemplateId) || JOURNAL_TEMPLATES[0];
  }, [selectedTemplateId]);

  const currentStep = template.steps[currentStepIdx] || template.steps[0];

  const handleAnswerChange = (stepId, text) => {
    setAnswers(prev => ({ ...prev, [stepId]: text }));
  };

  const handleSelectTemplate = (id) => {
    setSelectedTemplateId(id);
    setCurrentStepIdx(0);
    setAnswers({});
    setShowCoachAnalysis(false);
  };

  // Combine all step answers into unified text for analysis
  const combinedText = useMemo(() => {
    return template.steps
      .map(s => answers[s.id] || "")
      .filter(Boolean)
      .join("\n\n");
  }, [template, answers]);

  // Real-time AI Analysis
  const aiCoach = useMemo(() => {
    return analyzeJournalReflection({
      text: combinedText,
      templateId: template.id,
      userName
    });
  }, [combinedText, template.id, userName]);

  // Format into Markdown for Daily Note
  const generateMarkdownEntry = () => {
    let md = `### ${template.icon} ${template.name} — ${dateStr}\n\n`;

    template.steps.forEach(s => {
      const ans = (answers[s.id] || "").trim();
      if (ans) {
        md += `**${s.title}**\n> *${s.prompt}*\n\n${ans}\n\n`;
      }
    });

    md += `---\n`;
    md += `**🤖 AI Reflection Coach Insights (${aiCoach.tone.icon} ${aiCoach.tone.label})**:\n`;
    md += `${aiCoach.insight}\n\n`;

    if (aiCoach.distortions.length > 0) {
      md += `*Cognitive Reframing Tips*:\n`;
      aiCoach.distortions.forEach(d => {
        md += `- ${d.icon} **${d.type}**: ${d.tip}\n`;
      });
      md += `\n`;
    }

    md += `*Anchor Affirmation*: "${aiCoach.anchorAffirmation}"\n`;

    return md;
  };

  const handleSave = () => {
    if (!combinedText.trim()) {
      if (showToast) showToast("Please write at least one thought before saving!");
      return;
    }

    const entry = generateMarkdownEntry();
    if (onSaveToJournal) {
      onSaveToJournal(entry);
    }
    playTaskComplete();
    if (showToast) {
      showToast("✨ Reflection saved with AI Coach Insights to your Journal!");
    }
    if (onClose) onClose();
  };

  const handleCopy = () => {
    const entry = generateMarkdownEntry();
    navigator.clipboard.writeText(entry).then(() => {
      playChimeSound(600, 0.2, 0.2);
      if (showToast) showToast("📋 Formatted reflection copied to clipboard!");
    });
  };

  const isStepFilled = Boolean((answers[currentStep.id] || "").trim());
  const allStepsCount = template.steps.length;
  const answeredCount = template.steps.filter(s => (answers[s.id] || "").trim()).length;

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        background: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(18px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeIn 0.25s ease-out"
      }}
      onClick={onClose}
    >
      <div
        className="glass"
        style={{
          width: "100%",
          maxWidth: 540,
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: 26,
          padding: "24px 22px",
          background: "var(--glass-bg)",
          border: "1.5px solid var(--glass-border)",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.4)",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>✨</span>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--card-text, #5a4a42)", margin: 0 }}>
                Guided Journaling & AI Coach
              </h3>
              <p style={{ fontSize: 11, color: "var(--text-muted, rgba(139, 126, 116, 0.7))", margin: 0 }}>
                Science-backed CBT, Stoic, and Mindfulness prompts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
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

        {/* TEMPLATE PICKER TABS */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 16, scrollbarWidth: "none" }}>
          {JOURNAL_TEMPLATES.map(t => {
            const isSelected = selectedTemplateId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t.id)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 14,
                  background: isSelected ? "var(--accent-gradient)" : "rgba(0, 0, 0, 0.05)",
                  border: isSelected ? "1.5px solid #fff" : "1px solid var(--glass-border)",
                  color: isSelected ? "#fff" : "var(--card-text, #5a4a42)",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s ease"
                }}
              >
                <span>{t.icon}</span>
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE TEMPLATE HERO BANNER */}
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 16,
            background: "rgba(0, 0, 0, 0.03)",
            border: "1px solid var(--glass-border)",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--card-text, #5a4a42)" }}>
                {template.icon} {template.name}
              </span>
              <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 8, background: "rgba(0,0,0,0.06)", color: "var(--accent-primary)", fontWeight: 700 }}>
                {template.category}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted, rgba(139, 126, 116, 0.7))", margin: "2px 0 0 0" }}>
              {template.subtitle}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent-primary)" }}>
              Step {currentStepIdx + 1}/{allStepsCount}
            </span>
            <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>
              {answeredCount}/{allStepsCount} done
            </p>
          </div>
        </div>

        {/* STEP PROGRESS TRACKER PILLS */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {template.steps.map((s, idx) => {
            const isCurrent = idx === currentStepIdx;
            const hasValue = Boolean((answers[s.id] || "").trim());
            return (
              <button
                key={s.id}
                onClick={() => setCurrentStepIdx(idx)}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  background: isCurrent ? "var(--accent-primary)" : hasValue ? "#10b981" : "rgba(0, 0, 0, 0.12)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.25s ease"
                }}
                title={s.title}
              />
            );
          })}
        </div>

        {/* CURRENT STEP CARD */}
        <div
          style={{
            padding: 16,
            borderRadius: 18,
            background: "rgba(0, 0, 0, 0.02)",
            border: "1px solid var(--glass-border)",
            marginBottom: 16
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "var(--card-text, #5a4a42)", margin: 0 }}>
              {currentStep.title}
            </h4>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {(answers[currentStep.id] || "").length} chars
            </span>
          </div>

          <p style={{ fontSize: 12, color: "var(--text-muted, rgba(139, 126, 116, 0.8))", marginBottom: 10, fontStyle: "italic" }}>
            {currentStep.prompt}
          </p>

          <textarea
            value={answers[currentStep.id] || ""}
            onChange={(e) => handleAnswerChange(currentStep.id, e.target.value)}
            placeholder={currentStep.placeholder}
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              border: "1px solid var(--input-border, rgba(0, 0, 0, 0.15))",
              background: "var(--input-bg, #ffffff)",
              color: "var(--card-text, #5a4a42)",
              fontSize: 13,
              lineHeight: 1.5,
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              boxShadow: "inset 0 1px 4px rgba(0, 0, 0, 0.04)"
            }}
          />

          {/* Stepper Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <button
              onClick={() => setCurrentStepIdx(p => Math.max(0, p - 1))}
              disabled={currentStepIdx === 0}
              style={{
                padding: "6px 14px",
                borderRadius: 10,
                border: "1px solid var(--glass-border)",
                background: "rgba(0, 0, 0, 0.05)",
                color: "var(--card-text, #5a4a42)",
                fontSize: 12,
                fontWeight: 700,
                cursor: currentStepIdx === 0 ? "not-allowed" : "pointer",
                opacity: currentStepIdx === 0 ? 0.4 : 1
              }}
            >
              ← Back
            </button>

            {currentStepIdx < allStepsCount - 1 ? (
              <button
                onClick={() => setCurrentStepIdx(p => Math.min(allStepsCount - 1, p + 1))}
                style={{
                  padding: "6px 18px",
                  borderRadius: 10,
                  background: isStepFilled ? "var(--accent-gradient)" : "rgba(0, 0, 0, 0.08)",
                  border: "none",
                  color: isStepFilled ? "#fff" : "var(--card-text, #5a4a42)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Next Step →
              </button>
            ) : (
              <button
                onClick={() => setShowCoachAnalysis(true)}
                style={{
                  padding: "6px 18px",
                  borderRadius: 10,
                  background: "var(--accent-gradient)",
                  border: "none",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "var(--glow-shadow)"
                }}
              >
                ✨ Review AI Insights
              </button>
            )}
          </div>
        </div>

        {/* AI REFLECTION COACH SECTION (Collapsible or activated on review) */}
        {combinedText.trim().length > 15 && (
          <div
            style={{
              padding: 16,
              borderRadius: 18,
              background: "rgba(0, 0, 0, 0.03)",
              border: "1px solid var(--glass-border)",
              marginBottom: 16
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer"
              }}
              onClick={() => setShowCoachAnalysis(!showCoachAnalysis)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🤖</span>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--card-text, #5a4a42)", margin: 0 }}>
                    AI Reflection Coach
                  </h4>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>
                    Tone: <strong style={{ color: aiCoach.tone.color }}>{aiCoach.tone.icon} {aiCoach.tone.label}</strong>
                  </p>
                </div>
              </div>
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  color: "var(--accent-primary)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {showCoachAnalysis ? "Hide ▲" : "View Insights ▼"}
              </button>
            </div>

            {showCoachAnalysis && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--glass-border)" }}>
                {/* Empathetic Insight Paragraph */}
                <p style={{ fontSize: 12, color: "var(--card-text, #5a4a42)", lineHeight: 1.6, marginBottom: 12 }}>
                  {aiCoach.insight}
                </p>

                {/* Cognitive Distortions Caught */}
                {aiCoach.distortions.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                      <span>⚖️</span> Thinking Traps & Gentle Reframes:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {aiCoach.distortions.map((d, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 10,
                            background: "rgba(245, 158, 11, 0.1)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            fontSize: 11,
                            color: "var(--card-text, #5a4a42)"
                          }}
                        >
                          <strong>{d.icon} {d.type}</strong>: {d.tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Micro-Steps */}
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "var(--card-text, #5a4a42)", marginBottom: 4 }}>
                    🌱 Recommended Micro-Self Care:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: "var(--text-muted)" }}>
                    {aiCoach.microActions.map((act, idx) => (
                      <li key={idx} style={{ marginBottom: 3 }}>{act}</li>
                    ))}
                  </ul>
                </div>

                {/* Anchor Affirmation Banner */}
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: "var(--accent-gradient)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    textAlign: "center"
                  }}
                >
                  💫 "{aiCoach.anchorAffirmation}"
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM ACTIONS BAR */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
          <button
            onClick={handleCopy}
            disabled={!combinedText.trim()}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: "rgba(0, 0, 0, 0.05)",
              border: "1px solid var(--glass-border)",
              color: "var(--card-text, #5a4a42)",
              fontSize: 12,
              fontWeight: 700,
              cursor: combinedText.trim() ? "pointer" : "not-allowed",
              opacity: combinedText.trim() ? 1 : 0.4
            }}
          >
            📋 Copy Markdown
          </button>

          <button
            onClick={handleSave}
            disabled={!combinedText.trim()}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              background: "var(--accent-gradient)",
              border: "none",
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              cursor: combinedText.trim() ? "pointer" : "not-allowed",
              boxShadow: combinedText.trim() ? "var(--glow-shadow)" : "none",
              opacity: combinedText.trim() ? 1 : 0.4,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <span>✓ Save to Journal</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact Quick Launcher Card for Daily Notes Screen & Home Screen
export function QuickGuidedJournalLauncherCard({ onOpenJournalStudio }) {
  return (
    <div
      className="glass"
      style={{
        borderRadius: 20,
        padding: "16px 18px",
        marginBottom: 16,
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        boxShadow: "var(--glass-shadow)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        cursor: "pointer"
      }}
      onClick={onOpenJournalStudio}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "linear-gradient(135deg, #a855f7, #ec4899)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            boxShadow: "0 6px 16px rgba(168, 85, 247, 0.3)"
          }}
        >
          ✨
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: "var(--card-text, #5a4a42)", margin: 0 }}>
              Guided Journal & AI Coach
            </h4>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 8, background: "rgba(168, 85, 247, 0.12)", color: "#a855f7" }}>
              CBT Prompts
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted, rgba(139, 126, 116, 0.7))", margin: "2px 0 0 0" }}>
            CBT anxiety de-escalator, Stoic review, and gratitude savoring
          </p>
        </div>
      </div>

      <button
        style={{
          padding: "8px 14px",
          borderRadius: 12,
          background: "linear-gradient(135deg, #a855f7, #ec4899)",
          border: "none",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 6px 16px rgba(168, 85, 247, 0.25)",
          whiteSpace: "nowrap"
        }}
      >
        Prompt ✨
      </button>
    </div>
  );
}
