/**
 * ╔══════════════════════════════════════════╗
 * ║         BITKIN AUTO-PLAYER BOT  v5       ║
 * ║         built by .87 🌵 @ofalamin        ║
 * ╚══════════════════════════════════════════╝
 *
 * v5: fixed — player.x is always 88 (world scrolls, player doesn't)
 *
 * Root cause of all previous failures:
 *   v3 — P/obs/spd are in a closure, not on window
 *   v4 — used player.x change to detect new frames,
 *         but player never moves so bot never fired
 *
 * Fix: hook collides(), react directly on every call.
 * Cooldown prevents double-firing within the same threat.
 *
 * From the logs:
 *   player = { x: 88, y: 670, w: 48, h: 80 }  ← always x:88
 *   player right edge = 88 + 48 = 136
 *   obstacle at x ~155 → dist = 19px (already on top of player!)
 *   → reactionDist must be much larger (200px+)
 */

(function BitkinBot() {
  'use strict';

  const CONFIG = {
    reactionDist: 75,     // px ahead of player's right edge — tight to avoid early fires
    actionCooldown: 350,  // ms between actions
    debug: true,
  };

  let running       = false;
  let lastAction    = 0;
  let jumpCount     = 0;
  let duckCount     = 0;
  let _orig         = null;

  // ─── KEYS ──────────────────────────────────────────────────────────────────
  function fireKey(key) {
    ['keydown','keyup'].forEach(t =>
      document.dispatchEvent(new KeyboardEvent(t, { key, code: key === ' ' ? 'Space' : key, bubbles: true }))
    );
  }

  function doJump() {
    fireKey(' ');
    fireKey('ArrowUp');
    jumpCount++;
    if (CONFIG.debug) console.log(`[BitkinBot] 🦘 JUMP #${jumpCount}`);
  }

  function doDuck() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true }));
    setTimeout(() =>
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true }))
    , 220);
    duckCount++;
    if (CONFIG.debug) console.log(`[BitkinBot] 🦆 DUCK #${duckCount}`);
  }

  // ─── CLASSIFY ──────────────────────────────────────────────────────────────
  // Classify obstacle:
  //   has .d (sprite data)  → ground obstacle (STOOL/CARDS/BOTTLE) → JUMP
  //   type === 'gate'       → gate obstacle — jump OVER it          → JUMP
  //   no .d, h <= 10        → gate top bar (thin) — jump over       → JUMP
  //   no .d, w <= 25        → gate post (tall, thin) — jump over    → JUMP
  //   no .d, y well above ground → CHIP (flying) → DUCK
  //   fallback              → JUMP (safe default)
  function classify(o) {
    if (o.d !== undefined)   return 'jump';  // sprite = ground obstacle
    if (o.type === 'gate')   return 'jump';  // gate = jump over whole frame
    if (o.h <= 10)           return 'jump';  // gate top bar (h:8) = jump
    if (o.w <= 25)           return 'jump';  // gate post (w:20, tall) = jump
    // CHIP: no .d, not gate-shaped, flies in from above → duck
    return 'duck';
  }

  // ─── HOOK ──────────────────────────────────────────────────────────────────
  function install() {
    if (!window.collides) {
      console.warn('[BitkinBot] window.collides not found');
      return false;
    }
    _orig = window.collides;

    // Buffer: collect all obstacles seen this tick, decide at end of tick
    let tickBuffer  = [];
    let tickTimeout = null;

    function decideTick() {
      if (!tickBuffer.length) return;
      const player = tickBuffer[0].player;
      const playerRight = player.x + player.w;

      // Find closest obstacle ahead within reaction range
      let best = null, bestDist = Infinity;
      for (const { obs } of tickBuffer) {
        const dist = obs.x - playerRight;
        if (dist > 0 && dist < CONFIG.reactionDist && dist < bestDist) {
          best = obs; bestDist = dist;
        }
      }
      tickBuffer = [];
      if (!best) return;

      const now = Date.now();
      if (now - lastAction < CONFIG.actionCooldown) return;

      const action = classify(best);
      if (CONFIG.debug) console.log(`[BitkinBot] 👁 ${action.toUpperCase()} | dist: ${Math.round(bestDist)} | type: ${best.type || (best.d ? 'sprite' : 'no-d')}`);
      if (action === 'jump') doJump(); else doDuck();
      lastAction = now;
    }

    window.collides = function(player, obs) {
      if (running) {
        tickBuffer.push({ player, obs });
        // Schedule decide at end of this tick (all collides calls happen synchronously)
        if (!tickTimeout) {
          tickTimeout = setTimeout(() => { tickTimeout = null; decideTick(); }, 0);
        }
      }
      return _orig(player, obs);
    };

    return true;
  }

  function uninstall() {
    if (_orig) { window.collides = _orig; _orig = null; }
  }

  // ─── API ───────────────────────────────────────────────────────────────────
  window.BitkinBot = {
    start() {
      if (!install()) return;
      running = true;
      console.log('%c[BitkinBot] ✅ v5 running — start the game!', 'color:#00ffcc;font-weight:bold');
    },
    stop() {
      running = false;
      uninstall();
      console.log(`%c[BitkinBot] 🛑 Stopped. Jumps: ${jumpCount} | Ducks: ${duckCount}`, 'color:#ff6b6b;font-weight:bold');
    },
    config(o) { Object.assign(CONFIG, o); console.log('[BitkinBot] Config:', CONFIG); },
    status()  { console.log({ running, jumpCount, duckCount, config: CONFIG }); },
  };

  // ─── BANNER + AUTO-START ───────────────────────────────────────────────────
  console.log('%c╔══════════════════════════════════════╗', 'color:#00ffcc');
  console.log('%c║    BITKIN BOT v5  •  .87 🌵          ║', 'color:#00ffcc;font-weight:bold');
  console.log('%c╚══════════════════════════════════════╝', 'color:#00ffcc');
  console.log('[BitkinBot] %cBitkinBot.stop()%c   — halt', 'color:#ff6b6b;font-weight:bold','');
  console.log('[BitkinBot] %cBitkinBot.config({ reactionDist: 280 })%c — tune', 'color:#ffd700;font-weight:bold','');

  if (install()) {
    running = true;
    console.log('%c[BitkinBot] ✅ Hook ready — now run startGame()', 'color:#00ffcc;font-weight:bold');
  }

})();
