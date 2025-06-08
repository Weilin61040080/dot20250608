import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import GameContainer from '../components/core/GameContainer';
import DialogSystem from '../components/ui/DialogSystem';
import HUD from '../components/ui/HUD';
import ViewModeToggle from '../components/ui/ViewModeToggle';
import ModuleCompletionModal from '../components/ui/ModuleCompletionModal';
import gameService from '../services/gameService';
import { setCurrentMap } from '../store/slices/gameSlice';
import { RootState } from '../store';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  position: relative;
  background-color: var(--background-color);
`;

const GameWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const BackButton = styled(Link)`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  background-color: white;
  color: var(--primary-color);
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

// Mapping from module IDs to map IDs
const moduleMapMapping: Record<string, string> = {
  'module-test': 'test-map-1',
  'module-ethics': 'campus-map',
  'module-ml': 'lab-map'
};

const GamePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get the current module ID from Redux
  const currentModuleId = useSelector((state: RootState) => state.module.currentModuleId);
  const { showCompletionModal } = useSelector((state: RootState) => state.module);
  
  useEffect(() => {
    // Load the appropriate map based on the selected module
    const loadMap = async () => {
      try {
        // If no module is selected, redirect to module selection page
        if (!currentModuleId) {
          console.log('No module selected. Redirecting to module selection page.');
          navigate('/modules');
          return;
        }
        
        // Get the map ID for the selected module
        const mapId = moduleMapMapping[currentModuleId] || 'test-map-1';
        console.log(`Loading map ${mapId} for module ${currentModuleId}`);
        
        const map = await gameService.loadMap(mapId);
        dispatch(setCurrentMap(map));
      } catch (error) {
        console.error('Failed to load map:', error);
      }
    };
    
    loadMap();
  }, [dispatch, currentModuleId, navigate]);
  
  return (
    <PageContainer>
      <BackButton to="/modules">← Back to Modules</BackButton>
      <GameWrapper>
        <GameContainer />
        <HUD />
        <ViewModeToggle />
        <DialogSystem />
      </GameWrapper>
      {showCompletionModal && <ModuleCompletionModal />}
    </PageContainer>
  );
};

export default GamePage; 