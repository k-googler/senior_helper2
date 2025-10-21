import { create } from 'zustand';
import { Project, Screen, Hotspot, AppMode, ViewerState } from '../types';

interface AppState {
  // 앱 모드
  mode: AppMode;
  setMode: (mode: AppMode) => void;

  // 프로젝트 관리
  projects: Project[];
  currentProjectId: string | null;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  deleteProjects: (ids: string[]) => void;
  duplicateProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;

  // 화면 관리 (현재 프로젝트)
  addScreen: (screen: Screen) => void;
  updateScreen: (screenId: string, updates: Partial<Screen>) => void;
  deleteScreen: (screenId: string) => void;
  reorderScreens: (screens: Screen[]) => void;

  // 핫스팟 관리
  addHotspot: (screenId: string, hotspot: Hotspot) => void;
  updateHotspot: (screenId: string, hotspotId: string, updates: Partial<Hotspot>) => void;
  deleteHotspot: (screenId: string, hotspotId: string) => void;

  // Undo/Redo 기능
  history: Project[][];
  historyIndex: number;
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;

  // 뷰어 상태
  viewerState: ViewerState;
  setCurrentScreen: (screenId: string | null) => void;
  toggleHint: () => void;
  completeScreen: (screenId: string) => void;
  resetViewer: () => void;

  // 로컬 스토리지
  loadFromStorage: () => void;
  saveToStorage: () => void;

  // 프로젝트 내보내기/가져오기
  exportProject: (projectId: string) => void;
  importProject: (projectData: string) => Promise<{ success: boolean; error?: string }>;
  exportAllProjects: () => void;
  importProjects: (projectsData: string) => Promise<{ success: boolean; error?: string }>;
}

const STORAGE_KEY = 'senior-helper-data';

const initialViewerState: ViewerState = {
  currentScreenId: null,
  showHint: true,
  completedScreens: [],
  startTime: null,
};

const MAX_HISTORY = 20; // 최대 히스토리 개수

export const useStore = create<AppState>((set, get) => ({
  mode: 'home',
  projects: [],
  currentProjectId: null,
  viewerState: initialViewerState,
  history: [],
  historyIndex: -1,

  setMode: (mode) => set({ mode }),

  // 프로젝트 관리
  addProject: (project) => {
    set((state) => ({
      projects: [...state.projects, project],
      currentProjectId: project.id,
    }));
    get().saveToStorage();
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }));
    get().saveToStorage();
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
    }));
    get().saveToStorage();
  },

  deleteProjects: (ids) => {
    set((state) => ({
      projects: state.projects.filter((p) => !ids.includes(p.id)),
      currentProjectId: ids.includes(state.currentProjectId || '') ? null : state.currentProjectId,
    }));
    get().saveToStorage();
  },

  duplicateProject: (id) => {
    const { projects } = get();
    const projectToDuplicate = projects.find((p) => p.id === id);
    if (!projectToDuplicate) return;

    // 딥 클론 생성 (새로운 ID 할당)
    const now = Date.now();
    const duplicatedProject: Project = {
      ...projectToDuplicate,
      id: `project-${now}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${projectToDuplicate.name} (사본)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      screens: projectToDuplicate.screens.map((screen, index) => ({
        ...screen,
        id: `screen-${now}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        hotspots: screen.hotspots.map((hotspot, hIndex) => ({
          ...hotspot,
          id: `hotspot-${now}-${hIndex}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      })),
    };

    set((state) => ({
      projects: [...state.projects, duplicatedProject],
    }));
    get().saveToStorage();
  },

  setCurrentProject: (id) => set({ currentProjectId: id }),

  // 화면 관리
  addScreen: (screen) => {
    const { currentProjectId } = get();
    if (!currentProjectId) return;

    get().saveHistory(); // 히스토리 저장

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === currentProjectId
          ? { ...p, screens: [...p.screens, screen], updatedAt: new Date().toISOString() }
          : p
      ),
    }));
    get().saveToStorage();
  },

  updateScreen: (screenId, updates) => {
    const { currentProjectId } = get();
    if (!currentProjectId) return;

    get().saveHistory(); // 히스토리 저장

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === currentProjectId
          ? {
              ...p,
              screens: p.screens.map((s) => (s.id === screenId ? { ...s, ...updates } : s)),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    get().saveToStorage();
  },

  deleteScreen: (screenId) => {
    const { currentProjectId } = get();
    if (!currentProjectId) return;

    get().saveHistory(); // 히스토리 저장

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === currentProjectId
          ? {
              ...p,
              screens: p.screens.filter((s) => s.id !== screenId),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    get().saveToStorage();
  },

  reorderScreens: (screens) => {
    const { currentProjectId } = get();
    if (!currentProjectId) return;

    get().saveHistory(); // 히스토리 저장

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === currentProjectId
          ? { ...p, screens, updatedAt: new Date().toISOString() }
          : p
      ),
    }));
    get().saveToStorage();
  },

  // 핫스팟 관리
  addHotspot: (screenId, hotspot) => {
    const { currentProjectId } = get();
    if (!currentProjectId) return;

    get().saveHistory(); // 히스토리 저장

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === currentProjectId
          ? {
              ...p,
              screens: p.screens.map((s) =>
                s.id === screenId ? { ...s, hotspots: [...s.hotspots, hotspot] } : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    get().saveToStorage();
  },

  updateHotspot: (screenId, hotspotId, updates) => {
    const { currentProjectId } = get();
    if (!currentProjectId) return;

    get().saveHistory(); // 히스토리 저장

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === currentProjectId
          ? {
              ...p,
              screens: p.screens.map((s) =>
                s.id === screenId
                  ? {
                      ...s,
                      hotspots: s.hotspots.map((h) =>
                        h.id === hotspotId ? { ...h, ...updates } : h
                      ),
                    }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    get().saveToStorage();
  },

  deleteHotspot: (screenId, hotspotId) => {
    const { currentProjectId } = get();
    if (!currentProjectId) return;

    get().saveHistory(); // 히스토리 저장

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === currentProjectId
          ? {
              ...p,
              screens: p.screens.map((s) =>
                s.id === screenId
                  ? { ...s, hotspots: s.hotspots.filter((h) => h.id !== hotspotId) }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    get().saveToStorage();
  },

  // 뷰어 상태
  setCurrentScreen: (screenId) =>
    set((state) => ({
      viewerState: {
        ...state.viewerState,
        currentScreenId: screenId,
        startTime: state.viewerState.startTime || Date.now(),
      },
    })),

  toggleHint: () =>
    set((state) => ({
      viewerState: { ...state.viewerState, showHint: !state.viewerState.showHint },
    })),

  completeScreen: (screenId) =>
    set((state) => ({
      viewerState: {
        ...state.viewerState,
        completedScreens: [...state.viewerState.completedScreens, screenId],
      },
    })),

  resetViewer: () => set({ viewerState: initialViewerState }),

  // 로컬 스토리지
  loadFromStorage: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({ projects: parsed.projects || [] });
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  },

  saveToStorage: () => {
    try {
      const { projects } = get();
      // 이미지 파일은 제외하고 저장 (base64 URL만 저장)
      const projectsToSave = projects.map((p) => ({
        ...p,
        screens: p.screens.map((s) => {
          const { imageFile, ...screenWithoutFile } = s;
          return screenWithoutFile;
        }),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects: projectsToSave }));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  },

  // 프로젝트 내보내기/가져오기
  exportProject: (projectId) => {
    try {
      const { projects } = get();
      const project = projects.find((p) => p.id === projectId);
      if (!project) {
        console.error('Project not found');
        return;
      }

      // 이미지 파일 제외
      const projectToExport = {
        ...project,
        screens: project.screens.map((s) => {
          const { imageFile, ...screenWithoutFile } = s;
          return screenWithoutFile;
        }),
      };

      const dataStr = JSON.stringify(projectToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name.replace(/[^a-z0-9가-힣]/gi, '_')}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export project:', error);
    }
  },

  importProject: async (projectData) => {
    try {
      const project = JSON.parse(projectData) as Project;

      // 유효성 검사
      if (!project.id || !project.name || !Array.isArray(project.screens)) {
        return { success: false, error: '올바른 프로젝트 파일이 아닙니다.' };
      }

      // ID 중복 방지 - 새 ID 생성
      const newProject: Project = {
        ...project,
        id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      get().addProject(newProject);
      return { success: true };
    } catch (error) {
      console.error('Failed to import project:', error);
      return { success: false, error: 'JSON 파일을 읽을 수 없습니다.' };
    }
  },

  exportAllProjects: () => {
    try {
      const { projects } = get();
      if (projects.length === 0) {
        alert('내보낼 프로젝트가 없습니다.');
        return;
      }

      // 이미지 파일 제외
      const projectsToExport = projects.map((p) => ({
        ...p,
        screens: p.screens.map((s) => {
          const { imageFile, ...screenWithoutFile } = s;
          return screenWithoutFile;
        }),
      }));

      const dataStr = JSON.stringify({ projects: projectsToExport }, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `senior_helper_projects_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export all projects:', error);
    }
  },

  importProjects: async (projectsData) => {
    try {
      const data = JSON.parse(projectsData);

      // 유효성 검사
      if (!data.projects || !Array.isArray(data.projects)) {
        return { success: false, error: '올바른 프로젝트 파일이 아닙니다.' };
      }

      // 모든 프로젝트에 새 ID 생성
      const newProjects: Project[] = data.projects.map((project: Project) => ({
        ...project,
        id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // 기존 프로젝트에 추가
      set((state) => ({
        projects: [...state.projects, ...newProjects],
      }));
      get().saveToStorage();

      return { success: true };
    } catch (error) {
      console.error('Failed to import projects:', error);
      return { success: false, error: 'JSON 파일을 읽을 수 없습니다.' };
    }
  },

  // Undo/Redo 기능
  saveHistory: () => {
    const { projects, history, historyIndex } = get();

    // 딥 클론을 위해 JSON 사용 (imageFile 제외)
    const projectsClone = JSON.parse(
      JSON.stringify(
        projects.map((p) => ({
          ...p,
          screens: p.screens.map((s) => {
            const { imageFile, ...screenWithoutFile } = s;
            return screenWithoutFile;
          }),
        }))
      )
    );

    // 현재 인덱스 이후의 히스토리 제거 (새로운 분기)
    const newHistory = history.slice(0, historyIndex + 1);

    // 새로운 상태 추가
    newHistory.push(projectsClone);

    // 최대 개수 제한
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    } else {
      set({ historyIndex: historyIndex + 1 });
    }

    set({ history: newHistory });
  },

  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  undo: () => {
    const { history, historyIndex } = get();

    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];

      set({
        projects: previousState,
        historyIndex: newIndex,
      });

      console.log('↶ Undo:', historyIndex, '→', newIndex);
    }
  },

  redo: () => {
    const { history, historyIndex } = get();

    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];

      set({
        projects: nextState,
        historyIndex: newIndex,
      });

      console.log('↷ Redo:', historyIndex, '→', newIndex);
    }
  },
}));
