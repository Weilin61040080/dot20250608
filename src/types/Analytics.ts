/**
 * Learning Analytics Types
 * Defines the data structures for tracking learner interactions and progress
 * All events use a standardized format with consistent columns
 */

// Action types that can be tracked
export enum AnalyticsAction {
  SUBMIT_ANSWER = 'SubmitAnswer',
  ASK_FOR_HINT = 'AskForHint',
  ACTIVITY_START = 'ActivityStart',
  ACTIVITY_COMPLETE = 'ActivityComplete'
}

// Legacy lifecycle event types (kept for backward compatibility)
export enum ActivityLifecycleType {
  START = 'start',
  COMPLETE = 'complete'
}

// Standardized Analytics Event Structure
// All events follow this exact format for consistency
export interface StandardAnalyticsEvent {
  activityId: string;
  assignmentId?: string;
  studentId?: string;
  moduleName: string;
  classId?: string;
  action: AnalyticsAction;
  input: string; // Learner's input or empty string for activity start/complete events
  evaluation: boolean | null; // true/false for SubmitAnswer, null for others
  feedback: any; // Feedback content based on action type
  attemptCreatedAt: string; // ISO-8601 timestamp
  startedAt: string | null; // ISO-8601 timestamp - always present, null if not applicable
  finishedAt: string | null; // ISO-8601 timestamp - always present, null if not applicable
  
  // Additional context fields (not in main log but useful for processing)
  questionId?: string;
  questionType?: 'multiple-choice' | 'drag-drop' | 'open-ended' | 'chatbot';
  attemptNumber?: number;
  timeSpent?: number; // milliseconds
  hintLevel?: number; // for hint requests
  totalQuestions?: number; // for activity start/complete events
  questionsAnswered?: number; // for activity complete events
  finalScore?: number; // for activity complete events
  maxPossibleScore?: number; // for activity complete events
}

// Legacy types for backward compatibility (will be converted to StandardAnalyticsEvent)
export interface AnalyticsEvaluation {
  isPartialCorrect: boolean;
  rubric?: RubricResult[];
  score?: number;
  maxScore?: number;
}

export interface RubricResult {
  criteria: string;
  passed: boolean;
  feedback: string;
  weight?: number;
}

export interface AnalyticsFeedback {
  rubric?: RubricResult[];
  overall_feedback?: string;
  hint?: string;
  targeted_feedback?: string;
}

// Base analytics event structure (legacy)
export interface BaseAnalyticsEvent {
  activityId: string;
  assignmentId?: string;
  studentId?: string;
  classId?: string;
  moduleName: string;
  action: AnalyticsAction;
  attemptCreatedAt: string;
}

// Submit Answer event (legacy)
export interface SubmitAnswerEvent extends BaseAnalyticsEvent {
  action: AnalyticsAction.SUBMIT_ANSWER;
  input: string;
  evaluation: AnalyticsEvaluation;
  feedback: AnalyticsFeedback;
  questionId: string;
  questionType: 'multiple-choice' | 'drag-drop' | 'open-ended' | 'chatbot';
  attemptNumber: number;
  timeSpent?: number;
}

// Ask for Hint event (legacy)
export interface AskForHintEvent extends BaseAnalyticsEvent {
  action: AnalyticsAction.ASK_FOR_HINT;
  input: string;
  feedback: AnalyticsFeedback;
  questionId: string;
  questionType: 'multiple-choice' | 'drag-drop' | 'open-ended' | 'chatbot';
  hintLevel: number;
}

// Activity Start event (legacy)
export interface ActivityStartEvent extends BaseAnalyticsEvent {
  action: AnalyticsAction.ACTIVITY_START;
  startedAt: string;
  totalQuestions: number;
}

// Activity Complete event (legacy)
export interface ActivityCompleteEvent extends BaseAnalyticsEvent {
  action: AnalyticsAction.ACTIVITY_COMPLETE;
  finishedAt: string;
  totalTimeSpent?: number;
  totalQuestions?: number;
  questionsAnswered?: number;
  finalScore?: number;
  maxPossibleScore?: number;
}

// Union type for all analytics events (legacy)
export type AnalyticsEvent = SubmitAnswerEvent | AskForHintEvent | ActivityStartEvent | ActivityCompleteEvent;

// Transport interface for sending events
export interface AnalyticsTransport {
  send(event: StandardAnalyticsEvent): Promise<void>;
}

// Configuration for the analytics tracker
export interface AnalyticsConfig {
  enabled: boolean;
  transports: AnalyticsTransport[];
  bufferSize?: number;
  flushInterval?: number;
  includeDebugInfo?: boolean;
}

// Analytics session data
export interface AnalyticsSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  events: StandardAnalyticsEvent[];
  metadata?: Record<string, any>;
} 