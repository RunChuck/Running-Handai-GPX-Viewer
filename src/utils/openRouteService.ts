const ORS_API_KEY = import.meta.env.VITE_OPENROUTE_SERVICE_API_KEY;
const ORS_BASE_URL = "https://api.openrouteservice.org";

interface Coordinate {
  lat: number;
  lng: number;
}

// Polyline 디코딩 함수
const decodePolyline = (encoded: string): Array<[number, number]> => {
  const coordinates: Array<[number, number]> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    // Decode latitude
    let shift = 0;
    let result = 0;
    let byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    // Decode longitude
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
};

interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

interface RouteResponse {
  coordinates: Coordinate[];
  distance: number;
  duration: number;
}

// 주소를 좌표로 변환하는 함수 (Geocoding)
export const geocodeAddress = async (
  address: string
): Promise<GeocodeResult | null> => {
  if (!address.trim()) return null;

  try {
    const url = `${ORS_BASE_URL}/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(
      address
    )}&boundary.country=KR&size=1`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [lng, lat] = feature.geometry.coordinates;

      return {
        lat,
        lng,
        displayName: feature.properties.label || address,
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    throw new Error("주소를 찾을 수 없습니다.");
  }
};

// 여러 지점을 경유하는 경로를 계산하는 함수
export const calculateRoute = async (
  coordinates: Coordinate[],
  profile: string = "foot-walking"
): Promise<RouteResponse> => {
  if (coordinates.length < 2) {
    throw new Error("최소 2개의 지점이 필요합니다.");
  }

  try {
    const coordinateString = coordinates
      .map((coord) => `${coord.lng},${coord.lat}`)
      .join("|");

    const url = `${ORS_BASE_URL}/v2/directions/${profile}`;

    const requestBody = {
      coordinates: coordinates.map((coord) => [coord.lng, coord.lat]),
      format: "json",
      instructions: false,
      geometry_simplify: false,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("API 키가 유효하지 않습니다.");
      } else if (response.status === 429) {
        throw new Error("API 요청 한도를 초과했습니다.");
      } else {
        throw new Error(`경로 계산 실패: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log("OpenRouteService 경로 API 응답:", data);

    if (!data.routes || data.routes.length === 0) {
      throw new Error("경로를 찾을 수 없습니다.");
    }

    const route = data.routes[0];
    console.log("Route 데이터:", route);
    console.log("Geometry 타입:", typeof route.geometry);
    console.log("Geometry 내용:", route.geometry);

    // geometry 구조 확인 및 처리
    let routeCoordinates: Array<{ lat: number; lng: number }>;

    if (typeof route.geometry === "string") {
      // encoded polyline - 디코딩 처리
      console.log("Encoded polyline 디코딩 중...");
      const decodedCoords = decodePolyline(route.geometry);
      routeCoordinates = decodedCoords.map(([lng, lat]) => ({
        lat,
        lng,
      }));
    } else if (
      route.geometry &&
      typeof route.geometry === "object" &&
      route.geometry.coordinates
    ) {
      // GeoJSON 형태 (혹시 있을 경우를 대비)
      routeCoordinates = route.geometry.coordinates.map(
        (coord: [number, number]) => ({
          lat: coord[1],
          lng: coord[0],
        })
      );
    } else {
      throw new Error("알 수 없는 geometry 형식입니다.");
    }

    return {
      coordinates: routeCoordinates,
      distance: route.summary.distance / 1000, // meters to kilometers
      duration: route.summary.duration, // seconds
    };
  } catch (error) {
    console.error("Route calculation error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("경로 계산 중 오류가 발생했습니다.");
  }
};

// 전체 경로 생성 프로세스를 통합하는 함수
export const planRoute = async (
  addresses: string[],
  profile: string = "foot-walking"
): Promise<{
  coordinates: Coordinate[];
  geocodedAddresses: GeocodeResult[];
  distance: number;
  duration: number;
}> => {
  if (addresses.length < 2) {
    throw new Error("최소 출발지와 도착지를 입력해주세요.");
  }

  // 1단계: 모든 주소를 좌표로 변환
  console.log("주소를 좌표로 변환 중...");
  const geocodedResults: GeocodeResult[] = [];

  for (const address of addresses) {
    const result = await geocodeAddress(address);
    if (!result) {
      throw new Error(`주소를 찾을 수 없습니다: ${address}`);
    }
    geocodedResults.push(result);
  }

  // 2단계: 경로 계산
  console.log("경로 계산 중...");
  const coordinates = geocodedResults.map((result) => ({
    lat: result.lat,
    lng: result.lng,
  }));

  const routeResult = await calculateRoute(coordinates, profile);

  return {
    coordinates: routeResult.coordinates,
    geocodedAddresses: geocodedResults,
    distance: routeResult.distance,
    duration: routeResult.duration,
  };
};

// GPX 형식으로 경로 데이터를 변환하는 함수
export const convertToGPX = (
  coordinates: Coordinate[],
  routeName: string,
  geocodedAddresses?: GeocodeResult[]
): string => {
  const now = new Date().toISOString();

  let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Running Handai GPX Viewer" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${routeName}</name>
    <desc>OpenRouteService로 생성된 경로</desc>
    <time>${now}</time>`;

  if (geocodedAddresses && geocodedAddresses.length > 0) {
    gpxContent += `
    <keywords>출발지: ${geocodedAddresses[0].displayName}`;
    if (geocodedAddresses.length > 2) {
      gpxContent += `, 경유지: ${geocodedAddresses
        .slice(1, -1)
        .map((addr) => addr.displayName)
        .join(", ")}`;
    }
    if (geocodedAddresses.length > 1) {
      gpxContent += `, 도착지: ${
        geocodedAddresses[geocodedAddresses.length - 1].displayName
      }`;
    }
    gpxContent += `</keywords>`;
  }

  gpxContent += `
  </metadata>
  <trk>
    <name>${routeName}</name>
    <trkseg>`;

  coordinates.forEach((coord) => {
    gpxContent += `
      <trkpt lat="${coord.lat}" lon="${coord.lng}"></trkpt>`;
  });

  gpxContent += `
    </trkseg>
  </trk>
</gpx>`;

  return gpxContent;
};

// GPX 파일 다운로드 함수
export const downloadGPX = (gpxContent: string, filename: string) => {
  const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".gpx") ? filename : `${filename}.gpx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
