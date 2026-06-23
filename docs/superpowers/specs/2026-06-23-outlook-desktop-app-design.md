# Outlook Desktop App — Design Spec

**Date:** 2026-06-23  
**Status:** Approved

---

## 목적

회사 관리자가 PC 브라우저에서 특정 Outlook URL 접근을 차단한 상황에서, Electron 데스크탑 앱으로 모바일 User-Agent를 사용해 우회하고 Windows/Mac 팀 배포용 앱을 만든다.

---

## 아키텍처

Electron 단일 창 앱. 메인 프로세스가 BrowserWindow를 생성하고 Outlook URL을 로드한다. 별도 렌더러 프로세스 코드 없이 웹 콘텐츠를 그대로 표시한다.

```
outlook-app/
├── main.js          # Electron 메인 프로세스
├── package.json     # 의존성 + electron-builder 빌드 설정
└── assets/
    └── icon.png     # 앱 아이콘 (512×512 PNG)
```

---

## 핵심 동작

### 1. User-Agent 우회
모든 웹 요청에 iPhone Safari UA를 설정한다:
```
Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1
```
`session.defaultSession.webRequest` 또는 `BrowserWindow` 생성 시 `userAgent` 옵션으로 적용.

### 2. 알림
- Web Notifications API 권한을 자동 허용 (`setPermissionRequestHandler`)
- Outlook 웹 페이지가 자체적으로 발송하는 알림이 OS 데스크탑 알림으로 표시됨
- Mac: Dock 아이콘 뱃지 — `document.title`에 포함된 숫자(읽지 않은 메일 수)를 파싱해 `app.setBadgeCount()` 적용

### 3. 창 설정
- 초기 크기: 1200×800
- 리사이즈 가능
- 타이틀: "Outlook"

---

## 빌드 산출물

| 플랫폼 | 형식 | 배포 방법 |
|--------|------|-----------|
| Mac (arm64 + x64) | `.app` → `.zip` | zip 파일 공유 |
| Windows (x64) | `.exe` (NSIS 인스톨러) | 설치 파일 공유 |

`electron-builder`로 빌드. `package.json`의 `build` 섹션에 설정.

---

## 의존성

- `electron` ^28
- `electron-builder` ^24

---

## 미포함 (향후 고려)

- 시스템 트레이 상주
- 시작 시 자동 실행
- 앱스토어 배포 (코드 서명 필요)
