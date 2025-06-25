import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import styled from '@emotion/styled';
import type { GPXFile } from '../types/gpx';

interface MapViewProps {
  activeFile: GPXFile | null;
  isSidebarCollapsed: boolean;
  onZoomChange?: (zoomLevel: number) => void;
  onLocationError?: (errorMessage: string) => void;
}

export interface MapViewRef {
  moveToCurrentLocation: () => void;
  moveToFileRoute: (file: GPXFile) => void;
}

const MapContainer = styled.div`
  flex: 1;
  background: #f5f5f5;
  position: relative;
`;

const MapView = forwardRef<MapViewRef, MapViewProps>(({ activeFile, isSidebarCollapsed, onZoomChange, onLocationError }, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);
  const polylines = useRef<kakao.maps.Polyline[]>([]);
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const locationRequestRef = useRef<{
    isRequesting: boolean;
    hasSucceeded: boolean;
    errorTimeout: NodeJS.Timeout | null;
  }>({
    isRequesting: false,
    hasSucceeded: false,
    errorTimeout: null
  });

  const moveToCurrentLocation = useCallback(() => {
    if (locationRequestRef.current.isRequesting) {
      console.log('위치 요청이 이미 진행 중입니다.');
      return;
    }

    if (!mapInstance.current) {
      const errorMessage = '지도가 초기화되지 않았습니다.';
      console.error(errorMessage);
      if (onLocationError) {
        onLocationError(errorMessage);
      }
      return;
    }

    if (!navigator.geolocation) {
      const errorMessage = '이 브라우저는 위치 서비스를 지원하지 않습니다.';
      console.error(errorMessage);
      if (onLocationError) {
        onLocationError(errorMessage);
      }
      return;
    }

    // 위치 요청 시작
    locationRequestRef.current.isRequesting = true;
    locationRequestRef.current.hasSucceeded = false;
    
    // 기존 에러 타이머 클리어
    if (locationRequestRef.current.errorTimeout) {
      clearTimeout(locationRequestRef.current.errorTimeout);
    }

    console.log('현재 위치를 가져오는 중...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`현재 위치: ${latitude}, ${longitude}`);
        
        // 성공 플래그 설정
        locationRequestRef.current.hasSucceeded = true;
        
        if (mapInstance.current && window.kakao) {
          const currentPosition = new window.kakao.maps.LatLng(latitude, longitude);
          mapInstance.current.setCenter(currentPosition);
          mapInstance.current.setLevel(3); // 현재 위치 확대
        }
        
        // 요청 완료
        locationRequestRef.current.isRequesting = false;
        
        // error 타이머 클리어
        if (locationRequestRef.current.errorTimeout) {
          clearTimeout(locationRequestRef.current.errorTimeout);
          locationRequestRef.current.errorTimeout = null;
        }
      },
      (error) => {
        console.log('위치 에러 발생:', error.code, error.message);
        
        // 에러 발생 후 잠시 기다렸다가 성공했는지 확인
        locationRequestRef.current.errorTimeout = setTimeout(() => {
          // 1초 후에도 성공하지 않았다면 진짜 에러로 처리
          if (!locationRequestRef.current.hasSucceeded) {
            let errorMessage = '위치를 가져올 수 없습니다.';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = '위치 접근 권한이 거부되었습니다.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = '위치 정보를 사용할 수 없습니다.';
                break;
              case error.TIMEOUT:
                errorMessage = '위치 요청 시간이 초과되었습니다.';
                break;
            }
            
            console.error('진짜 위치 오류:', errorMessage);
            if (onLocationError) {
              onLocationError(errorMessage);
            }
          } else {
            console.log('에러가 발생했지만 위치 조회는 성공했습니다.');
          }
          
          // 요청 완료
          locationRequestRef.current.isRequesting = false;
          locationRequestRef.current.errorTimeout = null;
        }, 1000); 
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, 
        maximumAge: 300000 
      }
    );
  }, [onLocationError]);

  // 파일 경로로 이동하는 함수
  const moveToFileRoute = useCallback((file: GPXFile) => {
    if (!mapInstance.current || !window.kakao || !file.data.points.length) return;

    clearRoutes();

    const path = file.data.points.map(
      point => new window.kakao.maps.LatLng(point.lat, point.lng)
    );

    const polyline = new window.kakao.maps.Polyline({
      path: path,
      strokeWeight: 4,
      strokeColor: file.color,
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
    });

    polyline.setMap(mapInstance.current);
    polylines.current.push(polyline);

    const bounds = new window.kakao.maps.LatLngBounds();
    path.forEach(point => bounds.extend(point));
    mapInstance.current.setBounds(bounds);
  }, []);

  // 부모 컴포넌트에서 호출할 수 있는 메서드 노출
  useImperativeHandle(ref, () => ({
    moveToCurrentLocation,
    moveToFileRoute
  }), [moveToCurrentLocation, moveToFileRoute]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (locationRequestRef.current.errorTimeout) {
        clearTimeout(locationRequestRef.current.errorTimeout);
      }
    };
  }, []);

  // 카카오 맵 초기화
  useEffect(() => {
    if (!mapContainer.current) return;

    const mapScript = document.createElement('script');
    mapScript.async = true;
    mapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_KAKAO_MAP_API_KEY
    }&autoload=false`;

    const onLoadKakaoMap = () => {
      console.log('카카오 맵 스크립트 로드 완료');
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          const container = mapContainer.current;
          if (!container) return;

          const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청 좌표
            level: 8,
            draggable: true, 
            scrollwheel: true,
          };

          const map = new window.kakao.maps.Map(container, options);
          mapInstance.current = map;
          console.log('지도 초기화 완료');

          // 초기 줌 레벨 콜백 호출
          if (onZoomChange) {
            onZoomChange(map.getLevel());
          }

          // 줌 레벨 변경 이벤트 리스너 추가
          window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
            const currentLevel = map.getLevel();
            console.log('줌 레벨 변경:', currentLevel);
            if (onZoomChange) {
              onZoomChange(currentLevel);
            }
          });

          // ResizeObserver 설정
          setupResizeObserver();
        });
      } else {
        console.error('카카오 맵을 로드할 수 없습니다.');
      }
    };

    const onErrorKakaoMap = () => {
      console.error('카카오 맵 스크립트 로드에 실패했습니다. API 키를 확인해주세요.');
    };

    mapScript.addEventListener('load', onLoadKakaoMap);
    mapScript.addEventListener('error', onErrorKakaoMap);

    document.head.appendChild(mapScript);

    return () => {
      mapScript.removeEventListener('load', onLoadKakaoMap);
      mapScript.removeEventListener('error', onErrorKakaoMap);
      if (document.head.contains(mapScript)) {
        document.head.removeChild(mapScript);
      }
      // ResizeObserver 정리
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  }, []);

  // ResizeObserver 설정
  const setupResizeObserver = () => {
    if (!mapContainer.current || !mapInstance.current) return;

    resizeObserver.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === mapContainer.current && mapInstance.current) {
          // 컨테이너 크기가 변경되면 즉시 지도 리사이즈
          mapInstance.current.relayout();
          console.log('지도 리사이즈 완료');
        }
      }
    });

    resizeObserver.current.observe(mapContainer.current);
  };

  // 활성 파일이 변경될 때 경로 그리기
  useEffect(() => {
    if (activeFile && mapInstance.current) {
      drawRoute(activeFile);
    } else {
      // 활성 파일이 없으면 경로 제거
      clearRoutes();
    }
  }, [activeFile]);

  // GPX 경로를 지도에 그리기
  const drawRoute = (file: GPXFile) => {
    if (!mapInstance.current || !window.kakao) return;

    // 기존 폴리라인 제거
    clearRoutes();

    // 경로 포인트를 카카오맵 좌표로 변환
    const path = file.data.points.map(
      point => new window.kakao.maps.LatLng(point.lat, point.lng)
    );

    // 폴리라인 생성
    const polyline = new window.kakao.maps.Polyline({
      path: path,
      strokeWeight: 4,
      strokeColor: file.color,
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
    });

    // 지도에 폴리라인 표시
    polyline.setMap(mapInstance.current);
    polylines.current.push(polyline);

    // 파일 선택시 항상 해당 경로가 보이도록 지도 범위 조정
    const bounds = new window.kakao.maps.LatLngBounds();
    path.forEach(point => bounds.extend(point));
    mapInstance.current.setBounds(bounds);
    console.log(`경로 표시 및 이동 완료: ${file.data.name}`);
  };

  // 지도에서 모든 경로 제거
  const clearRoutes = () => {
    polylines.current.forEach(polyline => polyline.setMap(null));
    polylines.current = [];
  };

  return <MapContainer ref={mapContainer} />;
});

MapView.displayName = 'MapView';

export default MapView; 