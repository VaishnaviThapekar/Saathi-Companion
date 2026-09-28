// ═══════════════════════════════════════════════════════════════════════
// SAATHI CLOUD SYNC VAULT CONFIGURATOR (Zero Dependencies)
// Optional cloud sync endpoint for cross-device journal synchronization
// ═══════════════════════════════════════════════════════════════════════

export const getCloudSyncConfig = () => {
  try {
    const raw = localStorage.getItem("saathi_cloud_sync");
    return raw ? JSON.parse(raw) : { enabled: false, syncKey: "", endpoint: "" };
  } catch {
    return { enabled: false, syncKey: "", endpoint: "" };
  }
};

export const saveCloudSyncConfig = (config) => {
  try {
    localStorage.setItem("saathi_cloud_sync", JSON.stringify(config));
  } catch {}
};

export const syncDataToCloud = async (data) => {
  const config = getCloudSyncConfig();
  if (!config.enabled || !config.endpoint) return { success: false, reason: "Cloud sync disabled" };

  try {
    const res = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.syncKey}`
      },
      body: JSON.stringify(data)
    });
    return { success: res.ok };
  } catch (err) {
    console.warn("Cloud sync error:", err);
    return { success: false, reason: err.message };
  }
};
