import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrate } from '../../utils/helpers';
import { Screen, Hotspot } from '../../types';
import { VirtualKeyboard } from './VirtualKeyboard';

export const ViewerMode = () => {
  const {
    projects,
    currentProjectId,
    viewerState,
    setMode,
    setCurrentScreen,
    completeScreen,
    resetViewer,
  } = useStore();

  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [showInput, setShowInput] = useState<string | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [inputConfig, setInputConfig] = useState<{
    mode: 'auto' | 'manual';
    placeholder?: string;
    expectedValue?: string;
  } | null>(null);
  const [userInput, setUserInput] = useState('');
  const [showHint, setShowHint] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchEffect, setTouchEffect] = useState<{ x: number; y: number } | null>(null);

  const currentProject = projects.find((p) => p.id === currentProjectId);
  const currentScreen = currentProject?.screens.find(
    (s) => s.id === viewerState.currentScreenId
  );

  useEffect(() => {
    // 첫 번째 화면으로 시작
    if (currentProject && currentProject.screens.length > 0 && !viewerState.currentScreenId) {
      setCurrentScreen(currentProject.screens[0].id);
    }
  }, [currentProject, viewerState.currentScreenId, setCurrentScreen]);

  useEffect(() => {
    // 음성 안내
    if (currentScreen?.voiceGuide && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentScreen.voiceGuide);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentScreen?.id]);

  const handleHotspotClick = async (hotspot: Hotspot, e: React.MouseEvent) => {
    if (isTransitioning) return;

    // 터치 효과
    const rect = e.currentTarget.getBoundingClientRect();
    setTouchEffect({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setTimeout(() => setTouchEffect(null), 600);

    const { action } = hotspot;

    // 딜레이가 있으면 대기
    if (action.delay) {
      await new Promise((resolve) => setTimeout(resolve, action.delay));
    }

    switch (action.type) {
      case 'navigate':
        if (action.target && currentScreen) {
          vibrate(50);
          setIsTransitioning(true);
          completeScreen(currentScreen.id);

          setTimeout(() => {
            setCurrentScreen(action.target!);
            setIsTransitioning(false);
          }, 300);
        }
        break;

      case 'message':
        if (action.message) {
          vibrate(50);
          setShowMessage(action.message);
          setTimeout(() => setShowMessage(null), 2000);
        }
        break;

      case 'input':
        vibrate(30);
        const mode = action.inputMode || 'auto';

        if (mode === 'auto') {
          // 자동 입력 모드 (기존 방식)
          if (action.inputValue) {
            setShowInput(action.inputValue);
            setTimeout(() => setShowInput(null), 1500);
          }
        } else {
          // 수동 입력 모드 (가상 키보드)
          setInputConfig({
            mode: 'manual',
            placeholder: action.inputPlaceholder || '입력하세요',
            expectedValue: action.inputValue,
          });
          setUserInput('');
          setShowKeyboard(true);
        }
        break;

      case 'vibrate':
        vibrate(200);
        break;
    }
  };

  const handleBack = () => {
    if (confirm('체험을 종료하시겠습니까?')) {
      resetViewer();
      setMode('home');
    }
  };

  const handleRestart = () => {
    if (confirm('처음부터 다시 시작하시겠습니까?')) {
      resetViewer();
      if (currentProject && currentProject.screens.length > 0) {
        setCurrentScreen(currentProject.screens[0].id);
      }
    }
  };

  const handleKeyboardComplete = () => {
    setShowKeyboard(false);

    // 입력값 체크 (expectedValue가 있으면)
    if (inputConfig?.expectedValue) {
      const isCorrect = userInput.trim() === inputConfig.expectedValue.trim();
      if (isCorrect) {
        vibrate(50);
        setShowMessage('정확합니다! 잘하셨어요!');
        setTimeout(() => setShowMessage(null), 2000);
      } else {
        setShowMessage(`입력하신 값: ${userInput}`);
        setTimeout(() => setShowMessage(null), 2000);
      }
    } else {
      setShowMessage(`입력하신 값: ${userInput}`);
      setTimeout(() => setShowMessage(null), 2000);
    }

    setInputConfig(null);
    setUserInput('');
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
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

  if (!currentScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">완료했습니다!</h2>
          <p className="text-gray-600 mb-6">모든 단계를 성공적으로 마쳤습니다</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold"
            >
              다시 하기
            </button>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
            >
              나가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = currentProject.screens.length > 0
    ? ((viewerState.completedScreens.length / currentProject.screens.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* 상단 바 */}
      <div className="bg-white shadow-sm z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-800 text-xl"
          >
            ← 나가기
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className={`text-sm px-3 py-1 rounded ${
                showHint ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {showHint ? '힌트 켜짐' : '힌트 꺼짐'}
            </button>
            <button
              onClick={handleRestart}
              className="text-gray-600 hover:text-gray-800"
            >
              🔄
            </button>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="h-1 bg-gray-200">
          <motion.div
            className="h-full bg-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* 화면 영역 */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{
              maxWidth: '400px',
              width: '100%',
              height: '100%',
              maxHeight: 'calc(100vh - 120px)',
              aspectRatio: '9/19',
            }}
          >
            {/* 배경 이미지 */}
            <img
              src={currentScreen.imageUrl}
              alt={currentScreen.name}
              className="w-full h-full object-contain select-none"
              draggable={false}
            />

            {/* 인터랙티브 핫스팟 */}
            {currentScreen.hotspots.map((hotspot) => (
              <motion.div
                key={hotspot.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={(e) => handleHotspotClick(hotspot, e)}
                className="absolute cursor-pointer group"
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                  width: `${hotspot.width}%`,
                  height: `${hotspot.height}%`,
                }}
              >
                {/* 터치 영역 (개발 중 표시, 실제로는 투명) */}
                <div className="w-full h-full bg-transparent group-hover:bg-indigo-500/10 transition-colors rounded-lg" />

                {/* 힌트 표시 */}
                {showHint && hotspot.hint && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                  >
                    <div className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {hotspot.hint}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-2xl"
                        >
                          👆
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 터치 효과 */}
                {touchEffect && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute w-8 h-8 bg-indigo-500 rounded-full pointer-events-none"
                    style={{
                      left: touchEffect.x - 16,
                      top: touchEffect.y - 16,
                    }}
                  />
                )}
              </motion.div>
            ))}

            {/* 자동 키보드 입력 효과 */}
            <AnimatePresence>
              {showInput && !showKeyboard && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  className="absolute bottom-0 left-0 right-0 bg-gray-100 border-t-2 border-gray-300 p-4"
                >
                  <div className="text-center text-lg font-semibold text-gray-800">
                    {showInput}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    >
                      |
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 가상 키보드 */}
            <AnimatePresence>
              {showKeyboard && inputConfig && (
                <VirtualKeyboard
                  onInput={setUserInput}
                  onComplete={handleKeyboardComplete}
                  placeholder={inputConfig.placeholder}
                  initialValue=""
                />
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 메시지 토스트 */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl text-xl font-bold flex items-center gap-3">
              <span className="text-3xl">✓</span>
              {showMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
