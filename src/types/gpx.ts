export interface GPXPoint {
  lat: number;
  lng: number;
  ele?: number;
}

export interface GPXData {
  name: string;
  points: GPXPoint[];
}

export interface GPXFile {
  id: string;
  name: string;
  data: GPXData;
  uploadTime: Date;
  color: string;
  downloadContent?: string;
  // 경로 정보 (OpenRouteService로 생성된 경우)
  routeInfo?: {
    distance: number; // km
    duration: number; // seconds
    waypoints?: Array<{
      // 출발지, 경유지, 도착지 정보
      lat: number;
      lng: number;
      address: string;
      type: "start" | "waypoint" | "end";
    }>;
  };
}
