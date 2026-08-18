// ═══════════════════════════════════════════════════════════════════════
// SAATHI WEB AUDIO SYNTHESIZER & CHIME GENERATOR (Zero NPM Dependencies)
// ═══════════════════════════════════════════════════════════════════════

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play a gentle, soothing bell chime for breathing or completion
export const playChimeSound = (freq = 528, duration = 1.2) => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.warn("Audio chime not available:", err);
  }
};

// Play task reminder ping
export const playAlarmPing = () => {
  playChimeSound(660, 0.3);
  setTimeout(() => playChimeSound(880, 0.5), 120);
};
