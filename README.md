## 🛠 개발 환경 (Development Environment)

이 프로젝트는 프론트엔드(Client)와 백엔드(Server)가 분리된 구조로 개발되었습니다.

### 💻 Frontend (Client)
- **Framework:** Next.js (v16.2.6)
- **Library:** React (v19.2.4), React DOM (v19.2.4)
- **Language:** TypeScript (v5.x)
- **Styling:** Tailwind CSS (v4.x)
- **Theme Management:** next-themes (다크모드 지원)

### ⚙️ Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express (v5.2.1)
- **Language:** TypeScript (v6.0.3)
- **ORM:** Prisma (v5.22.0)
- **Database:** Microsoft SQL Server (MSSQL)

---

## 📦 주요 설치 모듈 (Dependencies)

### Frontend Dependencies (`client/package.json`)
- `next`: React 기반의 서버 사이드 렌더링(SSR) 및 정적 웹사이트 생성 프레임워크
- `react`, `react-dom`: UI 컴포넌트 구축을 위한 핵심 라이브러리
- `next-themes`: 다크모드/라이트모드 테마 전환을 쉽게 구현하기 위한 라이브러리
- `tailwindcss`, `@tailwindcss/postcss`: 유틸리티 퍼스트 CSS 프레임워크 및 PostCSS 플러그인

### Backend Dependencies (`server/package.json`)
- `express`: Node.js 웹 애플리케이션 프레임워크 (API 라우팅 처리)
- `@prisma/client`: 데이터베이스 조작을 위한 타입 세이프 ORM 클라이언트
- `bcrypt`: 사용자 비밀번호 암호화(해싱)를 위한 라이브러리
- `jsonwebtoken`: JWT(JSON Web Token) 기반의 사용자 인증 및 인가 처리
- `cors`: 교차 출처 리소스 공유(CORS) 정책 설정을 위한 미들웨어
- `dotenv`: `.env` 파일에서 환경 변수를 로드하기 위한 모듈
