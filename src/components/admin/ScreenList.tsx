import { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { generateId, fileToBase64 } from '../../utils/helpers';
import { Screen } from '../../types';
import { motion } from 'framer-motion';

interface ScreenListProps {
  selectedScreenId: string | null;
  onSelectScreen: (screenId: string) => void;
}

export const ScreenList = ({ selectedScreenId, onSelectScreen }: ScreenListProps) => {
  const { projects, currentProjectId, addScreen, deleteScreen } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentProject = projects.find((p) => p.id === currentProjectId);
  const screens = currentProject?.screens || [];

  const handleAddScreen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const newScreen: Screen = {
        id: generateId(),
        name: `화면 ${screens.length + 1}`,
        imageUrl: base64,
        imageFile: file,
        hotspots: [],
        order: screens.length,
      };
      addScreen(newScreen);
      onSelectScreen(newScreen.id);
    } catch (error) {
      alert('이미지 업로드에 실패했습니다.');
      console.error(error);
    }

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteScreen = (screenId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 화면을 삭제하시겠습니까?')) {
      deleteScreen(screenId);
      if (selectedScreenId === screenId) {
        const remainingScreens = screens.filter(s => s.id !== screenId);
        if (remainingScreens.length > 0) {
          onSelectScreen(remainingScreens[0].id);
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">화면 목록</h3>
        <span className="text-sm text-gray-500">{screens.length}개</span>
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full mb-4 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <span className="text-xl">+</span>
        화면 추가
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAddScreen}
        className="hidden"
      />

      {screens.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">📱</div>
          <p className="text-sm">화면을 추가해주세요</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {screens.map((screen, index) => (
            <motion.div
              key={screen.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectScreen(screen.id)}
              className={`
                relative cursor-pointer rounded-lg border-2 p-3 transition-all
                ${
                  selectedScreenId === screen.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                  <img
                    src={screen.imageUrl}
                    alt={screen.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-gray-800 truncate">
                      {screen.name}
                    </h4>
                    <button
                      onClick={(e) => handleDeleteScreen(screen.id, e)}
                      className="text-red-500 hover:text-red-700 text-lg flex-shrink-0"
                      title="삭제"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {screen.hotspots.length}개 인터랙션
                  </p>
                  {screen.voiceGuide && (
                    <p className="text-xs text-indigo-600 mt-1 truncate">
                      🔊 음성 안내
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
