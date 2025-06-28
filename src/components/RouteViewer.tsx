import { useState } from "react";
import styled from "@emotion/styled";
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

interface RoutePoint {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
}

interface RouteViewerProps {
  onRouteGenerated: (route: GPXFile) => void;
  onLocationError: (error: string) => void;
  onRouteSelect?: (route: GPXFile) => void;
}

const Container = styled.div`
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RoutePointContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const RoutePointItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
`;

const RoutePointInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;

  &::placeholder {
    color: #999;
  }
`;

const PointTypeIcon = styled.div<{ type: "start" | "waypoint" | "end" }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: white;
  background: ${(props) => {
    switch (props.type) {
      case "start":
        return "#22c55e";
      case "waypoint":
        return "#3b82f6";
      case "end":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  }};
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    color: #4561ff;
  }
`;

const DeleteButton = styled(ActionButton)`
  &:hover {
    background: #fee;
    color: #ef4444;
  }
`;

const AddWaypointButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  color: #4561ff;
  border: 1px dashed #4561ff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: #f8f9ff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
`;

const GenerateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #4561ff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: #3b4de8;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  color: #4561ff;
  border: 2px solid #4561ff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: #4561ff;
    color: white;
  }

  &:disabled {
    border-color: #ccc;
    color: #ccc;
    cursor: not-allowed;
  }
`;

const RouteInfo = styled.div`
  background: #f8f9ff;
  border: 1px solid #e0e6ff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const RouteInfoTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #4561ff;
  font-size: 14px;
  font-weight: 600;
`;

const RouteInfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 14px;
  color: #666;

  &:last-child {
    margin-bottom: 0;
  }
`;

const RouteInfoValue = styled.span`
  color: #333;
  font-weight: 500;
`;

const OptionSection = styled.div`
  margin-bottom: 16px;
`;

const OptionLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4561ff;
  }
`;

const RouteViewer = ({
  onRouteGenerated,
  onLocationError,
  onRouteSelect,
}: RouteViewerProps) => {
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
          .replace(/[<>:"/\\|?*]/g, "") // 파일명에 사용할 수 없는 문자 제거
          .replace(/\s+/g, "_") // 공백을 언더스코어로 변환
          .replace(/_{2,}/g, "_") // 연속된 언더스코어를 하나로 변환
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
    <Container>
      <Title>경로 생성</Title>

      <Section>
        <SectionTitle>지점 설정</SectionTitle>
        <RoutePointContainer>
          {routePoints.map((point, index) => (
            <RoutePointItem key={point.id}>
              <PointTypeIcon type={getPointType(index)}>
                {getPointLabel(index)}
              </PointTypeIcon>
              <RoutePointInput
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
                <DeleteButton onClick={() => removeWaypoint(point.id)}>
                  <HiTrash />
                </DeleteButton>
              )}
            </RoutePointItem>
          ))}
        </RoutePointContainer>

        <AddWaypointButton onClick={addWaypoint}>
          <HiPlus />
          경유지 추가
        </AddWaypointButton>
      </Section>

      <Section>
        <SectionTitle>경로 옵션</SectionTitle>
        <OptionSection>
          <OptionLabel>이동 방식</OptionLabel>
          <Select
            value={routeProfile}
            onChange={(e) => setRouteProfile(e.target.value)}
          >
            <option value="foot-walking">도보</option>
            <option value="foot-hiking">러닝</option>
            <option value="cycling-regular">자전거</option>
            <option value="driving-car">자동차</option>
          </Select>
        </OptionSection>
      </Section>

      {lastGeneratedRoute && (
        <Section>
          <SectionTitle>경로 정보</SectionTitle>
          <RouteInfo>
            <RouteInfoTitle>생성된 경로</RouteInfoTitle>
            <RouteInfoItem>
              <span>총 거리:</span>
              <RouteInfoValue>
                {lastGeneratedRoute.distance.toFixed(2)} km
              </RouteInfoValue>
            </RouteInfoItem>
            <RouteInfoItem>
              <span>예상 시간:</span>
              <RouteInfoValue>
                {formatDuration(lastGeneratedRoute.duration)}
              </RouteInfoValue>
            </RouteInfoItem>
            <RouteInfoItem>
              <span>포인트 수:</span>
              <RouteInfoValue>
                {lastGeneratedRoute.route.data.points.length}개
              </RouteInfoValue>
            </RouteInfoItem>
          </RouteInfo>
        </Section>
      )}

      <ButtonGroup>
        <GenerateButton onClick={generateRoute} disabled={isGenerating}>
          <HiMapPin />
          {isGenerating ? "경로 생성 중..." : "경로 생성"}
        </GenerateButton>

        {lastGeneratedRoute && (
          <DownloadButton onClick={handleDownload}>
            <HiArrowDownTray />
            GPX 파일 다운로드
          </DownloadButton>
        )}
      </ButtonGroup>
    </Container>
  );
};

export default RouteViewer;
