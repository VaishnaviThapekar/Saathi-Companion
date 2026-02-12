# <img src="public/icons/icon-192.svg" alt="Saathi icon" width="20" height="20" style="vertical-align: middle;" /> Saathi

Saathi ("friend") is your personal AI companion for wellness, productivity, and reflection.

> **Your safe space for daily thoughts, feelings, and growth.**

---

## ✨ What Makes Saathi Unique

- 🧠 **Remembers Your Moments** – Tracks meaningful moments (proud, struggles, what helped) and refers back to them in chat
- 💬 **Empathetic Local AI Chat** – Have real conversations with an AI that knows your journey (no API key needed by default)
- 🎯 **Daily Check-ins** – Guided mood & reflection prompts that adapt to your needs
- 🔒 **Privacy First** – PIN-protected, fully offline-capable, all data stays on your device
- 💾 **Persistent Data** – Every note, thought, and entry is saved permanently (until you delete)
- 🎨 **Beautiful, Calming Design** – Soft gradients, smooth animations, optimized for mobile and desktop
- 📥 **Export Your Memories** – Download all your data as JSON or CSV anytime

---

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm start
```

Opens at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

---


## ✨ Features & UI Overview

| Screen | 🎯 What You Do |
|--------|---|
| 🏠 **Home Dashboard** | See personalized greeting, today's mood, gratitude, energy, habits, and quick stats |
| 💭 **Daily Check-in** | Select mood (amazing/good/okay/struggling/overwhelmed), share feelings, get AI support |
| ✅ **Tasks** | Create tasks, set due dates/times, mark complete, see overdue warnings, focus mode |
| 🔥 **Habits** | Build daily/weekly habits, track streaks, set reminders, see completion stats |
| 🌟 **Wellness Center** | Gratitude journal, energy tracker (1-5), mood timeline, affirmations, breathing exercises, voice notes |
| 📸 **Memories** | Save photos with captions & emotions, track proud moments, log struggles, note what helps |
| 📝 **Daily Notes** | Calendar-based journal, persistent notes, reflect on the day, search by date |
| 💬 **Chat Companion** | Talk anytime, she remembers your journey, celebrates wins, suggests helpful tools |
| 🔐 **Privacy & Security** | PIN protection, change/reset PIN, export all data (JSON/CSV), reset account |

---

## ✨ Features

✅ **17 Features Included:**
- Daily Check-in with mood & reflections
- Weekly mood timeline & history
- Complete task management with reminders
- Habit tracking with streaks & progress
- Gratitude journal
- Energy level tracker (1-5)
- Breathing exercises (4-4-6 guided)
- Voice recording & transcription
- Photo + text memories
- Calendar-based daily notes
- AI companion chat
- Personalized affirmations
- Privacy lock (PIN protection)
- Data export (JSON/CSV)
- PWA ready (install as app)
- Full offline support
- Persistent localStorage (nothing uploaded)

---

## 📁 Project Structure

```
src/
├── App.js                      # Main application & state management
├── index.js                    # React entry point
├── serviceWorkerRegistration.js# PWA offline support
├── components/
│   ├── screens/                # All 8 main screens
│   │   ├── HomeScreen.js       # Dashboard UI
│   │   ├── DailyNotesScreen.js # Calendar & journal
│   │   └── ...                 # Wellness, Tasks, Habits, Chat, etc.
│   └── common/
│       └── Icon.js             # Reusable icon component
├── utils/
│   ├── ai.js                   # AI chat engine
│   ├── storage.js              # localStorage helpers
│   └── helpers.js              # Utility functions
└── styles/
    └── global.css              # Gradients, animations, responsive design

public/
├── index.html                  # HTML shell
├── manifest.json               # PWA app manifest
├── service-worker.js           # Offline caching
└── icons/                      # App icons (192×192, 512×512 PNG)

api/
└── claude.js                   # Vercel serverless proxy (optional)

.gitignore                      # Excludes .env, node_modules, etc.
package.json                    # Dependencies & scripts
```

---

## 🔧 Configuration

### Local Storage & Privacy
- All data stored in browser `localStorage`
- **Nothing is sent to any server** by default
- Works completely offline after first load
- Your data = your device only

### Local AI Chat (No API Key Required)
The app uses an intelligent rule-based chatbot by default. For empathetic, context-aware responses without needing an API key:
- Recognizes moods (sad, tired, stressed, excited, etc.)
- Remembers your struggles & proud moments
- Suggests helpful actions (breathing, tasks, affirmations)
- Customize responses in `src/utils/ai.js`

### Optional: Add Claude API (Advanced)
To enable real Claude AI responses on Vercel:
1. Get an API key from [claude.ai](https://console.anthropic.com)
2. Add `ANTHROPIC_API_KEY` to Vercel environment variables
3. The app will automatically use the serverless proxy in production

---

## 🌐 Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag /build folder to netlify.com/drop
```

### GitHub Pages
```bash
npm install --save-dev gh-pages

# Add to package.json:
"homepage": "https://VaishnaviThapekar.github.io/Saathi-companion",
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

npm run deploy
```

---

## 📱 Mobile Installation

1. Deploy to a URL
2. Open on phone
3. **iPhone:** Safari → Share → "Add to Home Screen"
4. **Android:** Chrome → Menu → "Add to Home Screen"
5. **Desktop:** Chrome/Edge → Install icon in the address bar

## 🎨 Customization

### Colors & Design
Edit gradient values in `src/styles/global.css`

### Features
Enable/disable screens by modifying imports in `App.js`

### AI Chat Responses
Customize responses in `src/utils/ai.js` – add your own patterns, prompts, and follow-ups

### Icons & Branding
Replace icons in `public/icons/` with your own 192×192 and 512×512 PNG files

---

## 💾 Data Export & Privacy

**Your data is yours!** Saathi gives you multiple ways to access it:

### Export Options
- **JSON Export** – Complete backup of all data with every detail
- **CSV Export** – Tasks, habits, and notes as spreadsheet files
- **Selective Export** – Choose which sections to include
- All exports happen **locally** (nothing uploaded anywhere)

### Privacy Features
- 🔐 PIN-protected app (optional)
- 📵 No account logins required
- 🚫 No tracking or analytics (except basic React dev)
- 🛡️ Works completely offline
- 🗑️ Delete everything instantly

---



### Colors & Design
Edit gradient values in `src/styles/global.css`

### Features
Enable/disable screens by modifying imports in `App.js`

### AI Chat Responses
Customize responses in `src/utils/ai.js` – add your own patterns, prompts, and follow-ups

### Icons & Branding
Replace icons in `public/icons/` with your own 192×192 and 512×512 PNG files

---

## 🐛 Troubleshooting

### Voice Notes Not Working
- Use Chrome or Edge (Firefox/Safari have limited Web Speech API support)
- Check microphone permissions in browser settings

### Notifications Not Showing
- Grant notification permission when prompted
- Notifications only work on HTTPS (or localhost for testing)

### Storage Not Persisting
- Check browser privacy/incognito mode (data only in active tab)
- Ensure cookies/storage aren't blocked in Settings

### Chat Responses Are Generic
- Customize replies in `src/utils/ai.js`
- Add your own prompts and logic

### App Data Disappeared
- Most common: browser privacy mode (delete data on close)
- Check: Browser settings → Privacy → Storage
- Solution: Use normal browsing mode or export data regularly

---

## 📝 License

MIT License - Free to use, modify, and distribute

---

## 💖 Built With

- **React 18.2** – Fast, interactive UI
- **Local Storage** – Privacy-first data
- **Web APIs** – Notifications, voice, offline
- **Claude API (optional)** – Advanced AI responses

---

**Enjoy your personal AI wellness companion!** ✨

*Made with ❤️ for your wellness journey.* 🌸
