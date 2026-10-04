const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('flavorDashDesktop', {
  platform: process.platform
});
