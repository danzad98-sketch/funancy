# Funancy — Demo Guide

A 5-minute live walkthrough for the financial-literacy merge game.

---

## Section 1 — How to access the demo

### Live demo URL

**🌐 https://sleeping-combining-masters-peterson.trycloudflare.com/board**

Other reachable routes:

- `/finance` — Finance Center
- `/goals` — Meta Goal (life upgrades)

> ⚠️ **The demo URL is a live tunnel from this laptop.** Keep this laptop on with `npm run dev` AND the `tmole 3000` tunnel running during the presentation. (You were going to keep the laptop on as a backup anyway — this just makes it the primary path.)
>
> If the URL stops working between now and tomorrow, restart it from a terminal:
> ```
> cd C:\Users\danza\OneDrive\Desktop\CALUDE1\funancy
> npm run dev          # in terminal 1
> tmole 3000           # in terminal 2 — gives you a fresh URL
> ```
> The new URL will be different — paste the new one here and I'll update this file.

### Backup — run locally

```bash
cd funancy
npm install
npm run dev
```

Then open `http://localhost:3000/board` in any modern browser. The dev server hot-reloads, so any tweak made before the audience walks in is reflected immediately.

If you need a clean slate while local-running, the in-app **🔄 Restart Demo** button (top-left, fixed-position) wipes progression and re-seeds the curated demo state.

---

## Section 2 — 5-minute demo flow

The demo opens with the Working Board pre-populated for an instant "wow":

- **Resources**: 5,000 coins · 100 ⚡ energy · 5 ⏳ time speeders
- **Grid**: 6 items already placed in 3 mergeable pairs (🍚🍚, 🥩🥩, ✏️✏️)
- **Sell stall**: 3 curated requests, one per reward type (coins, time-booster, mystery-box)

### Minute 1 — Opening hook *(Working Board)*

1. Open the live URL. The Working Board loads first.
2. Talking points while the audience absorbs the visuals:
   - *"This is Funancy — a casual merge game that secretly teaches financial literacy. Every minute of play maps to a real-world money concept."*
   - Point out the painted assets: stall, awning, lanterns, register, counter, trays, and the 3 producer cards at the bottom.
3. Drag one 🍚 onto the other 🍚. The instant tier-2 merge fires; the gold pop + sparkle animation lands.
4. The leftmost sell request's bubble updates from "missing items" → ready to **SELL**. (We'll close it in Minute 2.)

### Minute 2 — Core loop *(Spawn → Merge → Sell → Reward)*

1. Tap one of the bottom producer cards (rake / oven / takeout). Energy ticks down by 1, an item drops on the grid, the gold flash fires.
2. Drag the new item next to its twin and merge again.
3. Hit the green **SELL** button on a fulfilled request. The matched items vanish, a reward toast appears at the top.
4. Showcase reward variety (each demo request has a different one):
   - Sell request 1 → **+5 coins** (header coin pill ticks up)
   - Sell request 2 → **+1 time speeder** (hourglass pill ticks up)
   - Sell request 3 → **🎁 mystery box** (purple toast)
5. Talking point: *"Three reward types in 30 seconds — coins for spending, time speeders for fast-forward, mystery boxes for surprise. The variety is what keeps the loop addictive while teaching that different work yields different rewards."*

### Minute 3 — Finance Center

1. Tap the **🏛️ "מרכז פיננסי"** tab in the bottom nav.
2. Show the breakdown:
   - **Bank balance**: 5,000 (uninvested wallet — loses value to inflation)
   - **Total assets**: 5,000 (bank + investments)
   - **Mission**: open your first deposit
3. Tap the deposit account → enter 1,000 → confirm. Wallet drops to 4,000, deposit position shows **1,000 / 1,000** (current value / cost basis), unrealized P/L = 0.
4. Tap the **⏳ Time Speeder** button. A year passes:
   - Deposit balance grows by ~2% to ~1,020 (the spec rate).
   - Wallet rolls a random ±1–3% inflation/deflation hit. The toast banner shows whether it was 📉 inflation (red) or 📈 deflation (green).
5. Talking point: *"Cost basis stays frozen at 1,000 — the price you paid. The current value is what it's worth now. Real brokerages do this exact same math; we use it here to teach the difference between unrealized and realized profit."*
6. Tap **withdraw all** → realized P/L shows the gain banked, position resets to 0/0. Wallet jumps by the proceeds.

### Minute 4 — Meta Goal

1. Tap the **🎯 "מטרות"** tab.
2. Show the 3-stage progression:
   - **Stage 1** active — basics (phone, bicycle, mini-fridge, etc.)
   - **Stages 2 & 3** locked, with their unlock criteria visible
3. Tap **Buy** on a Stage 1 item that fits the wallet. Coins deduct exactly once; the item shows its "owned" badge.
4. Tap **Buy** rapidly 5 times on a different item — only one purchase processes (click guard prevents double-charge).
5. Talking point: *"Three stages map to real life: starter independence → adult upgrades → milestone achievements. The rule that you can only buy with money you actually earned and managed is the whole game in one sentence — Work, Manage, Upgrade Life."*

### Minute 5 — Closing & restart

1. Tap the **🔄 Restart Demo** button (top-left). Confirm "?לאתחל את המשחק".
2. Resources stay at the demo defaults; everything else resets to the curated starting state. Now ready for the next audience member, the next question, or the next group.
3. Closing line: *"That's the full loop. Work to earn, manage to grow, upgrade to live. Questions?"*

---

## Section 3 — Common issues and recovery

| Symptom | Recovery |
|---|---|
| A screen doesn't load or a control is unresponsive | Tap **🔄 Restart Demo** in the header. State is wiped and the curated demo state re-seeds in <1 second. |
| `localhost:3000` is down (laptop sleep, npm crash) | Switch to the deployed Vercel URL. Both are bookmarked. |
| `vercel.app` is unreachable (network/wifi) | Switch to the local server. |
| A calculation looks off | Restart — almost always lingering state from a prior demo. The Finance math passes all 7 PRD scenarios in code review; if the live numbers look wrong it's stale state, not a bug. |
| Audience asks about a feature the demo doesn't show | *"That's planned for the next sprint — happy to talk about the design over coffee."* Move on. |
| Total UI freeze on stage | Have a **screen-recorded backup video** of a successful run on your phone or laptop. Record one tonight using QuickTime / OBS / Windows Game Bar. |

---

## Section 4 — Pre-presentation checklist

Print this. Tick it off the morning of.

- [ ] **Phone** charged to 100% and on silent
- [ ] **Laptop** plugged in (don't trust the battery)
- [ ] **Localhost** running as backup: `cd funancy && npm run dev` open in a terminal you can see
- [ ] **Demo URL** bookmarked AND open in a browser tab on the presentation laptop
- [ ] One **successful demo run** completed end-to-end before going live (do this 5 minutes before)
- [ ] **🔄 Restart button** tapped at least once to confirm it works in this network/browser
- [ ] **Screen recording** saved offline as a fallback (recorded last night)
- [ ] HDMI / display adapter tested with the room's projector / TV
- [ ] Browser zoom set to a level the back row can read (try `Ctrl/Cmd +` once or twice)
- [ ] System volume at a sane level if the demo plays any audio

You've got this.
