import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Rnd } from 'react-rnd';
import { generateId } from '../../utils/helpers';
import { Hotspot, HotspotAction } from '../../types';
import { HotspotConfig } from './HotspotConfig';

interface ScreenEditorProps {
  screenId: string | null;
}

export const ScreenEditor = ({ screenId }: ScreenEditorProps) => {
  const {
    projects,
    currentProjectId,
    updateScreen,
    addHotspot,
    updateHotspot,
    deleteHotspot,
  } = useStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDraw, setCurrentDraw] = useState<{ x: number; y: number } | null>(null);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [showConfigPopup, setShowConfigPopup] = useState(false);

  const imageRef = useRef<HTMLDivElement>(null);

  const currentProject = projects.find((p) => p.id === currentProjectId);
  const currentScreen = currentProject?.screens.find((s) => s.id === screenId);

  useEffect(() => {
    setSelectedHotspotId(null);
    setShowConfigPopup(false);
  }, [screenId]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || e.target !== e.currentTarget) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentDraw({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCurrentDraw({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !drawStart || !currentDraw || !screenId) {
      setIsDrawing(false);
      return;
    }

    const minX = Math.min(drawStart.x, currentDraw.x);
    const minY = Math.min(drawStart.y, currentDraw.y);
    const maxX = Math.max(drawStart.x, currentDraw.x);
    const maxY = Math.max(drawStart.y, currentDraw.y);
    const width = maxX - minX;
    const height = maxY - minY;

    // 너무 작은 영역은 무시
    if (width < 2 || height < 2) {
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentDraw(null);
      return;
    }

    const newHotspot: Hotspot = {
      id: generateId(),
      x: minX,
      y: minY,
      width,
      height,
      action: {
        type: 'navigate',
        target: '',
      },
      isCorrect: true,
    };

    addHotspot(screenId, newHotspot);
    setSelectedHotspotId(newHotspot.id);
    setShowConfigPopup(true);

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentDraw(null);
  };

  const handleUpdateHotspot = (hotspotId: string, updates: Partial<Hotspot>) => {
    if (!screenId) return;
    updateHotspot(screenId, hotspotId, updates);
  };

  const handleDeleteHotspot = (hotspotId: string) => {
    if (!screenId) return;
    if (confirm('이 인터랙션을 삭제하시겠습니까?')) {
      deleteHotspot(screenId, hotspotId);
      if (selectedHotspotId === hotspotId) {
        setSelectedHotspotId(null);
        setShowConfigPopup(false);
      }
    }
  };

  const handleSaveConfig = (action: HotspotAction, hint?: string) => {
    if (!screenId || !selectedHotspotId) return;
    handleUpdateHotspot(selectedHotspotId, { action, hint });
    setShowConfigPopup(false);
    setSelectedHotspotId(null);
  };

  const handleUpdateScreenName = () => {
    if (!screenId || !currentScreen) return;
    const newName = prompt('화면 이름을 입력하세요:', currentScreen.name);
    if (newName && newName.trim()) {
      updateScreen(screenId, { name: newName.trim() });
    }
  };

  const handleUpdateVoiceGuide = () => {
    if (!screenId || !currentScreen) return;
    const newGuide = prompt('음성 안내 텍스트를 입력하세요:', currentScreen.voiceGuide || '');
    updateScreen(screenId, { voiceGuide: newGuide || undefined });
  };

  if (!currentScreen) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-6xl mb-4">👈</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          화면을 선택하세요
        </h3>
        <p className="text-gray-500">왼쪽에서 화면을 선택하거나 새로 추가해주세요</p>
      </div>
    );
  }

  const selectedHotspot = currentScreen.hotspots.find((h) => h.id === selectedHotspotId);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* 헤더 */}
      <div className="border-b p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-800">{currentScreen.name}</h3>
            <button
              onClick={handleUpdateScreenName}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              ✏️
            </button>
          </div>
          <button
            onClick={handleUpdateVoiceGuide}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            🔊 음성 안내
          </button>
        </div>
        <p className="text-sm text-gray-600">
          인터랙티브 영역을 지정하려면 이미지 위에서 드래그하세요
        </p>
      </div>

      <div className="p-4 flex justify-center items-start">
        {/* 이미지 영역 - 체험 모드와 동일한 크기 */}
        <div className="relative">
          <div
            ref={imageRef}
            className="relative bg-gray-100 rounded-lg overflow-hidden shadow-xl"
            style={{
              width: '100%',
              maxWidth: '400px',
              aspectRatio: '9/19',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (isDrawing) {
                setIsDrawing(false);
                setDrawStart(null);
                setCurrentDraw(null);
              }
            }}
          >
            <img
              src={currentScreen.imageUrl}
              alt={currentScreen.name}
              className="w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />

            {/* 기존 핫스팟 */}
            {currentScreen.hotspots.map((hotspot) => {
              if (!imageRef.current) return null;
              const rect = imageRef.current.getBoundingClientRect();

              return (
                <Rnd
                  key={hotspot.id}
                  position={{
                    x: (hotspot.x / 100) * rect.width,
                    y: (hotspot.y / 100) * rect.height,
                  }}
                  size={{
                    width: (hotspot.width / 100) * rect.width,
                    height: (hotspot.height / 100) * rect.height,
                  }}
                  onDragStop={(_e, d) => {
                    if (!imageRef.current) return;
                    const rect = imageRef.current.getBoundingClientRect();
                    const newX = (d.x / rect.width) * 100;
                    const newY = (d.y / rect.height) * 100;
                    handleUpdateHotspot(hotspot.id, { x: newX, y: newY });
                  }}
                  onResizeStop={(_e, _direction, ref, _delta, position) => {
                    if (!imageRef.current) return;
                    const rect = imageRef.current.getBoundingClientRect();
                    const newWidth = (ref.offsetWidth / rect.width) * 100;
                    const newHeight = (ref.offsetHeight / rect.height) * 100;
                    const newX = (position.x / rect.width) * 100;
                    const newY = (position.y / rect.height) * 100;
                    handleUpdateHotspot(hotspot.id, {
                      x: newX,
                      y: newY,
                      width: newWidth,
                      height: newHeight,
                    });
                  }}
                  bounds="parent"
                  className={`
                    border-2 cursor-move
                    ${
                      selectedHotspotId === hotspot.id
                        ? 'border-indigo-500 bg-indigo-500/20'
                        : 'border-yellow-400 bg-yellow-400/20'
                    }
                  `}
                  onClick={() => {
                    setSelectedHotspotId(hotspot.id);
                    setShowConfigPopup(true);
                  }}
                >
                  <div className="absolute top-0 right-0 flex gap-1 p-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteHotspot(hotspot.id);
                      }}
                      className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                  {hotspot.hint && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                      {hotspot.hint}
                    </div>
                  )}
                </Rnd>
              );
            })}

            {/* 드래그 중인 영역 */}
            {isDrawing && drawStart && currentDraw && (
              <div
                className="absolute border-2 border-dashed border-indigo-500 bg-indigo-500/20 pointer-events-none"
                style={{
                  left: `${Math.min(drawStart.x, currentDraw.x)}%`,
                  top: `${Math.min(drawStart.y, currentDraw.y)}%`,
                  width: `${Math.abs(currentDraw.x - drawStart.x)}%`,
                  height: `${Math.abs(currentDraw.y - drawStart.y)}%`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* 핫스팟 설정 팝업 */}
      {showConfigPopup && selectedHotspot && screenId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">인터랙션 설정</h3>
              <button
                onClick={() => {
                  setShowConfigPopup(false);
                  setSelectedHotspotId(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <HotspotConfig
                hotspot={selectedHotspot}
                availableScreens={currentProject?.screens || []}
                onSave={handleSaveConfig}
                onCancel={() => {
                  setShowConfigPopup(false);
                  setSelectedHotspotId(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
