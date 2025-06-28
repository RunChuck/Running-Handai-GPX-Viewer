/// <reference types="vite/client" />
/// <reference types="node" />

interface ImportMetaEnv {
  readonly VITE_KAKAO_MAP_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 카카오 맵 API 타입 정의
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (
          container: HTMLElement,
          options: {
            center: kakao.maps.LatLng;
            level: number;
          }
        ) => kakao.maps.Map;
        LatLng: new (lat: number, lng: number) => kakao.maps.LatLng;
        LatLngBounds: new () => kakao.maps.LatLngBounds;
        Polyline: new (options: {
          path: kakao.maps.LatLng[];
          strokeWeight: number;
          strokeColor: string;
          strokeOpacity: number;
          strokeStyle: string;
        }) => kakao.maps.Polyline;

        event: {
          addListener: (target: any, type: string, handler: () => void) => void;
        };
      };
    };
  }

  namespace kakao.maps {
    class Map {
      setBounds(bounds: LatLngBounds): void;
      getLevel(): number;
      setLevel(level: number): void;
      setCenter(latlng: LatLng): void;
      relayout(): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
    }

    class LatLngBounds {
      extend(latlng: LatLng): void;
    }

    class Polyline {
      setMap(map: Map | null): void;
    }
  }
}
