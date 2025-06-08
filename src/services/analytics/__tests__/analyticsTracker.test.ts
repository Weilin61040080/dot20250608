/**
 * Analytics Tracker Unit Tests
 * Verifies that every event type is logged with the correct schema
 */

import { AnalyticsTracker } from '../analyticsTracker';
import { ConsoleTransport } from '../transports';
import { 
  AnalyticsAction, 
  ActivityLifecycleType,
  AnalyticsConfig 
} from '../../../types/Analytics';

// Mock console methods to capture output
const mockConsoleLog = jest.fn();
const mockConsoleGroup = jest.fn();
const mockConsoleGroupEnd = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  console.log = mockConsoleLog;
  console.group = mockConsoleGroup;
  console.groupEnd = mockConsoleGroupEnd;
});

describe('AnalyticsTracker', () => {
  let tracker: AnalyticsTracker;
  let mockTransport: jest.Mocked<any>;

  beforeEach(() => {
    mockTransport = {
      send: jest.fn().mockResolvedValue(undefined)
    };

    const config: AnalyticsConfig = {
      enabled: true,
      transports: [mockTransport],
      includeDebugInfo: true
    };

    tracker = new AnalyticsTracker(config);
  });

  describe('trackSubmitAnswer', () => {
    it('should log submit answer event with correct schema', async () => {
      const params = {
        activityId: 'activity-1',
        questionId: 'question-1',
        questionType: 'multiple-choice' as const,
        input: 'Option A',
        evaluation: {
          isPartialCorrect: true,
          score: 1,
          maxScore: 1
        },
        feedback: {
          explanation: 'Correct answer!',
          overall_feedback: 'Well done!'
        },
        moduleName: 'Test Module'
      };

      await tracker.trackSubmitAnswer(params);

      expect(mockTransport.send).toHaveBeenCalledTimes(1);
      const event = mockTransport.send.mock.calls[0][0];

      // Verify event structure
      expect(event).toMatchObject({
        activityId: 'activity-1',
        moduleName: 'Test Module',
        action: AnalyticsAction.SUBMIT_ANSWER,
        input: 'Option A',
        evaluation: {
          isPartialCorrect: true,
          score: 1,
          maxScore: 1
        },
        feedback: {
          explanation: 'Correct answer!',
          overall_feedback: 'Well done!'
        },
        questionId: 'question-1',
        questionType: 'multiple-choice',
        attemptNumber: 1
      });

      // Verify required fields
      expect(event.attemptCreatedAt).toBeDefined();
      expect(typeof event.attemptCreatedAt).toBe('string');
      expect(new Date(event.attemptCreatedAt)).toBeInstanceOf(Date);
    });

    it('should track multiple attempts for the same question', async () => {
      const params = {
        activityId: 'activity-1',
        questionId: 'question-1',
        questionType: 'multiple-choice' as const,
        input: 'Option A',
        evaluation: { isPartialCorrect: false, score: 0, maxScore: 1 },
        feedback: { explanation: 'Try again' },
        moduleName: 'Test Module'
      };

      // First attempt
      await tracker.trackSubmitAnswer(params);
      let event = mockTransport.send.mock.calls[0][0];
      expect(event.attemptNumber).toBe(1);

      // Second attempt
      await tracker.trackSubmitAnswer(params);
      event = mockTransport.send.mock.calls[1][0];
      expect(event.attemptNumber).toBe(2);
    });

    it('should include time spent when question timer was started', async () => {
      const activityId = 'activity-1';
      const questionId = 'question-1';

      // Start timer
      tracker.startQuestionTimer(activityId, questionId);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      const params = {
        activityId,
        questionId,
        questionType: 'multiple-choice' as const,
        input: 'Option A',
        evaluation: { isPartialCorrect: true, score: 1, maxScore: 1 },
        feedback: { explanation: 'Correct!' },
        moduleName: 'Test Module'
      };

      await tracker.trackSubmitAnswer(params);

      const event = mockTransport.send.mock.calls[0][0];
      expect(event.timeSpent).toBeDefined();
      expect(typeof event.timeSpent).toBe('number');
      expect(event.timeSpent).toBeGreaterThan(0);
    });
  });

  describe('trackAskForHint', () => {
    it('should log ask for hint event with correct schema', async () => {
      const params = {
        activityId: 'activity-1',
        questionId: 'question-1',
        questionType: 'open-ended' as const,
        hintLevel: 1,
        hint: 'Think about the main concepts',
        moduleName: 'Test Module'
      };

      await tracker.trackAskForHint(params);

      expect(mockTransport.send).toHaveBeenCalledTimes(1);
      const event = mockTransport.send.mock.calls[0][0];

      expect(event).toMatchObject({
        activityId: 'activity-1',
        moduleName: 'Test Module',
        action: AnalyticsAction.ASK_FOR_HINT,
        input: '', // Should be empty for hint requests
        feedback: { hint: 'Think about the main concepts' },
        questionId: 'question-1',
        questionType: 'open-ended',
        hintLevel: 1
      });

      expect(event.attemptCreatedAt).toBeDefined();
    });
  });

  describe('trackActivityLifecycle', () => {
    it('should log activity start event with correct schema', async () => {
      const params = {
        activityId: 'activity-1',
        lifecycleType: ActivityLifecycleType.START,
        moduleName: 'Test Module',
        totalQuestions: 5
      };

      await tracker.trackActivityLifecycle(params);

      expect(mockTransport.send).toHaveBeenCalledTimes(1);
      const event = mockTransport.send.mock.calls[0][0];

      expect(event).toMatchObject({
        activityId: 'activity-1',
        moduleName: 'Test Module',
        action: AnalyticsAction.ACTIVITY_LIFECYCLE,
        lifecycleType: ActivityLifecycleType.START,
        totalQuestions: 5
      });

      expect(event.startedAt).toBeDefined();
      expect(event.attemptCreatedAt).toBeDefined();
    });

    it('should log activity complete event with correct schema', async () => {
      // First start the activity
      await tracker.trackActivityLifecycle({
        activityId: 'activity-1',
        lifecycleType: ActivityLifecycleType.START,
        moduleName: 'Test Module',
        totalQuestions: 3
      });

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      // Then complete it
      const params = {
        activityId: 'activity-1',
        lifecycleType: ActivityLifecycleType.COMPLETE,
        moduleName: 'Test Module',
        totalQuestions: 3,
        questionsAnswered: 3,
        finalScore: 85,
        maxPossibleScore: 100
      };

      await tracker.trackActivityLifecycle(params);

      expect(mockTransport.send).toHaveBeenCalledTimes(2);
      const event = mockTransport.send.mock.calls[1][0];

      expect(event).toMatchObject({
        activityId: 'activity-1',
        moduleName: 'Test Module',
        action: AnalyticsAction.ACTIVITY_LIFECYCLE,
        lifecycleType: ActivityLifecycleType.COMPLETE,
        totalQuestions: 3,
        questionsAnswered: 3,
        finalScore: 85,
        maxPossibleScore: 100
      });

      expect(event.finishedAt).toBeDefined();
      expect(event.totalTimeSpent).toBeDefined();
      expect(typeof event.totalTimeSpent).toBe('number');
      expect(event.totalTimeSpent).toBeGreaterThan(0);
    });
  });

  describe('question timers', () => {
    it('should start and stop question timers correctly', () => {
      const activityId = 'activity-1';
      const questionId = 'question-1';

      // Start timer
      tracker.startQuestionTimer(activityId, questionId);
      
      // Stop timer
      const timeSpent = tracker.stopQuestionTimer(activityId, questionId);
      
      expect(timeSpent).toBeDefined();
      expect(typeof timeSpent).toBe('number');
      expect(timeSpent).toBeGreaterThanOrEqual(0);
    });

    it('should return undefined for non-existent timer', () => {
      const timeSpent = tracker.stopQuestionTimer('activity-1', 'question-1');
      expect(timeSpent).toBeUndefined();
    });
  });

  describe('configuration', () => {
    it('should not track events when disabled', async () => {
      tracker.setEnabled(false);

      await tracker.trackSubmitAnswer({
        activityId: 'activity-1',
        questionId: 'question-1',
        questionType: 'multiple-choice',
        input: 'Option A',
        evaluation: { isPartialCorrect: true, score: 1, maxScore: 1 },
        feedback: { explanation: 'Correct!' },
        moduleName: 'Test Module'
      });

      expect(mockTransport.send).not.toHaveBeenCalled();
    });

    it('should provide session information', () => {
      const sessionInfo = tracker.getSessionInfo();
      
      expect(sessionInfo).toHaveProperty('sessionId');
      expect(sessionInfo).toHaveProperty('startTime');
      expect(typeof sessionInfo.sessionId).toBe('string');
      expect(typeof sessionInfo.startTime).toBe('string');
      expect(new Date(sessionInfo.startTime)).toBeInstanceOf(Date);
    });
  });

  describe('error handling', () => {
    it('should handle transport errors gracefully', async () => {
      mockTransport.send.mockRejectedValue(new Error('Transport failed'));

      // Should not throw
      await expect(tracker.trackSubmitAnswer({
        activityId: 'activity-1',
        questionId: 'question-1',
        questionType: 'multiple-choice',
        input: 'Option A',
        evaluation: { isPartialCorrect: true, score: 1, maxScore: 1 },
        feedback: { explanation: 'Correct!' },
        moduleName: 'Test Module'
      })).resolves.not.toThrow();
    });
  });
});

describe('ConsoleTransport', () => {
  let transport: ConsoleTransport;

  beforeEach(() => {
    transport = new ConsoleTransport(true);
  });

  it('should format submit answer events correctly', async () => {
    const event = {
      activityId: 'activity-1',
      moduleName: 'Test Module',
      action: AnalyticsAction.SUBMIT_ANSWER as const,
      attemptCreatedAt: '2024-01-01T00:00:00.000Z',
      input: 'Option A',
      evaluation: { isPartialCorrect: true, score: 1, maxScore: 1 },
      feedback: { explanation: 'Correct!' },
      questionId: 'question-1',
      questionType: 'multiple-choice' as const,
      attemptNumber: 1,
      timeSpent: 5000
    };

    await transport.send(event);

    expect(mockConsoleGroup).toHaveBeenCalledWith('🎯 Analytics Event: SubmitAnswer');
    expect(mockConsoleLog).toHaveBeenCalledWith('🎮 Activity: activity-1');
    expect(mockConsoleLog).toHaveBeenCalledWith('📚 Module: Test Module');
    expect(mockConsoleLog).toHaveBeenCalledWith('❓ Question: question-1 (multiple-choice)');
    expect(mockConsoleLog).toHaveBeenCalledWith('💭 Input: "Option A"');
    expect(mockConsoleLog).toHaveBeenCalledWith('✅ Correct: true');
    expect(mockConsoleLog).toHaveBeenCalledWith('⏱️ Time Spent: 5.00s');
    expect(mockConsoleGroupEnd).toHaveBeenCalled();
  });

  it('should format activity lifecycle events correctly', async () => {
    const event = {
      activityId: 'activity-1',
      moduleName: 'Test Module',
      action: AnalyticsAction.ACTIVITY_LIFECYCLE as const,
      attemptCreatedAt: '2024-01-01T00:00:00.000Z',
      lifecycleType: ActivityLifecycleType.COMPLETE,
      totalTimeSpent: 120000,
      finalScore: 85,
      maxPossibleScore: 100,
      questionsAnswered: 3,
      totalQuestions: 3
    };

    await transport.send(event);

    expect(mockConsoleGroup).toHaveBeenCalledWith('🎯 Analytics Event: ActivityLifecycle');
    expect(mockConsoleLog).toHaveBeenCalledWith('🔄 Lifecycle: complete');
    expect(mockConsoleLog).toHaveBeenCalledWith('⏱️ Total Time: 120.00s');
    expect(mockConsoleLog).toHaveBeenCalledWith('🏆 Final Score: 85/100');
    expect(mockConsoleLog).toHaveBeenCalledWith('📊 Progress: 3/3 questions');
  });
}); 