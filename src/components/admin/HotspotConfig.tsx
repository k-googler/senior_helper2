import { useState } from 'react';
import { Hotspot, HotspotAction, Screen, ActionType } from '../../types';

interface HotspotConfigProps {
  hotspot: Hotspot;
  availableScreens: Screen[];
  onSave: (action: HotspotAction, hint?: string) => void;
  onCancel: () => void;
}

export const HotspotConfig = ({
  hotspot,
  availableScreens,
  onSave,
  onCancel,
}: HotspotConfigProps) => {
  const [actionType, setActionType] = useState<ActionType>(hotspot.action.type);
  const [targetScreen, setTargetScreen] = useState(hotspot.action.target || '');
  const [message, setMessage] = useState(hotspot.action.message || '');
  const [inputValue, setInputValue] = useState(hotspot.action.inputValue || '');
  const [inputMode, setInputMode] = useState<'auto' | 'manual'>(
    hotspot.action.inputMode || 'auto'
  );
  const [inputPlaceholder, setInputPlaceholder] = useState(
    hotspot.action.inputPlaceholder || '입력하세요'
  );
  const [delay, setDelay] = useState(hotspot.action.delay || 0);
  const [hint, setHint] = useState(hotspot.hint || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const action: HotspotAction = {
      type: actionType,
      ...(actionType === 'navigate' && targetScreen && { target: targetScreen }),
      ...(actionType === 'message' && message && { message }),
      ...(actionType === 'input' && {
        inputValue,
        inputMode,
        inputPlaceholder,
      }),
      ...(delay > 0 && { delay }),
    };

    onSave(action, hint || undefined);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 액션 타입 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            액션 종류
          </label>
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value as ActionType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="navigate">다음 화면으로 이동</option>
            <option value="message">메시지 표시</option>
            <option value="input">키보드 입력</option>
            <option value="vibrate">진동 효과</option>
            <option value="none">액션 없음</option>
          </select>
        </div>

        {/* 화면 전환 */}
        {actionType === 'navigate' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이동할 화면
            </label>
            <select
              value={targetScreen}
              onChange={(e) => setTargetScreen(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">화면을 선택하세요</option>
              {availableScreens.map((screen) => (
                <option key={screen.id} value={screen.id}>
                  {screen.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 메시지 */}
        {actionType === 'message' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              표시할 메시지
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="예: 잘하셨습니다!"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
              required
            />
          </div>
        )}

        {/* 키보드 입력 */}
        {actionType === 'input' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                입력 모드
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="auto"
                    checked={inputMode === 'auto'}
                    onChange={(e) => setInputMode(e.target.value as 'auto' | 'manual')}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm">자동 입력 (미리 정한 텍스트 표시)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="manual"
                    checked={inputMode === 'manual'}
                    onChange={(e) => setInputMode(e.target.value as 'auto' | 'manual')}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm">수동 입력 (가상 키보드)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {inputMode === 'auto' ? '입력될 텍스트' : '예상 입력값 (정답)'}
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="예: 서울역"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {inputMode === 'manual' && (
                <p className="text-xs text-gray-500 mt-1">
                  사용자 입력과 비교할 정답 (선택사항)
                </p>
              )}
            </div>

            {inputMode === 'manual' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  플레이스홀더
                </label>
                <input
                  type="text"
                  value={inputPlaceholder}
                  onChange={(e) => setInputPlaceholder(e.target.value)}
                  placeholder="예: 목적지를 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
        )}

        {/* 힌트 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            힌트 텍스트 (선택)
          </label>
          <input
            type="text"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="예: 여기를 눌러주세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 딜레이 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            딜레이 (밀리초)
          </label>
          <input
            type="number"
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            min="0"
            step="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            액션 실행 전 대기 시간 (0 = 즉시 실행)
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
};
