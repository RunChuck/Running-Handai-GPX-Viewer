import { useState } from "react";
import styled from "@emotion/styled";
import {
  HiTrash,
  HiChevronLeft,
  HiChevronRight,
  HiMapPin,
  HiMagnifyingGlass,
  HiDocumentText,
  HiMap,
  HiArrowDownTray,
} from "react-icons/hi2";
import { parseGPX } from "../utils/gpxParser";
import RouteViewer from "./RouteViewer";
import type { GPXFile } from "../types/gpx";

interface SidebarProps {
  gpxFiles: GPXFile[];
  activeFileId: string | null;
  isCollapsed: boolean;
  zoomLevel: number;
  onFileUpload: (file: GPXFile) => void;
  onFileSelect: (file: GPXFile) => void;
  onFileDelete: (fileId: string) => void;
  onToggle: (collapsed: boolean) => void;
  onLocationRequest: () => void;
  onError?: (message: string) => void;
}

const Container = styled.div<{ isCollapsed: boolean }>`
  width: ${(props) => (props.isCollapsed ? "0px" : "320px")};
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.3s ease;
`;

const SidebarContent = styled.div<{ isCollapsed: boolean }>`
  opacity: ${(props) => (props.isCollapsed ? "0" : "1")};
  transition: opacity 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const CollapseButton = styled.button<{ isCollapsed: boolean }>`
  position: absolute;
  top: 50%;
  left: ${(props) => (props.isCollapsed ? "10px" : "310px")};
  transform: translateY(-50%);
  z-index: 1001;
  width: 32px;
  height: 32px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #f5f5f5;
    border-color: #4561ff;
    color: #4561ff;
  }
`;

const SidebarHeader = styled.div`
  padding: 24px 24px 20px 24px;
`;

const Title = styled.h1`
  color: #333;
  font-size: 24px;
  font-weight: 600;
`;

const TabContainer = styled.div`
  display: flex;
  width: 100%;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  position: relative;
  box-sizing: border-box;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1 1 50%;
  width: 50%;
  padding: 14px 12px;
  border: none;
  background: ${(props) => (props.active ? "#fff" : "transparent")};
  color: ${(props) => (props.active ? "#4561FF" : "#666")};
  font-weight: ${(props) => (props.active ? "600" : "500")};
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  border-bottom: 3px solid
    ${(props) => (props.active ? "#4561FF" : "transparent")};
  white-space: nowrap;
  text-align: center;
  box-sizing: border-box;

  &:hover {
    background: #f5f5f5;
    color: #4561ff;
  }
`;

const TabContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// GPX Tab Components
const GPXTabContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
`;

const FileInput = styled.input`
  display: none;
`;

const DropZone = styled.div<{ isDragOver: boolean }>`
  border: 2px dashed ${(props) => (props.isDragOver ? "#4561FF" : "#e0e0e0")};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background: ${(props) => (props.isDragOver ? "#f8f9ff" : "transparent")};
  transition: all 0.2s ease;
  margin-bottom: 16px;
  cursor: pointer;

  &:hover {
    border-color: #4561ff;
    background: #f8f9ff;
  }
`;

const DropZoneText = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
`;

const ZoomLevelContainer = styled.div`
  padding: 12px;
  background: #f8f9ff;
  border: 1px solid #e0e6ff;
  border-radius: 8px;
`;

const ZoomLevelTitle = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ZoomLevelValue = styled.div`
  font-size: 18px;
  color: #4561ff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ZoomRange = styled.div`
  font-size: 11px;
  color: #999;
  font-weight: 500;
`;

const LocationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: white;
  color: #4561ff;
  border: 2px solid #4561ff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
  margin-top: 8px;

  &:hover {
    background: #4561ff;
    color: white;
  }
`;

const LoadingMessage = styled.div`
  color: #4561ff;
  font-size: 14px;
  text-align: center;
  padding: 8px;
  background: #f8f9ff;
  border-radius: 6px;
  margin-top: 8px;
`;

const ErrorMessage = styled.div`
  color: #ff4757;
  font-size: 14px;
  text-align: center;
  padding: 8px;
  background: #fee;
  border-radius: 6px;
  margin-top: 8px;
`;

const FileListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-top: 16px;
`;

const FileListTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #919191;
  font-size: 16px;
  font-weight: 600;
`;

const FileItem = styled.div<{ active?: boolean }>`
  padding: 12px 16px;
  margin-bottom: 8px;
  border: 2px solid ${(props) => (props.active ? "#4561FF" : "#e0e0e0")};
  background: ${(props) => (props.active ? "#f8f9ff" : "white")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    border-color: #4561ff;
    background: #f8f9ff;
  }
`;

const FileItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileInfo = styled.div`
  font-size: 12px;
  color: #666;
`;

const ActionButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  flex-shrink: 0;
`;

const ActionButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #999;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;

  &:active {
    transform: scale(0.95);
  }
`;

const DownloadButton = styled(ActionButton)`
  &:hover {
    background: #e3f2fd;
    color: #1976d2;
    transform: scale(1.1);
  }
`;

const DeleteButton = styled(ActionButton)`
  &:hover {
    background: #fee;
    color: #ff4757;
    transform: scale(1.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 40px 20px;
  line-height: 1.5;
`;

const Sidebar = ({
  gpxFiles,
  activeFileId,
  isCollapsed,
  zoomLevel,
  onFileUpload,
  onFileSelect,
  onFileDelete,
  onToggle,
  onLocationRequest,
  onError,
}: SidebarProps) => {
  const [activeTab, setActiveTab] = useState<"gpx" | "route">("gpx");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".gpx")) {
      const errorMessage = "GPX 파일만 업로드 가능합니다.";
      if (onError) {
        onError(errorMessage);
      } else {
        setError(errorMessage);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const data = parseGPX(text);

      if (data.points.length === 0) {
        const errorMessage = "GPX 파일에서 경로 데이터를 찾을 수 없습니다.";
        if (onError) {
          onError(errorMessage);
        } else {
          setError(errorMessage);
        }
        return;
      }

      const newFile: GPXFile = {
        id: Date.now().toString(),
        name: file.name,
        data,
        uploadTime: new Date(),
        color: "#4561FF",
      };

      onFileUpload(newFile);
      console.log(`GPX 파일 로드 완료: ${data.points.length}개 포인트`);
    } catch (err) {
      const errorMessage = "GPX 파일을 파싱하는 중 오류가 발생했습니다.";
      if (onError) {
        onError(errorMessage);
      } else {
        setError(errorMessage);
      }
      console.error("GPX 파싱 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processFile(file);
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleDropZoneClick = () => {
    document.getElementById("gpx-file")?.click();
  };

  const handleFileDelete = (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onFileDelete(fileId);
  };

  const handleLocationClick = () => {
    onLocationRequest();
  };

  const toggleSidebar = () => {
    onToggle(!isCollapsed);
  };

  const formatUploadTime = (date: Date) => {
    return date.toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRouteGenerated = (route: GPXFile) => {
    onFileUpload(route);
    setActiveTab("gpx"); // 경로 생성 후 GPX 탭으로 이동
  };

  const handleRouteSelect = (route: GPXFile) => {
    // 경로 생성 후 해당 경로로 지도 이동
    onFileSelect(route);
  };

  const handleLocationError = (errorMessage: string) => {
    // 토스트로 오류 표시하기 위해 상위 컴포넌트로 전달
    if (onError) {
      onError(errorMessage);
    } else {
      console.error("Route error:", errorMessage);
    }
  };

  const handleDownloadGPX = (file: GPXFile, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!file.downloadContent) {
      const errorMessage = "다운로드할 콘텐츠가 없습니다.";
      if (onError) {
        onError(errorMessage);
      } else {
        console.error(errorMessage);
      }
      return;
    }

    const blob = new Blob([file.downloadContent], {
      type: "application/gpx+xml",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name.endsWith(".gpx") ? file.name : `${file.name}.gpx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <CollapseButton
        isCollapsed={isCollapsed}
        onClick={toggleSidebar}
        title={isCollapsed ? "사이드바 열기" : "사이드바 닫기"}
      >
        {isCollapsed ? <HiChevronRight /> : <HiChevronLeft />}
      </CollapseButton>

      <Container isCollapsed={isCollapsed}>
        <SidebarContent isCollapsed={isCollapsed}>
          <SidebarHeader>
            <Title>🏃‍♂️ 팀척을 위한 GPX 뷰어</Title>
          </SidebarHeader>

          <TabContainer>
            <Tab
              active={activeTab === "gpx"}
              onClick={() => setActiveTab("gpx")}
            >
              <HiDocumentText />
              GPX 파일
            </Tab>
            <Tab
              active={activeTab === "route"}
              onClick={() => setActiveTab("route")}
            >
              <HiMap />
              경로 생성
            </Tab>
          </TabContainer>

          <TabContent>
            {activeTab === "gpx" ? (
              <GPXTabContent>
                <DropZone
                  isDragOver={isDragOver}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleDropZoneClick}
                >
                  <DropZoneText>
                    파일을 여기에 드래그하거나
                    <br />
                    클릭해서 선택하세요
                  </DropZoneText>
                </DropZone>

                <ZoomLevelContainer>
                  <ZoomLevelTitle>
                    <HiMagnifyingGlass size={14} />
                    지도 확대 수준
                  </ZoomLevelTitle>
                  <ZoomLevelValue>
                    레벨 {zoomLevel}
                    <ZoomRange>/ 14</ZoomRange>
                  </ZoomLevelValue>
                </ZoomLevelContainer>

                <LocationButton
                  onClick={handleLocationClick}
                  title="현재 위치로 이동"
                >
                  <HiMapPin size={16} />
                </LocationButton>

                <FileInput
                  id="gpx-file"
                  type="file"
                  accept=".gpx"
                  onChange={handleFileUpload}
                />

                {loading && (
                  <LoadingMessage>GPX 파일을 처리하는 중...</LoadingMessage>
                )}
                {error && <ErrorMessage>{error}</ErrorMessage>}

                <FileListContainer>
                  {gpxFiles.length > 0 ? (
                    <>
                      <FileListTitle>
                        업로드된 파일 ({gpxFiles.length})
                      </FileListTitle>
                      {gpxFiles.map((file) => (
                        <FileItem
                          key={file.id}
                          active={activeFileId === file.id}
                          onClick={() => onFileSelect(file)}
                        >
                          <FileItemContent>
                            <FileName>{file.name}</FileName>
                            <FileInfo>
                              {file.data.points.length}개 포인트 •{" "}
                              {formatUploadTime(file.uploadTime)}
                            </FileInfo>
                          </FileItemContent>
                          <ActionButtonGroup>
                            {file.downloadContent && (
                              <DownloadButton
                                onClick={(e) => handleDownloadGPX(file, e)}
                                title="GPX 파일 다운로드"
                              >
                                <HiArrowDownTray size={14} />
                              </DownloadButton>
                            )}
                            <DeleteButton
                              onClick={(e) => handleFileDelete(file.id, e)}
                              title="파일 삭제"
                            >
                              <HiTrash size={14} />
                            </DeleteButton>
                          </ActionButtonGroup>
                        </FileItem>
                      ))}
                    </>
                  ) : (
                    <EmptyState>파일을 업로드 해주세요</EmptyState>
                  )}
                </FileListContainer>
              </GPXTabContent>
            ) : (
              <RouteViewer
                onRouteGenerated={handleRouteGenerated}
                onLocationError={handleLocationError}
                onRouteSelect={handleRouteSelect}
              />
            )}
          </TabContent>
        </SidebarContent>
      </Container>
    </>
  );
};

export default Sidebar;
