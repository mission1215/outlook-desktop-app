# Outlook Desktop App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Electron 데스크탑 앱으로 Outlook 웹 페이지를 모바일 UA로 래핑해 Mac(.app)과 Windows(.exe) 빌드를 팀 배포용으로 만든다.

**Architecture:** Electron 메인 프로세스가 단일 BrowserWindow를 생성하고 iPhone Safari User-Agent로 Outlook URL을 로드한다. Web Notifications 권한을 자동 허용해 OS 알림을 통과시키고, Mac에서는 document.title 파싱으로 Dock 뱃지를 업데이트한다.

**Tech Stack:** Node.js, Electron 28, electron-builder 24

---

## File Structure

```
outlook-app/
├── main.js              # Electron 메인 프로세스 (창 생성, UA, 알림, 뱃지)
├── package.json         # 의존성 + electron-builder 빌드 설정
└── assets/
    └── icon.png         # 앱 아이콘 512×512 PNG
```

---

### Task 1: 프로젝트 초기화

**Files:**
- Create: `outlook-app/package.json`

- [ ] **Step 1: 프로젝트 디렉토리 생성**

```bash
mkdir -p /Users/kimjungsik/Documents/AI/Cluade/outlook/outlook-app/assets
cd /Users/kimjungsik/Documents/AI/Cluade/outlook/outlook-app
```

- [ ] **Step 2: package.json 생성**

```json
{
  "name": "outlook-app",
  "version": "1.0.0",
  "description": "Outlook Desktop App",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build:mac": "electron-builder --mac",
    "build:win": "electron-builder --win",
    "build:all": "electron-builder --mac --win"
  },
  "build": {
    "appId": "com.company.outlook-app",
    "productName": "Outlook",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "assets/**"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "icon": "assets/icon.png",
      "target": [
        { "target": "zip", "arch": ["x64", "arm64"] }
      ]
    },
    "win": {
      "icon": "assets/icon.png",
      "target": [
        { "target": "nsis", "arch": ["x64"] }
      ]
    },
    "nsis": {
      "oneClick": true,
      "perMachine": false
    }
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.0.0"
  }
}
```

- [ ] **Step 3: 의존성 설치**

```bash
cd /Users/kimjungsik/Documents/AI/Cluade/outlook/outlook-app
npm install
```

예상 출력: `added XX packages` (오류 없음)

- [ ] **Step 4: Commit**

```bash
cd /Users/kimjungsik/Documents/AI/Cluade/outlook
git init
git add outlook-app/package.json outlook-app/package-lock.json
git commit -m "feat: init Electron project with build config"
```

---

### Task 2: 앱 아이콘 준비

**Files:**
- Create: `outlook-app/assets/icon.png`

- [ ] **Step 1: 아이콘 파일 생성 (임시 플레이스홀더)**

512×512 PNG 아이콘이 필요하다. 임시로 ImageMagick으로 파란 사각형을 만든다. (나중에 실제 아이콘으로 교체 가능)

```bash
cd /Users/kimjungsik/Documents/AI/Cluade/outlook/outlook-app
# ImageMagick이 있는 경우:
convert -size 512x512 xc:#0078D4 -fill white -font Arial -pointsize 80 \
  -gravity center -annotate 0 "O" assets/icon.png

# ImageMagick이 없는 경우, Node.js로 생성:
node -e "
const fs = require('fs');
// 1×1 pixel PNG (blue) encoded as base64
const buf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync('assets/icon.png', buf);
console.log('icon.png created');
"
```

> **참고:** 실제 배포 전에 512×512 Outlook 스타일 아이콘으로 교체 권장.

- [ ] **Step 2: 아이콘 파일 존재 확인**

```bash
ls -la /Users/kimjungsik/Documents/AI/Cluade/outlook/outlook-app/assets/icon.png
```

예상 출력: 파일 존재, 크기 > 0

- [ ] **Step 3: Commit**

```bash
cd /Users/kimjungsik/Documents/AI/Cluade/outlook
git add outlook-app/assets/icon.png
git commit -m "feat: add placeholder app icon"
```

---

### Task 3: main.js — 기본 창 + 모바일 User-Agent

**Files:**
- Create: `outlook-app/main.js`

- [ ] **Step 1: main.js 작성**

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

const OUTLOOK_URL = 'https://outlook.live.com/mail/';

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ' +
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
```

- [ ] **Step 2: 앱 실행 확인**

```bash
cd /Users/kimjungsik/Documents/AI/Cluade/outlook/outlook-app
npm start
```

예상 동작:
- Electron 창이 뜨며 Outlook 로그인 페이지가 로드됨
- 로그인 후 모바일 레이아웃으로 메일함이 열림
- PC 브라우저에서 막혔던 페이지가 정상 표시됨

- [ ] **Step 3: Commit**

```bash
cd /Users/kimjungsik/Documents/AI/Cluade/outlook
git add outlook-app/main.js
git commit -m "feat: add Electron window with mobile UA"
```

---

### Task 4: 알림 권한 + Mac Dock 뱃지

**Files:**
- Modify: `outlook-app/main.js`

- [ ] **Step 1: main.js에 알림 권한 핸들러와 뱃지 로직 추가**

`createWindow()` 함수 아래, `app.whenReady()` 위에 다음 코드를 추가한다:

```javascript
const { app, BrowserWindow, session } = require('electron');
```

`app.whenReady().then(...)` 내부를 아래로 교체한다:

```javascript
app.whenReady().then(() => {
  // Web Notifications 권한 자동 허용
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
```

`createWindow()` 함수 내 `mainWindow.loadURL(...)` 다음에 Mac 뱃지 로직을 추가한다:

```javascript
  // Mac Dock 뱃지: document.title의 숫자 파싱
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
```

완성된 `main.js` 전체:

```javascript
const { app, BrowserWindow, session } = require('electron');
const path = require('path');

const OUTLOOK_URL = 'https://outlook.live.com/mail/';

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ' +
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

  // Mac Dock 뱃지: document.title의 숫자 파싱
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
```

- [ ] **Step 2: 앱 재실행 후 알림 동작 확인**

```bash
cd /Users/kimjungsik/Documents/AI/Cluade/outlook/outlook-app
npm start
```

예상 동작:
- 로그인 후 Outlook이 알림 허용 요청을 보내면 자동으로 허용됨
- 새 메일 수신 시 OS 데스크탑 알림 팝업이 표시됨
- Mac: 읽지 않은 메일이 있을 때 Dock 아이콘에 숫자 뱃지가 표시됨

- [ ] **Step 3: Commit**

```bash
cd /Users/kimjungsik/Documents/AI/Cluade/outlook
git add outlook-app/main.js
git commit -m "feat: add Web Notifications permission and Mac Dock badge"
```

---

### Task 5: Mac 빌드

**Files:**
- Output: `outlook-app/dist/` (빌드 결과물)

- [ ] **Step 1: Mac 빌드 실행**

```bash
cd /Users/kimjungsik/Documents/AI/Cluade/outlook/outlook-app
npm run build:mac
```

예상 출력:
```
• building        target=ZIP arch=x64 file=dist/Outlook-1.0.0-mac.zip
• building        target=ZIP arch=arm64 file=dist/Outlook-1.0.0-arm64-mac.zip
• build success
```

- [ ] **Step 2: 빌드 결과 확인**

```bash
ls dist/
```

예상 출력: `Outlook-1.0.0-mac.zip`, `Outlook-1.0.0-arm64-mac.zip` 파일 존재

- [ ] **Step 3: zip 압축 해제 후 앱 실행 테스트**

```bash
cd dist
unzip -o Outlook-1.0.0-arm64-mac.zip  # M1/M2 Mac인 경우
# 또는
unzip -o Outlook-1.0.0-mac.zip        # Intel Mac인 경우
open "Outlook.app"
```

예상 동작: Outlook 앱이 정상적으로 열리고 로그인 페이지가 표시됨

- [ ] **Step 4: Commit**

```bash
cd /Users/kimjungsik/Documents/AI/Cluade/outlook
echo "outlook-app/dist/" >> .gitignore
git add .gitignore
git commit -m "chore: ignore build output directory"
```

---

### Task 6: Windows 빌드 (선택 — Windows 환경 또는 CI 필요)

> **참고:** Windows `.exe` 빌드는 Windows 머신 또는 GitHub Actions CI에서 실행해야 한다. Mac에서 크로스 컴파일은 electron-builder가 지원하지 않는다.

**Option A: Windows 머신에서 직접 빌드**

```bash
cd outlook-app
npm install
npm run build:win
```

예상 출력: `dist/Outlook Setup 1.0.0.exe`

**Option B: GitHub Actions로 자동 빌드**

- [ ] **Step 1: `.github/workflows/build.yml` 생성**

```bash
mkdir -p /Users/kimjungsik/Documents/AI/Cluade/outlook/.github/workflows
```

```yaml
# .github/workflows/build.yml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
        working-directory: outlook-app
      - run: npm run build:mac
        working-directory: outlook-app
      - uses: actions/upload-artifact@v4
        with:
          name: mac-build
          path: outlook-app/dist/*.zip

  build-win:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
        working-directory: outlook-app
      - run: npm run build:win
        working-directory: outlook-app
      - uses: actions/upload-artifact@v4
        with:
          name: win-build
          path: outlook-app/dist/*.exe
```

- [ ] **Step 2: Commit**

```bash
cd /Users/kimjungsik/Documents/AI/Cluade/outlook
git add .github/
git commit -m "ci: add GitHub Actions build for Mac and Windows"
```

---

## 배포 방법 요약

| 플랫폼 | 파일 | 배포 |
|--------|------|------|
| Mac (M1/M2) | `Outlook-1.0.0-arm64-mac.zip` | zip 압축 해제 → `Outlook.app`을 Applications 폴더로 |
| Mac (Intel) | `Outlook-1.0.0-mac.zip` | 동일 |
| Windows | `Outlook Setup 1.0.0.exe` | 더블클릭 설치 |

> **Mac 보안 경고:** 코드 서명 없이 배포 시 "개발자를 확인할 수 없습니다" 경고가 뜬다. `우클릭 → 열기`로 우회하거나, System Settings → Privacy & Security에서 허용.
