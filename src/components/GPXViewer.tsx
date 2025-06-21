import { useState, useRef } from 'react';
import styled from '@emotion/styled';
import Sidebar from './Sidebar';
import MapView from './MapView';
import type { MapViewRef } from './MapView';
import type { GPXFile } from '../types/gpx';

const Container = styled.div`
  display: flex;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const GPXViewer = () => {
  const [gpxFiles, setGpxFiles] = useState<GPXFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const mapViewRef = useRef<MapViewRef>(null);

  const handleFileUpload = (newFile: GPXFile) => {
    setGpxFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleFileSelect = (file: GPXFile) => {
    setActiveFileId(file.id);
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

  // 현재 활성 파일 찾기
  const activeFile = gpxFiles.find(file => file.id === activeFileId) || null;

  return (
    <Container>
      <Sidebar
        gpxFiles={gpxFiles}
        activeFileId={activeFileId}
        isCollapsed={isSidebarCollapsed}
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
      />
    </Container>
  );
};

export default GPXViewer;