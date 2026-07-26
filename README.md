# DEADLINE EMERGENCY - 마감 임박 알람 앱

Vercel에 배포할 수 있는 Next.js 기반 프로젝트입니다.

## 실행 방법

1. 압축 해제 후 디렉토리 이동:
   ```bash
   cd deadline-alarm-app
   ```

2. 패키지 설치:
   ```bash
   npm install
   ```

3. 환경 변수 설정 (`.env.local` 파일 생성):
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. 개발 서버 실행:
   ```bash
   npm run dev
   ```

## Vercel 배포 방법
1. GitHub 저장소에 소스 코드를 올립니다.
2. Vercel에서 프로젝트를 연결합니다.
3. Environment Variables에 `GEMINI_API_KEY` 환경 변수를 추가합니다.
