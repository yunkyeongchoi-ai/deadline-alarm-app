# ⚡ DEADLINE EMERGENCY & FIRESTORE BOARD

Gemini API 기반 마감 임박 알람 웹앱 및 Firebase Firestore 연동 게시판 통합 프로젝트입니다.

## 🛠️ 기능 목록
1. **마감 임박 알람 앱 (`/`)**: 미루고 있는 작업과 마감 시간을 입력받아 Gemini API가 벼락치기 타임테이블 및 실행 지침 생성, 실시간 알림/경고음 출력
2. **자유 게시판 (`/board`)**: Firebase Firestore 연동을 통해 작성 글을 DB에 저장하고 최신순으로 실시간 불러오기

## 🚀 설정 방법
1. `src/lib/firebase.js` 파일에서 `firebaseConfig` 객체에 Firebase 웹 설정값을 입력합니다.
2. Vercel 배포 시 `GEMINI_API_KEY` 환경 변수를 설정합니다.
