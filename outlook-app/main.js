const { app, BrowserWindow, session } = require('electron');
const path = require('path');

const OUTLOOK_URL = 'https://outlook.live.com/mail/';

const MOBILE_UA =
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) ' +
  'AppleWebKit/605.1.15 (KHTML, like Gecko) ' +
  'Version/17.0 Mobile/15E148 Safari/604.1';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Outlook',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(OUTLOOK_URL, {
    userAgent: MOBILE_UA,
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
