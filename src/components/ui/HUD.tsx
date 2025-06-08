import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import MissionTracker from './MissionTracker';
import PointsTracker from './PointsTracker';
import Timer from './Timer';

const HUDContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  align-items: flex-start;
  pointer-events: auto;
`;

const InfoPanel = styled.div`
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(4px);
`;

const DebugToggleContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  pointer-events: auto;
  z-index: 101;
`;

const PlayerPosition = styled(InfoPanel)`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  font-family: monospace;
  font-size: 0.75rem;
  opacity: 0.8;
  pointer-events: auto;
`;

const RightSideUIContainer = styled.div<{ 
  canvasWidth: number; 
  canvasHeight: number; 
  containerWidth: number; 
  containerHeight: number; 
}>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  position: absolute;
  top: ${props => {
    // Calculate the top position of the canvas (centered vertically)
    const canvasTop = Math.max(0, (props.containerHeight - props.canvasHeight) / 2);
    return canvasTop + 20;
  }}px;
  right: ${props => {
    // Calculate the right position relative to the canvas (centered horizontally)
    const canvasLeft = Math.max(0, (props.containerWidth - props.canvasWidth) / 2);
    const canvasRight = canvasLeft + props.canvasWidth;
    return props.containerWidth - canvasRight + 20;
  }}px;
  pointer-events: auto;
  width: 168px;
  z-index: 50;
`;

const ToggleDebugButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: green;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const HUD: React.FC = () => {
  const position = useSelector((state: RootState) => state.player.position);
  const { currentModuleId, modules } = useSelector((state: RootState) => state.module);
  const viewConfig = useSelector((state: RootState) => state.ui.viewConfig);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 1024,
    height: 768
  });
  
  const currentModule = currentModuleId 
    ? modules.find(m => m.id === currentModuleId) 
    : null;
  
  const handleDebugToggle = () => console.log("Debug Toggled");

  // Update container dimensions when component mounts or window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    // Initial measurement
    updateDimensions();

    // Listen for window resize
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Update dimensions when viewConfig changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    // Small delay to ensure canvas has been resized
    const timeoutId = setTimeout(updateDimensions, 100);
    return () => clearTimeout(timeoutId);
  }, [viewConfig.canvasWidth, viewConfig.canvasHeight]);

  return (
    <HUDContainer ref={containerRef}>
      <TopBar>
        <InfoPanel>
          Module: {currentModule ? currentModule.title : 'None'}
        </InfoPanel>
      </TopBar>
      
      <DebugToggleContainer>
        <ToggleDebugButton onClick={handleDebugToggle}>Toggle Debug</ToggleDebugButton>
      </DebugToggleContainer>
      
      <RightSideUIContainer
        canvasWidth={viewConfig.canvasWidth}
        canvasHeight={viewConfig.canvasHeight}
        containerWidth={containerDimensions.width}
        containerHeight={containerDimensions.height}
      >
        {currentModuleId && <Timer />}
        {currentModuleId && <PointsTracker />}
        {currentModuleId && <MissionTracker moduleId={currentModuleId} />}
      </RightSideUIContainer>
      
      <PlayerPosition>
        Position: X: {position.x}, Y: {position.y}
      </PlayerPosition>
    </HUDContainer>
  );
};

export default HUD; 