import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('windowsDesktopAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  getHardwareTelemetry: () => ipcRenderer.invoke('get-hardware-telemetry'),
  isDesktopApp: true,
  platform: 'win32'
});
