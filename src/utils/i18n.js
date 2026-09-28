// ═══════════════════════════════════════════════════════════════════════
// SAATHI MULTI-LANGUAGE I18N SERVICE (Zero Dependencies)
// Translations for English (en), Hindi (hi), Spanish (es), French (fr), German (de)
// ═══════════════════════════════════════════════════════════════════════

export const LANGUAGES = {
  en: { code: "en", name: "English", flag: "🇺🇸" },
  hi: { code: "hi", name: "हिंदी (Hindi)", flag: "🇮🇳" },
  es: { code: "es", name: "Español (Spanish)", flag: "🇪🇸" },
  fr: { code: "fr", name: "Français (French)", flag: "🇫🇷" },
  de: { code: "de", name: "Deutsch (German)", flag: "🇩🇪" }
};

const translations = {
  en: {
    home: "Home",
    tasks: "Tasks",
    habits: "Habits",
    wellness: "Wellness",
    memories: "Memories",
    chat: "Chat",
    settings: "Settings",
    search: "Search",
    dailyCheckIn: "Daily Reflection",
    yourCompanion: "Your AI Life Companion",
    addTask: "Add Task",
    addHabit: "Add Habit",
    addMemory: "Add Memory",
    installApp: "Install Saathi App",
    language: "App Language",
    customAlarms: "Custom Daily Alarms",
    morningAlarm: "Morning Reflection Alarm",
    eveningAlarm: "Evening Wind-Down Alarm",
    cloudSync: "Cloud Sync Vault (Optional)",
    streak: "Streak",
    done: "Done",
    pending: "Pending",
    exportPDF: "Export PDF Report"
  },
  hi: {
    home: "होम",
    tasks: "कार्य (Tasks)",
    habits: "आदतें (Habits)",
    wellness: "स्वास्थ्य (Wellness)",
    memories: "यादें (Memories)",
    chat: "बातचीत (Chat)",
    settings: "सेटिंग्स",
    search: "खोजें",
    dailyCheckIn: "दैनिक विचार",
    yourCompanion: "आपका AI साथी",
    addTask: "कार्य जोड़ें",
    addHabit: "आदत जोड़ें",
    addMemory: "याद जोड़ें",
    installApp: "साथी ऐप इंस्टॉल करें",
    language: "ऐप की भाषा",
    customAlarms: "दैनिक अलार्म",
    morningAlarm: "सुबह का अलार्म",
    eveningAlarm: "शाम का अलार्म",
    cloudSync: "क्लाउड सिंक वॉल्ट",
    streak: "लगातार दिन",
    done: "पूर्ण",
    pending: "शेष",
    exportPDF: "PDF रिपोर्ट डाउनलोड करें"
  },
  es: {
    home: "Inicio",
    tasks: "Tareas",
    habits: "Hábitos",
    wellness: "Bienestar",
    memories: "Recuerdos",
    chat: "Chat",
    settings: "Ajustes",
    search: "Buscar",
    dailyCheckIn: "Reflexión Diaria",
    yourCompanion: "Tu Compañero IA",
    addTask: "Añadir Tarea",
    addHabit: "Añadir Hábito",
    addMemory: "Añadir Recuerdo",
    installApp: "Instalar Saathi",
    language: "Idioma de la App",
    customAlarms: "Alarmas Diarias",
    morningAlarm: "Alarma Mañanera",
    eveningAlarm: "Alarma Nocturna",
    cloudSync: "Bóveda en la Nube",
    streak: "Racha",
    done: "Hecho",
    pending: "Pendiente",
    exportPDF: "Exportar Reporte PDF"
  },
  fr: {
    home: "Accueil",
    tasks: "Tâches",
    habits: "Habitudes",
    wellness: "Bien-être",
    memories: "Souvenirs",
    chat: "Discussion",
    settings: "Paramètres",
    search: "Rechercher",
    dailyCheckIn: "Réflexion Quotidienne",
    yourCompanion: "Votre Compagnon IA",
    addTask: "Ajouter une tâche",
    addHabit: "Ajouter une habitude",
    addMemory: "Ajouter un souvenir",
    installApp: "Installer l'application",
    language: "Langue de l'application",
    customAlarms: "Alarmes Quotidiennes",
    morningAlarm: "Alarme du Matin",
    eveningAlarm: "Alarme du Soir",
    cloudSync: "Coffre Cloud",
    streak: "Série",
    done: "Terminé",
    pending: "En attente",
    exportPDF: "Exporter le rapport PDF"
  },
  de: {
    home: "Start",
    tasks: "Aufgaben",
    habits: "Gewohnheiten",
    wellness: "Wohlbefinden",
    memories: "Erinnerungen",
    chat: "Chat",
    settings: "Einstellungen",
    search: "Suchen",
    dailyCheckIn: "Tägliche Reflexion",
    yourCompanion: "Dein KI Begleiter",
    addTask: "Aufgabe hinzufügen",
    addHabit: "Gewohnheit hinzufügen",
    addMemory: "Erinnerung hinzufügen",
    installApp: "Saathi App Installieren",
    language: "App Sprache",
    customAlarms: "Tägliche Alarme",
    morningAlarm: "Morgen Reflexion Alarm",
    eveningAlarm: "Abend Ruhe Alarm",
    cloudSync: "Cloud Tresor",
    streak: "Serie",
    done: "Erledigt",
    pending: "Offen",
    exportPDF: "PDF Bericht Exportieren"
  }
};

export const getSavedLanguage = () => {
  try {
    const lang = localStorage.getItem("saathi_language");
    return lang && LANGUAGES[lang] ? lang : "en";
  } catch {
    return "en";
  }
};

export const setSavedLanguage = (lang) => {
  try {
    localStorage.setItem("saathi_language", lang);
  } catch {}
};

export const t = (key, lang = "en") => {
  const dict = translations[lang] || translations.en;
  return dict[key] || translations.en[key] || key;
};
