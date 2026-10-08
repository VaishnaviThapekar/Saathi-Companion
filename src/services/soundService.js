// ═══════════════════════════════════════════════════════════════════════
// SAATHI WEB AUDIO SYNTHESIZER & AMBIENT SOUNDSCAPES (Zero Dependencies)
// ═══════════════════════════════════════════════════════════════════════

let audioCtx = null;
let activeAmbientNodes = null;
let ambientMasterGain = null;
let currentAmbientType = null;

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

// Check if sound FX are enabled in settings (default true)
export const isSoundEnabled = () => {
  const val = localStorage.getItem('saathi_sound_enabled');
  return val === null ? true : val === 'true';
};

export const setSoundEnabled = (enabled) => {
  localStorage.setItem('saathi_sound_enabled', enabled ? 'true' : 'false');
};

// 🔔 UI Sound Chimes
export const playChimeSound = (freq = 528, duration = 1.2, volume = 0.2) => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.warn("Audio chime failed:", err);
  }
};

export const playTaskComplete = () => {
  if (!isSoundEnabled()) return;
  playChimeSound(523.25, 0.4, 0.2); // C5
  setTimeout(() => playChimeSound(659.25, 0.4, 0.2), 100); // E5
  setTimeout(() => playChimeSound(783.99, 0.6, 0.25), 200); // G5
};

export const playMoodLog = () => {
  if (!isSoundEnabled()) return;
  playChimeSound(528, 1.2, 0.22); // 528Hz Solfeggio Love/Healing tone
};

export const playStreakUnlock = () => {
  if (!isSoundEnabled()) return;
  playChimeSound(523.25, 0.3, 0.2);
  setTimeout(() => playChimeSound(659.25, 0.3, 0.2), 90);
  setTimeout(() => playChimeSound(1046.50, 0.8, 0.3), 180); // C6 victory
};

export const playTabSwitch = () => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
};

export const ALARM_SOUND_TYPES = [
  { id: "gentle", name: "Gentle Chime", icon: "🔔", desc: "E-Major soothing arpeggio chime" },
  { id: "sunrise", name: "Sunrise Bell", icon: "🌅", desc: "Warm harmonic bell tone with gentle modulation" },
  { id: "zen", name: "Zen Singing Bowl", icon: "🧘", desc: "432Hz deep resonant meditation bowl" },
  { id: "pulse", name: "Energizing Pulse", icon: "⚡", desc: "Dual tone uplifting arpeggio pulse" }
];

export const playAlarmSound = (type = 'gentle') => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (type === 'sunrise') {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc2.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.setValueAtTime(880, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.0);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.0);
      osc2.stop(ctx.currentTime + 2.0);
    } else if (type === 'zen') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(216, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.5);
    } else if (type === 'pulse') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        setTimeout(() => {
          playChimeSound(freq, 0.4, 0.25);
        }, idx * 100);
      });
    } else {
      [329.63, 415.30, 493.88, 659.25].forEach((freq, idx) => {
        setTimeout(() => {
          playChimeSound(freq, 0.5, 0.22);
        }, idx * 120);
      });
    }
  } catch (err) {
    console.warn("Alarm sound playback error:", err);
  }
};

export const playAlarmPing = () => {
  playAlarmSound(localStorage.getItem('saathi_alarm_sound') || 'gentle');
};


// 🌿 Procedural Ambient Soundscapes (Rain, Ocean, Pink Noise, Zen Drone)
const createNoiseBuffer = (ctx) => {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    data[i] *= 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
};

export const startAmbientSound = (type = 'rain', volume = 0.3) => {
  stopAmbientSound();
  try {
    const ctx = getAudioContext();
    ambientMasterGain = ctx.createGain();
    ambientMasterGain.gain.setValueAtTime(volume, ctx.currentTime);
    ambientMasterGain.connect(ctx.destination);

    if (type === 'rain') {
      const noiseBuffer = createNoiseBuffer(ctx);
      const whiteNoiseSource = ctx.createBufferSource();
      whiteNoiseSource.buffer = noiseBuffer;
      whiteNoiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      whiteNoiseSource.connect(filter);
      filter.connect(ambientMasterGain);
      whiteNoiseSource.start();

      activeAmbientNodes = [whiteNoiseSource, filter];
    } else if (type === 'ocean') {
      const noiseBuffer = createNoiseBuffer(ctx);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // Wave swell speed

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(300, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noiseSource.connect(filter);
      filter.connect(ambientMasterGain);

      lfo.start();
      noiseSource.start();
      activeAmbientNodes = [noiseSource, filter, lfo, lfoGain];
    } else if (type === 'pink') {
      const noiseBuffer = createNoiseBuffer(ctx);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(ambientMasterGain);
      noiseSource.start();
      activeAmbientNodes = [noiseSource, filter];
    } else if (type === 'zen') {
      // Dual 432Hz binaural meditation synth
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(216, ctx.currentTime); // 432Hz octave
      osc2.frequency.setValueAtTime(218.5, ctx.currentTime); // Gentle binaural beat

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.15, ctx.currentTime);

      osc1.connect(subGain);
      osc2.connect(subGain);
      subGain.connect(ambientMasterGain);

      osc1.start();
      osc2.start();
      activeAmbientNodes = [osc1, osc2, subGain];
    }

    currentAmbientType = type;
  } catch (err) {
    console.warn("Could not start ambient sound:", err);
  }
};

let activeCustomAudio = null;

export const startCustomAudio = (dataUrl, volume = 0.5, onEnded) => {
  stopAmbientSound();
  stopCustomAudio();
  try {
    activeCustomAudio = new Audio(dataUrl);
    activeCustomAudio.volume = Math.max(0, Math.min(1, volume));
    activeCustomAudio.loop = true;
    if (onEnded) {
      activeCustomAudio.onended = onEnded;
    }
    activeCustomAudio.play().catch(e => console.warn("Custom audio autoplay blocked:", e));
    currentAmbientType = "custom";
  } catch (e) {
    console.warn("Failed to play custom audio track:", e);
  }
};

export const stopCustomAudio = () => {
  if (activeCustomAudio) {
    try {
      activeCustomAudio.pause();
      activeCustomAudio.currentTime = 0;
    } catch (e) {}
    activeCustomAudio = null;
  }
  if (currentAmbientType === "custom") {
    currentAmbientType = null;
  }
};

export const setCustomAudioVolume = (vol) => {
  if (activeCustomAudio) {
    activeCustomAudio.volume = Math.max(0, Math.min(1, vol));
  }
};

export const stopAmbientSound = () => {
  stopCustomAudio();
  if (activeAmbientNodes) {
    activeAmbientNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    activeAmbientNodes = null;
  }
  if (ambientMasterGain) {
    try { ambientMasterGain.disconnect(); } catch (e) {}
    ambientMasterGain = null;
  }
  currentAmbientType = null;
};

export const setAmbientVolume = (vol) => {
  setCustomAudioVolume(vol);
  if (ambientMasterGain && audioCtx) {
    ambientMasterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), audioCtx.currentTime);
  }
};

export const getCurrentAmbientType = () => currentAmbientType;

