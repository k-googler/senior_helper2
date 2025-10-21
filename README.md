# 시니어 헬퍼 (Senior Helper)

어르신들을 위한 모바일 앱 체험 교육 시스템

![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)

## 📖 프로젝트 소개

시니어 헬퍼는 어르신들이 카카오택시, 배달앱 등의 모바일 앱을 실제로 사용하기 전에 **안전하게 연습**할 수 있는 인터랙티브 시뮬레이터입니다.

복지사나 자원봉사자가 관리자 모드에서 앱 화면 캡처 이미지를 업로드하고 인터랙티브 영역을 설정하면, 어르신들은 체험 모드에서 실제 앱처럼 사용해볼 수 있습니다.

### 주요 특징

- 🎯 **쉬운 콘텐츠 제작**: 드래그로 인터랙티브 영역 지정
- 📱 **모바일 최적화**: 터치, 진동, 음성 안내 지원
- ✨ **동적 효과**: 부드러운 애니메이션과 시각적 피드백
- 💾 **로컬 저장**: 인터넷 없이도 사용 가능
- 🎨 **범용 시스템**: 모든 종류의 앱 체험 콘텐츠 제작 가능

## 🚀 시작하기

### 필요 사항

- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/senior_helper.git
cd senior_helper

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:5173 을 열어 확인하세요.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 📱 사용 방법

### 1. 관리자 모드 (콘텐츠 제작)

1. **프로젝트 생성**
   - 홈 화면에서 "새 프로젝트 만들기" 클릭
   - 프로젝트 이름과 설명 입력

2. **화면 추가**
   - "화면 추가" 버튼으로 앱 스크린샷 업로드
   - 여러 화면을 순서대로 추가

3. **인터랙티브 영역 설정**
   - 이미지 위에서 드래그하여 클릭 가능한 영역 지정
   - 각 영역에 액션 설정:
     - 다음 화면으로 이동
     - 메시지 표시
     - 키보드 입력 시뮬레이션
     - 진동 효과

4. **힌트 및 안내 추가**
   - 각 핫스팟에 힌트 텍스트 입력
   - 화면별 음성 안내 설정

### 2. 체험 모드 (어르신 사용)

1. 홈 화면에서 프로젝트 선택
2. "체험하기" 버튼 클릭
3. 화면의 안내에 따라 터치/클릭
4. 진행률 바로 학습 진행 상황 확인

## 🏗️ 기술 스택

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Drag & Drop**: react-rnd
- **Storage**: LocalStorage

## 📂 프로젝트 구조

```
senior_helper/
├── src/
│   ├── components/
│   │   ├── Home.tsx              # 홈 화면
│   │   ├── admin/                # 관리자 모드
│   │   │   ├── AdminMode.tsx
│   │   │   ├── ProjectSettings.tsx
│   │   │   ├── ScreenList.tsx
│   │   │   ├── ScreenEditor.tsx
│   │   │   └── HotspotConfig.tsx
│   │   └── viewer/               # 체험 모드
│   │       └── ViewerMode.tsx
│   ├── store/
│   │   └── useStore.ts           # Zustand 상태 관리
│   ├── types/
│   │   └── index.ts              # TypeScript 타입 정의
│   ├── utils/
│   │   └── helpers.ts            # 유틸리티 함수
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
└── vite.config.ts
```

## 🎨 주요 기능

### 관리자 모드

- ✅ 프로젝트 생성/편집/삭제
- ✅ 이미지 업로드 및 화면 관리
- ✅ 드래그로 인터랙티브 영역 지정
- ✅ 드래그/리사이즈로 영역 조정
- ✅ 다양한 액션 타입 설정
- ✅ 음성 안내 텍스트 입력
- ✅ 힌트 메시지 설정

### 체험 모드

- ✅ 부드러운 화면 전환 애니메이션
- ✅ 터치 효과 (ripple)
- ✅ 진동 피드백
- ✅ 음성 안내 (TTS)
- ✅ 힌트 표시/숨김
- ✅ 진행률 추적
- ✅ 완료 시 통계 표시

## 🔮 향후 계획

현재는 완전 이미지 기반으로 구현되어 있습니다. 향후 다음 기능을 추가할 예정입니다:

- [ ] 카카오맵 API 연동 (실제 지도 표시)
- [ ] 프로젝트 import/export (JSON)
- [ ] 클라우드 저장소 연동
- [ ] 학습 통계 및 분석
- [ ] 템플릿 공유 기능
- [ ] 여러 시나리오 지원

## 🤝 기여하기

이슈와 PR을 환영합니다!

## 📄 라이선스

MIT License

## 👥 만든 사람

복지관 및 교육기관에서 어르신들의 디지털 접근성 향상을 위해 만들어졌습니다.

---

**어르신들의 디지털 세상, 시니어 헬퍼와 함께하세요! 💙**
