# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**시니어 헬퍼 (Senior Helper)** - 어르신들을 위한 모바일 앱 체험 교육 시스템

이 프로젝트는 어르신들이 카카오택시, 배달앱 등의 모바일 앱을 실제로 사용하기 전에 안전하게 연습할 수 있는 인터랙티브 시뮬레이터입니다. 복지사나 자원봉사자가 관리자 모드에서 앱 화면 캡처 이미지를 업로드하고 인터랙티브 영역을 설정하면, 어르신들은 체험 모드에서 실제 앱처럼 사용해볼 수 있습니다.

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Drag & Drop**: react-rnd
- **Storage**: LocalStorage

## Commands

### Development
```bash
npm run dev       # 개발 서버 시작 (http://localhost:5173)
npm run build     # 프로덕션 빌드
npm run preview   # 빌드된 앱 미리보기
npm run lint      # ESLint 실행
```

## Architecture

### 모드 구조 (3가지 모드)

1. **Home Mode** (`src/components/Home.tsx`)
   - 프로젝트 목록 표시
   - 프로젝트 생성/편집/삭제/체험 진입점

2. **Admin Mode** (`src/components/admin/`)
   - 프로젝트 설정 (`ProjectSettings.tsx`)
   - 화면 목록 관리 (`ScreenList.tsx`)
   - 화면 에디터 (`ScreenEditor.tsx`) - 드래그로 인터랙티브 영역 지정
   - 핫스팟 설정 (`HotspotConfig.tsx`) - 액션 타입, 메시지, 화면 전환 등 설정

3. **Viewer Mode** (`src/components/viewer/`)
   - 실제 체험 화면
   - 터치 인터랙션, 애니메이션, 음성 안내 등 동적 효과

### 데이터 구조 (`src/types/index.ts`)

**핵심 타입**:
- `Project`: 프로젝트 (여러 Screen 포함)
- `Screen`: 화면 (이미지 + 여러 Hotspot)
- `Hotspot`: 인터랙티브 영역 (위치, 크기, 액션)
- `HotspotAction`: 액션 정의 (navigate, message, input, vibrate, none)

**액션 타입**:
- `navigate`: 다음 화면으로 이동
- `message`: 메시지 토스트 표시
- `input`: 키보드 입력 시뮬레이션
- `vibrate`: 진동 효과
- `none`: 액션 없음

### 상태 관리 (`src/store/useStore.ts`)

Zustand를 사용한 전역 상태 관리:
- 앱 모드 전환
- 프로젝트 CRUD
- 화면 및 핫스팟 관리
- 뷰어 상태 (현재 화면, 진행률, 힌트 표시 등)
- LocalStorage 자동 저장/불러오기

### 주요 기능

**관리자 모드**:
- 이미지 업로드 후 드래그로 인터랙티브 영역 지정
- react-rnd를 사용한 핫스팟 위치/크기 조절
- 각 핫스팟에 액션 설정 (화면 전환, 메시지, 키보드 입력 등)
- 음성 안내 텍스트 설정 (TTS 지원)

**체험 모드**:
- Framer Motion을 활용한 부드러운 화면 전환 애니메이션
- 터치 효과 (ripple effect)
- 힌트 표시/숨김 토글
- 진행률 바
- 음성 안내 (Web Speech API)
- 진동 피드백 (Vibration API)

## File Structure

```
src/
├── types/           # TypeScript 타입 정의
│   └── index.ts
├── store/          # Zustand 상태 관리
│   └── useStore.ts
├── utils/          # 유틸리티 함수
│   └── helpers.ts
├── components/
│   ├── Home.tsx                    # 홈 화면
│   ├── admin/                      # 관리자 모드
│   │   ├── AdminMode.tsx          # 관리자 메인
│   │   ├── ProjectSettings.tsx    # 프로젝트 설정
│   │   ├── ScreenList.tsx         # 화면 목록
│   │   ├── ScreenEditor.tsx       # 화면 에디터 (드래그)
│   │   └── HotspotConfig.tsx      # 핫스팟 설정
│   └── viewer/                     # 체험 모드
│       └── ViewerMode.tsx         # 체험 메인
├── App.tsx         # 메인 앱 (모드 전환)
├── main.tsx        # 진입점
└── index.css       # 글로벌 스타일
```

## Key Patterns

### 1. 좌표 시스템
핫스팟 위치와 크기는 **퍼센트(%)** 기반으로 저장되어 다양한 화면 크기에 대응:
```typescript
{
  x: 10,      // 왼쪽에서 10%
  y: 20,      // 위에서 20%
  width: 30,  // 너비 30%
  height: 15  // 높이 15%
}
```

### 2. 이미지 저장
- 업로드된 이미지는 base64로 변환하여 LocalStorage에 저장
- `imageFile` 속성은 저장 시 제외 (용량 절약)

### 3. 화면 전환 플로우
1. 사용자가 핫스팟 클릭
2. 딜레이가 있으면 대기
3. 액션 타입에 따라 처리:
   - navigate: 화면 전환 (애니메이션 포함)
   - message: 토스트 메시지 표시
   - input: 키보드 입력 애니메이션
   - vibrate: 진동

### 4. 모바일 최적화
- viewport meta 태그로 모바일 웹앱 모드 지원
- touch-action 최적화
- 진동 API (navigator.vibrate)
- 음성 안내 (speechSynthesis)

## Development Notes

### 화면 에디터 사용법
1. 화면 목록에서 "화면 추가" 클릭하여 이미지 업로드
2. 업로드된 이미지 위에서 드래그하여 인터랙티브 영역 생성
3. 생성된 핫스팟을 클릭하여 액션 설정
4. 핫스팟은 드래그/리사이즈 가능 (react-rnd)

### LocalStorage 데이터
- Key: `senior-helper-data`
- 자동 저장: 모든 상태 변경 시
- 자동 불러오기: 앱 시작 시

### 애니메이션 효과
- 화면 전환: scale + opacity (Framer Motion)
- 터치 효과: scale + opacity with ripple
- 힌트: 손가락 이모지 bounce 애니메이션
- 진행률 바: width transition

## Current Status (2025-10-21)

### ✅ 완료된 기능 (MVP v1.0)

**핵심 기능**:
- ✅ 3가지 모드 구현 (Home, Admin, Viewer)
- ✅ 프로젝트 생성/편집/삭제
- ✅ 이미지 업로드 및 화면 관리
- ✅ 드래그로 인터랙티브 영역 지정 (react-rnd)
- ✅ 5가지 액션 타입 (navigate, message, input, vibrate, none)
- ✅ 힌트 및 음성 안내 설정
- ✅ LocalStorage 자동 저장/불러오기

**동적 효과**:
- ✅ Framer Motion 화면 전환 애니메이션
- ✅ 터치 ripple 효과
- ✅ 힌트 손가락 이모지 bounce 애니메이션
- ✅ 키보드 입력 시뮬레이션 애니메이션
- ✅ 성공 메시지 토스트
- ✅ 진행률 바

**모바일 최적화**:
- ✅ 터치 인터페이스
- ✅ 진동 피드백 (Vibration API)
- ✅ 음성 안내 (Web Speech API)
- ✅ 반응형 디자인

### 🧪 테스트 방법

1. **개발 서버 실행**:
   ```bash
   npm install
   npm run dev
   ```
   - 로컬: http://localhost:5173
   - 모바일: http://[your-ip]:5173

2. **테스트 시나리오**:
   - 새 프로젝트 생성 (예: "카카오택시 호출하기")
   - 앱 스크린샷 업로드 (3-5개 화면)
   - 각 화면에 인터랙티브 영역 드래그로 지정
   - 액션 설정 (화면 전환, 메시지 등)
   - 체험 모드에서 실제 사용해보기

3. **확인 사항**:
   - [ ] 화면 전환 애니메이션이 부드러운가?
   - [ ] 터치 효과가 잘 나타나는가?
   - [ ] 힌트가 잘 보이는가?
   - [ ] 모바일에서 진동/음성이 작동하는가?
   - [ ] LocalStorage에 데이터가 저장되는가?

## Next Steps (다음 할 일)

### Phase 2 - 지도 기능 업그레이드 (선택사항)

**옵션 2 (하이브리드)로 업그레이드**:
- [ ] 카카오맵 API 키 발급 및 설정
- [ ] 관리자 모드에서 출발지/목적지 주소 입력 UI 추가
- [ ] 체험 모드에서 실제 카카오맵 표시
- [ ] 미리 정한 주소만 선택 가능하도록 제한
- [ ] 경로 표시 기능

**필요한 파일 수정**:
1. `src/types/index.ts` - 지도 관련 타입 추가
2. `src/components/admin/ScreenEditor.tsx` - 지도 화면 설정 UI
3. `src/components/viewer/ViewerMode.tsx` - 카카오맵 컴포넌트 통합
4. `package.json` - `react-kakao-maps-sdk` 추가

### Phase 3 - 개선 사항

**UX 개선**:
- [ ] 관리자 모드에서 화면 순서 드래그로 변경
- [ ] 핫스팟 복사/붙여넣기 기능
- [ ] 실행 취소/다시 실행 (undo/redo)
- [ ] 화면 미리보기 모드

**데이터 관리**:
- [ ] 프로젝트 JSON 파일로 내보내기/가져오기
- [ ] 여러 프로젝트 일괄 삭제
- [ ] 프로젝트 복제 기능

**통계 및 분석**:
- [ ] 체험 완료 시간 측정
- [ ] 오답 클릭 횟수 추적
- [ ] 학습 진행 기록 저장

### Phase 4 - 고급 기능

**템플릿 시스템**:
- [ ] 기본 템플릿 제공 (카카오택시, 배달앱 등)
- [ ] 커뮤니티 템플릿 공유
- [ ] 템플릿 마켓플레이스

**클라우드 연동**:
- [ ] Firebase 인증 및 데이터베이스
- [ ] 여러 기기에서 동기화
- [ ] 복지관별 프로젝트 관리

**접근성 개선**:
- [ ] 큰 글씨 모드
- [ ] 고대비 테마
- [ ] 스크린 리더 지원

## 알려진 이슈

### 해결 필요

1. **LocalStorage 용량 제한**:
   - 문제: 이미지를 base64로 저장하면 용량이 큼
   - 해결: IndexedDB로 마이그레이션 또는 이미지 압축

2. **브라우저 호환성**:
   - Web Speech API가 일부 브라우저에서 미지원
   - Vibration API가 iOS Safari에서 제한적

3. **화면 에디터 UX**:
   - 작은 화면에서 드래그가 어려울 수 있음
   - 확대/축소 기능 필요

### 향후 고려사항

- PWA(Progressive Web App)로 변환하여 오프라인 사용 개선
- 앱 스토어 배포 (React Native로 포팅)
- 관리자 가이드 및 튜토리얼 영상 제작

## Deployment (배포)

### Vercel (추천)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### Netlify

```bash
# 빌드
npm run build

# dist 폴더를 Netlify에 드래그 앤 드롭
```

### GitHub Pages

```bash
# vite.config.ts에 base 설정
export default defineConfig({
  base: '/senior_helper2/',
  // ...
})

# 빌드 및 배포
npm run build
# dist 폴더를 gh-pages 브랜치에 푸시
```

## Contributing

버그 리포트나 기능 제안은 GitHub Issues에 등록해주세요.

Pull Request는 언제나 환영합니다!

## Git Repository

https://github.com/k-googler/senior_helper2.git
