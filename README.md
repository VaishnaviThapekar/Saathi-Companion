# <img src="public/icons/icon-192.svg" alt="Saathi icon" width="20" height="20" style="vertical-align: middle;" /> Saathi

Saathi ("friend") is your personal AI companion for wellness, productivity, and reflection.

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


## ✨ Features

- ✅ **Daily Check-in** - Mood + reflections
- ✅ **Mood Timeline** - Weekly mood snapshot
- ✅ **Tasks** - Add, complete, due reminders
- ✅ **Habits** - Daily/weekly goals, streaks, reminders
- ✅ **Reminders Dashboard** - Manage habit reminders inside Habits
- ✅ **Gratitude Journal** - Daily gratitude tracking
- ✅ **Energy Tracker** - Log energy levels 1-5
- ✅ **Breathing Exercises** - Guided 4-4-6 breathing
- ✅ **Voice Notes** - Record & transcribe
- ✅ **Memories** - Photo and note memories
- ✅ **Daily Notes** - Calendar-based notes
- ✅ **Chat** - AI companion chat
- ✅ **Affirmations** - Personalized based on struggles
- ✅ **Privacy Lock** - PIN lock with change/reset
- ✅ **Export** - JSON + CSV export with selection
- ✅ **PWA Ready** - Installable and offline-capable

---

## 📁 Project Structure

```
src/
├── App.js                      # Main application (screens + logic)
├── index.js                    # Entry point
├── serviceWorkerRegistration.js# PWA registration
├── components/
│   └── screens/
│       └── HomeScreen.js       # Home dashboard UI
└── styles/
    └── global.css              # Global styles

public/
├── index.html                  # HTML shell
├── manifest.json               # PWA manifest
├── service-worker.js           # Offline caching
└── icons/                       # App icons
```

---

## 🔧 Configuration

### Storage API

By default, uses `localStorage`. If you want to swap in a different storage layer, update the `window.storage` shim in `App.js`.

### AI Integration

Update the API configuration inside `App.js` where `callAI` is defined.

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

---

## 🎨 Customization

### Colors
Edit gradient values in `src/styles/global.css`

### Features
Enable/disable features by modifying screen imports in `App.js`

### AI Prompts
Customize AI behavior in `src/utils/ai.js`

---

## 🐛 Troubleshooting

### Voice Notes Not Working
- Use Chrome/Edge (not Firefox/Safari)
- Check microphone permissions

### Notifications Not Showing
- Grant notification permissions
- Must be HTTPS (or localhost)

### Storage Not Persisting
- Check browser privacy settings
- Ensure cookies/storage enabled

---

## 📝 License

MIT License - Free to use and modify

---

## 💖 Support

Built with love using React

**Enjoy your personal AI companion!** 🌸
