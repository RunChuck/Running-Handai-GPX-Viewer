import styled from "@emotion/styled";

export const Container = styled.div`
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h2`
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
`;

export const Section = styled.div`
  margin-bottom: 24px;
`;

export const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const RoutePointContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

export const RoutePointItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
`;

export const RoutePointInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;

  &::placeholder {
    color: #999;
  }
`;

export const PointTypeIcon = styled.div<{ type: "start" | "waypoint" | "end" }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: white;
  background: ${(props) => {
    switch (props.type) {
      case "start":
        return "#22c55e";
      case "waypoint":
        return "#3b82f6";
      case "end":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  }};
`;

export const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    color: #4561ff;
  }
`;

export const DeleteButton = styled(ActionButton)`
  &:hover {
    background: #fee;
    color: #ef4444;
  }
`;

export const AddWaypointButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  color: #4561ff;
  border: 1px dashed #4561ff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: #f8f9ff;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
`;

export const PinModeButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${(props) => (props.active ? "#4561ff" : "transparent")};
  color: ${(props) => (props.active ? "white" : "#4561ff")};
  border: 1px solid #4561ff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;
  margin-bottom: 8px;

  &:hover {
    background: ${(props) => (props.active ? "#3b4de8" : "#f8f9ff")};
  }
`;

export const ClearPinsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 12px;
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: #fef2f2;
  }
`;

export const GenerateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #4561ff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: #3b4de8;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

export const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  color: #4561ff;
  border: 2px solid #4561ff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: #4561ff;
    color: white;
  }

  &:disabled {
    border-color: #ccc;
    color: #ccc;
    cursor: not-allowed;
  }
`;

export const RouteInfo = styled.div`
  background: #f8f9ff;
  border: 1px solid #e0e6ff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

export const RouteInfoTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #4561ff;
  font-size: 14px;
  font-weight: 600;
`;

export const RouteInfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 14px;
  color: #666;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const RouteInfoValue = styled.span`
  color: #333;
  font-weight: 500;
`;

export const OptionSection = styled.div`
  margin-bottom: 16px;
`;

export const OptionLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
`;

export const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4561ff;
  }
`;

export const PinInfo = styled.div`
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f8ff;
  border: 1px solid #e0e6ff;
  border-radius: 6px;
  font-size: 12px;
  color: #4561ff;
  text-align: center;
`;
