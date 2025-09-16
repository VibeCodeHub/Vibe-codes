R3F Glass Blocks

A photorealistic 3D block-stacking game built with React + Vite + TypeScript + @react-three/fiber + drei + three.js.

Install

```bash
npm install
```

Run (dev)

```bash
npm run dev
```

Then open the URL printed by Vite.

Build

```bash
npm run build && npm run preview
```

Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Health check: `curl https://your-app.vercel.app/health.json`

Notes

- TypeScript strict mode enabled.
- Tests: `npm test` (all tests pass)
- Health endpoint: `/health.json` returns app status

Material Tuning

- MeshPhysicalMaterial (baseline glass):
  - transmission=1 enables refraction; requires an environment (HDRI) to read.
  - ior≈1.5 controls refraction strength; higher feels denser.
  - thickness≈0.18–0.25 controls transmission distance; too high looks foggy.
  - roughness≈0.05–0.10 blurs reflections; lower is clearer, higher is frosted.
  - env intensity: tune via Environment intensity and renderer exposure.
  - See three.js docs for transmission details.

Troubleshooting

- Black/dim glass: environment not loaded. Ensure `<Environment preset="city" />` is present.
- Foggy glass: reduce roughness and/or thickness; increase attenuationDistance.
- FPS dips: reduce DPR (e.g., `dpr={[1,1.5]}`), lower bloom intensity, or disable bloom.

Mobile

- Quality levels: Low (solid), Medium (transmission, no bloom), High (transmission + bloom).
- Auto-quality: Frame-time monitoring adjusts quality automatically on sustained regress.
- Touch controls: Swipe left/right to move, up/down to rotate, long-press for soft drop.
- DPR scaling: AdaptiveDpr clamps to [1,2] based on performance.
- Query override: `?quality=low|medium|high` for testing.

PWA (Progressive Web App)

- Installable on mobile devices and desktop.
- Offline-ready: Core game assets cached, HDRI files cached for 7 days.
- iOS: Add to Home Screen for full-screen experience.
- Android: Install prompt appears automatically.

PWA Install Instructions

iOS (Safari):
1. Open the game in Safari
2. Tap the Share button (square with arrow)
3. Select "Add to Home Screen"
4. Tap "Add" to install
5. Game launches in full-screen mode without Safari UI

Android (Chrome):
1. Open the game in Chrome
2. Look for "Install" banner or menu option
3. Tap "Install" when prompted
4. Game appears as native app in app drawer

Performance Notes

- Draw calls: ~6 (board + tetromino + ghost + frame + grid + postprocessing)
- Transmission requires HDRI environment and tone mapping for realistic refraction.
- Auto-quality: Hysteresis prevents oscillation (26ms→downgrade, 16.5ms→upgrade, 2s cooldown).
- Debug HUD: Press ` (backtick) to show FPS, DPR, draw calls, quality transitions.
- iOS Web Inspector: Use Safari's Web Inspector to monitor performance on device.

Replay System

The game includes a deterministic replay system for recording and playing back gameplay sessions.

**Recording:**
1. Click "Record" to start recording inputs
2. Play normally - all inputs are captured
3. Click "Stop Rec" to stop recording
4. Click "Export" to download replay as JSON file

**Playback:**
1. Click "Import" → "File" to load from file, or "Clipboard" to load from clipboard
2. Click "Play" to start replay (live input is blocked during replay)
3. Click "Stop" to stop replay

**Replay Format:**
```json
{
  "seed": "game-seed-string",
  "inputs": [
    {"t": 0, "action": "move", "data": -1},
    {"t": 5, "action": "rotate", "data": 1},
    {"t": 10, "action": "hardDrop"},
    {"t": 15, "action": "softDrop", "data": 1}
  ],
  "version": "1.0.0",
  "timestamp": 1234567890,
  "score": 1500,
  "lines": 5
}
```

**Actions:**
- `move`: data = -1 (left) or 1 (right)
- `rotate`: data = -1 (CCW) or 1 (CW)
- `softDrop`: data = 1 (start) or 0 (stop)
- `hardDrop`: no data
- `hold`: no data
- `pause`/`resume`: no data

**Determinism:**
- Same seed + same inputs = identical game state
- Replays are frame-perfect reproductions
- All game logic is deterministic (RNG, physics, scoring)

Offline Assets

- ✅ Core game assets (JS, CSS, HTML)
- ✅ Icons and manifest
- ⚠️ HDRI environment (lazy-loaded, cached 7 days)
- ❌ External CDN assets (fallback to default environment)

## Legal Notes

This game is inspired by classic block-stacking puzzle games. The game mechanics and scoring system are based on established conventions in the puzzle game genre. The Super Rotation System (SRS) implementation follows the official Tetris Guideline specification as documented in the Tetris Wiki.

**SRS Source**: https://tetris.wiki/Super_Rotation_System

This project is for educational and entertainment purposes. All code is original implementation using open-source libraries.

## Technical References

@Web three.js MeshPhysicalMaterial transmission docs
@Web react-three-fiber docs
@Web drei Environment docs

