#!/bin/bash

APP_NAME="OutlookApp.app"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_PATH="$SCRIPT_DIR/$APP_NAME"

echo "OutlookApp 설치를 시작합니다..."

# 앱 파일 확인
if [ ! -d "$APP_PATH" ]; then
  echo "❌ $APP_NAME 파일을 찾을 수 없습니다."
  echo "   install.command와 OutlookApp.app이 같은 폴더에 있어야 합니다."
  read -p "아무 키나 누르면 종료됩니다..."
  exit 1
fi

# 기존 앱 종료
if pgrep -x "OutlookApp" > /dev/null; then
  echo "기존 앱을 종료합니다..."
  pkill -x "OutlookApp"
  sleep 1
fi

# Applications에 복사
echo "Applications 폴더에 설치 중..."
cp -R "$APP_PATH" /Applications/

# 격리 플래그 제거 (손상됨 오류 해결)
echo "보안 설정 적용 중..."
xattr -cr /Applications/$APP_NAME

echo "✅ 설치 완료!"
echo "   Launchpad 또는 Applications 폴더에서 OutlookApp을 실행하세요."

# 앱 실행
open /Applications/$APP_NAME
