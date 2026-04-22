# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the game

No build step, no server required. Open `index.html` directly in Chrome or Firefox:

```
start index.html          # Windows
open index.html           # macOS
```

Phaser 3 and the "Press Start 2P" font are loaded from CDN, so an internet connection is required on first load (both are cached by the browser afterwards).

## Repository layout

```
index.html        – entry point; loads Phaser 3 CDN + game.js
game.js           – entire shooter game (~650 lines, no external deps)
tictactoe.html    – standalone tic-tac-toe (single self-contained file)
```

## game.js architecture

The file is structured as four consecutive sections:

### 1. `SoundManager` (module-level singleton `sfx`)
Wraps the Web Audio API. All sounds are synthesized at runtime — no audio files. `sfx.play(id)` dispatches to `_tone()` (oscillator with frequency sweep + gain envelope) or `_noise()` (white-noise buffer). The `AudioContext` is created lazily on first `play()` call to satisfy browser autoplay policies. Valid IDs: `shoot`, `hit`, `enemyDeath`, `playerHit`, `waveStart`, `gameOver`, `scoreUp`.

### 2. `BootScene`
Runs once at startup. Every sprite and overlay is drawn with Phaser `Graphics` objects and baked into named textures via `generateTexture()`. **There are no image files** — if you need a new sprite, add a `_mySprite()` method here, call it from `create()`, and reference the texture key in `GameScene`. Helper `_px(g, color, [[x,y,w,h], ...])` batch-fills rectangles.

Textures produced: `player`, `gun`, `walker`, `runner`, `tank`, `bullet`, `flash`, `spark`, `grid`, `scanlines`, `heart`.

### 3. `GameScene`
Main gameplay. Key design decisions:

- **State reset in `init()`**, not `create()` — Phaser calls `init()` before every scene restart, so scores/flags always reset cleanly.
- **Wave ID guard**: `this.waveId` is incremented at the start of each wave; spawner callbacks compare against the captured `id` to ignore stale callbacks from previous waves after a quick player death and restart.
- **Gun is not a physics body** — it's a plain `this.add.sprite` positioned manually each frame to follow `this.player` and rotated toward `this.input.activePointer`. `setFlipY` compensates for the 180° rotation when aiming left so the gun doesn't appear upside-down.
- **Walking bob** is a `setScale(1, 1 + sin(bobAngle) * 0.07)` applied each frame — avoids conflicting with the physics body's position.
- **Bullet lifespan** is enforced two ways: a `time.delayedCall(1100ms)` for normal expiry, and an off-screen bounds check at the bottom of `update()` iterating backward over `bullets.getChildren()`.
- **Enemy AI** is pure seek: `velocityFromAngle` toward player position, recalculated every frame.
- **Wave completion** is tracked by `waveKills >= waveTotal`. Since you can only kill enemies that have already spawned, the count can never trip early even when enemies die before all spawners fire.

### 4. `GameOverScene`
Displays score/wave/kills, accepts click or any keypress to restart `GameScene`. Re-uses the `grid` and `scanlines` textures generated in `BootScene`.

## Enemy tuning

Defined in `_spawnEnemy()`. Three types chosen by wave number and a random roll:

| Type | Unlocks | HP | Base speed | Points |
|---|---|---|---|---|
| `walker` | wave 1 | 3 | 80 + (wave−1)×5 | 10 |
| `runner` | wave 3 | 1 | 170 + (wave−3)×7 | 20 |
| `tank` | wave 5 | 8 | 52 + (wave−5)×3 | 60 |

Wave enemy count: `4 + (wave − 1) × 2`.

## Depth / z-order

| Layer | Depth |
|---|---|
| Background grid | 0 |
| Enemies | 4 |
| Player | 5 |
| Gun | 6 |
| Bullets | 7 |
| Muzzle flash | 8 |
| Sparks | 10 |
| HUD text & hearts | 500 |
| Scanlines | 999 |
| Wave banners | 800 |

## Git workflow

GitHub remote: `https://github.com/Dev-Gustavo-Alfa/retro-shooter`

Commit message convention used in this project:
```
feat:     new gameplay feature
fix:      bug fix
refactor: code restructure with no behaviour change
chore:    tooling, deps, config
```

Push after every meaningful change:
```
git add <files>
git commit -m "feat: description"
git push
```
