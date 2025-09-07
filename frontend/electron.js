import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import net from 'net';
import activeWin from 'active-win';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Keep a global reference of the window object
let mainWindow;

// Storage directory for offline functionality
const STORAGE_DIR = join(homedir(), '.metamind');

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

// Check if server is running
function checkServerConnection() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(3000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(3000, 'localhost');
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: join(__dirname, 'preload.js')
    },
    icon: join(__dirname, 'public', 'vite.svg'),
    show: false,
    titleBarStyle: 'default'
  });

  // Load the app
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Try different ports in case 5173 is occupied
    const devPorts = [5173, 5174, 5175];
    let devUrl = 'http://localhost:5173';
    
    // Check which port Vite is actually running on
    for (const port of devPorts) {
      try {
        devUrl = `http://localhost:${port}`;
        break;
      } catch (error) {
        continue;
      }
    }
    
    mainWindow.loadURL(devUrl);
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, 'dist', 'index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers for offline functionality
ipcMain.handle('storage-read', async (event, filename) => {
  try {
    const filePath = join(STORAGE_DIR, filename);
    console.log(`Reading file: ${filePath}`);
    const data = await fs.readFile(filePath, 'utf8');
    console.log(`File read successfully: ${filename}`);
    return JSON.parse(data);
  } catch (error) {
    console.log(`Failed to read file ${filename}:`, error.message);
    return null;
  }
});

ipcMain.handle('storage-write', async (event, filename, data) => {
  try {
    await ensureStorageDir();
    const filePath = join(STORAGE_DIR, filename);
    console.log(`Writing file: ${filePath}`);
    console.log(`Data to write:`, data);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`File written successfully: ${filename}`);
    return true;
  } catch (error) {
    console.error('Storage write error:', error);
    return false;
  }
});

ipcMain.handle('check-server', async () => {
  return await checkServerConnection();
});

ipcMain.handle('get-storage-dir', () => {
  return STORAGE_DIR;
});

// Activity tracking with active-win
let activityTrackingInterval = null;
let currentAppSession = null;

ipcMain.handle('get-active-window', async () => {
  try {
    const activeWindow = await activeWin();
    return activeWindow;
  } catch (error) {
    console.error('Error getting active window:', error);
    return null;
  }
});

ipcMain.handle('start-activity-tracking', async (event, intervalMs = 5000) => {
  if (activityTrackingInterval) {
    clearInterval(activityTrackingInterval);
  }

  activityTrackingInterval = setInterval(async () => {
    try {
      const activeWindow = await activeWin();
      if (activeWindow && activeWindow.owner && activeWindow.owner.name) {
        const appName = activeWindow.owner.name;
        const currentTime = new Date().toISOString();
        
        // If this is a different app than the current session, end the previous session
        if (currentAppSession && currentAppSession.app !== appName) {
          currentAppSession.endTime = currentTime;
          // Send the completed session to renderer
          mainWindow.webContents.send('app-session-ended', currentAppSession);
        }
        
        // Start new session if it's a different app or no current session
        if (!currentAppSession || currentAppSession.app !== appName) {
          currentAppSession = {
            app: appName,
            startTime: currentTime,
            endTime: null,
            title: activeWindow.title || '',
            url: activeWindow.url || ''
          };
          // Send the new session to renderer
          mainWindow.webContents.send('app-session-started', currentAppSession);
        }
      }
    } catch (error) {
      console.error('Activity tracking error:', error);
    }
  }, intervalMs);

  return true;
});

ipcMain.handle('stop-activity-tracking', () => {
  if (activityTrackingInterval) {
    clearInterval(activityTrackingInterval);
    activityTrackingInterval = null;
  }
  
  // End current session if exists
  if (currentAppSession) {
    currentAppSession.endTime = new Date().toISOString();
    mainWindow.webContents.send('app-session-ended', currentAppSession);
    currentAppSession = null;
  }
  
  return true;
});

// App event handlers
app.whenReady().then(async () => {
  await ensureStorageDir();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationURL) => {
    navigationEvent.preventDefault();
  });
});
