// ═══════════════════════════════════════════════════════════════════════
// AI UTILITIES (Claude API)
// ═══════════════════════════════════════════════════════════════════════

const getClaudeApiKey = () => {
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("Missing REACT_APP_ANTHROPIC_API_KEY");
  }

  return apiKey;
};

const callClaude = async payload => {
  const useProxy = process.env.NODE_ENV === "production";
  const url = useProxy ? "/api/claude" : "https://api.anthropic.com/v1/messages";
  const headers = {
    "Content-Type": "application/json"
  };

  if (!useProxy) {
    headers["x-api-key"] = getClaudeApiKey();
    headers["anthropic-version"] = "2023-06-01";
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  return response;
};

/**
 * Call Claude API
 *
 * @param {string} prompt - The prompt to send
 * @param {number} maxTokens - Maximum tokens in response
 * @returns {Promise<string>} - AI response text
 */
export const callAI = async (prompt, maxTokens = 800) => {
  try {
    const response = await callClaude({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    if (!response.ok) {
      console.error("API Error:", response.status);
      return "I'm having trouble thinking right now. Try again in a moment.";
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error("AI call failed:", error);
    return "Connection issue. I'm still here, just can't think deeply right now.";
  }
};

/**
 * Generate affirmation based on struggles
 */
export const generateAffirmation = async (userName, struggles) => {
  if (!struggles || struggles.length === 0) {
    return "You are doing your best, and that is enough.";
  }

  const prompt = `Based on these struggles: "${struggles}", create 1 warm, personalized affirmation for ${userName}. Make it specific, not generic. 1 sentence only.`;

  try {
    const text = await callAI(prompt, 100);
    return text.replace(/"/g, "").trim();
  } catch (error) {
    return "You're stronger than you know.";
  }
};

/**
 * Generate weekly reflection
 */
export const generateWeeklyReflection = async (userName, data) => {
  const { proud, struggles, helped, gratitudes } = data;

  const prompt = `Write a warm, personal weekly reflection for ${userName}.

Proud moments: ${proud}
Struggles: ${struggles}
What helped: ${helped}
Gratitudes: ${gratitudes}

Be encouraging. Acknowledge growth. 4-5 sentences max.`;

  try {
    return await callAI(prompt, 400);
  } catch (error) {
    return "This week you showed up, and that matters.";
  }
};

/**
 * Detect emotional patterns
 */
export const detectEmotionalPatterns = async (userName, energyLog, struggles) => {
  const prompt = `Analyze ${userName}'s patterns over 2 weeks.

Energy log:
${energyLog}

Recent struggles: ${struggles}

Detect 1-2 gentle patterns (e.g., "Mondays seem harder" or "Energy dips in afternoons"). Be warm, not clinical. Max 2 sentences.`;

  try {
    return await callAI(prompt, 200);
  } catch (error) {
    return null;
  }
};

/**
 * Chat with memory of meaningful moments
 */
export const chatWithMemory = async (messages, userName, meaningfulMoments) => {
  const momentsContext = meaningfulMoments
    .slice(-10)
    .map(m => `${m.type}: "${m.text}" (${m.emotion})`)
    .join("\n");

  const systemPrompt = `You are ${userName}'s empathetic AI companion. You remember their meaningful moments:

${momentsContext}

When they share struggles or feelings, gently recall similar past moments if relevant (e.g., "Last time you felt this way, music helped a little"). Be warm, present, and genuinely supportive. Keep responses conversational and brief.`;

  try {
    const response = await callClaude({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm having trouble connecting. Could you try again?";
  }
};
