import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Activity as ActivityData, ActivityQuestion } from '../../data/activityContext';
import { AppThunk } from '../index';
import { completeMission } from './moduleSlice';
import debugHelper from '../../utils/debugHelper';
import { addPointsToCurrentModule } from './moduleSlice';
import { gameStateService } from '../../services/gameStateService';

export type ActivityType = 'quiz' | 'matching' | 'conversation' | 'puzzle';

// Extend the ActivityData type to include the missionId
export interface ActivityWithMission extends ActivityData {
  missionId?: string; // Associated mission ID
}

export interface ActivityState {
  id: string;
  moduleId: string;
  type: ActivityType;
  title: string;
  description: string;
  learningObjectives: string[];
  content: Record<string, any>;
  reward: {
    points: number;
    items?: string[];
  };
  completed: boolean;
  questions: ActivityQuestion[];
  completionPoints: number;
  missionId?: string; // Associated mission ID
}

interface ActivityReducerState {
  currentActivity: ActivityWithMission | null;
  currentQuestionIndex: number;
  answers: Record<string, any>;
  questionAttempts: Record<string, number>; // Track attempts per question
  questionStates: Record<string, 'unanswered' | 'submitted' | 'correct' | 'incorrect'>; // Track question states
  completed: string[];
  active: boolean;
  score: number;
  showResults: boolean;
  conclusionDialogActive: boolean;
  activityCompletedUnderway: boolean;
}

const initialState: ActivityReducerState = {
  currentActivity: null,
  currentQuestionIndex: 0,
  answers: {},
  questionAttempts: {},
  questionStates: {},
  completed: [],
  active: false,
  score: 0,
  showResults: false,
  conclusionDialogActive: false,
  activityCompletedUnderway: false,
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    startActivity: (state, action: PayloadAction<ActivityWithMission>) => {
      debugHelper.logDebug('[activitySlice] startActivity', action.payload);
      state.currentActivity = action.payload;
      state.currentQuestionIndex = 0;
      state.answers = {};
      state.questionAttempts = {};
      state.questionStates = {};
      state.active = true;
      state.score = 0;
      state.showResults = false;
      state.conclusionDialogActive = false;
      state.activityCompletedUnderway = false;
    },
    nextQuestion: (state) => {
      if (state.currentActivity && state.currentQuestionIndex < state.currentActivity.questions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },
    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },
    answerQuestion: (state, action: PayloadAction<{ questionId: string, answer: any, questionState?: 'correct' | 'incorrect' }>) => {
      const { questionId, answer, questionState } = action.payload;
      state.answers[questionId] = answer;
      
      // Increment attempt count for this question
      state.questionAttempts[questionId] = (state.questionAttempts[questionId] || 0) + 1;
      
      if (state.currentActivity) {
        const question = state.currentActivity.questions.find(q => q.id === questionId);
        
        if (question && (question.type === 'multiple-choice' || question.type === 'drag-drop')) {
          const isCorrect = question.type === 'multiple-choice' 
            ? answer === question.correctAnswer 
            : answer === question.correctAnswer;
            
          // Update question state
          state.questionStates[questionId] = isCorrect ? 'correct' : 'incorrect';
            
          if (isCorrect) {
            state.score += 10;
          }
        } else if (question && (question.type === 'open-ended' || question.type === 'chatbot')) {
          // For AI-evaluated questions, use provided questionState or default to 'submitted'
          state.questionStates[questionId] = questionState || 'submitted';
        }
      }
      // Note: Removed automatic completion logic to allow users to see feedback on last question
      // Activity completion is now handled explicitly via finishActivity action
    },
    updateQuestionState: (state, action: PayloadAction<{ questionId: string, questionState: 'correct' | 'incorrect' }>) => {
      const { questionId, questionState } = action.payload;
      state.questionStates[questionId] = questionState;
    },
    retryQuestion: (state, action: PayloadAction<{ questionId: string }>) => {
      const { questionId } = action.payload;
      // Reset question state but keep attempt count (attempts are incremented when answering)
      delete state.answers[questionId];
      state.questionStates[questionId] = 'unanswered';
    },
    closeActivity: (state) => {
      debugHelper.logDebug('[activitySlice] closeActivity');
      state.currentActivity = null;
      state.currentQuestionIndex = 0;
      state.answers = {};
      state.questionAttempts = {};
      state.questionStates = {};
      state.active = false;
      state.score = 0;
      state.showResults = false;
      state.conclusionDialogActive = false;
      state.activityCompletedUnderway = false;
    },
    hideResults: (state) => {
      debugHelper.logDebug('[activitySlice] hideResults: Initial state', { showResults: state.showResults, conclusionDialogActive: state.conclusionDialogActive, activityCompletedUnderway: state.activityCompletedUnderway });
      state.showResults = false;
      if (state.currentActivity && state.currentActivity.conclusion && state.currentActivity.conclusion.length > 0) {
        state.conclusionDialogActive = true;
        debugHelper.logDebug('[activitySlice] hideResults: Conclusion exists. SET conclusionDialogActive = true');
      } else {
        state.activityCompletedUnderway = true;
        debugHelper.logDebug('[activitySlice] hideResults: No conclusion. SET activityCompletedUnderway = true');
      }
      debugHelper.logDebug('[activitySlice] hideResults: Final state', { showResults: state.showResults, conclusionDialogActive: state.conclusionDialogActive, activityCompletedUnderway: state.activityCompletedUnderway });
    },
    markConclusionDialogFinished: (state) => {
      debugHelper.logDebug('[activitySlice] markConclusionDialogFinished: Initial state', { conclusionDialogActive: state.conclusionDialogActive, activityCompletedUnderway: state.activityCompletedUnderway });
      state.conclusionDialogActive = false;
      state.activityCompletedUnderway = true;
      debugHelper.logDebug('[activitySlice] markConclusionDialogFinished: Final state', { conclusionDialogActive: state.conclusionDialogActive, activityCompletedUnderway: state.activityCompletedUnderway });
    },
    finalizeActivityCompletion: (state) => {
      debugHelper.logDebug('[activitySlice] finalizeActivityCompletion: Initial state', { currentActivityId: state.currentActivity?.id, activityCompletedUnderway: state.activityCompletedUnderway });
      if (state.currentActivity && state.activityCompletedUnderway) {
        if (!state.completed.includes(state.currentActivity.id)) {
          state.completed.push(state.currentActivity.id);
        }
        state.score += state.currentActivity.completionPoints;
        debugHelper.logDebug('[activitySlice] finalizeActivityCompletion: Activity data updated', { score: state.score, completed: state.completed });
      }
    },
    finishActivity: (state) => {
      debugHelper.logDebug('[activitySlice] finishActivity: Setting showResults = true');
      state.showResults = true;
    }
  }
});

export const completeCurrentActivityAndMission = (): AppThunk => 
  (dispatch, getState) => {
    debugHelper.logDebug('[activitySlice Thunk] completeCurrentActivityAndMission: START');
    
    const initialActivityState = getState().activity;
    
    if (initialActivityState.currentActivity && initialActivityState.activityCompletedUnderway) {
      debugHelper.logDebug('[activitySlice Thunk] Conditions met, proceeding with completion logic.');
      
      const currentModule = getState().module.modules.find(m => m.id === getState().module.currentModuleId);
      
      if (currentModule) {
        debugHelper.logDebug('[activitySlice Thunk] Current module found, awarding points and completing mission.');
        
        const pointsToAward = initialActivityState.currentActivity.completionPoints || 10;
        debugHelper.logDebug('[activitySlice Thunk] Dispatching addPointsToCurrentModule', { points: pointsToAward });
        dispatch(addPointsToCurrentModule(pointsToAward));

        let missionToCompleteId: string | null = null;
        const activityIdAsMissionId = initialActivityState.currentActivity.id;

        if (currentModule.missions.some(m => m.id === activityIdAsMissionId)) {
          missionToCompleteId = activityIdAsMissionId;
        } else {
          const matchingMissionByActivityIdField = currentModule.missions.find(
            m => m.activityId === initialActivityState.currentActivity!.id
          );
          if (matchingMissionByActivityIdField) {
            missionToCompleteId = matchingMissionByActivityIdField.id;
          }
        }

        if (missionToCompleteId) {
          debugHelper.logDebug('[activitySlice Thunk] Dispatching completeMission', { missionId: missionToCompleteId });
          dispatch(completeMission(missionToCompleteId));
          
          // Save game state after mission completion
          gameStateService.saveCurrentState(getState())
            .then((success) => {
              if (success) {
                debugHelper.logDebug('[activitySlice Thunk] Game state saved successfully after mission completion');
              } else {
                debugHelper.logDebug('[activitySlice Thunk] Failed to save game state after mission completion');
              }
            })
            .catch((error) => {
              debugHelper.logDebug('[activitySlice Thunk] Error saving game state after mission completion:', error);
            });
        } else {
          debugHelper.logDebug('[activitySlice Thunk] No mission found to complete for this activity', { activityId: initialActivityState.currentActivity.id });
        }
      } else {
        debugHelper.logDebug('[activitySlice Thunk] No current module found to associate mission or points.');
      }

      setTimeout(() => {
        debugHelper.logDebug('[activitySlice Thunk] Dispatching closeActivity (UI cleanup)');
        dispatch(activitySlice.actions.closeActivity());
      }, 100);

    } else {
      debugHelper.logDebug('[activitySlice Thunk] completeCurrentActivityAndMission: Conditions NOT MET or no current activity.', { 
        activityId: initialActivityState.currentActivity?.id, 
        activityCompletedUnderway: initialActivityState.activityCompletedUnderway 
      });
    }
    debugHelper.logDebug('[activitySlice Thunk] completeCurrentActivityAndMission: END');
  };

export const { 
  startActivity, 
  nextQuestion, 
  previousQuestion, 
  answerQuestion, 
  closeActivity,
  hideResults,
  markConclusionDialogFinished,
  finalizeActivityCompletion,
  finishActivity,
  updateQuestionState,
  retryQuestion
} = activitySlice.actions;

export default activitySlice.reducer; 