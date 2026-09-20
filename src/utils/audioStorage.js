// ═══════════════════════════════════════════════════════════════════════
// SAATHI INDEXED DB AUDIO STORAGE (Zero Dependencies)
// Stores custom MP3/WAV/M4A focus audio files efficiently
// ═══════════════════════════════════════════════════════════════════════

const DB_NAME = 'saathi_audio_db';
const DB_VERSION = 1;
const STORE_NAME = 'custom_tracks';

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this browser."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

export const saveAudioTrack = async (file) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const track = {
        id: 'track_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: file.name.replace(/\.[^/.]+$/, ""), // remove extension
        fileName: file.name,
        type: file.type || 'audio/mp3',
        size: file.size,
        data: reader.result, // ArrayBuffer or Base64
        createdAt: new Date().toISOString()
      };

      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(track);

      req.onsuccess = () => resolve(track);
      req.onerror = (e) => reject(e.target.error);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

export const getAllAudioTracks = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn("Failed to load audio tracks from IndexedDB:", err);
    return [];
  }
};

export const deleteAudioTrack = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject(e.target.error);
  });
};
