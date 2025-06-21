import type { GPXPoint, GPXData } from '../types/gpx';

export const parseGPX = (gpxString: string): GPXData => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(gpxString, "application/xml");

  // GPX 파일명 추출
  const nameElement = doc.querySelector("name");
  const name = nameElement?.textContent || "Unknown Route";

  const points: GPXPoint[] = [];

  // Route 형식 확인 (<rte> -> <rtept>)
  const rtepts = doc.querySelectorAll("rtept");
  rtepts.forEach((rtept) => {
    const lat = parseFloat(rtept.getAttribute("lat") || "0");
    const lng = parseFloat(rtept.getAttribute("lon") || "0");
    const eleElement = rtept.querySelector("ele");
    const ele = eleElement
      ? parseFloat(eleElement.textContent || "0")
      : undefined;

    points.push({ lat, lng, ele });
  });

  // Track 형식 확인 (<trk> -> <trkseg> -> <trkpt>)
  if (points.length === 0) {
    const trkpts = doc.querySelectorAll("trkpt");
    trkpts.forEach((trkpt) => {
      const lat = parseFloat(trkpt.getAttribute("lat") || "0");
      const lng = parseFloat(trkpt.getAttribute("lon") || "0");
      const eleElement = trkpt.querySelector("ele");
      const ele = eleElement
        ? parseFloat(eleElement.textContent || "0")
        : undefined;

      points.push({ lat, lng, ele });
    });
  }

  return { name, points };
};