# 🐾 Desktop Pet (macOS)

A cute little pet that lives on top of your desktop. Pick a **black-and-white (tuxedo) cat**, a **Shiba**, or a **Husky**. It wanders along the bottom of your screen, blinks, wags its tail, naps when ignored, hops happily when you poke it, dangles like a scruffed kitten when you pick it up, and chases a food bowl when you feed it.

## One-time setup

You need **Node.js** installed. If you don't have it, download the "LTS" version from https://nodejs.org and install it (just keep clicking Continue).

Then open the **Terminal** app and run these two commands, one at a time:

```bash
cd "path/to/desktop-pet"        # the folder this README is in
npm install                     # downloads the app engine (one time, ~1 min)
```

Tip: instead of typing the path, type `cd ` (with a space) and then drag the `desktop-pet` folder onto the Terminal window — it fills in the path for you.

## Run it

```bash
npm start
```

Your pet appears at the bottom of the screen. To stop it, click the **🐾** icon in the menu bar (top-right of your screen) and choose **Quit**.

## How to play with it

- **Switch pets** — click the **🐾** in the menu bar (or right-click the pet) → *Choose pet* → Cat / Shiba / Husky.
- **Feed it** — menu bar 🐾 → *Drop food 🍖*. A food bowl appears; drag the bowl around and the pet follows it, then eats. The bowl disappears when it's done (or choose *Remove food*).
- **Pick it up** — drag the pet with your mouse. It goes limp and dangles like a scruffed cat, then drops back to the ground when you let go.
- **Poke it** — single-click for a happy hop and a 💗.
- **Naps** — if left alone for a bit, it lies down as a sleepy loaf with 💤 until you click it.
- **Recenter** — menu bar 🐾 → *Bring to center* if it ever wanders off.

The pet stays on top of other windows and follows you across all Spaces/desktops.

## Notes

- This is a small Electron app. Everything runs locally on your Mac — no internet, no accounts.
- macOS may ask for Screen Recording or Accessibility permission the first time (so the pet can float over other apps). Allow it if prompted.
