// ═══════════════════════════════════════════════════════════════════════
// STORAGE UTILITIES
// ═══════════════════════════════════════════════════════════════════════

/**
 * localStorage wrapper with async API matching Claude's window.storage
 * 
 * For Claude.ai deployment:
 * - Replace localStorage calls with window.storage
 * - Storage API is already async
 * 
 * For local development:
 * - Uses localStorage with Promise wrapper
 */

// Mock window.storage if not available (local development)
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
    return result ? JSON.parse(result.value) : fallback;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return fallback;
  }
};

export const save = async (key, value) => {
  try {
    await window.storage.set(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
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
    console.error(`Error removing ${key}:`, error);
  }
};
