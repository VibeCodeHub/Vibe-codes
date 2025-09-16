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

Notes

- TypeScript strict mode enabled.
- Tests will be added in later batches. Use `npm test`.

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

Performance Notes

- Draw calls: ~3 (board + tetromino + postprocessing)
- Transmission requires HDRI environment and tone mapping for realistic refraction.
- Auto-quality: Hysteresis prevents oscillation (26ms→downgrade, 16.5ms→upgrade, 2s cooldown).
- Debug HUD: Press ` (backtick) to show FPS, DPR, draw calls, quality transitions.
- iOS Web Inspector: Use Safari's Web Inspector to monitor performance on device.
- @Web three.js MeshPhysicalMaterial transmission docs
- @Web react-three-fiber docs
- @Web drei Environment docs

