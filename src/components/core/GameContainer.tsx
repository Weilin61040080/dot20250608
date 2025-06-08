import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { TileMap } from '../../types/TileMap';
import { RootState, store } from '../../store';
import GameEngine from '../../engine/GameEngine';
import gameService from '../../services/gameService';
import debugHelper from '../../utils/debugHelper';

const GameCanvas = styled.canvas<{ canvasWidth: number; canvasHeight: number }>`
  display: block;
  width: ${props => props.canvasWidth}px;
  height: ${props => props.canvasHeight}px;
  background-color: #111;
  border: 2px solid #333;
  image-rendering: pixelated; /* Crisp pixel art rendering */
`;

const GameContainerWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000;
`;

// Helper to get the correct asset path based on environment
const getAssetBasePath = () => {
  // The public URL is either set in the env or uses the current basename
  const publicUrl = process.env.PUBLIC_URL || '';
  console.log('Public URL:', publicUrl);
  return `${publicUrl}/assets/`;
};

const GameContainer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const currentMap = useSelector((state: RootState) => state.game.currentMap);
  const viewConfig = useSelector((state: RootState) => state.ui.viewConfig);
  const gameInitialized = useRef(false);
  
  // Use optional chaining to prevent errors if dialogue state doesn't exist yet
  const activeDialogue = useSelector((state: RootState) => state.dialogue?.activeDialogue);
  
  // Initialize game engine on mount
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Set canvas size from view config
      canvas.width = viewConfig.canvasWidth;
      canvas.height = viewConfig.canvasHeight;
      
      // Get the correct asset path
      const assetsBasePath = getAssetBasePath();
      console.log('Using assets base path:', assetsBasePath);
      
      // Initialize engine with correct paths
      engineRef.current = new GameEngine({
        canvasId: 'game-canvas',
        tileSize: 32,
        assetsBasePath // Use the dynamic path
      });
      
      // Connect the engine to the Redux store
      engineRef.current.setStore(store);
      
      // Start the engine
      engineRef.current.start();
      
      // Set gameInitialized to true
      gameInitialized.current = true;
      
      // Use debugHelper to log initialization
      debugHelper.logDebug('Game engine initialized', { 
        canvasId: 'game-canvas',
        assetsBasePath,
        canvasSize: `${viewConfig.canvasWidth}x${viewConfig.canvasHeight}`,
        viewMode: 'player'
      });
    }
    
    return () => {
      // Stop the engine when unmounting
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  // Update canvas size when view config changes
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = viewConfig.canvasWidth;
      canvas.height = viewConfig.canvasHeight;
      
      console.log(`Canvas updated to ${viewConfig.canvasWidth}x${viewConfig.canvasHeight}, mode: player`);
    }
  }, [viewConfig.canvasWidth, viewConfig.canvasHeight]);

  // Load map when it changes
  useEffect(() => {
    if (engineRef.current && currentMap) {
      console.log('Loading current map:', currentMap);
      engineRef.current.loadMap(currentMap);
    }
  }, [currentMap]);
  
  // Load test map if no map is selected (for development purposes)
  useEffect(() => {
    const loadTestMap = async () => {
      if (engineRef.current && !currentMap) {
        try {
          console.log('No map loaded, attempting to load test map');
          
          // Try to use the gameService first
          try {
            const map = await gameService.loadMap('test-map-1');
            if (map) {
              console.log('Successfully loaded test map from gameService');
              engineRef.current.loadMap(map);
              return;
            }
          } catch (serviceError) {
            console.warn('Could not load map from gameService, trying direct fetch:', serviceError);
          }
          
          // Fallback to direct fetch from assets directory
          const response = await fetch('/assets/maps/test-map.json');
          if (!response.ok) {
            throw new Error(`Map fetch failed: ${response.status} ${response.statusText}`);
          }
          
          const testMap: TileMap = await response.json();
          console.log('Successfully loaded test map from fetch:', testMap);
          engineRef.current.loadMap(testMap);
        } catch (error) {
          console.error('Failed to load test map:', error);
        }
      }
    };
    
    loadTestMap();
  }, [currentMap]);
  
  // Pause the game when dialogue is active
  useEffect(() => {
    if (engineRef.current) {
      if (activeDialogue) {
        // Pause game when dialogue is active
        engineRef.current.stop();
      } else if (gameInitialized.current) {
        // Resume game when dialogue is inactive
        engineRef.current.start();
      }
    }
  }, [activeDialogue]);
  
  return (
    <GameContainerWrapper>
      <GameCanvas 
        id="game-canvas" 
        ref={canvasRef}
        canvasWidth={viewConfig.canvasWidth}
        canvasHeight={viewConfig.canvasHeight}
      />
    </GameContainerWrapper>
  );
};

export default GameContainer; 