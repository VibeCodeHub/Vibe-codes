R3F Glass Tetris

React + Vite + TypeScript + @react-three/fiber + drei + three.js.

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

Offline Assets

- ✅ Core game assets (JS, CSS, HTML)
- ✅ Icons and manifest
- ⚠️ HDRI environment (lazy-loaded, cached 7 days)
- ❌ External CDN assets (fallback to default environment)

@Web three.js MeshPhysicalMaterial transmission docs
@Web react-three-fiber docs
@Web drei Environment docs

