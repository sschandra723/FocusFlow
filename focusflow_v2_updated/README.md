# FocusFlow — Deep Work Timer

## 🚀 Deploy to Netlify (FREE — enables Spotify)

Spotify now blocks localhost. You need a real HTTPS URL.
Netlify is free and takes 2 minutes.

### Steps:
1. Go to https://netlify.com → Sign up (free)
2. Click **Add new site → Deploy manually**
3. **Drag the entire `focusflow_v2` folder** onto the Netlify drop zone
4. Netlify gives you: `https://something-123.netlify.app`
5. Copy that URL

### Then set up Spotify:
1. Go to https://developer.spotify.com/dashboard
2. Open your **FocusFlow** app → Settings
3. Under **Redirect URIs** — remove old file:// and localhost entries
4. Add your Netlify URL with trailing slash: `https://something-123.netlify.app/`
5. Click Add → Save
6. Under **User Management** → add your Spotify email → Save
7. Open your Netlify URL → click **Connect with Spotify** ✅

---

## Running locally (timer only, no Spotify)
Just open `index.html` in a browser.
Spotify won't work from file:// — deploy to Netlify for that.

## Ambient sounds
- 🌧 Rain — synthesised (Web Audio)
- 🌿 Forest — sounds/forest.mp3
- ☕ Café — sounds/cafe.mp3
- 🌊 Ocean — sounds/ocean.mp3
- 🔥 Fireplace — sounds/fire.mp3
