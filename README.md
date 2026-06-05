# SubTracker Pro 💳

SubTracker Pro is a premium, offline-first subscription tracker built as a Progressive Web App (PWA). It runs entirely in the browser using `localStorage` for data persistence, allowing you to manage and visualize your subscriptions on both PC and mobile devices without a database or server backend.

## ✨ Features

- **Glassmorphic Dark Mode UI**: A premium dark-themed interface built using modern CSS layout patterns and micro-animations.
- **Mobile Responsive Design**: The layout automatically transitions from a desktop sidebar navigation to a mobile bottom tab-bar with a floating add button.
- **100% Offline-First (PWA)**: Uses a Service Worker to cache all required resources and runs without an active internet connection.
- **Native SVG Charting**: Renders lightweight, interactive doughnut charts for category spend and horizontal progress timelines for upcoming renewals.
- **Auto Date Rollover**: When a subscription's renewal date has passed, the app automatically advances the date to the next cycle (weekly, monthly, quarterly, yearly).
- **Multi-Currency Normalization**: Input subscriptions in various currencies (USD, EUR, GBP, IDR, JPY, CAD, AUD) and view a normalized total in your preferred base currency.
- **Export & Import**: Download your subscription database to a JSON file or restore from a backup.
- **Desktop Alerts**: Enable browser-based notifications to receive warning alerts when a subscription is due.

## 🚀 Local Setup

To run it on your PC:
1. Clone this repository.
2. Serve it using a local server (required for Service Workers):
   - **Python**: `python -m http.server 8000`
   - **Node.js**: `npx serve`
3. Open `http://localhost:8000` or `http://localhost:3000` in your web browser.

## 📲 Installing on iOS & Android

You can host this repository for free on platforms like **GitHub Pages**, **Vercel**, or **Netlify**.

Once hosted:
- **iOS (Safari)**: Open the link, tap **Share**, and select **Add to Home Screen**.
- **Android (Chrome)**: Open the link, tap the **Menu (three dots)**, and select **Add to Home Screen** or **Install App**.
