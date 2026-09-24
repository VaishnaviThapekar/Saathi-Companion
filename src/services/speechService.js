// ═══════════════════════════════════════════════════════════════════════
// SAATHI WEB SPEECH SYNTHESIS SERVICE (Zero Dependencies)
// Natural, gentle voice synthesis for AI companion chat responses
// ═══════════════════════════════════════════════════════════════════════

export const isTTSSupported = () => {
  return typeof window !== "undefined" && "speechSynthesis" in window;
};

export const isTTSEnabled = () => {
  const val = localStorage.getItem("saathi_tts_enabled");
  return val === null ? false : val === "true";
};

export const setTTSEnabled = (enabled) => {
  localStorage.setItem("saathi_tts_enabled", enabled ? "true" : "false");
};

export const stopSpeech = () => {
  if (isTTSSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
};

export const speakText = (text, onEnd) => {
  if (!isTTSSupported() || !text) return;
  stopSpeech();

  try {
    // Strip markdown formatting for natural speech
    const cleanText = text
      .replace(/[*_~#`[\]()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Voice tuning for a gentle, natural tone
    utterance.rate = 0.95;  // slightly slower for clarity
    utterance.pitch = 1.05; // warm, gentle pitch
    utterance.volume = 1.0;

    // Pick a natural, soothing voice if available
    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => 
      /Google US English|Google UK English Female|Samantha|Karen|Victoria|Zira|Natural|Female/i.test(v.name)
    ) || voices.find(v => v.lang.startsWith("en"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    synth.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis error:", err);
  }
};
