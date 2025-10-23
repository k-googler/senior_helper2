import { useEffect, useState } from 'react';
import { Map, MapMarker, Polyline } from 'react-kakao-maps-sdk';

interface KakaoMapViewerProps {
  startAddress?: string;
  endAddress?: string;
  width?: string;
  height?: string;
}

interface Location {
  lat: number;
  lng: number;
}

export const KakaoMapViewer = ({
  startAddress,
  endAddress,
  width = '100%',
  height = '100%',
}: KakaoMapViewerProps) => {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [mapCenter, setMapCenter] = useState<Location>({ lat: 37.5665, lng: 126.9780 }); // 서울 시청 기본값
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const geocodeAddress = async () => {
      setIsLoading(true);

      try {
        // Kakao Maps API가 로드되었는지 확인
        if (!window.kakao || !window.kakao.maps) {
          console.error('Kakao Maps API가 로드되지 않았습니다.');
          setIsLoading(false);
          return;
        }

        const geocoder = new window.kakao.maps.services.Geocoder();

        // 출발지 주소 변환
        if (startAddress) {
          geocoder.addressSearch(startAddress, (result: any[], status: any) => {
            if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
              const location = {
                lat: parseFloat(result[0].y),
                lng: parseFloat(result[0].x),
              };
              setStartLocation(location);
              setMapCenter(location); // 출발지를 중심으로 설정
            } else {
              console.error('출발지 주소를 찾을 수 없습니다:', startAddress);
            }
          });
        }

        // 목적지 주소 변환
        if (endAddress) {
          geocoder.addressSearch(endAddress, (result: any[], status: any) => {
            if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
              setEndLocation({
                lat: parseFloat(result[0].y),
                lng: parseFloat(result[0].x),
              });
            } else {
              console.error('목적지 주소를 찾을 수 없습니다:', endAddress);
            }
            setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('주소 검색 중 오류 발생:', error);
        setIsLoading(false);
      }
    };

    geocodeAddress();
  }, [startAddress, endAddress]);

  // 출발지와 목적지 중간 지점 계산
  useEffect(() => {
    if (startLocation && endLocation) {
      const centerLat = (startLocation.lat + endLocation.lat) / 2;
      const centerLng = (startLocation.lng + endLocation.lng) / 2;
      setMapCenter({ lat: centerLat, lng: centerLng });
    }
  }, [startLocation, endLocation]);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100"
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-3xl mb-2">🗺️</div>
          <p className="text-sm text-gray-600">지도 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Map
      center={mapCenter}
      style={{ width, height }}
      level={7}
    >
      {/* 출발지 마커 */}
      {startLocation && (
        <MapMarker
          position={startLocation}
          image={{
            src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
            size: { width: 24, height: 35 },
          }}
        >
          <div style={{ padding: '5px', color: '#000', fontSize: '12px' }}>
            출발지: {startAddress}
          </div>
        </MapMarker>
      )}

      {/* 목적지 마커 */}
      {endLocation && (
        <MapMarker
          position={endLocation}
          image={{
            src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
            size: { width: 24, height: 35 },
          }}
        >
          <div style={{ padding: '5px', color: '#000', fontSize: '12px' }}>
            목적지: {endAddress}
          </div>
        </MapMarker>
      )}

      {/* 경로 선 */}
      {startLocation && endLocation && (
        <Polyline
          path={[
            startLocation,
            endLocation,
          ]}
          strokeWeight={5}
          strokeColor="#4F46E5"
          strokeOpacity={0.7}
          strokeStyle="solid"
        />
      )}
    </Map>
  );
};

// Kakao Maps API 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}
