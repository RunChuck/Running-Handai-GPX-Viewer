import { useState, useRef } from 'react';
import styled from '@emotion/styled';
import Sidebar from './Sidebar';
import MapView from './MapView';
import Toast from './Toast';
import type { MapViewRef } from './MapView';
import type { GPXFile } from '../types/gpx';

const Container = styled.div`
  display: flex;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
`;

const GPXViewer = () => {
  const [gpxFiles, setGpxFiles] = useState<GPXFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(8);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const mapViewRef = useRef<MapViewRef>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
  };

  const closeToast = () => {
    setIsToastVisible(false);
  };

  const handleFileUpload = (newFile: GPXFile) => {
    setGpxFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleFileSelect = (file: GPXFile) => {
    setActiveFileId(file.id);
    // 파일 선택 시 항상 해당 경로로 이동
    if (mapViewRef.current) {
      mapViewRef.current.moveToFileRoute(file);
    }
  };

  const handleFileDelete = (fileId: string) => {
    setGpxFiles(prev => {
      const newFiles = prev.filter(file => file.id !== fileId);
      
      // 삭제된 파일이 현재 활성 파일이었다면
      if (activeFileId === fileId) {
        // 다른 파일이 있다면 첫 번째 파일을 활성화
        if (newFiles.length > 0) {
          setActiveFileId(newFiles[0].id);
        } else {
          setActiveFileId(null);
        }
      }
      
      return newFiles;
    });

    console.log(`파일 삭제됨: ${fileId}`);
  };

  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleLocationRequest = () => {
    if (mapViewRef.current) {
      mapViewRef.current.moveToCurrentLocation();
    }
  };

  const handleZoomChange = (level: number) => {
    setZoomLevel(level);
  };

  const handleLocationError = (errorMessage: string) => {
    showToast(errorMessage);
  };

  // 현재 활성 파일 찾기
  const activeFile = gpxFiles.find(file => file.id === activeFileId) || null;

  return (
    <Container>
      <Toast 
        message={toastMessage}
        type="error"
        isVisible={isToastVisible}
        onClose={closeToast}
        duration={3000}
      />
      
      <Sidebar
        gpxFiles={gpxFiles}
        activeFileId={activeFileId}
        isCollapsed={isSidebarCollapsed}
        zoomLevel={zoomLevel}
        onFileUpload={handleFileUpload}
        onFileSelect={handleFileSelect}
        onFileDelete={handleFileDelete}
        onToggle={handleSidebarToggle}
        onLocationRequest={handleLocationRequest}
      />
      <MapView 
        ref={mapViewRef}
        activeFile={activeFile} 
        isSidebarCollapsed={isSidebarCollapsed}
        onZoomChange={handleZoomChange}
        onLocationError={handleLocationError}
      />
    </Container>
  );
};

export default GPXViewer;