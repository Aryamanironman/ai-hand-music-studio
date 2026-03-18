# 🎵 AI Hand Music Studio

> Transform hand gestures into music in real-time using your webcam.

AI Hand Music Studio is an interactive web application that uses **MediaPipe Hands** to detect your hand and finger movements through your laptop camera, converting them into musical notes powered by **Tone.js** — all happening in real-time in your browser.

---

## ✨ Features

- **🖐️ Real-time Hand Tracking** — Uses MediaPipe Hands to detect and track hand landmarks through your webcam
- **🎹 Finger-to-Note Mapping** — Each finger maps to a musical note (Thumb→C, Index→D, Middle→E, Ring→F, Pinky→G)
- **🎸 Multiple Instruments** — Switch between Piano, Synth, and Guitar sounds in real-time
- **🎵 Chord Support** — Raise multiple fingers to play chords
- **📊 Live Waveform Visualization** — Real-time audio waveform display with gradient effects
- **🔴 Recording System** — Record your hand-played music and play it back
- **✋ Gesture Controls** — Fist to stop playing, open hand to play
- **🌟 Visual Feedback** — Glowing fingertip highlights with color-coded note labels
- **🎨 Modern Dark UI** — Glassmorphism design with neon glow effects and smooth animations

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React** (Vite) | Frontend framework |
| **Tailwind CSS** | Styling & design system |
| **MediaPipe Hands** | Real-time hand tracking |
| **Tone.js** | Audio synthesis engine |
| **Web Audio API** | Waveform visualization & recording |
| **Canvas API** | Hand landmark overlay rendering |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- A modern browser (Chrome recommended for best WebRTC/MediaPipe support)
- A working webcam

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-hand-music-studio.git

# Navigate to the project
cd ai-hand-music-studio

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🎮 How to Use

1. **Click "Start Camera"** to enable your webcam
2. **Allow camera permissions** when prompted
3. **Show your hand** to the camera
4. **Raise fingers** to play notes:
   - 👍 **Thumb** → C4
   - 👆 **Index** → D4
   - 🖕 **Middle** → E4
   - 💍 **Ring** → F4
   - 🤙 **Pinky** → G4
5. **Make a fist** to stop all sounds
6. **Switch instruments** using the panel on the right
7. **Record** your performance and **play it back**

---

## 📁 Project Structure

```
ai-hand-music-studio/
├── src/
│   ├── components/
│   │   ├── CameraView.jsx        # Webcam feed & overlay canvas
│   │   ├── HandTracker.jsx       # MediaPipe hand detection logic
│   │   ├── InstrumentPanel.jsx   # Instrument selector & note display
│   │   ├── WaveformVisualizer.jsx # Real-time audio waveform
│   │   └── Controls.jsx          # Camera, record, playback controls
│   ├── utils/
│   │   ├── fingerDetection.js    # Finger state detection algorithms
│   │   ├── soundEngine.js        # Tone.js audio engine
│   │   └── recording.js          # Web Audio recording utility
│   ├── App.jsx                   # Main application component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles & design system
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 📸 Screenshots

> Screenshots will be added here.

| Camera + Hand Tracking | Instrument Panel |
|---|---|
| *Live hand tracking with glowing fingertips* | *Instrument selector with active notes* |

| Waveform Visualization | Recording Controls |
|---|---|
| *Real-time audio waveform display* | *Record and playback your music* |

---

## 🔮 Future Improvements

- [ ] **Two-hand support** — Track both hands for a wider note range
- [ ] **Custom note mapping** — Let users assign their own notes to fingers
- [ ] **Volume control** — Use finger spread distance to control volume
- [ ] **Pitch shifting** — Map hand horizontal position to pitch
- [ ] **MIDI export** — Export recordings as MIDI files
- [ ] **More instruments** — Add drums, bass, strings, and more
- [ ] **Visual piano keyboard** — On-screen keyboard highlighting
- [ ] **Mobile support** — Front-facing camera on mobile devices
- [ ] **Collaborative mode** — Multiple users jamming together
- [ ] **AI accompaniment** — AI-generated background music that responds to your playing

---

## 📄 License

MIT License — feel free to use, modify, and share.

---

<p align="center">
  Built with ❤️ using React, MediaPipe, and Tone.js
</p>
