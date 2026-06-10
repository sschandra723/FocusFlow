# FocusFlow

FocusFlow is a web-based productivity platform designed to help users maintain deep focus through structured work sessions, ambient sound environments, and distraction management tools.

The application combines a Pomodoro timer, immersive background audio, focus protection mechanisms, and Spotify integration into a single workspace built for sustained concentration.

---

## Overview

Modern productivity is often disrupted by constant notifications, context switching, and digital distractions. FocusFlow addresses these challenges by providing a dedicated environment optimized for focused work.

The platform enables users to:

- Run structured focus sessions using the Pomodoro technique
- Create personalized work environments with ambient sounds
- Minimize interruptions through Focus Lock
- Track completed work sessions
- Integrate Spotify for background listening
- Switch seamlessly between focus and break cycles

---

## Key Features

### Deep Work Timer

FocusFlow provides a configurable Pomodoro timer system with support for:

- Focus Sessions
- Short Breaks
- Long Breaks
- Custom durations
- Automatic session transitions
- Session completion tracking

The timer engine automatically manages the workflow between work and recovery periods to encourage sustainable productivity.

---

### Ambient Sound Engine

The application includes built-in ambient environments designed to improve concentration.

Available soundscapes:

- Rain
- Forest
- Café
- Ocean
- Fireplace

The audio system supports:

- Adjustable volume controls
- Real-time switching between environments
- Continuous looping playback
- Audio caching for performance optimization
- Web Audio API fallback generation

If audio files are unavailable, FocusFlow dynamically generates environmental sounds using browser audio synthesis.

---

### Focus Lock

Focus Lock helps reduce interruptions during active sessions.

When enabled, FocusFlow can:

- Warn users before leaving the page
- Intercept navigation attempts
- Reduce accidental session abandonment
- Encourage uninterrupted focus periods

This feature is designed for users who frequently lose focus due to tab switching or accidental navigation.

---

### Productivity Tracking

FocusFlow maintains lightweight productivity statistics, including:

- Completed focus sessions
- Total focused minutes
- Session progress
- Active timer status

These metrics provide users with immediate feedback on their productivity habits.

---

### Spotify Integration

FocusFlow includes Spotify connectivity for users who prefer listening to music while working.

Features include:

- Spotify account authentication
- Playback controls
- Playlist support
- Session-friendly listening experience

Spotify token exchange is handled through a secure server-side proxy implementation to avoid exposing sensitive credentials.

---

## Architecture

```text
User
 │
 ▼
FocusFlow Interface
 │
 ├── Timer Engine
 │
 ├── Ambient Audio Engine
 │
 ├── Focus Lock System
 │
 ├── Productivity Tracking
 │
 └── Spotify Integration
          │
          ▼
     Spotify API
```

---

## Technical Highlights

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)

### Browser APIs

- Web Audio API
- Canvas API
- Local Storage API
- Notifications API
- Fullscreen API

### Backend Utilities

- Node.js
- HTTPS Local Development Server
- Netlify Functions

### Third-Party Services

- Spotify Web API

---

## Project Structure

```text
FocusFlow/
│
├── index.html
├── server.js
├── netlify.toml
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   └── audio.js
│
├── sounds/
│   ├── forest.mp3
│   ├── cafe.mp3
│   ├── ocean.mp3
│   └── fire.mp3
│
└── netlify/
    └── functions/
        └── spotify-token.js
```

---

## How It Works

### 1. Start a Session

Users select a timer mode and begin a focus session.

```text
Focus
Short Break
Long Break
Custom Session
```

---

### 2. Create a Work Environment

An ambient soundscape can be selected to create an environment suited to the task.

Examples:

- Rain for deep concentration
- Café for creative work
- Forest for relaxed focus

---

### 3. Enable Focus Lock

Focus Lock can be activated to discourage interruptions and maintain commitment to the current session.

---

### 4. Complete the Session

When the timer reaches zero:

- Session statistics are updated
- Focus minutes are recorded
- The next break cycle begins automatically
- Users can continue the Pomodoro workflow

---

## Local Development

### Clone Repository

```bash
git clone https://github.com/sschandra723/FocusFlow.git
cd FocusFlow
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
node server.js
```

Application runs at:

```text
http://localhost:3000
```

or

```text
https://localhost:3000
```

when SSL certificates are configured.

---

## Deployment

FocusFlow is designed for deployment on modern static hosting platforms.

Recommended providers:

- Netlify
- Vercel
- Render

For Spotify authentication support, Netlify deployment with serverless functions is recommended.

### Environment Variables

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

---

## Future Enhancements

Planned improvements include:

- User authentication
- Cloud synchronization
- Productivity analytics dashboard
- Session history
- Goal tracking
- Team workspaces
- Mobile support
- Calendar integrations
- AI-assisted productivity recommendations

---

## License

This project is licensed under the MIT License.

---

## Author

**Sai Sri Chandra**

FocusFlow was built to provide a distraction-free environment for deep work, combining productivity techniques, ambient audio, and modern web technologies into a unified experience.
