// ═══════════════════════════════════════════════════════════════════════
// SAATHI WEB SPEECH & VOICE AI ENGINE (Zero Dependencies)
// High-clarity Text-to-Speech (TTS) + Speech Recognition (STT)
// ═══════════════════════════════════════════════════════════════════════

export const isTTSSupported = () => {
  return typeof window !== "undefined" && "speechSynthesis" in window;
};

export const isSTTSupported = () => {
  return typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
};

export const isTTSEnabled = () => {
  const val = localStorage.getItem("saathi_tts_enabled");
  return val === null ? false : val === "true";
};

export const setTTSEnabled = (enabled) => {
  localStorage.setItem("saathi_tts_enabled", enabled ? "true" : "false");
};

export const getSavedVoiceName = () => {
  return localStorage.getItem("saathi_voice_name") || "";
};

export const setSavedVoiceName = (name) => {
  localStorage.setItem("saathi_voice_name", name);
};

export const getAvailableVoices = () => {
  if (!isTTSSupported()) return [];
  try {
    return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith("en"));
  } catch (e) {
    return [];
  }
};

export const stopSpeech = () => {
  if (isTTSSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
};

export const speakText = (text, onEnd, customOptions = {}) => {
  if (!isTTSSupported() || !text) return;
  stopSpeech();

  try {
    // Strip markdown formatting & emojis for natural speech flow
    const cleanText = text
      .replace(/[*_~#`[\]()]/g, " ")
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.rate = customOptions.rate || 0.95;  // natural pace
    utterance.pitch = customOptions.pitch || 1.05; // warm tone
    utterance.volume = customOptions.volume !== undefined ? customOptions.volume : 1.0;

    const voices = synth.getVoices();
    const savedName = getSavedVoiceName();
    let preferredVoice = null;

    if (savedName) {
      preferredVoice = voices.find(v => v.name === savedName);
    }
    if (!preferredVoice) {
      preferredVoice = voices.find(v => 
        /Google US English|Google UK English Female|Samantha|Karen|Victoria|Zira|Natural|Female/i.test(v.name)
      ) || voices.find(v => v.lang.startsWith("en"));
    }

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

// 🎙️ Speech Recognition Engine (Hands-Free Voice STT)
export const createSpeechRecognizer = ({ onResult, onError, onEnd, onStart }) => {
  if (!isSTTSupported()) return null;
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    if (onStart) recognition.onstart = onStart;

    recognition.onresult = (event) => {
      let transcript = "";
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }
      if (onResult) onResult(transcript, isFinal);
    };

    if (onError) recognition.onerror = (e) => onError(e.error || e);
    if (onEnd) recognition.onend = onEnd;

    return recognition;
  } catch (e) {
    console.warn("Failed to instantiate SpeechRecognition:", e);
    return null;
  }
};
