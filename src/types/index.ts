// 액션 타입 정의
export type ActionType =
  | 'navigate'      // 다음 화면으로 이동
  | 'message'       // 메시지 표시
  | 'input'         // 키보드 입력
  | 'vibrate'       // 진동 효과
  | 'map'           // 지도 API 표시
  | 'none';         // 액션 없음

// 인터랙티브 영역 (핫스팟) 정의
export interface Hotspot {
  id: string;
  x: number;          // 상대 위치 (%)
  y: number;          // 상대 위치 (%)
  width: number;      // 상대 크기 (%)
  height: number;     // 상대 크기 (%)
  action: HotspotAction;
  hint?: string;      // 힌트 텍스트
  isCorrect: boolean; // 정답 여부
}

// 핫스팟 액션 정의
export interface HotspotAction {
  type: ActionType;
  target?: string;    // navigate일 때 다음 화면 ID
  message?: string;   // message일 때 표시할 메시지
  inputValue?: string; // input일 때 기본값/예상 입력값
  inputMode?: 'auto' | 'manual'; // input 모드: auto(자동 입력) | manual(사용자 직접 입력)
  inputPlaceholder?: string; // input일 때 플레이스홀더
  delay?: number;     // 액션 실행 전 딜레이 (ms)
  // 지도 API 관련
  mapStartAddress?: string;  // 출발지 주소
  mapEndAddress?: string;    // 목적지 주소
  mapStartLat?: number;      // 출발지 위도
  mapStartLng?: number;      // 출발지 경도
  mapEndLat?: number;        // 목적지 위도
  mapEndLng?: number;        // 목적지 경도
}

// 화면 정의
export interface Screen {
  id: string;
  name: string;
  imageUrl: string;   // 화면 이미지 URL (base64 or blob URL)
  imageFile?: File;   // 업로드된 이미지 파일
  voiceGuide?: string; // 음성 안내 텍스트
  hotspots: Hotspot[];
  order: number;      // 화면 순서
}

// 프로젝트 정의
export interface Project {
  id: string;
  name: string;
  description?: string;
  screens: Screen[];
  createdAt: string;
  updatedAt: string;
}

// 앱 모드
export type AppMode = 'home' | 'admin' | 'viewer';

// 뷰어 상태
export interface ViewerState {
  currentScreenId: string | null;
  showHint: boolean;
  completedScreens: string[];
  startTime: number | null;
}

// 세션 통계
export interface SessionStats {
  projectId: string;
  projectName: string;
  startTime: number;
  endTime: number | null;
  totalScreens: number;
  completedScreens: number;
  wrongClicks: number;
  correctClicks: number;
}

// 세션 기록 (저장용)
export interface SessionRecord {
  id: string;
  projectId: string;
  projectName: string;
  startTime: string;
  endTime: string;
  duration: number;        // 총 소요 시간 (ms)
  totalScreens: number;
  completedScreens: number;
  wrongClicks: number;
  correctClicks: number;
  completionRate: number;  // 완료율 (%)
  accuracy: number;        // 정확도 (%)
}
