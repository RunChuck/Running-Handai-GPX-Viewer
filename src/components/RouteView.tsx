import { useState } from "react";
import { HiPlus, HiTrash, HiMapPin, HiArrowDownTray } from "react-icons/hi2";
import { convertToGPX, downloadGPX } from "../utils/openRouteService";
import type { GPXFile } from "../types/gpx";
import type { MapViewRef } from "./MapView";
import * as S from "../styles/RouteView.styled";

interface RoutePoint {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
  isPinned?: boolean;
}

interface RouteViewProps {
  onRouteGenerated: (route: GPXFile) => void;
  onLocationError: (error: string) => void;
  onRouteSelect?: (route: GPXFile) => void;
  mapViewRef: React.RefObject<MapViewRef>;
}

const RouteView = ({
  onRouteGenerated,
  onLocationError,
  onRouteSelect,
  mapViewRef,
}: RouteViewProps) => {
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([
    { id: "1", address: "" },
    { id: "2", address: "" },
  ]);
  const [routeProfile, setRouteProfile] = useState<string>("foot-walking");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPinMode, setIsPinMode] = useState(false);
  const [pinCoordinates, setPinCoordinates] = useState<{ lat: number; lng: number }[]>([]);
  const [hasGeneratedRoute, setHasGeneratedRoute] = useState(false);
  const [lastGeneratedRoute, setLastGeneratedRoute] = useState<{
    route: GPXFile;
    distance: number;
    duration: number;
    gpxContent: string;
  } | null>(null);

  const addWaypoint = () => {
    const newWaypoint: RoutePoint = {
      id: Date.now().toString(),
      address: "",
    };
    setRoutePoints((prev) => [...prev.slice(0, -1), newWaypoint, prev[prev.length - 1]]);
  };

  const removeWaypoint = (id: string) => {
    if (routePoints.length <= 2) return;
    setRoutePoints((prev) => prev.filter((point) => point.id !== id));
  };

  const updateRoutePoint = (id: string, address: string) => {
    setRoutePoints((prev) =>
      prev.map((point) => (point.id === id ? { ...point, address } : point))
    );
  };

  // 핀 추가 핸들러
  const handlePinAdded = async (lat: number, lng: number) => {
    // state 업데이트
    setPinCoordinates((prevCoordinates) => {
      const newCoordinates = [...prevCoordinates, { lat, lng }];

      // 2개 이상의 핀이 있고 아직 경로를 생성하지 않았으면 자동으로 경로 생성
      if (newCoordinates.length >= 2 && !hasGeneratedRoute) {
        setHasGeneratedRoute(true);
        generateRouteWithCoordinates(newCoordinates);
      }

      return newCoordinates;
    });
  };

  // 좌표로 경로 생성하는 함수
  const generateRouteWithCoordinates = async (coordinates: { lat: number; lng: number }[]) => {
    try {
      const { planRouteWithCoordinates, convertToGPX } = await import("../utils/openRouteService");

      const coordinateArray = coordinates.map((coord) => [coord.lng, coord.lat]);
      const routeResult: {
        coordinates: { lat: number; lng: number; elevation?: number }[];
        geocodedAddresses: { lat: number; lng: number; displayName: string }[];
        distance: number;
        duration: number;
      } = await planRouteWithCoordinates(coordinateArray, routeProfile);

      const routeName = `핀_경로_${new Date().getTime()}`;
      const gpxContent = convertToGPX(
        routeResult.coordinates,
        routeName,
        routeResult.geocodedAddresses
      );

      const newRoute: GPXFile = {
        id: Date.now().toString(),
        name: routeName,
        uploadTime: new Date(),
        color: "#4561FF",
        data: {
          name: routeName,
          points: routeResult.coordinates,
        },
        downloadContent: gpxContent,
        isFromPinMode: true, // 핀 모드로 생성된 경로 표시
        routeInfo: {
          distance: routeResult.distance,
          duration: routeResult.duration,
          waypoints: routeResult.geocodedAddresses.map((addr, index) => ({
            lat: addr.lat,
            lng: addr.lng,
            address: addr.displayName,
            type:
              index === 0
                ? ("start" as const)
                : index === routeResult.geocodedAddresses.length - 1
                ? ("end" as const)
                : ("waypoint" as const),
          })),
        },
      };

      onRouteGenerated(newRoute);
      onLocationError(`핀 ${coordinates.length}개로 경로가 생성되었습니다!`);
    } catch (error) {
      console.error("경로 생성 오류:", error);
      if (error instanceof Error) {
        onLocationError(`경로 생성 오류: ${error.message}`);
      } else {
        onLocationError("경로 생성 중 오류가 발생했습니다.");
      }
    }
  };

  // 핀 모드 토글
  const togglePinMode = () => {
    const newPinMode = !isPinMode;
    setIsPinMode(newPinMode);

    if (newPinMode) {
      // 핀 모드 활성화 시 MapView에 핀 모드 설정
      if (mapViewRef.current) {
        mapViewRef.current.setPinMode(true, handlePinAdded);
      }
    } else {
      // 핀 모드 해제 시 핀들과 좌표 초기화
      setPinCoordinates([]);
      setHasGeneratedRoute(false);
      if (mapViewRef.current) {
        mapViewRef.current.clearPins();
        mapViewRef.current.setPinMode(false);
      }
    }
  };

  // 핀으로 설정된 포인트들 초기화
  const clearPinnedPoints = () => {
    setPinCoordinates([]);
    setHasGeneratedRoute(false);
    if (mapViewRef.current) {
      mapViewRef.current.clearPins();
    }
  };

  const getPointType = (index: number): "start" | "waypoint" | "end" => {
    if (index === 0) return "start";
    if (index === routePoints.length - 1) return "end";
    return "waypoint";
  };

  const getPointLabel = (index: number): string => {
    if (index === 0) return "S";
    if (index === routePoints.length - 1) return "E";
    return index.toString();
  };

  const generateRoute = async () => {
    // 핀 모드일 때는 자동으로 경로가 생성되므로 별도 처리 불필요
    if (isPinMode) {
      onLocationError("핀 모드에서는 핀을 2개 이상 찍으면 자동으로 경로가 생성됩니다.");
      return;
    }

    // 일반 모드일 때는 주소로 경로 생성
    const filledPoints = routePoints.filter((point) => point.address.trim());
    if (filledPoints.length < 2) {
      onLocationError("최소 출발지와 도착지를 입력해주세요.");
      return;
    }

    setIsGenerating(true);

    try {
      // 핀으로 설정된 포인트가 있으면 좌표를 직접 사용, 아니면 주소로 geocoding
      const coordinates = [];
      for (const point of filledPoints) {
        if (point.lat && point.lng) {
          coordinates.push([point.lng, point.lat]);
        }
      }

      // 이동 수단 한국어 변환
      const getProfileName = (profile: string): string => {
        switch (profile) {
          case "foot-walking":
            return "도보";
          case "foot-hiking":
            return "러닝";
          case "cycling-regular":
            return "자전거";
          case "driving-car":
            return "자동차";
          default:
            return "도보";
        }
      };

      // 파일명에 사용할 수 없는 문자 제거 및 정리
      const sanitizeFileName = (name: string): string => {
        return name
          .replace(/[<>:"/\\|?*]/g, "")
          .replace(/\s+/g, "_")
          .replace(/_{2,}/g, "_")
          .trim();
      };

      let routeResult: {
        coordinates: { lat: number; lng: number; elevation?: number }[];
        geocodedAddresses: { lat: number; lng: number; displayName: string }[];
        distance: number;
        duration: number;
      };
      let routeName: string;
      let waypoints: Array<{
        lat: number;
        lng: number;
        address: string;
        type: "start" | "waypoint" | "end";
      }>;

      if (coordinates.length === filledPoints.length) {
        // 모든 포인트가 좌표로 설정된 경우
        const { planRouteWithCoordinates } = await import("../utils/openRouteService");
        routeResult = await planRouteWithCoordinates(coordinates, routeProfile);

        // 좌표 기반 경로명
        const transportMode = getProfileName(routeProfile);
        routeName = `좌표_경로_${transportMode}_${Date.now()}`;

        // 좌표 기반 waypoints
        waypoints = routeResult.geocodedAddresses.map((addr, index) => ({
          lat: addr.lat,
          lng: addr.lng,
          address: addr.displayName,
          type:
            index === 0
              ? ("start" as const)
              : index === routeResult.geocodedAddresses.length - 1
              ? ("end" as const)
              : ("waypoint" as const),
        }));
      } else {
        // 기존 주소 기반 라우팅
        const addresses = filledPoints.map((point) => point.address.trim());
        const { planRoute } = await import("../utils/openRouteService");
        routeResult = await planRoute(addresses, routeProfile);

        // 주소 기반 경로명
        const startLocation = sanitizeFileName(addresses[0]);
        const endLocation = sanitizeFileName(addresses[addresses.length - 1]);
        const transportMode = getProfileName(routeProfile);
        routeName = `${startLocation}_${endLocation}_${transportMode}`;

        // 주소 기반 waypoints
        waypoints = routeResult.geocodedAddresses.map((addr, index) => ({
          lat: addr.lat,
          lng: addr.lng,
          address: addresses[index], // 사용자가 입력한 원래 주소
          type:
            index === 0
              ? ("start" as const)
              : index === routeResult.geocodedAddresses.length - 1
              ? ("end" as const)
              : ("waypoint" as const),
        }));
      }

      // GPX 문자열 생성
      const gpxContent = convertToGPX(
        routeResult.coordinates,
        routeName,
        routeResult.geocodedAddresses
      );

      // GPX 파일 생성
      const newRoute: GPXFile = {
        id: Date.now().toString(),
        name: routeName,
        uploadTime: new Date(),
        color: "#4561FF",
        data: {
          name: routeName,
          points: routeResult.coordinates,
        },
        downloadContent: gpxContent, // 다운로드용 GPX 콘텐츠 추가
        routeInfo: {
          distance: routeResult.distance,
          duration: routeResult.duration,
          waypoints: waypoints,
        },
      };

      setLastGeneratedRoute({
        route: newRoute,
        distance: routeResult.distance,
        duration: routeResult.duration,
        gpxContent,
      });

      onRouteGenerated(newRoute);

      // 생성된 경로로 지도 이동
      if (onRouteSelect) {
        onRouteSelect(newRoute);
      }
    } catch (error) {
      console.error("Route generation error:", error);
      if (error instanceof Error) {
        onLocationError(error.message);
      } else {
        onLocationError("경로 생성 중 오류가 발생했습니다.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!lastGeneratedRoute) return;

    const filename = `${lastGeneratedRoute.route.name.replace(/[^a-zA-Z0-9가-힣\s]/g, "_")}.gpx`;
    downloadGPX(lastGeneratedRoute.gpxContent, filename);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  return (
    <S.Container>
      <S.Title>경로 생성</S.Title>

      <S.Section>
        <S.SectionTitle>지점 설정</S.SectionTitle>
        <S.ButtonGroup>
          <S.PinModeButton onClick={togglePinMode} active={isPinMode}>
            <HiMapPin />
            {isPinMode ? "핀 모드 해제" : "지도에서 핀 찍기"}
          </S.PinModeButton>
          {isPinMode && (
            <S.PinInfo>
              핀 {pinCoordinates.length}개 찍음
              {pinCoordinates.length >= 2 && " (자동 경로 생성됨)"}
              {pinCoordinates.length > 0 && (
                <S.ClearPinsButton onClick={clearPinnedPoints}>핀 초기화</S.ClearPinsButton>
              )}
            </S.PinInfo>
          )}
        </S.ButtonGroup>
        <S.RoutePointContainer>
          {routePoints.map((point, index) => (
            <S.RoutePointItem key={point.id}>
              <S.PointTypeIcon type={getPointType(index)}>{getPointLabel(index)}</S.PointTypeIcon>
              <S.RoutePointInput
                type="text"
                placeholder={
                  index === 0
                    ? "출발지를 입력하세요"
                    : index === routePoints.length - 1
                    ? "도착지를 입력하세요"
                    : "경유지를 입력하세요"
                }
                value={point.address}
                onChange={(e) => updateRoutePoint(point.id, e.target.value)}
                disabled={isPinMode}
                style={{ backgroundColor: isPinMode ? "#f5f5f5" : "white" }}
              />
              {routePoints.length > 2 && getPointType(index) === "waypoint" && (
                <S.DeleteButton onClick={() => removeWaypoint(point.id)}>
                  <HiTrash />
                </S.DeleteButton>
              )}
            </S.RoutePointItem>
          ))}
        </S.RoutePointContainer>

        {!isPinMode && (
          <S.AddWaypointButton onClick={addWaypoint}>
            <HiPlus />
            경유지 추가
          </S.AddWaypointButton>
        )}
      </S.Section>

      <S.Section>
        <S.SectionTitle>경로 옵션</S.SectionTitle>
        <S.OptionSection>
          <S.OptionLabel>이동 방식</S.OptionLabel>
          <S.Select value={routeProfile} onChange={(e) => setRouteProfile(e.target.value)}>
            <option value="foot-walking">도보</option>
            <option value="foot-hiking">러닝</option>
            <option value="cycling-regular">자전거</option>
            <option value="driving-car">자동차</option>
          </S.Select>
        </S.OptionSection>
      </S.Section>

      {lastGeneratedRoute && (
        <S.Section>
          <S.SectionTitle>경로 정보</S.SectionTitle>
          <S.RouteInfo>
            <S.RouteInfoTitle>생성된 경로</S.RouteInfoTitle>
            <S.RouteInfoItem>
              <span>총 거리:</span>
              <S.RouteInfoValue>{lastGeneratedRoute.distance.toFixed(2)} km</S.RouteInfoValue>
            </S.RouteInfoItem>
            <S.RouteInfoItem>
              <span>예상 시간:</span>
              <S.RouteInfoValue>{formatDuration(lastGeneratedRoute.duration)}</S.RouteInfoValue>
            </S.RouteInfoItem>
            <S.RouteInfoItem>
              <span>포인트 수:</span>
              <S.RouteInfoValue>{lastGeneratedRoute.route.data.points.length}개</S.RouteInfoValue>
            </S.RouteInfoItem>
          </S.RouteInfo>
        </S.Section>
      )}

      <S.ButtonGroup>
        {!isPinMode && (
          <S.GenerateButton onClick={generateRoute} disabled={isGenerating}>
            <HiMapPin />
            {isGenerating ? "경로 생성 중..." : "경로 생성"}
          </S.GenerateButton>
        )}

        {lastGeneratedRoute && (
          <S.DownloadButton onClick={handleDownload}>
            <HiArrowDownTray />
            GPX 파일 다운로드
          </S.DownloadButton>
        )}
      </S.ButtonGroup>
    </S.Container>
  );
};

export default RouteView;
