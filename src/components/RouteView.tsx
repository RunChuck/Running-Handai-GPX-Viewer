import { useState } from "react";
import {
  HiPlus,
  HiTrash,
  HiMapPin,
  HiMagnifyingGlass,
  HiArrowDownTray,
} from "react-icons/hi2";
import {
  planRoute,
  convertToGPX,
  downloadGPX,
} from "../utils/openRouteService";
import type { GPXFile } from "../types/gpx";
import * as S from "../styles/RouteView.styled";

interface RoutePoint {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
}

interface RouteViewProps {
  onRouteGenerated: (route: GPXFile) => void;
  onLocationError: (error: string) => void;
  onRouteSelect?: (route: GPXFile) => void;
}

const RouteView = ({
  onRouteGenerated,
  onLocationError,
  onRouteSelect,
}: RouteViewProps) => {
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([
    { id: "1", address: "" },
    { id: "2", address: "" },
  ]);
  const [routeProfile, setRouteProfile] = useState<string>("foot-walking");
  const [isGenerating, setIsGenerating] = useState(false);
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
    setRoutePoints((prev) => [
      ...prev.slice(0, -1),
      newWaypoint,
      prev[prev.length - 1],
    ]);
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
    const filledPoints = routePoints.filter((point) => point.address.trim());
    if (filledPoints.length < 2) {
      onLocationError("최소 출발지와 도착지를 입력해주세요.");
      return;
    }

    setIsGenerating(true);

    try {
      const addresses = filledPoints.map((point) => point.address.trim());
      const routeResult = await planRoute(addresses, routeProfile);

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

      // 출발지와 도착지 추출 (사용자 입력값 사용)
      const startLocation = sanitizeFileName(addresses[0]);
      const endLocation = sanitizeFileName(addresses[addresses.length - 1]);
      const transportMode = getProfileName(routeProfile);

      const routeName = `${startLocation}_${endLocation}_${transportMode}`;

      // GPX 문자열 생성
      const gpxContent = convertToGPX(
        routeResult.coordinates,
        routeName,
        routeResult.geocodedAddresses
      );

      // waypoints 정보 생성
      const waypoints = routeResult.geocodedAddresses.map((addr, index) => ({
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

    const filename = `${lastGeneratedRoute.route.name.replace(
      /[^a-zA-Z0-9가-힣\s]/g,
      "_"
    )}.gpx`;
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
        <S.RoutePointContainer>
          {routePoints.map((point, index) => (
            <S.RoutePointItem key={point.id}>
              <S.PointTypeIcon type={getPointType(index)}>
                {getPointLabel(index)}
              </S.PointTypeIcon>
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
              />
              {routePoints.length > 2 && getPointType(index) === "waypoint" && (
                <S.DeleteButton onClick={() => removeWaypoint(point.id)}>
                  <HiTrash />
                </S.DeleteButton>
              )}
            </S.RoutePointItem>
          ))}
        </S.RoutePointContainer>

        <S.AddWaypointButton onClick={addWaypoint}>
          <HiPlus />
          경유지 추가
        </S.AddWaypointButton>
      </S.Section>

      <S.Section>
        <S.SectionTitle>경로 옵션</S.SectionTitle>
        <S.OptionSection>
          <S.OptionLabel>이동 방식</S.OptionLabel>
          <S.Select
            value={routeProfile}
            onChange={(e) => setRouteProfile(e.target.value)}
          >
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
              <S.RouteInfoValue>
                {lastGeneratedRoute.distance.toFixed(2)} km
              </S.RouteInfoValue>
            </S.RouteInfoItem>
            <S.RouteInfoItem>
              <span>예상 시간:</span>
              <S.RouteInfoValue>
                {formatDuration(lastGeneratedRoute.duration)}
              </S.RouteInfoValue>
            </S.RouteInfoItem>
            <S.RouteInfoItem>
              <span>포인트 수:</span>
              <S.RouteInfoValue>
                {lastGeneratedRoute.route.data.points.length}개
              </S.RouteInfoValue>
            </S.RouteInfoItem>
          </S.RouteInfo>
        </S.Section>
      )}

      <S.ButtonGroup>
        <S.GenerateButton onClick={generateRoute} disabled={isGenerating}>
          <HiMapPin />
          {isGenerating ? "경로 생성 중..." : "경로 생성"}
        </S.GenerateButton>

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
