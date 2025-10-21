import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

export const Home = () => {
  const { projects, setMode, setCurrentProject, deleteProject, exportProject, exportAllProjects, importProjects } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            시니어 헬퍼
          </h1>
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportAll}
                className="bg-blue-600 text-white px-6 py-4 rounded-xl text-lg font-semibold shadow-lg hover:bg-blue-700 transition-colors"
              >
                📤 전체 내보내기
              </motion.button>
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
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer"
                onClick={() => handleViewProject(project.id)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800 flex-1">
                      {project.name}
                    </h3>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="text-red-500 hover:text-red-700 text-xl p-1"
                      title="삭제"
                    >
                      ×
                    </button>
                  </div>

                  {project.description && (
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span>📄 {project.screens.length}개 화면</span>
                  </div>

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
                    <button
                      onClick={(e) => handleExportProject(project.id, e)}
                      className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors border border-blue-200"
                    >
                      📤 내보내기
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
