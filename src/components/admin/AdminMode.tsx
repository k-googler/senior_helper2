import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { generateId } from '../../utils/helpers';
import { Project } from '../../types';
import { ProjectSettings } from './ProjectSettings';
import { ScreenList } from './ScreenList';
import { ScreenEditor } from './ScreenEditor';

export const AdminMode = () => {
  const {
    projects,
    currentProjectId,
    setMode,
    addProject,
    updateProject,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useStore();

  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [showProjectSettings, setShowProjectSettings] = useState(false);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  // 새 프로젝트인 경우 설정 화면 표시
  useEffect(() => {
    if (!currentProjectId) {
      setShowProjectSettings(true);
    }
  }, [currentProjectId]);

  // 키보드 단축키 (Ctrl+Z: Undo, Ctrl+Y: Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  const handleSaveProjectSettings = (name: string, description: string) => {
    if (currentProjectId && currentProject) {
      updateProject(currentProjectId, { name, description });
    } else {
      const newProject: Project = {
        id: generateId(),
        name,
        description,
        screens: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addProject(newProject);
    }
    setShowProjectSettings(false);
  };

  const handleBack = () => {
    if (confirm('작업 중인 내용이 있다면 저장되었습니다. 홈으로 돌아가시겠습니까?')) {
      setMode('home');
    }
  };

  if (showProjectSettings) {
    return (
      <ProjectSettings
        initialName={currentProject?.name || ''}
        initialDescription={currentProject?.description || ''}
        onSave={handleSaveProjectSettings}
        onCancel={() => {
          if (!currentProjectId) {
            setMode('home');
          } else {
            setShowProjectSettings(false);
          }
        }}
      />
    );
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">프로젝트를 찾을 수 없습니다</p>
          <button
            onClick={handleBack}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-800 text-2xl"
            >
              ←
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{currentProject.name}</h1>
              <p className="text-sm text-gray-500">관리자 모드</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="실행 취소 (Ctrl+Z)"
            >
              ↶ 실행 취소
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="다시 실행 (Ctrl+Y)"
            >
              ↷ 다시 실행
            </button>
            <button
              onClick={() => setShowProjectSettings(true)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              프로젝트 설정
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 왼쪽: 화면 목록 */}
          <div className="lg:col-span-1">
            <ScreenList
              selectedScreenId={selectedScreenId}
              onSelectScreen={setSelectedScreenId}
            />
          </div>

          {/* 오른쪽: 화면 에디터 */}
          <div className="lg:col-span-2">
            <ScreenEditor screenId={selectedScreenId} />
          </div>
        </div>
      </div>
    </div>
  );
};
