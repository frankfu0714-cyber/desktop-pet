const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen } = require('electron');
const path = require('path');

let win = null;
let tray = null;
let foodWin = null;

// ---- sizes ----
const WIN_W = 220;
const WIN_H = 200;
const PLATE = 100;
const SPEED = 2.6;          // pixels per tick while walking
const TICK = 30;            // ms between movement ticks
const SLEEP_AFTER = 18000;  // ms of stillness before the pet naps
const EAT_TIME = 4500;      // ms spent eating
const MOUTH = 184;          // x of the pet's mouth within the artwork (facing right)
const NECK_Y = 60;          // y of the pet's neck/scruff within the window (for carrying)

// ---- pet state ----
let currentPet = 'cat';     // 'cat' | 'shiba' | 'husky'
let mode = 'idle';          // 'idle' | 'walk' | 'sleep' | 'eat'
let facing = 'right';       // 'left' | 'right'
let petX = 0, petY = 0;
let targetX = null;
let nextDecision = 0;
let lastActivity = Date.now();
let dragging = false;
let lastSent = '';

// ---- food state ----
let foodActive = false;
let plateX = 0, plateY = 0;
let eatStart = 0;

function workArea() { return screen.getPrimaryDisplay().workArea; }

// Pin a window above the macOS Dock and the Windows taskbar. The
// 'screen-saver' level sits above both, but macOS resets the level on
// some focus/visibility transitions and Windows can lose HWND_TOPMOST
// when another topmost window appears — so we re-apply on 'show',
// 'focus', and 'blur'.
function pinAlwaysOnTop(w) {
  if (!w || w.isDestroyed()) return;
  w.setAlwaysOnTop(true, 'screen-saver');
  w.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
}
function wirePinning(w) {
  pinAlwaysOnTop(w);
  w.on('show', () => pinAlwaysOnTop(w));
  w.on('focus', () => pinAlwaysOnTop(w));
  w.on('blur', () => pinAlwaysOnTop(w));
}

function clampX(x) {
  const wa = workArea();
  return Math.max(wa.x, Math.min(wa.x + wa.width - WIN_W, x));
}

function groundY() {
  const wa = workArea();
  return wa.y + wa.height - WIN_H + 18;
}

function petCenter() { return petX + WIN_W / 2; }

function sendState() {
  if (!win || win.isDestroyed()) return;
  const sig = mode + '|' + facing + '|' + currentPet;
  if (sig === lastSent) return;
  lastSent = sig;
  win.webContents.send('state', { mode, facing, pet: currentPet });
}

function applyPosition() {
  if (!win || win.isDestroyed()) return;
  win.setBounds({ x: Math.round(petX), y: Math.round(petY), width: WIN_W, height: WIN_H });
}

function wake() {
  lastActivity = Date.now();
  if (mode === 'sleep') { mode = 'idle'; nextDecision = Date.now() + 700; }
}

function tick() {
  if (!win || win.isDestroyed() || dragging) return;
  const now = Date.now();

  // ----- feeding overrides normal behavior -----
  if (foodActive) {
    const plateCenterX = plateX + PLATE / 2;
    targetX = clampX(plateCenterX - MOUTH);
    const dx = targetX - petX;
    if (Math.abs(dx) <= 4) {
      facing = 'right';
      if (mode !== 'eat') { mode = 'eat'; eatStart = now; }
      else if (now - eatStart > EAT_TIME) { finishEat(); sendState(); return; }
    } else {
      mode = 'walk';
      facing = dx < 0 ? 'left' : 'right';
      petX += Math.sign(dx) * Math.min(SPEED, Math.abs(dx));
      applyPosition();
    }
    sendState();
    return;
  }

  // ----- normal wandering -----
  if (mode === 'walk') {
    if (targetX === null) {
      mode = 'idle';
    } else {
      const dx = targetX - petX;
      if (Math.abs(dx) <= SPEED) {
        petX = targetX; targetX = null; mode = 'idle';
        nextDecision = now + (1500 + Math.random() * 3500);
      } else {
        facing = dx < 0 ? 'left' : 'right';
        petX += Math.sign(dx) * SPEED;
      }
      applyPosition();
    }
  } else if (mode === 'idle') {
    if (now >= nextDecision) {
      if (Math.random() < 0.6) {
        targetX = clampX(workArea().x + Math.random() * (workArea().width - WIN_W));
        facing = targetX < petX ? 'left' : 'right';
        mode = 'walk';
        lastActivity = now;
      } else {
        nextDecision = now + (1500 + Math.random() * 3000);
      }
    }
    if (now - lastActivity > SLEEP_AFTER) mode = 'sleep';
  }

  sendState();
}

function centerPet() {
  const wa = workArea();
  petX = clampX(wa.x + (wa.width - WIN_W) / 2);
  petY = groundY();
  applyPosition();
  wake();
}

// ---- feeding ----
function dropFood() {
  if (foodWin && !foodWin.isDestroyed()) { foodWin.focus(); return; }
  const wa = workArea();
  plateX = Math.max(wa.x, Math.min(wa.x + wa.width - PLATE, wa.x + (wa.width - PLATE) / 2));
  plateY = wa.y + wa.height - PLATE + 18;
  foodWin = new BrowserWindow({
    width: PLATE, height: PLATE, x: Math.round(plateX), y: Math.round(plateY),
    transparent: true, frame: false, resizable: false, skipTaskbar: true,
    hasShadow: false, alwaysOnTop: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  wirePinning(foodWin);
  foodWin.loadFile('food.html');
  // macOS clamps a window's spawn position above the Dock; re-apply once it's
  // shown so it lands at the intended low (over-the-Dock) spot immediately.
  const placeFood = () => {
    if (foodWin && !foodWin.isDestroyed())
      foodWin.setBounds({ x: Math.round(plateX), y: Math.round(plateY), width: PLATE, height: PLATE });
  };
  foodWin.once('show', placeFood);
  foodWin.webContents.once('did-finish-load', placeFood);
  foodWin.on('closed', () => { foodWin = null; foodActive = false; });
  foodActive = true;
  mode = 'walk';
  wake();
  if (tray) tray.setContextMenu(buildMenu());
}

function removeFood() {
  if (foodWin && !foodWin.isDestroyed()) foodWin.destroy();
  foodWin = null;
  foodActive = false;
  mode = 'idle';
  nextDecision = Date.now() + 800;
  lastActivity = Date.now();
  if (tray) tray.setContextMenu(buildMenu());
}

function finishEat() { removeFood(); }

function buildMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'Choose pet',
      submenu: [
        { label: '🐱  Cat (black & white)', type: 'radio', checked: currentPet === 'cat', click: () => setPet('cat') },
        { label: '🐕  Shiba', type: 'radio', checked: currentPet === 'shiba', click: () => setPet('shiba') },
        { label: '🐺  Husky', type: 'radio', checked: currentPet === 'husky', click: () => setPet('husky') },
      ],
    },
    { type: 'separator' },
    foodActive
      ? { label: 'Remove food', click: () => removeFood() }
      : { label: 'Drop food 🍖', click: () => dropFood() },
    { label: 'Bring to center', click: () => centerPet() },
    { type: 'separator' },
    { label: 'Quit', role: 'quit' },
  ]);
}

function setPet(pet) {
  currentPet = pet;
  lastSent = '';
  sendState();
  if (tray) tray.setContextMenu(buildMenu());
  wake();
}

function createTray() {
  if (process.platform === 'darwin') {
    // macOS: blank icon + emoji title shows 🐾 in the menu bar
    tray = new Tray(nativeImage.createEmpty());
    tray.setTitle('🐾');
  } else {
    // Windows/Linux: use a real icon in the system tray
    tray = new Tray(path.join(__dirname, 'tray.png'));
  }
  tray.setToolTip('Desktop Pet');
  tray.setContextMenu(buildMenu());
  // Windows: left-click should also open the menu
  tray.on('click', () => { try { tray.popUpContextMenu(); } catch (e) {} });
}

function createWindow() {
  win = new BrowserWindow({
    width: WIN_W, height: WIN_H,
    transparent: true, frame: false, resizable: false, movable: true,
    skipTaskbar: true, hasShadow: false, alwaysOnTop: true, focusable: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  wirePinning(win);
  win.loadFile('index.html');

  petX = clampX(workArea().x + (workArea().width - WIN_W) / 2);
  petY = groundY();
  applyPosition();

  win.webContents.on('did-finish-load', () => { lastSent = ''; sendState(); });
  setInterval(tick, TICK);
}

// ---- IPC: dragging the pet ----
ipcMain.on('drag-start', () => { dragging = true; wake(); });
ipcMain.on('drag-move', (_e, { x, y, lifted }) => {
  if (!lifted) return;            // only move once it's actually picked up
  const wa = workArea();
  // anchor the pet's neck/scruff to the cursor so it hangs from the mouse
  petX = clampX(x - WIN_W / 2);
  petY = Math.max(wa.y - 50, Math.min(wa.y + wa.height - 40, y - NECK_Y));
  applyPosition();
});
ipcMain.on('drag-end', () => {
  dragging = false;
  petY = groundY();
  applyPosition();
  mode = foodActive ? 'walk' : 'idle';
  nextDecision = Date.now() + 1200;
  lastActivity = Date.now();
  lastSent = '';
});
ipcMain.on('poke', () => { wake(); nextDecision = Date.now() + 1500; });
ipcMain.on('context-menu', () => { buildMenu().popup({ window: win }); });

// ---- IPC: dragging the food bowl ----
ipcMain.on('food-drag-start', () => { wake(); });
ipcMain.on('food-drag-move', (_e, { dx, dy }) => {
  if (!foodWin || foodWin.isDestroyed()) return;
  const wa = workArea();
  const b = foodWin.getBounds();
  plateX = Math.max(wa.x, Math.min(wa.x + wa.width - PLATE, b.x + dx));
  plateY = wa.y + wa.height - PLATE + 18;   // locked to ground level; drag only moves sideways
  foodWin.setBounds({ x: Math.round(plateX), y: Math.round(plateY), width: PLATE, height: PLATE });
  wake();
});
ipcMain.on('food-drag-end', () => {});

app.whenReady().then(() => {
  createWindow();
  createTray();
  if (app.dock) app.dock.hide();
});

app.on('window-all-closed', () => {});
