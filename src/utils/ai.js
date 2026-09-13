// ═══════════════════════════════════════════════════════════════════════
// AI UTILITIES (Multi-Persona, Crisis Safeguards & Context Recall)
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
  },
  mentor: {
    id: "mentor",
    name: "Professional Mentor",
    role: "Structured & Direct Advice",
    avatar: "🎓",
    greeting: "Welcome! Let's organize your focus, audit priorities, and execute efficiently."
  }
};

const normalize = (text) => (text || "").toLowerCase();
const truncateText = (text, max = 80) => (text.length > max ? `${text.slice(0, max - 3)}...` : text);

// 🆘 Crisis / Distress Keyword Detection for Mental Health Safety
export const detectCrisisKeywords = (messageText) => {
  const msg = normalize(messageText);
  const crisisRegex = /(suicid|self-harm|end my life|want to die|kill myself|cant go on|cannot go on|hurt myself|no reason to live|giving up on life|overdose)/i;
  return crisisRegex.test(msg);
};

export const CRISIS_HELPLINES = [
  { region: "US & Canada", name: "Suicide & Crisis Lifeline", number: "988", text: "Text HOME to 741741" },
  { region: "India", name: "Tele-MANAS Emergency", number: "14416", subtext: "24/7 Free Helpline (Toll-Free 1800 891 4416)" },
  { region: "India", name: "Vandrevala Foundation", number: "9999 666 555", subtext: "24/7 Mental Health Support" },
  { region: "India", name: "AASRA Helpline", number: "91-9820466726", subtext: "24/7 Crisis Intervention" },
  { region: "UK", name: "Samaritans UK", number: "116 123", subtext: "Free 24/7 Helpline" },
  { region: "International", name: "Befrienders Worldwide", number: "findahelpline.com", subtext: "Global Helpline Directory" }
];

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

export const getLocalChatReply = ({ userName, meaningfulMoments = [], message, personaId = "empathic" }) => {
  const name = userName || "friend";

  // Check for crisis trigger first
  if (detectCrisisKeywords(message)) {
    return {
      isCrisis: true,
      reply: `I hear how much weight and pain you're carrying right now, ${name}. Please know that you don't have to carry this alone. Saathi is an AI wellness tracker and cannot provide emergency care, but there are compassionate people ready to listen and support you 24/7.`,
      disclaimer: "⚠️ Saathi is an AI companion for personal wellness tracking and is not a substitute for professional medical or mental health care."
    };
  }

  const msg = normalize(message);
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
  } else if (personaId === "mentor") {
    if (/(goal|task|plan|project|work)/.test(msg)) {
      reply = `Understood, ${name}. Let's break this objective down into 3 concrete milestones and evaluate deadlines.`;
    } else {
      reply = `Good focus, ${name}. What is the primary bottleneck we need to solve right now?`;
    }
  } else {
    // Default Empathic Persona
    if (/^(hi|hello|hey)\b/.test(msg)) {
      reply = `Hi ${name}. I'm right here with you. How are you feeling right now?`;
    } else if (/(sad|down|lonely|depress|upset|cry|anx|stress|overwhelm)/.test(msg)) {
      reply = `I'm really sorry you're feeling that way, ${name}. ${memoryLine}Do you want to share what's weighing on you most?`;
    } else if (/(happy|good|great|excited|proud|grateful|relieved)/.test(msg)) {
      reply = `I'm glad to hear that! ${memoryLine}Want to capture what made it feel good?`;
    } else if (/(tired|exhaust|sleep|burnout)/.test(msg)) {
      reply = "Sounds like your body is asking for rest. Want to talk about what's draining you or try a quick reset?";
    } else if (/(task|todo|plan|habit|goal|focus|procrast)/.test(msg)) {
      reply = "We can break it into one small step. What's the tiniest next action you can do in 5 minutes?";
    } else if (/thank|thanks/.test(msg)) {
      reply = "You're welcome! I'm always here for you. Want to keep going or pause for a breath?";
    } else {
      reply = `Thanks for sharing that, ${name}. ${memoryLine}What feels most important to you right now?`;
    }
  }

  const followUps = [
    "If you'd like, we can do a 4-4-6 breath together.",
    "Want me to save this as a meaningful moment?",
    "Should I turn this into a small task or habit?"
  ];

  const extra = followUps[(message.length || 1) % followUps.length];
  const fullText = `${reply} ${extra}`.replace(/\s+/g, " ").trim();

  return {
    isCrisis: false,
    reply: fullText,
    disclaimer: null
  };
};

export const callExternalAIModel = async ({ prompt, systemPrompt, apiKey, provider = "gemini" }) => {
  if (detectCrisisKeywords(prompt)) {
    return "I hear how much pain you're carrying right now. Please reach out to a trusted professional or emergency helpline (like 988 or Tele-MANAS 14416). You don't have to go through this alone.";
  }

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

export const callAI = async (prompt = "", maxTokens = 800) => {
  if (prompt && maxTokens) {
    return "You are doing your best, and that is enough.";
  }
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
