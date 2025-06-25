import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import styled from '@emotion/styled';
import type { GPXFile } from '../types/gpx';

interface MapViewProps {
  activeFile: GPXFile | null;
  isSidebarCollapsed: boolean;
  onZoomChange?: (zoomLevel: number) => void;
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

const MapView = forwardRef<MapViewRef, MapViewProps>(({ activeFile, isSidebarCollapsed, onZoomChange }, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);
  const polylines = useRef<kakao.maps.Polyline[]>([]);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  // 부모 컴포넌트에서 호출할 수 있는 메서드 노출
  useImperativeHandle(ref, () => ({
    moveToCurrentLocation,
    moveToFileRoute
  }));

  // 현재 위치로 이동하는 함수
  const moveToCurrentLocation = () => {
    if (!mapInstance.current) {
      console.error('지도가 초기화되지 않았습니다.');
      return;
    }

    if (!navigator.geolocation) {
      console.error('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    console.log('현재 위치를 가져오는 중...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`현재 위치: ${latitude}, ${longitude}`);
        
        if (mapInstance.current && window.kakao) {
          const currentPosition = new window.kakao.maps.LatLng(latitude, longitude);
          mapInstance.current.setCenter(currentPosition);
          mapInstance.current.setLevel(3); // 현재 위치 확대
        }
      },
      (error) => {
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
        
        console.error('현재 위치 오류:', errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5분
      }
    );
  };

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

  const moveToFileRoute = (file: GPXFile) => {
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
  };

  return <MapContainer ref={mapContainer} />;
});

MapView.displayName = 'MapView';

export default MapView; 