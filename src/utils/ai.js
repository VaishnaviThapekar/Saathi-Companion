// ═══════════════════════════════════════════════════════════════════════
// AI UTILITIES (Multi-Persona, Context Recall & Action Detection)
// ═══════════════════════════════════════════════════════════════════════

export const COMPANION_PERSONAS = {
  empathic: {
    id: "empathic",
    name: "Empathic Saathi",
    role: "Supportive Friend",
    avatar: "🌸",
    greeting: "I'm right here with you. How is your heart doing today?"
  },
  coach: {
    id: "coach",
    name: "Focus Coach",
    role: "Goal & Action Guide",
    avatar: "⚡",
    greeting: "Let me help you turn thoughts into clear, small action steps!"
  },
  mindful: {
    id: "mindful",
    name: "Mindful Guide",
    role: "Zen & Calm Companion",
    avatar: "🌿",
    greeting: "Take a gentle breath with me. What is present for you right now?"
  },
  creative: {
    id: "creative",
    name: "Creative Spark",
    role: "Inspiration & Reflection",
    avatar: "✨",
    greeting: "Let's explore your ideas and capture your best thoughts!"
  }
};

const normalize = (text) => (text || "").toLowerCase();
const truncateText = (text, max = 80) => (text.length > max ? `${text.slice(0, max - 3)}...` : text);

// Detect Action Chips from User Messages
export const detectActionableSuggestions = (messageText) => {
  const msg = normalize(messageText);
  const chips = [];

  if (/(anx|stress|overwhelm|panic|breath|tired|exhaust|heavy)/.test(msg)) {
    chips.push({ id: "action_breath", label: "🌬️ 4-4-6 Breathing", actionType: "breath" });
  }

  if (/(task|todo|plan|need to|must|finish|project|buy|remember to)/.test(msg)) {
    chips.push({ id: "action_task", label: "✅ Add as Task", actionType: "task" });
  }

  if (/(habit|daily|every day|morning|routine|streak|practice)/.test(msg)) {
    chips.push({ id: "action_habit", label: "🔥 Track Habit", actionType: "habit" });
  }

  if (/(proud|happy|grateful|meaningful|moment|special|win|achievement)/.test(msg)) {
    chips.push({ id: "action_memory", label: "🌟 Save Moment", actionType: "memory" });
  }

  return chips;
};

// Smart Offline Persona Engine
export const getLocalChatReply = ({ userName, meaningfulMoments = [], message, personaId = "empathic" }) => {
  const msg = normalize(message);
  const name = userName || "there";
  const lastMoment = meaningfulMoments.slice().reverse().find(m => m && m.text);
  const memoryLine = lastMoment ? `I remember you noted: "${truncateText(lastMoment.text)}". ` : "";

  let reply = "";

  if (personaId === "coach") {
    if (/(sad|down|stress|anx|overwhelm)/.test(msg)) {
      reply = `I hear you, ${name}. Let's protect your momentum by keeping things tiny. What is 1 action we can do in under 3 minutes?`;
    } else if (/(goal|task|plan|work|focus|project)/.test(msg)) {
      reply = `Great drive, ${name}! Let's pick the single highest priority for today and get it done.`;
    } else {
      reply = `Awesome, ${name}! What's the smallest next step to move this forward?`;
    }
  } else if (personaId === "mindful") {
    if (/(anx|stress|panic|overwhelm|tired)/.test(msg)) {
      reply = `Slow down your pace, ${name}. ${memoryLine}Notice your breath right now. Would a 4-4-6 breath reset help bring calm?`;
    } else {
      reply = `Thank you for sharing that, ${name}. What is one quiet thing you feel grateful for in this moment?`;
    }
  } else if (personaId === "creative") {
    reply = `Love that perspective, ${name}! What if we wrote this down as a daily note or a milestone memory?`;
  } else {
    // Default Empathic Persona
    if (/^(hi|hello|hey)\b/.test(msg)) {
      reply = `Hi ${name}. I'm here with you. How are you feeling right now?`;
    } else if (/(sad|down|lonely|depress|upset|cry|anx|stress|overwhelm)/.test(msg)) {
      reply = `I'm really sorry you're feeling that way. ${memoryLine}Do you want to share what's weighing on you most?`;
    } else if (/(happy|good|great|excited|proud|grateful|relieved)/.test(msg)) {
      reply = `I'm glad to hear that! ${memoryLine}Want to capture what made it feel good?`;
    } else if (/(tired|exhaust|sleep|burnout)/.test(msg)) {
      reply = "Sounds like your body is asking for rest. Want to talk about what's draining you or try a quick reset?";
    } else if (/(task|todo|plan|habit|goal|focus|procrast)/.test(msg)) {
      reply = "We can break it into one small step. What's the tiniest next action you can do in 5 minutes?";
    } else if (/thank|thanks/.test(msg)) {
      reply = "You're welcome. I'm here for you. Want to keep going or pause for a breath?";
    } else {
      reply = `Thanks for sharing that. ${memoryLine}What feels most important to you right now?`;
    }
  }

  const followUps = [
    "If you'd like, we can do a 4-4-6 breath together.",
    "Want me to save this as a meaningful moment?",
    "Should I turn this into a small task or habit?"
  ];

  const extra = followUps[(message.length || 1) % followUps.length];
  return `${reply} ${extra}`.replace(/\s+/g, " ").trim();
};

// Optional External API Call (Gemini / Claude)
export const callExternalAIModel = async ({ prompt, systemPrompt, apiKey, provider = "gemini" }) => {
  if (provider === "gemini" && apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nUser Message: ${prompt}` }] }
        ]
      })
    });
    if (!response.ok) throw new Error("Gemini API call failed");
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  if (provider === "claude" && apiKey) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!response.ok) throw new Error("Claude API call failed");
    const data = await response.json();
    return data.content[0].text;
  }

  throw new Error("No API key configured");
};

export const callAI = async (prompt, maxTokens = 800) => {
  return "You are doing your best, and that is enough.";
};

export const generateAffirmation = async (userName, struggles) => {
  if (!struggles) {
    return "You are doing your best, and that is enough.";
  }
  return `Dear ${userName || "friend"}, your willingness to work through "${truncateText(struggles, 40)}" shows your strength and growth.`;
};

export const chatWithMemory = async (messages, userName, meaningfulMoments) => {
  const lastMsg = messages[messages.length - 1]?.content || "";
  return getLocalChatReply({ userName, meaningfulMoments, message: lastMsg });
};
