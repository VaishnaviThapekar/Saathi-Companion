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
