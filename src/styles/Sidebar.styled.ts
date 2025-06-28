import styled from "@emotion/styled";

export const Container = styled.div<{ isCollapsed: boolean }>`
  width: ${(props) => (props.isCollapsed ? "0px" : "320px")};
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.3s ease;
`;

export const SidebarContent = styled.div<{ isCollapsed: boolean }>`
  opacity: ${(props) => (props.isCollapsed ? "0" : "1")};
  transition: opacity 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const CollapseButton = styled.button<{ isCollapsed: boolean }>`
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

export const SidebarHeader = styled.div`
  padding: 24px 24px 20px 24px;
`;

export const Title = styled.h1`
  color: #333;
  font-size: 24px;
  font-weight: 600;
`;

export const TabContainer = styled.div`
  display: flex;
  width: 100%;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  position: relative;
  box-sizing: border-box;
`;

export const Tab = styled.button<{ active: boolean }>`
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

export const TabContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// GPX Tab Components
export const GPXTabContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
`;

export const FileInput = styled.input`
  display: none;
`;

export const DropZone = styled.div<{ isDragOver: boolean }>`
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

export const DropZoneText = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
`;

export const ZoomLevelContainer = styled.div`
  padding: 12px;
  background: #f8f9ff;
  border: 1px solid #e0e6ff;
  border-radius: 8px;
`;

export const ZoomLevelTitle = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const ZoomLevelValue = styled.div`
  font-size: 18px;
  color: #4561ff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ZoomRange = styled.div`
  font-size: 11px;
  color: #999;
  font-weight: 500;
`;

export const LocationButton = styled.button`
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

export const LoadingMessage = styled.div`
  color: #4561ff;
  font-size: 14px;
  text-align: center;
  padding: 8px;
  background: #f8f9ff;
  border-radius: 6px;
  margin-top: 8px;
`;

export const ErrorMessage = styled.div`
  color: #ff4757;
  font-size: 14px;
  text-align: center;
  padding: 8px;
  background: #fee;
  border-radius: 6px;
  margin-top: 8px;
`;

export const FileListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-top: 16px;
`;

export const FileListTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #919191;
  font-size: 16px;
  font-weight: 600;
`;

export const FileItem = styled.div<{ active?: boolean }>`
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

export const FileItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const FileName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FileInfo = styled.div`
  font-size: 12px;
  color: #666;
`;

export const ActionButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  flex-shrink: 0;
`;

export const ActionButton = styled.button`
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

export const DownloadButton = styled(ActionButton)`
  &:hover {
    background: #e3f2fd;
    color: #1976d2;
    transform: scale(1.1);
  }
`;

export const DeleteButton = styled(ActionButton)`
  &:hover {
    background: #fee;
    color: #ff4757;
    transform: scale(1.1);
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 40px 20px;
  line-height: 1.5;
`;
