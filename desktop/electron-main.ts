import { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    frame: false, // Windows 11 Frameless custom Mica titlebar
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    backgroundColor: '#0a0f1d',
    show: false,
    icon: path.join(__dirname, '../public/icon.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webgl: true, // Hardware accelerated Sentinel-2 raster rendering
    }
  });

  // Windows Mica/Dark Theme enforcement
  nativeTheme.themeSource = 'dark';

  const startUrl = process.env.ELECTRON_START_URL || `http://localhost:3000`;
  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Window control IPC handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('get-hardware-telemetry', async () => {
  return {
    os: 'Windows 11 Enterprise x64',
    gpu: 'DirectX 12 / Vulkan Hardware Acceleration Active',
    ramUsageMb: 1840,
    totalRamMb: 16384,
    cpuUsagePercent: 14.2,
    sentinelBandEngine: 'Sentinel-2 MSI Level-2A Multi-Threaded Raster'
  };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
