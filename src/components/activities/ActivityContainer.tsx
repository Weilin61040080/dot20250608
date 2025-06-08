import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../../store';
import { useAppDispatch } from '../../store';
import { 
  hideResults, 
  completeCurrentActivityAndMission,
  closeActivity,
  finalizeActivityCompletion
} from '../../store/slices/activitySlice';
import { openDialog } from '../../store/slices/uiSlice';
import { addPointsToCurrentModule } from '../../store/slices/moduleSlice';
import { 
  trackActivityStartThunk, 
  trackActivityCompleteThunk 
} from '../../store/slices/analyticsSlice';
import MultipleChoiceActivity from './MultipleChoiceActivity';
import DragDropActivity from './DragDropActivity';
import OpenEndedActivity from './OpenEndedActivity';
import ChatbotActivity from './ChatbotActivity';
import { ActivityQuestion } from '../../data/activityContext';
import { NPC } from '../../types/MapData';
import debugHelper from '../../utils/debugHelper';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ContentContainer = styled(motion.div)`
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  padding: 16px 24px;
  background-color: var(--primary-color);
  color: white;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Content = styled.div`
  padding: 0;
`;

const ResultsContainer = styled.div`
  padding: 24px;
  text-align: center;
`;

const ResultsTitle = styled.h2`
  color: var(--primary-color);
  margin-bottom: 16px;
`;

const ResultsScore = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 24px;
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--secondary-color);
  }
`;

const ActivityContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    currentActivity, 
    currentQuestionIndex,
    showResults, 
    score, 
    active,
    conclusionDialogActive,
    activityCompletedUnderway,
    answers
  } = useSelector((state: RootState) => state.activity);
  const currentMap = useSelector((state: RootState) => state.game.currentMap);
  
  const pointsAwardedForCurrentResults = useRef(false);
  const activityStartTracked = useRef(false);

  // Track activity start
  useEffect(() => {
    if (currentActivity && active && !activityStartTracked.current) {
      debugHelper.logDebug('[ActivityContainer] Tracking activity start', { 
        activityId: currentActivity.id,
        totalQuestions: currentActivity.questions.length
      });
      
      dispatch(trackActivityStartThunk(
        currentActivity.id,
        currentActivity.questions.length
      ));
      
      activityStartTracked.current = true;
    }
  }, [currentActivity, active, dispatch]);

  // Reset tracking flag when activity changes
  useEffect(() => {
    if (!active || !currentActivity) {
      activityStartTracked.current = false;
    }
  }, [active, currentActivity]);

  useEffect(() => {
    if (currentActivity) {
      debugHelper.logDebug('Activity state updated in ActivityContainer', { 
        active,
        activityId: currentActivity.id, 
        showResults,
        conclusionDialogActive,
        activityCompletedUnderway,
        totalQuestions: currentActivity.questions.length,
        currentMapId: currentMap?.mapId
      });
    }
  }, [currentActivity, active, showResults, conclusionDialogActive, activityCompletedUnderway, currentMap]);

  useEffect(() => {
    if (conclusionDialogActive && currentActivity && currentActivity.conclusion && currentActivity.conclusion.length > 0 && currentMap?.npcs) {
      const npc = currentMap.npcs.find((n: NPC) => n.id === currentActivity.npcId);
      const npcName = npc?.name || 'Activity Conclusion';
      const npcAssetPath = npc?.assetPath;

      debugHelper.logDebug('[ActivityContainer] Conclusion dialog active, opening dialog with full NPC info.', {
        activityId: currentActivity.id,
        npcId: npc?.id,
        npcName,
        npcAssetPath
      });

      dispatch(openDialog({
        type: 'conclusion',
        title: npcName,
        speaker: npcName,
        portraitUrl: npcAssetPath,
        content: currentActivity.conclusion,
        npcId: currentActivity.npcId,
      }));
    }
  }, [conclusionDialogActive, currentActivity, currentMap, dispatch]);

  useEffect(() => {
    if (activityCompletedUnderway && currentActivity) {
      debugHelper.logDebug('[ActivityContainer] Activity completion underway, dispatching thunk.', { activityId: currentActivity.id });
      dispatch(completeCurrentActivityAndMission());
    }
  }, [activityCompletedUnderway, currentActivity, dispatch]);

  useEffect(() => {
    if (showResults && currentActivity && !pointsAwardedForCurrentResults.current) {
      dispatch(finalizeActivityCompletion());
      
      const pointsFromQuestions = score;
      const completionPoints = currentActivity.completionPoints || 0;
      const totalPointsForActivity = pointsFromQuestions + completionPoints;

      debugHelper.logDebug('[ActivityContainer] showResults is true. Awarding points.', {
        scoreFromQuestions: pointsFromQuestions,
        completionPoints,
        totalPointsForActivity,
        activityId: currentActivity.id
      });

      // Track activity completion
      const answeredQuestions = Object.keys(answers || {}).length;
      dispatch(trackActivityCompleteThunk(
        currentActivity.id,
        currentActivity.questions.length,
        answeredQuestions,
        score,
        currentActivity.questions.length * 10 // Assuming max 10 points per question
      ));

      if (totalPointsForActivity > 0) {
        dispatch(addPointsToCurrentModule(totalPointsForActivity));
      }
      pointsAwardedForCurrentResults.current = true;
    }
  }, [showResults, currentActivity, score, answers, dispatch]);

  useEffect(() => {
    if (!active || !currentActivity) {
      pointsAwardedForCurrentResults.current = false;
    }
  }, [active, currentActivity]);
  
  if (!active || !currentActivity) {
    return null;
  }
  
  const handleManualClose = () => {
    debugHelper.logDebug('[ActivityContainer] Manually closing activity.', { activityId: currentActivity.id });
    dispatch(closeActivity());
  };
  
  const handleContinueFromResults = () => {
    debugHelper.logDebug('[ActivityContainer] Continue from results clicked.', { activityId: currentActivity.id });
    dispatch(hideResults()); 
  };
  
  const currentQuestion = currentActivity.questions[currentQuestionIndex] as ActivityQuestion;
  
  const renderQuestion = () => {
    if (!currentQuestion) {
      debugHelper.logDebug('No current question found in renderQuestion', {
        questionIndex: currentQuestionIndex,
        totalQuestions: currentActivity.questions.length
      });
      return null;
    }
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return <MultipleChoiceActivity question={currentQuestion} />;
      case 'drag-drop':
        return <DragDropActivity question={currentQuestion} />;
      case 'open-ended':
        return <OpenEndedActivity question={currentQuestion} />;
      case 'chatbot':
        return <ChatbotActivity question={currentQuestion} />;
      default:
        return <div>Unsupported activity type</div>;
    }
  };
  
  let contentToRender;
  if (showResults) {
    contentToRender = (
      <ResultsContainer>
        <ResultsTitle>Activity Completed!</ResultsTitle>
        <ResultsScore>Score: {score}</ResultsScore>
        <p>You've earned {currentActivity.completionPoints} completion points!</p>
        <Button onClick={handleContinueFromResults}> 
          Continue
        </Button>
      </ResultsContainer>
    );
  } else if (conclusionDialogActive) {
    contentToRender = null;
    debugHelper.logDebug('[ActivityContainer] Conclusion dialog is active, suppressing question/results rendering.');
  } else if (!activityCompletedUnderway) {
    contentToRender = renderQuestion();
  } else {
    contentToRender = null;
    debugHelper.logDebug('[ActivityContainer] Activity completion underway or post-conclusion, suppressing question rendering to prevent flicker.');
  }

  return (
    <AnimatePresence>
      {active && !conclusionDialogActive && !activityCompletedUnderway && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ContentContainer
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <Header>
              <Title>{currentActivity.title}</Title>
              <CloseButton onClick={handleManualClose}>×</CloseButton>
            </Header>
            <Content>
              {contentToRender}
            </Content>
          </ContentContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default ActivityContainer; 