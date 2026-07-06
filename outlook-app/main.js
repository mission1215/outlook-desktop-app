const { app, BrowserWindow, session, shell } = require('electron');
const path = require('path');

// 앱 내에서 열 Microsoft 도메인
const MICROSOFT_DOMAINS = [
  'microsoft.com',
  'office.com',
  'office365.com',
  'microsoftonline.com',
  'sharepoint.com',
  'live.com',
  'outlook.com',
  'onedrive.live.com',
];

function isMicrosoftUrl(url) {
  try {
    const host = new URL(url).hostname;
    return MICROSOFT_DOMAINS.some(domain => host === domain || host.endsWith('.' + domain));
  } catch {
    return false;
  }
}

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

  // 링크 분기: Microsoft → 앱 내 새 창, 외부 → 시스템 브라우저
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isMicrosoftUrl(url)) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isMicrosoftUrl(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
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
  // 모든 요청에 모바일 UA 적용 (새 창 포함)
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = MOBILE_UA;
    callback({ requestHeaders: details.requestHeaders });
  });

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
