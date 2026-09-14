import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import path from 'path';
import os from 'os';

let mainWindow: BrowserWindow | null = null;

const startUrl = process.env.ELECTRON_START_URL || 'http://127.0.0.1:3000';

async function waitForServer(url: string, timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return;
      lastError = new Error(`Health check returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`TerraSat sunucusu başlatılamadı: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    backgroundColor: '#0a0f1d',
    show: false,
    icon: path.join(__dirname, '../icon.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webgl: true,
    }
  });

  nativeTheme.themeSource = 'dark';

  void mainWindow.loadURL(startUrl);
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error(`[desktop] UI load failed (${errorCode}): ${errorDescription}`);
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on('window-close', () => mainWindow?.close());

ipcMain.handle('get-hardware-telemetry', async () => {
  const totalRamMb = Math.round(os.totalmem() / 1024 / 1024);
  const ramUsageMb = Math.round((os.totalmem() - os.freemem()) / 1024 / 1024);
  return {
    os: `${os.type()} ${os.release()} ${os.arch()}`,
    gpu: 'unavailable',
    ramUsageMb,
    totalRamMb,
    cpuUsagePercent: null,
    sentinelBandEngine: 'status unavailable'
  };
});

app.whenReady().then(async () => {
  try {
    if (!process.env.ELECTRON_START_URL) {
      process.env.NODE_ENV = 'production';
      process.env.DESKTOP_MODE = 'true';
      process.env.APP_ROOT = path.join(__dirname, '../..');
      require('../server.cjs');
    }
    await waitForServer(startUrl);
    createWindow();
  } catch (error) {
    console.error('[desktop] Startup failed:', error);
    const message = error instanceof Error ? error.message : String(error);
    const errorWindow = new BrowserWindow({ width: 720, height: 420, backgroundColor: '#0a0f1d' });
    void errorWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(`<!doctype html><html><body style="font-family:Segoe UI;background:#0a0f1d;color:#f8fafc;padding:36px"><h2>TerraSat AI başlatılamadı</h2><p>${message}</p><p>Lütfen uygulamayı kapatıp yeniden açın.</p></body></html>`)}`);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
