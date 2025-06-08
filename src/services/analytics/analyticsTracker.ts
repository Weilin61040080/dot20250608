/**
 * Analytics Tracker Service
 * Main service for tracking learner interactions and progress
 * Uses standardized event format with consistent columns
 */

import { 
  AnalyticsConfig, 
  AnalyticsEvaluation, 
  AnalyticsFeedback, 
  StandardAnalyticsEvent,
  AnalyticsAction
} from '../../types/Analytics';
import { ConsoleTransport, HttpTransport, LocalStorageTransport } from './transports';
import debugHelper from '../../utils/debugHelper';
import { userProfileService } from '../userProfileService';

/**
 * User profile interface for analytics (legacy compatibility)
 */
interface AnalyticsUserProfile {
  studentId: string;
  classId: string;
  assignmentId?: string;
}

/**
 * Main Analytics Tracker Class
 */
export class AnalyticsTracker {
  private config: AnalyticsConfig;
  private sessionId: string;
  private sessionStartTime: string;
  private currentActivityStartTime?: string;
  private questionStartTimes: Map<string, number> = new Map();
  private questionAttempts: Map<string, number> = new Map();
  private userProfile: AnalyticsUserProfile | null = null;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date().toISOString();
    
    debugHelper.logDebug('Analytics Tracker initialized', {
      sessionId: this.sessionId,
      enabled: config.enabled,
      transports: config.transports.length
    });
  }

  /**
   * Set user profile data (student and class information)
   */
  setUserProfile(profile: AnalyticsUserProfile): void {
    this.userProfile = profile;
    debugHelper.logDebug('User profile set', profile);
  }

  /**
   * Get user profile data
   */
  getUserProfile(): AnalyticsUserProfile | null {
    // Try to get from userProfileService if not set directly
    if (!this.userProfile) {
      const serviceProfile = userProfileService.getCurrentProfile();
      if (serviceProfile) {
        this.userProfile = {
          studentId: serviceProfile.studentId,
          classId: serviceProfile.classId,
          assignmentId: undefined // Not available in service profile
        };
      }
    }
    return this.userProfile;
  }

  /**
   * Get student ID from user profile
   */
  private getStudentId(): string {
    const profile = this.getUserProfile();
    return profile?.studentId || 'N/A';
  }

  /**
   * Get class ID from user profile
   */
  private getClassId(): string {
    const profile = this.getUserProfile();
    return profile?.classId || 'N/A';
  }

  /**
   * Extract learner input based on question type and answer
   */
  private extractLearnerInput(
    questionType: 'multiple-choice' | 'drag-drop' | 'open-ended' | 'chatbot',
    answer: any,
    questionOptions?: any[]
  ): string {
    switch (questionType) {
      case 'multiple-choice':
        // For multiple choice, get the text of the selected option
        if (typeof answer === 'number' && questionOptions && questionOptions[answer]) {
          return questionOptions[answer];
        }
        return String(answer);
      
      case 'drag-drop':
        // For drag-drop, get the text of the selected option
        if (questionOptions) {
          const selectedOption = questionOptions.find(opt => opt.id === answer);
          return selectedOption ? selectedOption.text : String(answer);
        }
        return String(answer);
      
      case 'open-ended':
        // For open-ended, return the text content
        if (typeof answer === 'object' && answer.text) {
          return answer.text;
        }
        return String(answer);
      
      case 'chatbot':
        // For chatbot, return the message content
        if (typeof answer === 'object' && answer.text) {
          return answer.text;
        }
        return String(answer);
      
      default:
        return String(answer);
    }
  }

  /**
   * Convert evaluation to boolean
   */
  private convertEvaluationToBoolean(evaluation: AnalyticsEvaluation): boolean {
    // If there's a score, use it to determine correctness
    if (evaluation.score !== undefined && evaluation.maxScore !== undefined) {
      return evaluation.score === evaluation.maxScore;
    }
    
    // For partial correct, consider it as correct if mostly right
    return !evaluation.isPartialCorrect;
  }

  /**
   * Track a submit answer event
   */
  async trackSubmitAnswer(params: {
    activityId: string;
    questionId: string;
    questionType: 'multiple-choice' | 'drag-drop' | 'open-ended' | 'chatbot';
    answer: any;
    evaluation: AnalyticsEvaluation;
    feedback: AnalyticsFeedback;
    moduleName: string;
    questionOptions?: any[];
  }): Promise<void> {
    if (!this.config.enabled) return;

    const questionKey = `${params.activityId}-${params.questionId}`;
    const attemptNumber = (this.questionAttempts.get(questionKey) || 0) + 1;
    this.questionAttempts.set(questionKey, attemptNumber);

    // Calculate time spent on this question
    const questionStartTime = this.questionStartTimes.get(questionKey);
    const timeSpent = questionStartTime ? Date.now() - questionStartTime : undefined;

    // Extract learner input
    const input = this.extractLearnerInput(params.questionType, params.answer, params.questionOptions);

    // Convert evaluation to boolean
    const evaluationBoolean = this.convertEvaluationToBoolean(params.evaluation);

    // Format feedback based on question type
    let formattedFeedback: any;
    if (params.questionType === 'open-ended' || params.questionType === 'chatbot') {
      // For AI-graded questions, include rubric feedback
      formattedFeedback = {
        rubric: params.feedback.rubric || [],
        overall_feedback: params.feedback.overall_feedback || params.feedback.targeted_feedback
      };
    } else {
      // For static feedback (MCQ/drag-drop), use targeted feedback
      formattedFeedback = params.feedback.targeted_feedback || '';
    }

    const event: StandardAnalyticsEvent = {
      activityId: params.activityId,
      assignmentId: this.userProfile?.assignmentId,
      studentId: this.getStudentId(),
      moduleName: params.moduleName,
      classId: this.getClassId(),
      action: AnalyticsAction.SUBMIT_ANSWER,
      input,
      evaluation: evaluationBoolean,
      feedback: formattedFeedback,
      attemptCreatedAt: new Date().toISOString(),
      startedAt: questionStartTime ? new Date(questionStartTime).toISOString() : null,
      finishedAt: new Date().toISOString(),
      
      // Additional context fields
      questionId: params.questionId,
      questionType: params.questionType,
      attemptNumber,
      timeSpent
    };

    await this.logEvent(event);
  }

  /**
   * Track an ask for hint event
   */
  async trackAskForHint(params: {
    activityId: string;
    questionId: string;
    questionType: 'multiple-choice' | 'drag-drop' | 'open-ended' | 'chatbot';
    hintLevel: number;
    hint: string;
    moduleName: string;
  }): Promise<void> {
    if (!this.config.enabled) return;

    // Get question start time for timing context
    const questionKey = `${params.activityId}-${params.questionId}`;
    const questionStartTime = this.questionStartTimes.get(questionKey);
    const now = new Date().toISOString();

    const event: StandardAnalyticsEvent = {
      activityId: params.activityId,
      assignmentId: this.userProfile?.assignmentId,
      studentId: this.getStudentId(),
      moduleName: params.moduleName,
      classId: this.getClassId(),
      action: AnalyticsAction.ASK_FOR_HINT,
      input: '', // Empty for hint requests
      evaluation: null, // No evaluation for hints
      feedback: params.hint, // Hint content in feedback
      attemptCreatedAt: now,
      startedAt: questionStartTime ? new Date(questionStartTime).toISOString() : null,
      finishedAt: now, // Hint request completes immediately
      
      // Additional context fields
      questionId: params.questionId,
      questionType: params.questionType,
      hintLevel: params.hintLevel
    };

    await this.logEvent(event);
  }

  /**
   * Track activity start event
   */
  async trackActivityStart(params: {
    activityId: string;
    moduleName: string;
    totalQuestions?: number;
  }): Promise<void> {
    if (!this.config.enabled) return;

    const now = new Date().toISOString();
    this.currentActivityStartTime = now;

    const event: StandardAnalyticsEvent = {
      activityId: params.activityId,
      assignmentId: this.userProfile?.assignmentId,
      studentId: this.getStudentId(),
      moduleName: params.moduleName,
      classId: this.getClassId(),
      action: AnalyticsAction.ACTIVITY_START,
      input: '', // Empty for activity start
      evaluation: null, // No evaluation for activity start
      feedback: '', // Empty for activity start
      attemptCreatedAt: now,
      startedAt: now,
      finishedAt: null, // No finish time for activity start
      
      // Additional context fields
      totalQuestions: params.totalQuestions
    };

    await this.logEvent(event);
  }

  /**
   * Track activity complete event
   */
  async trackActivityComplete(params: {
    activityId: string;
    moduleName: string;
    totalQuestions?: number;
    questionsAnswered?: number;
    finalScore?: number;
    maxPossibleScore?: number;
  }): Promise<void> {
    if (!this.config.enabled) return;

    const now = new Date().toISOString();
    let totalTimeSpent: number | undefined;

    if (this.currentActivityStartTime) {
      totalTimeSpent = new Date(now).getTime() - new Date(this.currentActivityStartTime).getTime();
    }

    const event: StandardAnalyticsEvent = {
      activityId: params.activityId,
      assignmentId: this.userProfile?.assignmentId,
      studentId: this.getStudentId(),
      moduleName: params.moduleName,
      classId: this.getClassId(),
      action: AnalyticsAction.ACTIVITY_COMPLETE,
      input: '', // Empty for activity complete
      evaluation: null, // No evaluation for activity complete
      feedback: '', // Empty for activity complete
      attemptCreatedAt: now,
      startedAt: this.currentActivityStartTime || null,
      finishedAt: now,
      
      // Additional context fields
      totalQuestions: params.totalQuestions,
      questionsAnswered: params.questionsAnswered,
      finalScore: params.finalScore,
      maxPossibleScore: params.maxPossibleScore,
      timeSpent: totalTimeSpent
    };

    await this.logEvent(event);
  }

  /**
   * Start tracking time for a specific question
   */
  startQuestionTimer(activityId: string, questionId: string): void {
    const questionKey = `${activityId}-${questionId}`;
    this.questionStartTimes.set(questionKey, Date.now());
  }

  /**
   * Stop tracking time for a specific question
   */
  stopQuestionTimer(activityId: string, questionId: string): number | undefined {
    const questionKey = `${activityId}-${questionId}`;
    const startTime = this.questionStartTimes.get(questionKey);
    if (startTime) {
      this.questionStartTimes.delete(questionKey);
      return Date.now() - startTime;
    }
    return undefined;
  }

  /**
   * Log an event to all configured transports
   */
  private async logEvent(event: StandardAnalyticsEvent): Promise<void> {
    try {
      // Console log with standardized format - ALWAYS include all fields in same order
      console.log('📊 ANALYTICS EVENT:', {
        activityId: event.activityId,
        assignmentId: event.assignmentId || 'N/A',
        studentId: event.studentId || 'N/A',
        moduleName: event.moduleName,
        classId: event.classId || 'N/A',
        action: event.action,
        input: event.input,
        evaluation: event.evaluation,
        feedback: event.feedback,
        attemptCreatedAt: event.attemptCreatedAt,
        startedAt: event.startedAt || 'N/A',
        finishedAt: event.finishedAt || 'N/A'
      });

      // Send to all configured transports
      const promises = this.config.transports.map((transport: any) => 
        transport.send(event).catch((error: any) => {
          console.error('Transport failed to send event:', error);
        })
      );

      await Promise.allSettled(promises);

      // TODO: Call backend API here
      // await this.sendToBackendAPI(event);

    } catch (error) {
      console.error('Failed to log analytics event:', error);
    }
  }

  /**
   * Placeholder for backend API call
   */
  private async sendToBackendAPI(event: StandardAnalyticsEvent): Promise<void> {
    // TODO: Implement actual backend API call
    // Example:
    // const response = await fetch('/api/analytics/events', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${apiToken}`
    //   },
    //   body: JSON.stringify(event)
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`Backend API error: ${response.status}`);
    // }
    
    debugHelper.logDebug('Backend API call placeholder', { eventId: event.activityId });
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current session information
   */
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      startTime: this.sessionStartTime,
      enabled: this.config.enabled,
      transports: this.config.transports.length
    };
  }

  /**
   * Update tracker configuration
   */
  updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    debugHelper.logDebug('Analytics config updated', this.config);
  }

  /**
   * Enable or disable tracking
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    debugHelper.logDebug(`Analytics tracking ${enabled ? 'enabled' : 'disabled'}`);
  }
}

/**
 * Factory function to create a default analytics tracker for development
 */
export const createDefaultAnalyticsTracker = (): AnalyticsTracker => {
  return new AnalyticsTracker({
    enabled: true,
    transports: [
      new ConsoleTransport(true),
      new LocalStorageTransport('ai_literacy_analytics', 1000)
    ],
    includeDebugInfo: true
  });
};

/**
 * Factory function to create a production analytics tracker
 */
export const createProductionAnalyticsTracker = (apiEndpoint: string, apiKey?: string): AnalyticsTracker => {
  return new AnalyticsTracker({
    enabled: true,
    transports: [
      new HttpTransport(apiEndpoint, apiKey),
      new LocalStorageTransport('ai_literacy_analytics', 500) // Smaller buffer for production
    ],
    includeDebugInfo: false
  });
};

// Create and export a default instance
export const analyticsTracker = createDefaultAnalyticsTracker(); 