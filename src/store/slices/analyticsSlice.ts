import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../index';
import { 
  trackActivityStart, 
  trackActivityComplete, 
  trackQuestionAnswer,
  trackHintRequest,
  startQuestionTimer,
  stopQuestionTimer,
  getCurrentModuleName 
} from '../../services/analytics/helpers';
import { ActivityQuestion } from '../../data/activityContext';
import debugHelper from '../../utils/debugHelper';

interface AnalyticsState {
  enabled: boolean;
  sessionId: string;
  currentActivityId: string | null;
  questionTimers: Record<string, number>; // questionId -> startTime
  eventsLogged: number;
  lastEventTime: string | null;
}

const initialState: AnalyticsState = {
  enabled: true,
  sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  currentActivityId: null,
  questionTimers: {},
  eventsLogged: 0,
  lastEventTime: null
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setEnabled: (state, action: PayloadAction<boolean>) => {
      state.enabled = action.payload;
      debugHelper.logDebug(`Analytics ${action.payload ? 'enabled' : 'disabled'}`, {});
    },
    setCurrentActivity: (state, action: PayloadAction<string | null>) => {
      state.currentActivityId = action.payload;
    },
    startQuestionTimer: (state, action: PayloadAction<{ questionId: string }>) => {
      const { questionId } = action.payload;
      state.questionTimers[questionId] = Date.now();
    },
    stopQuestionTimer: (state, action: PayloadAction<{ questionId: string }>) => {
      const { questionId } = action.payload;
      delete state.questionTimers[questionId];
    },
    incrementEventCount: (state) => {
      state.eventsLogged += 1;
      state.lastEventTime = new Date().toISOString();
    },
    resetSession: (state) => {
      state.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      state.currentActivityId = null;
      state.questionTimers = {};
      state.eventsLogged = 0;
      state.lastEventTime = null;
    }
  }
});

// Thunk actions for analytics tracking
export const trackActivityStartThunk = (
  activityId: string,
  totalQuestions: number
): AppThunk => async (dispatch, getState) => {
  const state = getState();
  
  if (!state.analytics.enabled) return;

  try {
    dispatch(analyticsSlice.actions.setCurrentActivity(activityId));
    
    const moduleName = getCurrentModuleName(state);
    
    await trackActivityStart(
      activityId,
      moduleName,
      totalQuestions
    );
    
    dispatch(analyticsSlice.actions.incrementEventCount());
    debugHelper.logDebug('Activity start tracked', { activityId, moduleName });
  } catch (error) {
    console.error('Failed to track activity start:', error);
  }
};

export const trackActivityCompleteThunk = (
  activityId: string,
  totalQuestions: number,
  questionsAnswered: number,
  finalScore: number,
  maxPossibleScore: number
): AppThunk => async (dispatch, getState) => {
  const state = getState();
  
  if (!state.analytics.enabled) return;

  try {
    const moduleName = getCurrentModuleName(state);
    
    await trackActivityComplete(
      activityId,
      moduleName,
      totalQuestions,
      questionsAnswered,
      finalScore,
      maxPossibleScore
    );
    
    dispatch(analyticsSlice.actions.incrementEventCount());
    dispatch(analyticsSlice.actions.setCurrentActivity(null));
    debugHelper.logDebug('Activity completion tracked', { 
      activityId, 
      finalScore, 
      maxPossibleScore 
    });
  } catch (error) {
    console.error('Failed to track activity completion:', error);
  }
};

export const trackQuestionAnswerThunk = (
  activityId: string,
  question: ActivityQuestion,
  userAnswer: any,
  aiEvaluation?: any,
  actualFeedback?: string
): AppThunk => async (dispatch, getState) => {
  const state = getState();
  
  if (!state.analytics.enabled) return;

  try {
    // Stop the question timer if it was running
    dispatch(analyticsSlice.actions.stopQuestionTimer({ questionId: question.id }));
    stopQuestionTimer(activityId, question.id);
    
    const moduleName = getCurrentModuleName(state);
    
    await trackQuestionAnswer(
      activityId,
      question,
      userAnswer,
      moduleName,
      aiEvaluation,
      actualFeedback
    );
    
    dispatch(analyticsSlice.actions.incrementEventCount());
    debugHelper.logDebug('Question answer tracked', { 
      activityId, 
      questionId: question.id,
      questionType: question.type 
    });
  } catch (error) {
    console.error('Failed to track question answer:', error);
  }
};

export const startQuestionTimerThunk = (
  activityId: string,
  questionId: string
): AppThunk => (dispatch, getState) => {
  const state = getState();
  
  if (!state.analytics.enabled) return;

  try {
    dispatch(analyticsSlice.actions.startQuestionTimer({ questionId }));
    startQuestionTimer(activityId, questionId);
    debugHelper.logDebug('Question timer started', { activityId, questionId });
  } catch (error) {
    console.error('Failed to start question timer:', error);
  }
};

export const trackHintRequestThunk = (
  activityId: string,
  questionId: string,
  questionType: 'multiple-choice' | 'drag-drop' | 'open-ended' | 'chatbot',
  hintLevel: number,
  hint: string
): AppThunk => async (dispatch, getState) => {
  const state = getState();
  
  if (!state.analytics.enabled) return;

  try {
    const moduleName = getCurrentModuleName(state);
    
    await trackHintRequest(
      activityId,
      questionId,
      questionType,
      hintLevel,
      hint,
      moduleName
    );
    
    dispatch(analyticsSlice.actions.incrementEventCount());
    debugHelper.logDebug('Hint request tracked', { 
      activityId, 
      questionId,
      hintLevel 
    });
  } catch (error) {
    console.error('Failed to track hint request:', error);
  }
};

export const { 
  setEnabled, 
  setCurrentActivity, 
  incrementEventCount, 
  resetSession 
} = analyticsSlice.actions;

export default analyticsSlice.reducer; 