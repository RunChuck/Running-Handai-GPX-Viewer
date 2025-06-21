import type { GPXPoint, GPXData } from '../types/gpx';

export const parseGPX = (gpxString: string): GPXData => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(gpxString, 'application/xml');

  // GPX 파일명 추출
  const nameElement = doc.querySelector('name');
  const name = nameElement?.textContent || 'Unknown Route';

  // 경로 포인트 추출
  const rtepts = doc.querySelectorAll('rtept');
  const points: GPXPoint[] = [];

  rtepts.forEach(rtept => {
    const lat = parseFloat(rtept.getAttribute('lat') || '0');
    const lng = parseFloat(rtept.getAttribute('lon') || '0');
    const eleElement = rtept.querySelector('ele');
    const ele = eleElement
      ? parseFloat(eleElement.textContent || '0')
      : undefined;

    points.push({ lat, lng, ele });
  });

  return { name, points };
};