/**
 * Analytics Helper Functions
 * Utilities to integrate analytics tracking with existing game state
 * Updated to use standardized analytics format
 */

import { 
  AnalyticsEvaluation, 
  AnalyticsFeedback
} from '../../types/Analytics';
import { 
  ActivityQuestion, 
  MultipleChoiceQuestion, 
  DragDropQuestion, 
  OpenEndedQuestion, 
  ChatbotQuestion 
} from '../../data/activityContext';
import { analyticsTracker } from './analyticsTracker';

/**
 * Extract module name from current Redux state
 */
export const getCurrentModuleName = (state: any): string => {
  // Try to get module name from current module
  if (state.module?.currentModuleId && state.module?.modules) {
    const currentModule = state.module.modules.find(
      (m: any) => m.id === state.module.currentModuleId
    );
    if (currentModule) {
      return currentModule.title || currentModule.id;
    }
  }
  
  // Fallback to a default name
  return 'Unknown Module';
};

/**
 * Convert activity question to analytics question type
 */
export const getQuestionType = (question: ActivityQuestion): 'multiple-choice' | 'drag-drop' | 'open-ended' | 'chatbot' => {
  return question.type;
};

/**
 * Create evaluation object for multiple choice questions
 */
export const createMultipleChoiceEvaluation = (
  question: MultipleChoiceQuestion, 
  userAnswer: number
): AnalyticsEvaluation => {
  const isCorrect = userAnswer === question.correctAnswer;
  return {
    isPartialCorrect: !isCorrect, // Note: isPartialCorrect means NOT fully correct
    score: isCorrect ? 1 : 0,
    maxScore: 1
  };
};

/**
 * Create evaluation object for drag and drop questions
 */
export const createDragDropEvaluation = (
  question: DragDropQuestion, 
  userAnswer: string
): AnalyticsEvaluation => {
  const isCorrect = userAnswer === question.correctAnswer;
  return {
    isPartialCorrect: !isCorrect, // Note: isPartialCorrect means NOT fully correct
    score: isCorrect ? 1 : 0,
    maxScore: 1
  };
};

/**
 * Create evaluation object for open-ended questions
 * This would typically come from AI evaluation, but we'll create a basic version
 */
export const createOpenEndedEvaluation = (
  question: OpenEndedQuestion,
  userAnswer: string,
  aiEvaluation?: any
): AnalyticsEvaluation => {
  if (aiEvaluation) {
    // Check if this is the AI evaluation format from OpenEndedActivity
    if (aiEvaluation.rubrics && Array.isArray(aiEvaluation.rubrics)) {
      // Convert from OpenEndedActivity format to analytics format
      const rubric = aiEvaluation.rubrics.map((r: any) => ({
        criteria: r.description,
        passed: r.met,
        feedback: r.explanation || `This criteria was ${r.met ? 'met' : 'not met'}`
      }));

      return {
        isPartialCorrect: aiEvaluation.status === 'partial',
        rubric,
        score: aiEvaluation.metCount || 0,
        maxScore: aiEvaluation.totalCount || rubric.length
      };
    }
    
    // Check if this is already in the correct analytics format
    if (aiEvaluation.rubric && Array.isArray(aiEvaluation.rubric)) {
      return {
        isPartialCorrect: aiEvaluation.isPartialCorrect || false,
        rubric: aiEvaluation.rubric,
        score: aiEvaluation.score,
        maxScore: aiEvaluation.maxScore || 1
      };
    }
  }

  // Basic content-based evaluation as fallback
  const answerLength = userAnswer.trim().length;
  const hasSubstantialContent = answerLength >= 50;
  const hasExamples = userAnswer.toLowerCase().includes('example') || userAnswer.toLowerCase().includes('for instance');
  
  const score = (hasSubstantialContent ? 1 : 0) + (hasExamples ? 1 : 0);
  const maxScore = 2;
  const isPartialCorrect = score < maxScore;

  return {
    isPartialCorrect,
    score,
    maxScore,
    rubric: [
      {
        criteria: 'Substantial content (50+ characters)',
        passed: hasSubstantialContent,
        feedback: hasSubstantialContent ? 'Answer has substantial content' : 'Answer needs more detail'
      },
      {
        criteria: 'Includes examples or explanations',
        passed: hasExamples,
        feedback: hasExamples ? 'Answer includes examples' : 'Answer could benefit from examples'
      }
    ]
  };
};

/**
 * Create evaluation object for chatbot questions
 */
export const createChatbotEvaluation = (
  question: ChatbotQuestion,
  userMessage: string,
  aiEvaluation?: any
): AnalyticsEvaluation => {
  if (aiEvaluation) {
    // Check if this is the AI evaluation format from ChatbotActivity
    if (aiEvaluation.rubrics && Array.isArray(aiEvaluation.rubrics)) {
      // Convert from ChatbotActivity format to analytics format
      const rubric = aiEvaluation.rubrics.map((r: any) => ({
        criteria: r.description,
        passed: r.met,
        feedback: r.feedback || r.explanation || `This criteria was ${r.met ? 'met' : 'not met'}`
      }));

      return {
        isPartialCorrect: aiEvaluation.status === 'partial',
        rubric,
        score: aiEvaluation.metCount || 0,
        maxScore: aiEvaluation.totalCount || rubric.length
      };
    }
    
    // Check if this is already in the correct analytics format
    if (aiEvaluation.rubric && Array.isArray(aiEvaluation.rubric)) {
      return {
        isPartialCorrect: aiEvaluation.isPartialCorrect || false,
        rubric: aiEvaluation.rubric,
        score: aiEvaluation.score,
        maxScore: aiEvaluation.maxScore || 1
      };
    }
  }

  // Basic evaluation based on message length and content
  const messageLength = userMessage.trim().length;
  const hasQuestion = userMessage.includes('?');
  const isSubstantial = messageLength > 10;

  const score = (hasQuestion ? 1 : 0) + (isSubstantial ? 1 : 0);
  const maxScore = 2;

  return {
    isPartialCorrect: score < maxScore, // Partial if not perfect score
    score,
    maxScore,
    rubric: [
      {
        criteria: 'Contains a question',
        passed: hasQuestion,
        feedback: hasQuestion ? 'Message contains a question mark' : 'Message does not contain a question'
      },
      {
        criteria: 'Substantial content',
        passed: isSubstantial,
        feedback: isSubstantial ? 'Message has substantial content' : 'Message is too short'
      }
    ]
  };
};

/**
 * Create feedback object from question explanation
 */
export const createFeedback = (
  question: ActivityQuestion,
  userAnswer: any,
  evaluation: AnalyticsEvaluation,
  actualFeedback?: string,
  aiEvaluation?: any
): AnalyticsFeedback => {
  const feedback: AnalyticsFeedback = {
    rubric: evaluation.rubric
  };

  // Add targeted feedback based on question type
  if (question.type === 'multiple-choice' || question.type === 'drag-drop') {
    feedback.targeted_feedback = actualFeedback || 'Generic feedback for this question type.';
  }

  // For AI-evaluated questions (open-ended and chatbot), check if we have AI feedback
  if ((question.type === 'open-ended' || question.type === 'chatbot')) {
    // First, try to get overall feedback from aiEvaluation (direct from AI response)
    if (aiEvaluation && aiEvaluation.feedback) {
      feedback.overall_feedback = aiEvaluation.feedback;
    }
    // Second, check if userAnswer contains AI evaluation with feedback
    else if (typeof userAnswer === 'object' && userAnswer.evaluation && userAnswer.evaluation.feedback) {
      feedback.overall_feedback = userAnswer.evaluation.feedback;
    } 
    // Third, use actualFeedback if provided
    else if (actualFeedback) {
      feedback.overall_feedback = actualFeedback;
    }
    // Finally, generate overall feedback based on evaluation
    else {
      if (!evaluation.isPartialCorrect && evaluation.score === evaluation.maxScore) {
        feedback.overall_feedback = 'Excellent! You got this question completely right.';
      } else if (evaluation.score && evaluation.score > 0) {
        feedback.overall_feedback = 'Good attempt! You got some parts right, but there\'s room for improvement.';
      } else {
        feedback.overall_feedback = 'Not quite right. Review the explanation and try to understand the concept better.';
      }
    }
  } else {
    // Add overall feedback based on evaluation for non-AI questions
    if (!evaluation.isPartialCorrect && evaluation.score === evaluation.maxScore) {
      feedback.overall_feedback = 'Excellent! You got this question completely right.';
    } else if (evaluation.score && evaluation.score > 0) {
      feedback.overall_feedback = 'Good attempt! You got some parts right, but there\'s room for improvement.';
    } else {
      feedback.overall_feedback = 'Not quite right. Review the explanation and try to understand the concept better.';
    }
  }

  return feedback;
};

/**
 * Get user input as string for analytics (used by tracker internally)
 */
export const getUserInputString = (question: ActivityQuestion, userAnswer: any): string => {
  switch (question.type) {
    case 'multiple-choice':
      const mcQuestion = question as MultipleChoiceQuestion;
      return typeof userAnswer === 'number' && mcQuestion.options[userAnswer] 
        ? mcQuestion.options[userAnswer] 
        : String(userAnswer);
    
    case 'drag-drop':
      const ddQuestion = question as DragDropQuestion;
      if (typeof userAnswer === 'string' && ddQuestion.options) {
        const selectedOption = ddQuestion.options.find(opt => opt.id === userAnswer);
        return selectedOption ? selectedOption.text : userAnswer;
      }
      return String(userAnswer);
    
    case 'open-ended':
      if (typeof userAnswer === 'object' && userAnswer.text) {
        return userAnswer.text;
      }
      return String(userAnswer);
    
    case 'chatbot':
      if (typeof userAnswer === 'object' && userAnswer.text) {
        return userAnswer.text;
      }
      return String(userAnswer);
    
    default:
      return String(userAnswer);
  }
};

/**
 * Track activity start using standardized format
 */
export const trackActivityStart = async (
  activityId: string,
  moduleName: string,
  totalQuestions: number
): Promise<void> => {
  await analyticsTracker.trackActivityStart({
    activityId,
    moduleName,
    totalQuestions
  });
};

/**
 * Track activity completion using standardized format
 */
export const trackActivityComplete = async (
  activityId: string,
  moduleName: string,
  totalQuestions: number,
  questionsAnswered: number,
  finalScore: number,
  maxPossibleScore: number
): Promise<void> => {
  await analyticsTracker.trackActivityComplete({
    activityId,
    moduleName,
    totalQuestions,
    questionsAnswered,
    finalScore,
    maxPossibleScore
  });
};

/**
 * Track question answer using standardized format
 */
export const trackQuestionAnswer = async (
  activityId: string,
  question: ActivityQuestion,
  userAnswer: any,
  moduleName: string,
  aiEvaluation?: any,
  actualFeedback?: string
): Promise<void> => {
  // Create evaluation based on question type
  let evaluation: AnalyticsEvaluation;
  
  switch (question.type) {
    case 'multiple-choice':
      evaluation = createMultipleChoiceEvaluation(question as MultipleChoiceQuestion, userAnswer);
      break;
    case 'drag-drop':
      evaluation = createDragDropEvaluation(question as DragDropQuestion, userAnswer);
      break;
    case 'open-ended':
      const openEndedAnswer = typeof userAnswer === 'object' ? userAnswer.text : userAnswer;
      evaluation = createOpenEndedEvaluation(question as OpenEndedQuestion, openEndedAnswer, aiEvaluation);
      break;
    case 'chatbot':
      const chatAnswer = typeof userAnswer === 'object' ? userAnswer.text : userAnswer;
      evaluation = createChatbotEvaluation(question as ChatbotQuestion, chatAnswer, aiEvaluation);
      break;
    default:
      evaluation = { isPartialCorrect: true, score: 0, maxScore: 1 };
  }

  // Create feedback with actual feedback if provided
  const feedback = createFeedback(question, userAnswer, evaluation, actualFeedback, aiEvaluation);

  // Get question options for input extraction
  let questionOptions: any[] | undefined;
  if (question.type === 'multiple-choice') {
    questionOptions = (question as MultipleChoiceQuestion).options;
  } else if (question.type === 'drag-drop') {
    questionOptions = (question as DragDropQuestion).options;
  }

  // Track the answer
  await analyticsTracker.trackSubmitAnswer({
    activityId,
    questionId: question.id,
    questionType: question.type,
    answer: userAnswer,
    evaluation,
    feedback,
    moduleName,
    questionOptions
  });
};

/**
 * Track hint request using standardized format
 */
export const trackHintRequest = async (
  activityId: string,
  questionId: string,
  questionType: 'multiple-choice' | 'drag-drop' | 'open-ended' | 'chatbot',
  hintLevel: number,
  hint: string,
  moduleName: string
): Promise<void> => {
  await analyticsTracker.trackAskForHint({
    activityId,
    questionId,
    questionType,
    hintLevel,
    hint,
    moduleName
  });
};

/**
 * Start question timer
 */
export const startQuestionTimer = (activityId: string, questionId: string): void => {
  analyticsTracker.startQuestionTimer(activityId, questionId);
};

/**
 * Stop question timer and return elapsed time
 */
export const stopQuestionTimer = (activityId: string, questionId: string): number | undefined => {
  return analyticsTracker.stopQuestionTimer(activityId, questionId);
}; 