import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const PointsTrackerContainer = styled.div`
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
`;

const PointsLabel = styled.span`
  margin-right: 8px;
  opacity: 0.8;
`;

const PointsValue = styled.span`
  font-weight: bold;
  font-size: 1.1em;
`;

const PointsTracker: React.FC = () => {
  const { currentModulePoints } = useSelector((state: RootState) => state.module);

  // Optional: Could also get currentModuleId and only render if a module is active,
  // but currentModulePoints should be 0 if no module is active or reset.

  return (
    <PointsTrackerContainer>
      <PointsLabel>Points:</PointsLabel>
      <PointsValue>{currentModulePoints}</PointsValue>
    </PointsTrackerContainer>
  );
};

export default PointsTracker; 