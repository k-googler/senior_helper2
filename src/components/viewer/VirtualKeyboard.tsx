import { useState } from 'react';
import { motion } from 'framer-motion';

interface VirtualKeyboardProps {
  onInput: (text: string) => void;
  onComplete: () => void;
  placeholder?: string;
  initialValue?: string;
}

export const VirtualKeyboard = ({
  onInput,
  onComplete,
  placeholder = '입력하세요',
  initialValue = '',
}: VirtualKeyboardProps) => {
  const [text, setText] = useState(initialValue);
  const [isKorean, setIsKorean] = useState(true);

  const koreanKeys = [
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
    ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'],
  ];

  const englishKeys = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  const keys = isKorean ? koreanKeys : englishKeys;

  const handleKeyPress = (key: string) => {
    const newText = text + key;
    setText(newText);
    onInput(newText);
  };

  const handleBackspace = () => {
    const newText = text.slice(0, -1);
    setText(newText);
    onInput(newText);
  };

  const handleSpace = () => {
    const newText = text + ' ';
    setText(newText);
    onInput(newText);
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute bottom-0 left-0 right-0 bg-gray-200 border-t-2 border-gray-300"
    >
      {/* 입력 영역 */}
      <div className="bg-white px-4 py-3 border-b border-gray-300">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            readOnly
            placeholder={placeholder}
            className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleComplete}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 whitespace-nowrap"
          >
            완료
          </button>
        </div>
      </div>

      {/* 키보드 */}
      <div className="p-2">
        {/* 숫자 행 */}
        <div className="flex gap-1 mb-1">
          {numberKeys.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="flex-1 py-2 bg-white rounded shadow hover:bg-gray-100 active:bg-gray-200 text-sm font-semibold"
            >
              {key}
            </button>
          ))}
        </div>

        {/* 문자 키 */}
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 mb-1 justify-center">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="flex-1 py-3 bg-white rounded shadow hover:bg-gray-100 active:bg-gray-200 font-semibold"
                style={{ maxWidth: '50px' }}
              >
                {key}
              </button>
            ))}
          </div>
        ))}

        {/* 하단 행 */}
        <div className="flex gap-1">
          <button
            onClick={() => setIsKorean(!isKorean)}
            className="px-4 py-3 bg-gray-400 text-white rounded shadow hover:bg-gray-500 active:bg-gray-600 font-semibold text-sm"
          >
            {isKorean ? '영문' : '한글'}
          </button>
          <button
            onClick={handleSpace}
            className="flex-1 py-3 bg-white rounded shadow hover:bg-gray-100 active:bg-gray-200 font-semibold"
          >
            스페이스
          </button>
          <button
            onClick={handleBackspace}
            className="px-6 py-3 bg-gray-400 text-white rounded shadow hover:bg-gray-500 active:bg-gray-600 font-semibold"
          >
            ←
          </button>
        </div>
      </div>
    </motion.div>
  );
};
