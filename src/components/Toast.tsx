import { useEffect } from 'react';
import styled from '@emotion/styled';

interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const ToastContainer = styled.div<{ isVisible: boolean; type: 'error' | 'success' | 'info' }>`
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => {
    switch (props.type) {
      case 'success': return '#2ed573';
      case 'info': return '#4561FF';
      case 'error':
      default: return '#ff4757';
    }
  }};
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: translateX(-50%) translateY(${props => props.isVisible ? '0' : '-10px'});
  transition: all 0.3s ease;
  pointer-events: ${props => props.isVisible ? 'auto' : 'none'};
  cursor: pointer;
  
  &:hover {
    opacity: ${props => props.isVisible ? 0.9 : 0};
  }
`;

const Toast = ({ 
  message, 
  type = 'error', 
  isVisible, 
  onClose, 
  duration = 3000 
}: ToastProps) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const handleClick = () => {
    onClose();
  };

  return (
    <ToastContainer 
      isVisible={isVisible} 
      type={type}
      onClick={handleClick}
    >
      {message}
    </ToastContainer>
  );
};

export default Toast; 