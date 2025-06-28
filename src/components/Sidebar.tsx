import { useState } from "react";
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
import RouteView from "./RouteView";
import type { GPXFile } from "../types/gpx";
import * as S from "../styles/Sidebar.styled";

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
      <S.CollapseButton
        isCollapsed={isCollapsed}
        onClick={toggleSidebar}
        title={isCollapsed ? "사이드바 열기" : "사이드바 닫기"}
      >
        {isCollapsed ? <HiChevronRight /> : <HiChevronLeft />}
      </S.CollapseButton>

      <S.Container isCollapsed={isCollapsed}>
        <S.SidebarContent isCollapsed={isCollapsed}>
          <S.SidebarHeader>
            <S.Title>🏃‍♂️ 팀척을 위한 GPX 뷰어</S.Title>
          </S.SidebarHeader>

          <S.TabContainer>
            <S.Tab
              active={activeTab === "gpx"}
              onClick={() => setActiveTab("gpx")}
            >
              <HiDocumentText />
              GPX 파일
            </S.Tab>
            <S.Tab
              active={activeTab === "route"}
              onClick={() => setActiveTab("route")}
            >
              <HiMap />
              경로 생성
            </S.Tab>
          </S.TabContainer>

          <S.TabContent>
            {activeTab === "gpx" ? (
              <S.GPXTabContent>
                <S.DropZone
                  isDragOver={isDragOver}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleDropZoneClick}
                >
                  <S.DropZoneText>
                    파일을 여기에 드래그하거나
                    <br />
                    클릭해서 선택하세요
                  </S.DropZoneText>
                </S.DropZone>

                <S.ZoomLevelContainer>
                  <S.ZoomLevelTitle>
                    <HiMagnifyingGlass size={14} />
                    지도 확대 수준
                  </S.ZoomLevelTitle>
                  <S.ZoomLevelValue>
                    레벨 {zoomLevel}
                    <S.ZoomRange>/ 14</S.ZoomRange>
                  </S.ZoomLevelValue>
                </S.ZoomLevelContainer>

                <S.LocationButton
                  onClick={handleLocationClick}
                  title="현재 위치로 이동"
                >
                  <HiMapPin size={16} />
                </S.LocationButton>

                <S.FileInput
                  id="gpx-file"
                  type="file"
                  accept=".gpx"
                  onChange={handleFileUpload}
                />

                {loading && (
                  <S.LoadingMessage>GPX 파일을 처리하는 중...</S.LoadingMessage>
                )}
                {error && <S.ErrorMessage>{error}</S.ErrorMessage>}

                <S.FileListContainer>
                  {gpxFiles.length > 0 ? (
                    <>
                      <S.FileListTitle>
                        업로드된 파일 ({gpxFiles.length})
                      </S.FileListTitle>
                      {gpxFiles.map((file) => (
                        <S.FileItem
                          key={file.id}
                          active={activeFileId === file.id}
                          onClick={() => onFileSelect(file)}
                        >
                          <S.FileItemContent>
                            <S.FileName>{file.name}</S.FileName>
                            <S.FileInfo>
                              {file.data.points.length}개 포인트 •{" "}
                              {formatUploadTime(file.uploadTime)}
                            </S.FileInfo>
                          </S.FileItemContent>
                          <S.ActionButtonGroup>
                            {file.downloadContent && (
                              <S.DownloadButton
                                onClick={(e) => handleDownloadGPX(file, e)}
                                title="GPX 파일 다운로드"
                              >
                                <HiArrowDownTray size={14} />
                              </S.DownloadButton>
                            )}
                            <S.DeleteButton
                              onClick={(e) => handleFileDelete(file.id, e)}
                              title="파일 삭제"
                            >
                              <HiTrash size={14} />
                            </S.DeleteButton>
                          </S.ActionButtonGroup>
                        </S.FileItem>
                      ))}
                    </>
                  ) : (
                    <S.EmptyState>파일을 업로드 해주세요</S.EmptyState>
                  )}
                </S.FileListContainer>
              </S.GPXTabContent>
            ) : (
              <RouteView
                onRouteGenerated={handleRouteGenerated}
                onLocationError={handleLocationError}
                onRouteSelect={handleRouteSelect}
              />
            )}
          </S.TabContent>
        </S.SidebarContent>
      </S.Container>
    </>
  );
};

export default Sidebar;
