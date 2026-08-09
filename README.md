# Silent Signal 🧮🆘

**A calculator that quietly calls for help.**

Built for Hack Devengers 1.0 — Open Innovation Track.

🔗 **Live demo:** https://kishorereddycse860-hub.github.io/-silent-signal-/
📦 **Repo:** https://github.com/kishorereddycse860-hub/-silent-signal-

> Open the live link on your phone, tap "Set up my code" to set a secret PIN and emergency contact, then trigger it by typing that PIN on the calculator and pressing `=`.

## The Problem

When someone is in danger — an unsafe ride, harassment, a threatening situation at home or in public — pulling out a phone and visibly calling for help can escalate the risk. Most safety apps look like safety apps, which is exactly why they're hard to use discreetly: an attacker who sees a bright red "SOS" screen knows immediately what's happening.

## The Idea

Silent Signal looks and works like a completely ordinary calculator. It performs real arithmetic, has no visible "panic button," and raises no suspicion on a lock screen or in someone else's hands.

Underneath, the user sets a private numeric code and an emergency contact. If they're ever in danger, they open the "calculator," type their code, and press `=` — exactly like doing a sum. Silent Signal then:

1. Grabs the device's current GPS location
2. Builds an alert message with a live Google Maps link
3. Opens a pre-filled text message to the emergency contact — one tap to send

The calculator screen shows a normal result the entire time. Nothing on screen indicates anything happened.

## Features

- 🧮 Fully functional calculator (add, subtract, multiply, divide, %, +/-)
- 🔒 Private numeric trigger code, set by the user, stored only on their device
- 📍 Live GPS location attached to every alert
- 💬 One-tap handoff to native SMS with a pre-filled emergency message
- 📜 Hidden alert history log (visible only from the settings screen)
- 🕵️ Settings screen is reachable only via a secret gesture (tap "AC" 5× quickly) — invisible to anyone else using the phone
- 📱 Fully responsive — built mobile-first since this is a phone-in-pocket use case

## Why It's Different

Most safety-tech submissions are visible SOS buttons, chatbots, or reporting dashboards. Silent Signal's entire design premise is **camouflage** — the safety mechanism is the disguise. There's no separate "safety app" to explain away if someone checks your phone.

## Tech Stack

Pure HTML, CSS, and vanilla JavaScript — no frameworks, no build step, no backend server or API keys required. This is a deliberate choice: it keeps the app installable/usable instantly (just open `index.html` or the deployed link), works offline except for the final SMS handoff, and has zero dependency on a paid SMS API for the demo.

- Browser Geolocation API for live coordinates
- `sms:` URI scheme to hand off to the device's native messaging app (no third-party SMS gateway needed)
- `localStorage` for on-device settings and alert history — nothing leaves the device except the one SMS the user's own phone sends

## Running Locally

No install needed — it's static files.

```bash
# Option 1: just open it
open index.html

# Option 2: serve it (recommended, geolocation permissions behave better over http/https)
npx serve .
```

## Project Structure

```
-silent-signal-/
├── index.html      # Calculator UI + hidden settings/history/onboarding screens
├── css/style.css    # Realistic calculator styling, dark theme
├── js/app.js        # Calculator logic, secret-code detection, alert trigger
└── README.md
```

## Roadmap / What We'd Add With More Time

- Silent alert via backend (Twilio/Firebase Cloud Function) instead of relying on the native SMS app, so it works even if the user can't tap "send"
- Multiple emergency contacts, sent in parallel
- Optional silent audio/photo capture attached to the alert
- PWA install support for a true "looks like a real app" home-screen icon

## Team Devengers — Hack Devengers 1.0

Built in a single-day build window (9 AM–5 PM), submitted for the Open Innovation problem statement.
