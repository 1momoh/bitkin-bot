# 🤖 bitkin-bot

> A browser console auto-player for the [BITKIN](https://bitkin.fun/game/) endless runner game.
> Built by [**.87 🌵**](https://x.com/ofalamin) · [@ofalamin](https://x.com/ofalamin)

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
