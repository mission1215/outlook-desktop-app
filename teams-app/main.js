const { app, BrowserWindow, session } = require('electron');
const path = require('path');

const TEAMS_URL = 'https://teams.microsoft.com';

const IPAD_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/120.0.0.0 Mobile Safari/537.36';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Teams',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(TEAMS_URL, {
    userAgent: IPAD_UA,
  });

  if (process.platform === 'darwin') {
    mainWindow.webContents.on('page-title-updated', (event, title) => {
      const match = title.match(/\((\d+)\)/);
      if (match) {
        app.setBadgeCount(parseInt(match[1], 10));
      } else {
        app.setBadgeCount(0);
      }
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      if (permission === 'notifications') {
        callback(true);
      } else {
        callback(false);
      }
    }
  );

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
