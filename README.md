# [SK쉴더스 루키즈 개발 트랙 3기]
미니 프로젝트 3 - 플랜 메이트
> 여행 계획을 대신 세워주는 AI 웹 서비스
---
## 주요기능
사용자 인증:

회원가입: 이메일/비밀번호 기반의 사용자 계정 생성.

로그인: 등록된 계정으로 애플리케이션 접속.

개인 일정 관리:

일정 생성, 조회, 수정, 삭제 (CRUD).

달력 뷰(FullCalendar)를 통한 시각적인 일정 관리 및 시간대별 스케줄 확인.

장소 기반 일정 관리: 지도(Leaflet)를 활용한 위치 지정 및 시각화.

일정 공유 및 협업:

특정 일정을 다른 사용자와 공유하고 초대하는 기능.

공유된 일정에 대한 참여자별 권한 관리 (예: 조회 전용, 수정 가능).

일정별 댓글 및 알림 기능 (추가 예정이거나 계획 중인 기능).

게스트 모드:

비회원 사용자가 특정 공유 일정에 접근하고 조회할 수 있는 기능.

임시 게스트 키 발급 (추후 백엔드를 통한 동적 발급 시스템 구축 예정).

AI 기반 추천/보조 (선택적 기능):

채팅 인터페이스를 통해 일정 관련 질문에 대한 답변 또는 추천 기능 (FastAPI 연동).

데이터 내보내기:

일정 내용을 이미지 또는 PDF 형식으로 내보내기.

---
## 화면설계
<img width="1534" height="730" alt="image" src="https://github.com/user-attachments/assets/7c379a60-ddf1-461f-8abf-3a68e2b6acce" />
> 주요 화면 흐름과 디자인은 위와 같다.
>
> 메인 대시보드 (MainPage.jsx): 사용자의 전체 일정을 한눈에 볼 수 있는 달력 뷰와 다가오는 일정을 목록 형태로 제공합니다. 로그인한 사용자가 앱에 접속했을 때 가장 먼저 보게 되는 화면입니다.

인증 화면 (AuthPage.jsx): 회원가입 및 로그인 기능을 담당합니다. 사용자 인증 정보를 입력받아 백엔드(AuthService.jsx와 연동)와 통신하며, 계정 생성 및 세션 관리를 수행합니다.

일정 상세/추가/수정 (Calendar.jsx 관련): 개별 일정의 상세 정보(제목, 시간, 장소, 참여자 등)를 확인하고, 새로운 일정을 생성하거나 기존 일정을 수정할 수 있는 폼을 제공합니다. Calendar.jsx 컴포넌트가 달력 UI를 제공하고, RegionModal.jsx이 지도 기반의 장소 지정을 지원합니다.

여행 계획 생성 (StartPlanningPage.jsx): 사용자가 새로운 여행 계획이나 특정 플랜의 기본 정보(예: 제목, 기간, 목적지)를 입력하고 설정하는 과정을 위한 페이지입니다.

AI 채팅 (AIChatPage.jsx): AI 챗봇과의 상호작용을 위한 페이지입니다. 사용자가 AI에 질문을 하거나 대화를 나눌 수 있는 UI를 제공하며, 백엔드 AI 서비스(AIService.jsx와 연동)와 통신하여 응답을 받습니다.

마이페이지 (MyPage.jsx): 사용자 정보 관리, 알림 설정 등 개인화된 기능을 제공합니다.

커스텀 알림 (CustomAlert.jsx): 시스템 메시지(성공, 에러, 경고 등)를 사용자에게 일관된 형태로 표시합니다


---
## 시스템 아키텍처
>사용자에게 직접적인 인터페이스를 제공하는 부분으로, 웹 브라우저에서 실행됩니다. React 프레임워크와 Vite 빌드 도구를 사용하여 개발되었습니다.

Vercel을 통해 배포 및 호스팅되며, 자동 HTTPS, 글로벌 CDN, Git 기반 CI/CD 파이프라인의 이점을 활용하여 높은 가용성과 빠른 응답 속도를 보장합니다.

백엔드 API와의 통신을 위해 vercel.json의 rewrites 설정을 통해 API 프록시를 구성합니다. 이는 CORS(Cross-Origin Resource Sharing) 문제 해결 및 HTTP 백엔드와의 혼합 콘텐츠(Mixed Content) 문제 우회에 활용됩니다.

---
## 주요 기능
>사용자 인증 및 관리:

회원가입: 이메일 및 비밀번호 기반의 안전한 사용자 계정 생성 기능을 제공합니다. (AuthPage.jsx, AuthService.jsx, UserService.jsx 연동)

로그인: 등록된 계정을 통해 애플리케이션에 안전하게 접속할 수 있습니다. (AuthPage.jsx, AuthService.jsx 연동)

마이페이지: 사용자 프로필 조회 및 정보 업데이트를 할 수 있습니다. (MyPage.jsx, UserService.jsx 연동)

개인 일정 관리:

일정 CRUD (생성, 조회, 수정, 삭제): 사용자가 개인의 일정을 자유롭게 생성하고 관리할 수 있습니다. (Calendar.jsx, PlanningService.jsx, CalendarService.jsx 연동)

달력 뷰: FullCalendar를 통해 월/주/일 단위로 일정을 시각적으로 확인하고 관리할 수 있습니다. (Calendar.jsx)

장소 기반 일정 관리: Leaflet 지도를 활용하여 일정에 특정 장소를 지정하고 시각적으로 확인할 수 있습니다. (RegionModal.jsx 연동)


---
## 기술 스텍
>본 시스템은 사용자 중심 설계 원칙에 따라 다음과 같은 기술 스택으로 개발되었습니다.

*프론트엔드*

- React
- Figma
- Postman
*백엔드*

- Spring
- Java
- Postman
- Python
- Langchain
*데이터베이스*

- redis
- mysql
*버전 관리*

- GitHub
- Notion
- Google Docs
- Chat gpt
- Deepseek
  
---
## 폴더 구조
>/FRONT-MAIN/                  # 프로젝트의 루트 디렉토리
├── node_modules/             # 프로젝트 의존성 모듈 (npm/yarn 설치 시 자동 생성 및 관리)
├── public/                   # 웹 서버에서 직접 접근 가능한 정적 자원 (HTML 파일 및 번들링되지 않는 이미지 등)
│   └── (이미지 파일 등)       # background.png, beach_1.png, beach_2.png, calendar.png, logo_2.png, logo.png, react.svg, sky_main.png
├── src/                      # 애플리케이션의 모든 소스 코드
│   ├── assets/               # 컴포넌트나 페이지에서 사용되는 공통 정적 자원
│   │   ├── images/           # 이미지 파일 (예: background.png, beach_1.png, logo.png 등)
│   │   └── styles/           # 전역 또는 공통적으로 적용되는 스타일시트 (예: App.css, index.css 외에 추가 스타일)
│   ├── components/           # 재사용 가능한 UI 컴포넌트 모음
│   │   ├── Calendar.jsx      # 달력 UI를 렌더링하는 컴포넌트
│   │   ├── CustomAlert.css   # CustomAlert 컴포넌트의 스타일 정의
│   │   ├── CustomAlert.jsx   # 커스텀 알림/경고 메시지 UI 컴포넌트
│   │   ├── Logo.jsx          # 애플리케이션 로고를 표시하는 컴포넌트
│   │   └── RegionModal.jsx   # 지역 또는 위치 선택 모달 컴포넌트
│   ├── nginx/                # Nginx 관련 설정 파일 (개발 환경 프록시 또는 Docker 컨테이너 구성 시 사용)
│   │   └── nginx.conf        # Nginx 설정 파일
│   ├── pages/                # 애플리케이션의 각 주요 "페이지"를 구성하는 컴포넌트
│   │   ├── AIChatPage.css    # AIChatPage 스타일
│   │   ├── AIChatPage.jsx    # AI 챗봇과의 상호작용 페이지
│   │   ├── AuthPage.css      # AuthPage (로그인/회원가입) 스타일
│   │   ├── AuthPage.jsx      # 사용자 인증 (로그인/회원가입) 페이지
│   │   ├── MainPage.css      # MainPage 스타일
│   │   ├── MainPage.jsx      # 애플리케이션의 메인 대시보드/홈 페이지
│   │   ├── MyPage.css        # MyPage 스타일
│   │   ├── MyPage.jsx        # 사용자 개인 정보/설정 페이지
│   │   ├── StartPlanningPage.css # StartPlanningPage 스타일
│   │   └── StartPlanningPage.jsx # 여행/계획 생성 시작 페이지
│   ├── services/             # 백엔드 API 통신 로직 및 서비스 함수 모음
│   │   ├── AIService.jsx     # AI 관련 API 호출 처리
│   │   ├── AuthService.jsx   # 사용자 인증 관련 API 호출 처리
│   │   ├── CalendarService.jsx # 달력/일정 데이터 관련 API 호출 처리
│   │   ├── PlanningService.jsx # 계획/플랜 관련 API 호출 처리
│   │   └── UserService.jsx   # 사용자 정보 관련 API 호출 처리
│   ├── App.css               # 전체 애플리케이션의 기본 스타일
│   ├── App.jsx               # 메인 애플리케이션 컴포넌트 (주요 라우팅 포함)
│   ├── index.css             # HTML 문서에 직접 연결되는 전역 스타일 (일반적으로 App.css보다 더 기본적)
│   └── main.jsx              # 애플리케이션 진입점 (React DOM 렌더링 시작)
├── .env.development          # 개발 환경에서 사용될 환경 변수 정의 파일
├── .env.production           # 프로덕션(배포) 환경에서 사용될 환경 변수 정의 파일
├── .gitignore                # Git 버전 관리에서 제외할 파일 및 폴더 지정
├── Dockerfile                # 애플리케이션을 Docker 컨테이너로 빌드하기 위한 설정 파일
├── eslint.config.js          # ESLint (코드 린팅 도구) 설정 파일
├── index.html                # 애플리케이션의 기본 HTML 파일
├── package-lock.json         # `npm install` 시 설치된 패키지들의 정확한 버전과 종속성 트리 기록
├── package.json              # 프로젝트의 메타데이터 (이름, 버전) 및 모든 의존성 패키지, 스크립트 정의
├── README.md                 # 프로젝트 설명 문서
├── vercel.json               # Vercel 배포 플랫폼을 위한 설정 파일 (라우팅, 프록시 등)
└── vite.config.js            # Vite 빌드 도구의 설정 파일
