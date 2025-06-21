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
} 