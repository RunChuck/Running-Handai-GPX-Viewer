import styled from "@emotion/styled";

export const MapContainer = styled.div`
  flex: 1;
  background: #f5f5f5;
  position: relative;
`;

export const RouteInfoOverlay = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 200px;
  z-index: 1000;
`;

export const RouteInfoTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #4561ff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const RouteInfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const RouteInfoValue = styled.span`
  color: #333;
  font-weight: 600;
`;
