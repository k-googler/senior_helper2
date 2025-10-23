import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

export const Home = () => {
  const { projects, setMode, setCurrentProject, deleteProject, deleteProjects, duplicateProject, exportProject, exportAllProjects, importProjects, getSessionHistory, clearSessionHistory } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showStats, setShowStats] = useState(false);

  const handleCreateProject = () => {
    setCurrentProject(null);
    setMode('admin');
  };

  const handleEditProject = (projectId: string) => {
    setCurrentProject(projectId);
    setMode('admin');
  };

  const handleViewProject = (projectId: string) => {
    setCurrentProject(projectId);
    setMode('viewer');
  };

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('정말 이 프로젝트를 삭제하시겠습니까?')) {
      deleteProject(projectId);
    }
  };

  const handleExportProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    exportProject(projectId);
  };

  const handleExportAll = () => {
    exportAllProjects();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const result = await importProjects(text);

      if (result.success) {
        alert('프로젝트를 성공적으로 가져왔습니다!');
      } else {
        alert(result.error || '프로젝트 가져오기 실패');
      }
    } catch (error) {
      alert('파일을 읽을 수 없습니다.');
    } finally {
      setIsImporting(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDuplicateProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateProject(projectId);
  };

  const handleToggleSelection = (projectId: string) => {
    setSelectedIds(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === projects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(projects.map(p => p.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    if (confirm(`선택한 ${selectedIds.length}개의 프로젝트를 삭제하시겠습니까?`)) {
      deleteProjects(selectedIds);
      setSelectedIds([]);
      setSelectionMode(false);
    }
  };

  const handleClearStats = () => {
    if (confirm('모든 통계 기록을 삭제하시겠습니까?')) {
      clearSessionHistory();
      setShowStats(false);
    }
  };

  const sessionHistory = getSessionHistory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              시니어 헬퍼
            </h1>
            <button
              onClick={() => setShowStats(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              title="통계 보기"
            >
              📊 통계
            </button>
          </div>
          <p className="text-lg text-gray-600">어르신을 위한 앱 체험 교육 시스템</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateProject}
            className="flex-1 bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:bg-indigo-700 transition-colors"
          >
            + 새 프로젝트 만들기
          </motion.button>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleImportClick}
              disabled={isImporting}
              className="bg-green-600 text-white px-6 py-4 rounded-xl text-lg font-semibold shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? '가져오는 중...' : '📥 가져오기'}
            </motion.button>

            {projects.length > 0 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportAll}
                  className="bg-blue-600 text-white px-6 py-4 rounded-xl text-lg font-semibold shadow-lg hover:bg-blue-700 transition-colors"
                >
                  📤 전체 내보내기
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectionMode(!selectionMode)}
                  className={`px-6 py-4 rounded-xl text-lg font-semibold shadow-lg transition-colors ${
                    selectionMode
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {selectionMode ? '✕ 취소' : '☑ 선택'}
                </motion.button>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {selectionMode && projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-4 mb-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                {selectedIds.length === projects.length ? '전체 해제' : '전체 선택'}
              </button>
              <span className="text-gray-600">
                {selectedIds.length}개 선택됨
              </span>
            </div>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              선택 항목 삭제
            </button>
          </motion.div>
        )}

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-md"
          >
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              아직 프로젝트가 없습니다
            </h3>
            <p className="text-gray-500">
              새 프로젝트를 만들어 어르신들을 위한 체험 콘텐츠를 제작해보세요
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden ${
                  selectionMode ? 'cursor-default' : 'cursor-pointer'
                } ${selectedIds.includes(project.id) ? 'ring-4 ring-indigo-500' : ''}`}
                onClick={() => {
                  if (selectionMode) {
                    handleToggleSelection(project.id);
                  } else {
                    handleViewProject(project.id);
                  }
                }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    {selectionMode && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(project.id)}
                        onChange={() => handleToggleSelection(project.id)}
                        className="w-5 h-5 mr-3 mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <h3 className="text-xl font-bold text-gray-800 flex-1">
                      {project.name}
                    </h3>
                    {!selectionMode && (
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="text-red-500 hover:text-red-700 text-xl p-1"
                        title="삭제"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {project.description && (
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span>📄 {project.screens.length}개 화면</span>
                  </div>

                  {!selectionMode && (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project.id);
                          }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          편집
                        </button>
                        <button
                          onClick={() => handleViewProject(project.id)}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          체험하기
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleExportProject(project.id, e)}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors border border-blue-200"
                        >
                          📤 내보내기
                        </button>
                        <button
                          onClick={(e) => handleDuplicateProject(project.id, e)}
                          className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium transition-colors border border-green-200"
                        >
                          📋 복제
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 통계 모달 */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStats(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📊 체험 통계</h2>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {sessionHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-xl text-gray-600">아직 체험 기록이 없습니다</p>
                  <p className="text-gray-500 mt-2">프로젝트를 체험하면 통계가 기록됩니다</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <p className="text-gray-600">총 {sessionHistory.length}개의 체험 기록</p>
                    <button
                      onClick={handleClearStats}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
                    >
                      전체 삭제
                    </button>
                  </div>

                  <div className="space-y-4">
                    {sessionHistory.map((session) => (
                      <div
                        key={session.id}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{session.projectName}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(session.startTime).toLocaleString('ko-KR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-indigo-600">
                              {(session.duration / 1000).toFixed(1)}초
                            </div>
                            <div className="text-xs text-gray-500">소요 시간</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="text-sm text-gray-600 mb-1">완료율</div>
                            <div className="text-xl font-bold text-green-600">
                              {session.completionRate.toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {session.completedScreens}/{session.totalScreens} 화면
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="text-sm text-gray-600 mb-1">정확도</div>
                            <div className="text-xl font-bold text-blue-600">
                              {session.accuracy.toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {session.correctClicks}/{session.correctClicks + session.wrongClicks} 클릭
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="text-sm text-gray-600 mb-1">정답 클릭</div>
                            <div className="text-xl font-bold text-green-600">
                              {session.correctClicks}
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="text-sm text-gray-600 mb-1">오답 클릭</div>
                            <div className="text-xl font-bold text-red-600">
                              {session.wrongClicks}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
