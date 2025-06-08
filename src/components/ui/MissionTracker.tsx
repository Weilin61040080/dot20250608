import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const MissionTrackerContainer = styled.div`
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 6px;
  overflow: hidden;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
  pointer-events: auto;
`;

const MissionHeader = styled.div`
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderText = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MissionList = styled.div<{ isCollapsed: boolean }>`
  max-height: ${props => props.isCollapsed ? '0' : '300px'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const MissionItem = styled.div<{ completed: boolean }>`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  opacity: ${props => props.completed ? 0.6 : 1};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatusIcon = styled.div<{ completed: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background-color: ${props => props.completed ? '#4CAF50' : '#757575'};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    content: ${props => props.completed ? '"✓"' : '""'};
    color: white;
    font-size: 10px;
  }
`;

const MissionTitle = styled.div<{ completed: boolean }>`
  font-weight: 500;
  flex: 1;
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
`;

interface MissionTrackerProps {
  moduleId: string;
}

const MissionTracker: React.FC<MissionTrackerProps> = ({ moduleId }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const { modules, completedMissions } = useSelector((state: RootState) => state.module);
  const currentModule = modules.find(m => m.id === moduleId);
  
  useEffect(() => {
    console.log('===== MISSION TRACKER STATE CHECK =====');
    console.log('Module ID:', moduleId);
    console.log('Completed Missions Array:', completedMissions);
    if (currentModule) {
      console.log('Missions for Current Module:', currentModule.missions.map(m => ({ id: m.id, activityId: m.activityId, completed: completedMissions.includes(m.id) })));
    } else {
      console.log('Current module not found for MissionTracker.');
    }
    console.log('=====================================');
  }, [completedMissions, moduleId, currentModule]);
  
  if (!currentModule || !currentModule.missions || currentModule.missions.length === 0) {
    return null;
  }
  
  const missions = currentModule.missions;
  const completedCount = missions.filter(mission => 
    completedMissions.includes(mission.id)
  ).length;
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <MissionTrackerContainer key={`mission-tracker-${moduleId}-${completedMissions.length}`}>
      <MissionHeader>
        <HeaderText>Mission: {completedCount} / {missions.length}</HeaderText>
        <ToggleButton onClick={toggleCollapse}>
          {isCollapsed ? '+' : '-'}
        </ToggleButton>
      </MissionHeader>
      
      <MissionList isCollapsed={isCollapsed}>
        {missions.map(mission => {
          const isCompleted = completedMissions.includes(mission.id);
          return (
            <MissionItem 
              key={`${mission.id}-${isCompleted}`}
              completed={isCompleted}
            >
              <StatusIcon completed={isCompleted} />
              <MissionTitle completed={isCompleted}>
                {mission.title}
              </MissionTitle>
            </MissionItem>
          );
        })}
      </MissionList>
    </MissionTrackerContainer>
  );
};

export default MissionTracker; 