// 이미지 압축 옵션
export interface ImageCompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

// 이미지 압축 함수
export const compressImage = (
  file: File,
  options: ImageCompressOptions = {}
): Promise<string> => {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // 원본 비율 유지하면서 크기 조정
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Canvas에 이미지 그리기
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 압축된 이미지를 base64로 변환
        // PNG는 압축 효과가 적으므로 JPEG로 변환
        const mimeType = file.type === 'image/png' ? 'image/jpeg' : file.type;
        const compressedBase64 = canvas.toDataURL(mimeType, quality);

        resolve(compressedBase64);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// 이미지를 base64로 변환 (압축 포함)
export const fileToBase64 = (
  file: File,
  compress: boolean = true,
  options?: ImageCompressOptions
): Promise<string> => {
  if (compress && file.type.startsWith('image/')) {
    return compressImage(file, options);
  }

  // 압축하지 않거나 이미지가 아닌 경우
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// UUID 생성
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 진동 효과
export const vibrate = (duration: number = 100) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
};

// 날짜 포맷팅
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
