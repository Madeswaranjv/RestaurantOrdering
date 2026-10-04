const { app, BrowserWindow, dialog, net, protocol, shell } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const isDevelopment = !app.isPackaged;
const rendererOrigin = 'flavordash://app';
const apiPort = process.env.FLAVORDASH_API_PORT || '5000';
const apiUrl = `http://localhost:${apiPort}`;
let mainWindow;
let apiProcess;

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'flavordash',
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true }
  }
]);

function getBackendDirectory() {
  return isDevelopment ? path.join(app.getAppPath(), 'backend') : path.join(process.resourcesPath, 'backend');
}

function getRendererDirectory() {
  return path.join(app.getAppPath(), 'frontend', 'dist');
}

function ensureEnvironmentFile() {
  if (isDevelopment) return { path: null, created: false };

  const environmentFile = path.join(app.getPath('userData'), 'backend.env');
  if (fs.existsSync(environmentFile)) return { path: environmentFile, created: false };

  fs.copyFileSync(path.join(getBackendDirectory(), '.env.example'), environmentFile);
  return { path: environmentFile, created: true };
}

function startApi(environmentFile) {
  if (isDevelopment && process.env.FLAVORDASH_BACKEND_EXTERNAL === '1') return;

  const backendDirectory = getBackendDirectory();
  const serverEntry = path.join(backendDirectory, 'server.js');
  if (!fs.existsSync(serverEntry)) throw new Error(`The bundled API was not found at ${serverEntry}.`);

  apiProcess = spawn(process.execPath, [serverEntry], {
    cwd: backendDirectory,
    windowsHide: true,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      PORT: apiPort,
      NODE_ENV: isDevelopment ? 'development' : 'production',
      CLIENT_URL: rendererOrigin,
      ELECTRON_RENDERER_ORIGIN: rendererOrigin,
      ...(environmentFile ? { FLAVORDASH_ENV_FILE: environmentFile } : {})
    },
    stdio: isDevelopment ? 'inherit' : 'pipe'
  });
  apiProcess.on('error', (error) => console.error('Unable to start the FlavorDash API:', error));
  apiProcess.on('exit', (code) => {
    if (!app.isQuitting && code !== 0) console.error(`FlavorDash API stopped unexpectedly (code ${code}).`);
  });
}

async function waitForApi() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await net.fetch(`${apiUrl}/health`);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error('The local FlavorDash API did not become ready within 30 seconds.');
}

function registerRendererProtocol() {
  protocol.handle('flavordash', (request) => {
    const requestedPath = decodeURIComponent(new URL(request.url).pathname);
    const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.replace(/^[/\\]+/, '');
    const rendererDirectory = getRendererDirectory();
    const filePath = path.resolve(rendererDirectory, relativePath);
    if (filePath !== rendererDirectory && !filePath.startsWith(`${rendererDirectory}${path.sep}`)) {
      return new Response('Not found', { status: 404 });
    }
    return net.fetch(pathToFileURL(filePath).toString());
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    backgroundColor: '#090909',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDevelopment) {
    await mainWindow.loadURL(process.env.FLAVORDASH_RENDERER_URL || 'http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    await mainWindow.loadURL(`${rendererOrigin}/index.html`);
  }
}

const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    registerRendererProtocol();
    try {
      const environment = ensureEnvironmentFile();
      if (environment.created) {
        dialog.showMessageBoxSync({
          type: 'info',
          title: 'FlavorDash setup required',
          message: 'A desktop configuration file was created. Add your database and service settings, then reopen FlavorDash.',
          detail: environment.path
        });
        app.quit();
        return;
      }
      startApi(environment.path);
      await waitForApi();
      await createWindow();
    } catch (error) {
      console.error(error);
      dialog.showErrorBox('FlavorDash could not start', error.message);
      app.quit();
    }
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (apiProcess && !apiProcess.killed) apiProcess.kill();
});
