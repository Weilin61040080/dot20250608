# AI Literacy Game - Analytics System

A comprehensive analytics tracking system that captures detailed learner interactions and progress data in a standardized format for educational analysis.

## 🎯 Overview

The analytics system tracks three main types of events with a standardized log format:

- **`SUBMIT_ANSWER`** - When learners submit answers to questions
- **`ASK_FOR_HINT`** - When learners request hints during activities  
- **`ACTIVITY_LIFECYCLE`** - When activities start or complete

All events follow a consistent structure with standardized columns for easy analysis and data export.

## 📁 Architecture

```
src/
├── types/Analytics.ts              # TypeScript type definitions
├── services/analytics/
│   ├── analyticsTracker.ts         # Core tracking service
│   ├── transports.ts              # Event transport implementations
│   ├── helpers.ts                 # Helper functions for standardized tracking
│   └── demo.ts                    # Demo and testing utilities
└── store/slices/analyticsSlice.ts  # Redux state management
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { analyticsTracker } from './services/analytics/analyticsTracker';

// Set user profile
analyticsTracker.setUserProfile({
  studentId: 'student_123',
  classId: 'class_456'
});

// Track events using helper functions
import { trackActivityStart, trackQuestionAnswer } from './services/analytics/helpers';

// Start activity
await trackActivityStart('activity_id', 'Module Name', 5);

// Track answer submission
await trackQuestionAnswer(activityId, question, userAnswer, moduleName);
```

### Redux Integration

```typescript
import { trackQuestionAnswerThunk } from './store/slices/analyticsSlice';

// In a React component
const dispatch = useAppDispatch();

const handleSubmitAnswer = (answer: any) => {
  dispatch(trackQuestionAnswerThunk(
    activityId,
    question,
    answer,
    aiEvaluation // optional for open-ended questions
  ));
};
```

### Running Demo

```typescript
// In browser console
analyticsDemo.run();        // Run main demo
analyticsDemo.runAll();     // Run all demos
analyticsDemo.getEvents();  // View stored events
```

## 📊 Standardized Event Structure

All analytics events follow this exact format:

```typescript
interface StandardAnalyticsEvent {
  activityId: string;        // Activity identifier
  assignmentId?: string;     // Assignment identifier (optional)
  studentId?: string;        // Student identifier
  moduleName: string;        // Module/lesson name
  classId?: string;          // Class identifier
  action: AnalyticsAction;   // Event type (SUBMIT_ANSWER, ASK_FOR_HINT, ACTIVITY_LIFECYCLE)
  input: string;             // Learner's input or empty string for lifecycle events
  evaluation: boolean | null; // true/false for answers, null for other events
  feedback: any;             // Feedback content based on action type
  attemptCreatedAt: string;  // ISO-8601 timestamp
  startedAt?: string;        // ISO-8601 timestamp (for lifecycle events)
  finishedAt?: string;       // ISO-8601 timestamp (for lifecycle events)
  
  // Additional context fields
  questionId?: string;
  questionType?: 'multiple-choice' | 'drag-drop' | 'open-ended' | 'chatbot';
  attemptNumber?: number;
  timeSpent?: number;        // milliseconds
  hintLevel?: number;        // for hint requests
  lifecycleType?: ActivityLifecycleType; // for lifecycle events
  totalQuestions?: number;   // for lifecycle events
  questionsAnswered?: number; // for lifecycle events
  finalScore?: number;       // for lifecycle events
  maxPossibleScore?: number; // for lifecycle events
}
```

## 📝 Event Types & Examples

### 1. Submit Answer Event

```json
{
  "activityId": "intro_to_ai_001",
  "studentId": "student_123",
  "moduleName": "Introduction to AI",
  "classId": "cs101_fall2024",
  "action": "SUBMIT_ANSWER",
  "input": "Systems that can perform tasks requiring human intelligence",
  "evaluation": true,
  "feedback": "Correct! AI refers to systems that can perform tasks typically requiring human intelligence.",
  "attemptCreatedAt": "2024-01-15T10:30:45.123Z",
  "questionId": "q1_what_is_ai",
  "questionType": "multiple-choice",
  "attemptNumber": 1,
  "timeSpent": 15000
}
```

### 2. Ask for Hint Event

```json
{
  "activityId": "intro_to_ai_001",
  "studentId": "student_123",
  "moduleName": "Introduction to AI",
  "classId": "cs101_fall2024",
  "action": "ASK_FOR_HINT",
  "input": "",
  "evaluation": null,
  "feedback": "Think about how machine learning algorithms improve through experience with data.",
  "attemptCreatedAt": "2024-01-15T10:32:15.456Z",
  "questionId": "q2_ml_concepts",
  "questionType": "drag-drop",
  "hintLevel": 1
}
```

### 3. Activity Lifecycle Event

```json
{
  "activityId": "intro_to_ai_001",
  "studentId": "student_123",
  "moduleName": "Introduction to AI",
  "classId": "cs101_fall2024",
  "action": "ACTIVITY_LIFECYCLE",
  "input": "",
  "evaluation": null,
  "feedback": "",
  "attemptCreatedAt": "2024-01-15T10:45:30.789Z",
  "startedAt": "2024-01-15T10:30:00.000Z",
  "finishedAt": "2024-01-15T10:45:30.789Z",
  "lifecycleType": "COMPLETE",
  "totalQuestions": 5,
  "questionsAnswered": 5,
  "finalScore": 85,
  "maxPossibleScore": 100
}
```

## ⚙️ Configuration

### Development Setup

```typescript
import { createDefaultAnalyticsTracker } from './services/analytics/analyticsTracker';

const tracker = createDefaultAnalyticsTracker();
// Uses console and localStorage transports
```

### Production Setup

```typescript
import { createProductionAnalyticsTracker } from './services/analytics/analyticsTracker';

const tracker = createProductionAnalyticsTracker(
  'https://api.example.com/analytics',
  'your-api-key'
);
// Uses HTTP and localStorage transports
```

### Custom Configuration

```typescript
import { AnalyticsTracker } from './services/analytics/analyticsTracker';
import { ConsoleTransport, HttpTransport } from './services/analytics/transports';

const tracker = new AnalyticsTracker({
  enabled: true,
  debug: false,
  transports: [
    new ConsoleTransport(),
    new HttpTransport('https://your-api.com/events', 'api-key')
  ]
});
```

## 🔧 Integration Patterns

### React Component Integration

```typescript
import { useAppDispatch } from './store/hooks';
import { trackQuestionAnswerThunk, startQuestionTimerThunk } from './store/slices/analyticsSlice';

const QuestionComponent: React.FC<{ question: ActivityQuestion }> = ({ question }) => {
  const dispatch = useAppDispatch();
  const currentActivity = useSelector((state: RootState) => state.activity.currentActivity);

  useEffect(() => {
    // Start timer when question loads
    if (currentActivity) {
      dispatch(startQuestionTimerThunk(currentActivity.id, question.id));
    }
  }, [question.id]);

  const handleSubmit = (answer: any) => {
    if (currentActivity) {
      dispatch(trackQuestionAnswerThunk(
        currentActivity.id,
        question,
        answer
      ));
    }
  };

  return <div>{/* Your question UI */}</div>;
};
```

### Redux Middleware Integration

```typescript
// In your store configuration
import { trackActivityStartThunk, trackActivityCompleteThunk } from './slices/analyticsSlice';

// Activity start tracking
useEffect(() => {
  if (currentActivity) {
    dispatch(trackActivityStartThunk(
      currentActivity.id,
      currentActivity.questions.length
    ));
  }
}, [currentActivity]);

// Activity completion tracking
useEffect(() => {
  if (showResults && currentActivity) {
    dispatch(trackActivityCompleteThunk(
      currentActivity.id,
      currentActivity.questions.length,
      answeredQuestions,
      finalScore,
      maxPossibleScore
    ));
  }
}, [showResults]);
```

## 📈 Data Analysis

### Accessing Stored Data

```typescript
// Get all events from localStorage
const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');

// Get session information
const sessionInfo = analyticsTracker.getSessionInfo();
```

### Sample Analysis Queries

```typescript
// Calculate completion rate
const completionRate = events.filter(e => 
  e.action === 'ACTIVITY_LIFECYCLE' && e.lifecycleType === 'COMPLETE'
).length / events.filter(e => 
  e.action === 'ACTIVITY_LIFECYCLE' && e.lifecycleType === 'START'
).length;

// Average time per question
const questionTimes = events
  .filter(e => e.action === 'SUBMIT_ANSWER' && e.timeSpent)
  .map(e => e.timeSpent);
const avgTime = questionTimes.reduce((a, b) => a + b, 0) / questionTimes.length;

// Hint usage analysis
const hintRequests = events.filter(e => e.action === 'ASK_FOR_HINT');
const hintsByQuestion = hintRequests.reduce((acc, event) => {
  acc[event.questionId] = (acc[event.questionId] || 0) + 1;
  return acc;
}, {});
```

### Data Export

```typescript
// Export all analytics data
import { exportDemoData } from './services/analytics/demo';
const exportedData = exportDemoData();
console.log(exportedData); // JSON string ready for analysis
```

## 🧪 Testing

### Running Demos

```bash
# In browser console
analyticsDemo.run()        # Basic demo
analyticsDemo.runAll()     # Complete demo suite
analyticsDemo.runErrorTest() # Error handling demo
```

### Unit Testing

```typescript
import { trackQuestionAnswer } from './services/analytics/helpers';
import { MultipleChoiceQuestion } from './data/activityContext';

describe('Analytics Tracking', () => {
  it('should track multiple choice answers correctly', async () => {
    const question: MultipleChoiceQuestion = {
      id: 'test_q1',
      type: 'multiple-choice',
      question: 'Test question?',
      options: ['A', 'B', 'C'],
      correctAnswer: 1,
      explanation: 'B is correct'
    };

    await trackQuestionAnswer('test_activity', question, 1, 'Test Module');
    
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    expect(events).toHaveLength(1);
    expect(events[0].action).toBe('SUBMIT_ANSWER');
    expect(events[0].evaluation).toBe(true);
  });
});
```

## 🔒 Privacy & Security

### Data Privacy

- **Local Storage**: Events stored locally by default
- **No PII**: Only educational interaction data is tracked
- **Configurable**: Can disable tracking entirely
- **Transparent**: All tracked data is visible to users

### Security Considerations

- **API Keys**: Securely manage production API keys
- **HTTPS**: Use encrypted connections for data transmission
- **Validation**: All events validated before transmission
- **Rate Limiting**: Built-in protection against spam

### GDPR Compliance

```typescript
// Clear all stored data
analyticsDemo.clearEvents();

// Disable tracking
analyticsTracker.setEnabled(false);

// Export user data
const userData = exportDemoData();
```

## 🐛 Troubleshooting

### Common Issues

**Events not being tracked:**
```typescript
// Check if analytics is enabled
console.log(analyticsTracker.getSessionInfo());

// Verify user profile is set
console.log(analyticsTracker.getUserProfile());
```

**TypeScript errors:**
```typescript
// Ensure proper imports
import { ActivityQuestion } from './data/activityContext';
import { trackQuestionAnswer } from './services/analytics/helpers';
```

**Missing evaluation data:**
```typescript
// For open-ended questions, provide AI evaluation
await trackQuestionAnswer(activityId, question, answer, moduleName, aiEvaluation);
```

### Debug Mode

```typescript
// Enable debug logging
const tracker = new AnalyticsTracker({
  enabled: true,
  debug: true,
  transports: [new ConsoleTransport()]
});
```

## 📚 API Reference

### AnalyticsTracker Methods

- `setUserProfile(profile)` - Set student and class information
- `getUserProfile()` - Get current user profile
- `trackSubmitAnswer(params)` - Track answer submission
- `trackAskForHint(params)` - Track hint request
- `trackActivityLifecycle(params)` - Track activity start/completion
- `startQuestionTimer(activityId, questionId)` - Start timing a question
- `stopQuestionTimer(activityId, questionId)` - Stop timing a question
- `getSessionInfo()` - Get session information
- `setEnabled(enabled)` - Enable/disable tracking

### Redux Actions

- `trackActivityStartThunk` - Track activity start
- `trackActivityCompleteThunk` - Track activity completion
- `trackQuestionAnswerThunk` - Track question answer
- `trackHintRequestThunk` - Track hint request
- `startQuestionTimerThunk` - Start question timer
- `setEnabled` - Enable/disable analytics

### Helper Functions

- `trackActivityStart(activityId, moduleName, totalQuestions)`
- `trackActivityComplete(activityId, moduleName, totalQuestions, questionsAnswered, finalScore, maxPossibleScore)`
- `trackQuestionAnswer(activityId, question, userAnswer, moduleName, aiEvaluation?)`
- `trackHintRequest(activityId, questionId, questionType, hintLevel, hint, moduleName)`
- `startQuestionTimer(activityId, questionId)`
- `stopQuestionTimer(activityId, questionId)`

## 🤝 Contributing

When contributing to the analytics system:

1. **Follow the standardized format** - All events must use `StandardAnalyticsEvent`
2. **Add tests** - Include unit tests for new tracking functions
3. **Update documentation** - Keep this README current
4. **Privacy first** - Ensure no PII is tracked
5. **Validate data** - Check all required fields are present

## 📄 License

This analytics system is part of the AI Literacy Game project and follows the same license terms.

---

For more information, see the [Analytics Integration Guide](./docs/ANALYTICS-INTEGRATION.md) and [demo file](./src/services/analytics/demo.ts). 