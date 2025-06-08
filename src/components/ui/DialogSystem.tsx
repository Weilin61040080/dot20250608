import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState, useAppDispatch } from '../../store';
import { closeDialog } from '../../store/slices/uiSlice';
import { startActivity, markConclusionDialogFinished } from '../../store/slices/activitySlice';
import debugHelper from '../../utils/debugHelper';

// Helper to get the correct asset path based on environment
const getAssetBasePath = () => {
  const publicUrl = process.env.PUBLIC_URL || '';
  return `${publicUrl}/assets/`;
};

const DialogContainer = styled(motion.div)<{
  canvasWidth: number;
  canvasHeight: number;
  containerWidth: number;
  containerHeight: number;
  dialogLeft: number;
  dialogBottom: number;
}>`
  position: fixed;
  bottom: ${props => props.dialogBottom}px;
  left: ${props => props.dialogLeft}px;
  width: ${props => props.containerWidth * 0.6}px;
  max-width: 800px;
  height: 235px; /* Changed from 220px to 235px */
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #4a90e2;
  border-radius: 8px;
  padding: 20px;
  padding-left: 160px; /* Reduced from 200px to 160px since avatar moved closer (from -180px to -120px) */
  z-index: 1000;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  flex-direction: column;
`;

const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const DialogTitle = styled.h3`
  margin: 0;
  color: var(--primary-color);
  font-size: 1.5rem;
`;

const DialogContent = styled.div`
  margin-bottom: 20px;
  line-height: 1.6;
  font-size: 1.1rem;
  flex: 1; /* Take up available space */
  overflow-y: auto; /* Allow scrolling if content is too long */
  max-height: 150px; /* Increased from 80px to 150px to accommodate longer text in the taller dialog */
`;

const DialogOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end; /* Align buttons to the right */
`;

const DialogOption = styled.button`
  background-color: rgba(50, 50, 50, 0.8);
  color: white;
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 120px;
  
  &:hover {
    background-color: var(--primary-color);
  }
`;

const DialogPortrait = styled.div`
  position: absolute;
  left: -120px; /* Moved more to the right: changed from -180px to -120px */
  bottom: 0px; /* Align bottom of avatar with bottom of dialog UI: changed from -60px to 0px */
  width: 240px; /* 20% smaller: reduced from 300px to 240px */
  height: 320px; /* 20% smaller: reduced from 400px to 320px */
  background-color: transparent; /* Transparent background since images have transparent backgrounds */
  background-size: contain; /* Use contain to preserve aspect ratio and show full image */
  background-position: center bottom; /* Align to bottom center */
  background-repeat: no-repeat;
  z-index: 1001; /* Above the dialog */
`;

const DialogSpeakerContainer = styled.div`
  margin-bottom: 16px;
`;

const DialogSpeaker = styled.div`
  font-weight: bold;
  color: var(--primary-color);
  font-size: 1.2rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const DialogSystem: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dialogOpen, dialogData, viewConfig } = useSelector((state: RootState) => state.ui);
  const [contentIndex, setContentIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 1024,
    height: 768
  });
  
  const [dialogPosition, setDialogPosition] = useState({
    left: 512,
    bottom: 40
  });
  
  // Update container dimensions when component mounts or window resizes
  useEffect(() => {
    const updateDimensions = () => {
      // Get the actual canvas element for more accurate positioning
      const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
      
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: rect.height
        });
        
        // Position dialog with 20% padding from left edge of canvas
        const dialogLeft = rect.left + (rect.width * 0.2); // 20% padding from left edge of canvas
        const dialogBottom = window.innerHeight - rect.bottom + 320; // Increased from 120px to 320px padding from canvas bottom
        
        setDialogPosition({
          left: dialogLeft,
          bottom: dialogBottom
        });
        
        // Debug logging
        console.log('Canvas positioning (20% left padding, 60% width):', {
          canvasRect: rect,
          dialogLeft,
          dialogBottom,
          canvasLeft: rect.left,
          leftPadding: rect.width * 0.2,
          dialogWidth: rect.width * 0.6,
          windowHeight: window.innerHeight
        });
      } else {
        // Fallback to game container
        const gameContainer = document.querySelector('[data-testid="game-container"]') || 
                             document.querySelector('.game-container') ||
                             document.body;
        
        if (gameContainer) {
          const rect = gameContainer.getBoundingClientRect();
          setContainerDimensions({
            width: rect.width,
            height: rect.height
          });
          
          // Fallback positioning
          setDialogPosition({
            left: rect.left + (rect.width * 0.2),
            bottom: window.innerHeight - rect.bottom + 320  // Increased from 120px to 320px
          });
        }
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
      // Get the actual canvas element for more accurate positioning
      const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
      
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: rect.height
        });
        
        // Position dialog with 20% padding from left edge of canvas
        const dialogLeft = rect.left + (rect.width * 0.2); // 20% padding from left edge of canvas
        const dialogBottom = window.innerHeight - rect.bottom + 320; // Increased from 120px to 320px padding from canvas bottom
        
        setDialogPosition({
          left: dialogLeft,
          bottom: dialogBottom
        });
        
        // Debug logging
        console.log('Canvas positioning (20% left padding, 60% width, viewConfig change):', {
          canvasRect: rect,
          dialogLeft,
          dialogBottom,
          canvasLeft: rect.left,
          leftPadding: rect.width * 0.2,
          dialogWidth: rect.width * 0.6,
          windowHeight: window.innerHeight
        });
      } else {
        // Fallback to game container
        const gameContainer = document.querySelector('[data-testid="game-container"]') || 
                             document.querySelector('.game-container') ||
                             document.body;
        
        if (gameContainer) {
          const rect = gameContainer.getBoundingClientRect();
          setContainerDimensions({
            width: rect.width,
            height: rect.height
          });
          
          // Fallback positioning
          setDialogPosition({
            left: rect.left + (rect.width * 0.2),
            bottom: window.innerHeight - rect.bottom + 320  // Increased from 120px to 320px
          });
        }
      }
    };
    
    // Small delay to ensure canvas has been resized
    const timeoutId = setTimeout(updateDimensions, 100);
    return () => clearTimeout(timeoutId);
  }, [viewConfig.canvasWidth, viewConfig.canvasHeight]);
  
  useEffect(() => {
    setContentIndex(0);
    if (dialogData) {
      debugHelper.logDebug('[DialogSystem] Dialog opened/changed', {
        type: dialogData.type,
        title: dialogData.title,
        speaker: dialogData.speaker,
        portraitUrl: dialogData.portraitUrl
      });
    }
  }, [dialogData]);
  
  if (!dialogOpen || !dialogData) return null;
  
  const executeActionAndClose = () => {
    if (dialogData.type === 'conclusion') {
      debugHelper.logDebug('[DialogSystem] Conclusion dialog: dispatching markConclusionDialogFinished.');
      dispatch(markConclusionDialogFinished());
    } else if (dialogData.activityId && dialogData.npcId) {
      debugHelper.logDebug('[DialogSystem] NPC Intro: Starting activity', { activityId: dialogData.activityId });
      try {
        const { getActivityById } = require('../../data/activityContext');
        const activity = getActivityById(dialogData.activityId);
        if (activity) {
          const missionIdToUse = dialogData.missionId || dialogData.activityId;
          const activityWithMission = { ...activity, missionId: missionIdToUse };
          dispatch(startActivity(activityWithMission));
        } else {
          debugHelper.logDebug('[DialogSystem] Activity not found for intro action', { activityId: dialogData.activityId });
        }
      } catch (error) {
        console.error('[DialogSystem] Error starting activity:', error);
      }
    }
    dispatch(closeDialog());
  };
  
  const handleNext = () => {
    const isLastContent = !(Array.isArray(dialogData.content) && contentIndex < dialogData.content.length - 1);
    debugHelper.logDebug('[DialogSystem] handleNext', { type: dialogData.type, isLastContent, contentIndex });

    if (isLastContent) {
      executeActionAndClose();
    } else {
      setContentIndex(contentIndex + 1);
    }
  };
  
  const handleOptionClick = (action: string) => {
    debugHelper.logDebug('[DialogSystem] handleOptionClick', { action, type: dialogData.type });
    executeActionAndClose();
  };
  
  const handleCloseButton = () => {
    debugHelper.logDebug('[DialogSystem] handleCloseButton (X button)', { type: dialogData.type });
    if (dialogData.type === 'conclusion') {
      dispatch(markConclusionDialogFinished());
    }
    dispatch(closeDialog());
  };
  
  const currentDialogPageContent = Array.isArray(dialogData.content)
    ? dialogData.content[contentIndex]
    : dialogData.content;
  
  let buttonText = 'Continue →';
  if (dialogData.type === 'conclusion') {
    buttonText = Array.isArray(dialogData.content) && contentIndex < dialogData.content.length - 1 ? 'Next' : 'Finish';
  } else if (!Array.isArray(dialogData.content) || contentIndex === dialogData.content.length - 1) {
    if (dialogData.activityId) {
      buttonText = 'Start Activity';
    } else if (dialogData.options && dialogData.options.length > 0) {
    } else {
      buttonText = 'Close';
    }
  }
  
  return (
    <AnimatePresence>
      {dialogOpen && (
        <DialogContainer
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          canvasWidth={viewConfig.canvasWidth}
          canvasHeight={viewConfig.canvasHeight}
          containerWidth={containerDimensions.width}
          containerHeight={containerDimensions.height}
          dialogLeft={dialogPosition.left}
          dialogBottom={dialogPosition.bottom}
        >
          {/* Large avatar positioned outside dialog */}
          {dialogData.npcId && (
            <DialogPortrait 
              style={{ 
                backgroundImage: `url(${getAssetBasePath()}maps/test-map/thumbnail/${dialogData.npcId}-avatar.png)` 
              }} 
            />
          )}
          
          <DialogHeader>
            <DialogTitle>{dialogData.title}</DialogTitle>
            <CloseButton onClick={handleCloseButton}>×</CloseButton>
          </DialogHeader>
          
          {/* NPC name (if different from title) */}
          {dialogData.speaker && dialogData.speaker !== dialogData.title && (
            <DialogSpeakerContainer>
              <DialogSpeaker>{dialogData.speaker}</DialogSpeaker>
            </DialogSpeakerContainer>
          )}
          
          <DialogContent>{currentDialogPageContent}</DialogContent>
          
          {dialogData.options ? (
            <DialogOptions>
              {dialogData.options.map((option, index) => (
                <DialogOption key={index} onClick={() => handleOptionClick(option.action)}>
                  {option.text}
                </DialogOption>
              ))}
            </DialogOptions>
          ) : (
            <DialogOptions>
              <DialogOption onClick={handleNext}>{buttonText}</DialogOption>
            </DialogOptions>
          )}
        </DialogContainer>
      )}
    </AnimatePresence>
  );
};

export default DialogSystem; 