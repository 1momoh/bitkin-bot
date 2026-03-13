# 🤖 bitkin-bot

> A browser console auto-player for the [BITKIN](https://bitkin.io) endless runner game.
> Built by [**.87 🌵**](https://x.com/ofalamin) · [@ofalamin](https://x.com/ofalamin)

---

## How it works

Instead of pixel scanning the canvas (which fails due to background buildings matching obstacle brightness), **bitkin-bot hooks directly into the game's `collides()` function** — which is exposed on `window` and called every frame with the exact player and obstacle positions.

```
window.collides(player, obs) is called every game tick
         │
         ▼
bot intercepts both arguments
         │
         ▼
collect all obstacles in tick → pick closest within reactionDist
         │
         ├─ has .d sprite (STOOL/CARDS/BOTTLE) → JUMP
         ├─ gate part (h≤10 or w≤25)           → JUMP
         ├─ type === 'gate'                     → JUMP
         └─ no .d, not gate-shaped (CHIP)       → DUCK
         │
         ▼
fire keydown/keyup → cooldown guard → next tick
```

No pixel scanning. No canvas reads. No false positives.

---

## Version history

| Version | Approach | Problem |
|---|---|---|
| v1 | Canvas pixel brightness threshold | Background buildings triggered false jumps |
| v2 | Frame diffing against baseline | Buildings still close enough in brightness |
| v3 | Read `window.P`, `window.obs`, `window.spd` | Variables are in a closure, not on window |
| v4 | `collides()` hook, frame detection via `player.x` | Player x is always 88 — world scrolls, not player |
| **v5** | `collides()` hook, tick buffer, correct classifier | ✅ Working |

---

## Usage

1. Open **BITKIN** in your browser
2. Open DevTools → **Console** (`F12` or `Cmd+Option+J`)
3. Paste the full contents of `bitkin-bot.js` and hit **Enter**
4. Run `startGame()` — bot activates automatically

```
✅ Hook ready — now run startGame()
```

That's it. No extra commands needed.

---

## API

```js
BitkinBot.stop()                        // halt bot, restore original collides()
BitkinBot.config({ reactionDist: 80 }) // tune reaction distance
BitkinBot.status()                      // print live stats
```

---

## Tuning

```js
BitkinBot.config({
  reactionDist: 75,    // px ahead of player's right edge to react
                       // increase if jumping too late, decrease if too early
  actionCooldown: 350, // ms between actions (prevents double-fire)
  debug: true,         // toggle per-action console logs
})
```

### Obstacle classification

| Shape | Detected as | Action |
|---|---|---|
| Has `.d` sprite array | STOOL / CARDS / BOTTLE | **JUMP** |
| `h ≤ 10` (flat bar) | Gate top bar | **JUMP** |
| `w ≤ 25` (thin post) | Gate post | **JUMP** |
| `type === 'gate'` | Full gate object | **JUMP** |
| None of above | CHIP (flying obstacle) | **DUCK** |

---

## Why not a browser extension?

A Chrome extension would use the same `window.collides` hook — no advantage in detection accuracy. Console script is simpler, faster to iterate, and requires zero installation.

---

## Disclaimer

Built for **experimental / educational purposes** only. Do not use in competitive leaderboard contexts.

---

## License

MIT — do whatever, just keep the `.87 🌵` credit.

---

<p align="center">
  built by <strong>.87 🌵</strong> ·
  <a href="https://x.com/ofalamin">@ofalamin</a> ·
  <a href="https://t.me/Labs87">t.me/Labs87</a>
</p>
