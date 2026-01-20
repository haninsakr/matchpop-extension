# ⚽ MatchPop – Live Football Scores Browser Extension

MatchPop is a lightweight browser extension that lets you track live, finished, and upcoming football matches directly from your browser popup — fast, clean, and distraction-free.

Designed for desktop users who want instant access to match data without opening heavy websites or apps.

---

## 🚀 Features

- Live / Finished / Upcoming matches
- Favorite leagues management
- League & status filtering
- Dark mode / Light mode
- Auto refresh (no page reload)
- Goals details (expand / collapse)
- Lightweight popup UI
- Optimized API usage with caching
- Arabic / English language toggle (RTL support)

---

## 🧠 Project Goal

MatchPop was built to provide a **fast, minimal, and efficient** way to follow football matches while working on desktop.

The focus of the project is on:
- Performance optimization
- Clean UI logic for small surfaces (popup)
- Efficient API integration
- Real-world usability

---

## 🛠 Tech Stack

- **Vanilla JavaScript**
- **HTML5 / CSS3**
- **Chrome Extensions API (Manifest v3)**
- **API-Sports (Football API)**
- **Chrome Storage API**

---

## 🏗 Project Structure

```
├── manifest.json
├── football_popup_html.html   # Extension popup UI
├── football_popup_js.js       # Main logic (state, UI, API)
├── football_background_js.js  # Background service worker
├── icon16.png
├── icon48.png
├── icon128.png
```

---

## 🔄 Data Flow

1. User opens MatchPop popup
2. Settings & preferences load from Chrome Storage
3. API key is validated and stored locally
4. Matches fetched from API-Sports
5. Data cached (2 minutes) to reduce requests
6. Matches filtered & sorted locally
7. UI updates instantly without reload

---

## ⚡ Performance Optimizations

- Caching strategy to limit API calls
- Local filtering & sorting (no re-fetching)
- Lazy loading for goals data
- State-based rendering instead of full reloads
- Minimal DOM manipulation

---

## 🌐 API Integration

- Provider: **API-Sports (api-football)**
- Endpoints used:
  - `/fixtures` (matches)
  - `/fixtures/events` (goals)
  - `/status` (API validation)

Free-plan limitations are handled gracefully with UI states.

---

## 🌙 Theme & Language Support

- Dark / Light mode (saved locally)
- Arabic / English toggle
- Full RTL support for Arabic UI

---

## 📦 Installation (Local Development)

1. Clone the repository
2. Open Chrome → `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the project folder
6. Enter your API key when prompted

---

## 🔐 Security

- API key is stored **locally only** (Chrome Storage)
- No external servers or tracking
- Fully client-side architecture

---

## 🔧 Roadmap

- Background auto-refresh
- Notifications for live matches
- Team favorites (not only leagues)
- Improved caching strategy
- Performance profiling & refactoring

---

## 📚 Learning Outcomes

- Chrome Extension architecture (Manifest v3)
- Real-world API handling
- Performance optimization & caching
- State management without frameworks
- UI/UX for constrained surfaces

---

## 👩‍💻 Author

Built as a real-world side project focused on performance, usability, and clean engineering.

---

## 📄 License

MIT License

