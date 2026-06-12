# Desktop Pet — macOS Installation Guide

Welcome! This is a short, step-by-step guide for installing **Desktop Pet** on your Mac. No technical background required — if you can drag a file into a folder, you can do this.

## System requirements

- **macOS 11 (Big Sur) or later**
- Works on both **Apple Silicon** (M1 / M2 / M3 / M4) and **Intel** Macs — the DMG is a universal binary, so the same file works on either.

## 1. Download the DMG

1. Go to the [Releases page](https://github.com/frankfu0714-cyber/desktop-pet/releases) on GitHub.
2. Find the latest release at the top of the page.
3. Scroll down to the **Assets** section under that release. You'll see a list of files.
4. Click the file that ends in **`.dmg`** (for example, `Desktop-Pet-1.0.2-universal.dmg`) to download it. It will land in your **Downloads** folder.

## 2. Open the DMG

Double-click the downloaded `.dmg` file. A small window pops up showing two icons:

- The **Desktop Pet** app on the left
- A shortcut to your **Applications** folder on the right

## 3. Drag the app to the Applications folder

Click and hold the **Desktop Pet** icon, then drag it onto the **Applications** shortcut in the same window. Let go — macOS will copy the app over.

This is the standard way to install Mac apps. They all live in `/Applications`, which makes them easy to find later (and lets macOS keep them updated and tidy).

## 4. Eject the DMG

The DMG is just a temporary "virtual disk" used to deliver the app. Once the app is in Applications, you can eject the DMG:

- In **Finder**, look for the **Desktop Pet** disk in the sidebar (under **Locations**).
- Right-click it and choose **Eject** (or drag it to the Trash).

You can also delete the downloaded `.dmg` file from your Downloads folder — you don't need it anymore.

## 5. Launch the app

Open **Desktop Pet** from any of these places:

- **Launchpad** (the rocket icon in the Dock) → click **Desktop Pet**
- **Finder → Applications** → double-click **Desktop Pet**
- **Spotlight** (⌘ + Space) → type "Desktop Pet" → press Return

Your pet should appear at the bottom of the screen. To control it, click the **🐾** icon in the menu bar at the top-right of your screen.

## First-launch security note

Desktop Pet is signed with an **Apple Developer ID** and **notarized by Apple**, so it should open with a clean double-click on modern macOS.

On some older macOS versions you may see a one-time confirmation: *"Desktop Pet is an app downloaded from the Internet. Are you sure you want to open it?"* — that's perfectly normal. Just click **Open**. You won't be asked again.

The first time you run it, macOS may also ask for **Screen Recording** or **Accessibility** permission so the pet can float over other windows. Allow it if prompted.

## Uninstalling

To remove Desktop Pet:

1. Open **Finder → Applications**.
2. Drag **Desktop Pet** to the **Trash** (or right-click → **Move to Trash**).
3. Empty the Trash if you like.

That's it — no leftovers, no uninstaller required.

## Troubleshooting

**"Desktop Pet can't be opened because Apple cannot check it for malicious software"**

This shouldn't happen because the app is notarized, but if it does (for example, on a very old macOS version, or if Gatekeeper is being cautious):

1. In **Finder → Applications**, **right-click** (or Control-click) on **Desktop Pet**.
2. Choose **Open** from the menu.
3. In the confirmation dialog, click **Open** again.

After doing this once, the app will open normally from then on.

---

## 問題回報 / Report Issues

Found a bug or have a suggestion? Please open an issue on GitHub:

👉 [github.com/frankfu0714-cyber/desktop-pet/issues](https://github.com/frankfu0714-cyber/desktop-pet/issues)

Maintained by [@frankfu0714-cyber](https://github.com/frankfu0714-cyber). Thanks for trying Desktop Pet! 🐾
