# AI Literacy Game - Analytics Integration Documentation

## Overview

The AI Literacy Game features a comprehensive analytics system that tracks learner interactions and progress through standardized events. The system captures 4 main event types with consistent structure across all events.

## Analytics Event Types

### 1. SubmitAnswer
- **Purpose**: Tracks when students submit answers to questions
- **Timing**: Records question start time and submission time
- **Evaluation**: Boolean result based on correctness
- **Feedback**: Detailed feedback with rubric for AI-graded questions

### 2. AskForHint
- **Purpose**: Tracks when students request hints
- **Timing**: Records question context timing and immediate hint delivery
- **Evaluation**: null (no evaluation for hints)
- **Feedback**: Hint content provided to student

### 3. ActivityStart
- **Purpose**: Tracks when students begin an activity
- **Timing**: Records activity start time
- **Evaluation**: null (no evaluation for activity start)
- **Feedback**: Empty (no feedback for activity start)

### 4. ActivityComplete
- **Purpose**: Tracks when students complete an activity
- **Timing**: Records activity start and completion times
- **Evaluation**: null (no evaluation for activity completion)
- **Feedback**: Empty (no feedback for activity completion)

## Standardized Event Structure

All 4 event types follow this exact structure:

```json
{
  "activityId": "activity-npc-4",
  "assignmentId": "N/A",
  "studentId": "N/A", 
  "moduleName": "Introduction to AI Concepts",
  "classId": "N/A",
  "action": "SubmitAnswer|AskForHint|ActivityStart|ActivityComplete",
  "input": "user input or empty string",
  "evaluation": true|false|null,
  "feedback": "feedback content or empty string",
  "attemptCreatedAt": "2025-06-03T20:29:09.440Z",
  "startedAt": "2025-06-03T20:27:46.410Z" | "N/A",
  "finishedAt": "2025-06-03T20:29:09.440Z" | "N/A"
}
```

## Architecture

### Core Files
- `src/types/Analytics.ts` - Type definitions and interfaces
- `src/services/analytics/analyticsTracker.ts` - Main tracking service
- `src/services/analytics/helpers.ts` - Helper functions for Redux integration
- `src/store/slices/analyticsSlice.ts` - Redux state management
- `src/services/analytics/demo.ts` - Demo and testing functions

### Transport Layer
- `ConsoleTransport` - Logs events to browser console
- `LocalStorageTransport` - Stores events in browser localStorage
- `HttpTransport` - Sends events to backend API (placeholder)

## Integration Status

### ✅ Completed Components
- **MultipleChoiceActivity**: Full analytics integration with timing and evaluation
- **DragDropActivity**: Complete tracking with hint support
- **OpenEndedActivity**: AI evaluation feedback with rubric structure
- **ChatbotActivity**: Real-time tracking with AI feedback integration

### 📊 Event Tracking Features
- **Question Timing**: Automatic start/stop timers for all question types
- **Hint Tracking**: Records hint requests with context timing
- **AI Feedback**: Captures structured rubric feedback from AI evaluations
- **Activity Lifecycle**: Tracks complete activity sessions with duration

## Usage Examples

### Basic Question Tracking
```typescript
import { trackQuestionAnswer, startQuestionTimer } from '../services/analytics/helpers';

// Start timing
startQuestionTimer(activityId, questionId);

// Submit answer
await trackQuestionAnswer(
  activityId,
  question,
  userAnswer,
  moduleName,
  aiEvaluation // Optional for AI-graded questions
);
```

### Hint Request Tracking
```typescript
import { trackHintRequest } from '../services/analytics/helpers';

await trackHintRequest(
  activityId,
  questionId,
  questionType,
  hintLevel,
  hintContent,
  moduleName
);
```

### Activity Lifecycle Tracking
```typescript
import { trackActivityStart, trackActivityComplete } from '../services/analytics/helpers';

// Start activity
await trackActivityStart(activityId, moduleName, totalQuestions);

// Complete activity
await trackActivityComplete(
  activityId,
  moduleName,
  totalQuestions,
  questionsAnswered,
  finalScore,
  maxPossibleScore
);
```

## AI Feedback Structure

### Chatbot Questions
```json
{
  "rubric": [
    {
      "criteria": "Requests Elaboration or Explanation",
      "passed": true,
      "explanation": "The prompt requests elaboration about the water cycle."
    }
  ],
  "overall_feedback": "Good start! Your prompt shows understanding but could be more specific."
}
```

### Open-Ended Questions
```json
{
  "rubric": [
    {
      "criteria": "Addresses the main question directly",
      "passed": true,
      "explanation": "The response directly addresses AI bias in hiring."
    }
  ],
  "overall_feedback": "Strong analysis with good examples. Consider expanding on mitigation techniques."
}
```

## Testing and Verification

### Browser Console Testing
```javascript
// Test all 4 event types with standardized structure
analyticsDemo.testStructure()

// Run complete demo session
analyticsDemo.run()

// View stored events
analyticsDemo.getEvents()

// Export data for analysis
analyticsDemo.exportData()
```

### Verification Checklist
- ✅ All 4 event types have identical field structure
- ✅ Console logs always include startedAt/finishedAt (with "N/A" when not applicable)
- ✅ Timing data properly captured for question interactions
- ✅ AI feedback structured consistently across question types
- ✅ Redux integration working across all activity components

## Configuration

### Development Setup
```typescript
import { createDefaultAnalyticsTracker } from './analyticsTracker';

const tracker = createDefaultAnalyticsTracker();
// Uses ConsoleTransport + LocalStorageTransport
```

### Production Setup
```typescript
import { createProductionAnalyticsTracker } from './analyticsTracker';

const tracker = createProductionAnalyticsTracker(apiEndpoint, apiKey);
// Uses HttpTransport + LocalStorageTransport
```

## Data Analysis

### Accessing Stored Data
```typescript
// Get all events from localStorage
const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');

// Filter by event type
const submitEvents = events.filter(e => e.action === 'SubmitAnswer');
const hintEvents = events.filter(e => e.action === 'AskForHint');
```

### Sample Analysis Queries
```typescript
// Calculate average time per question
const avgTimePerQuestion = submitEvents
  .filter(e => e.startedAt && e.finishedAt)
  .map(e => new Date(e.finishedAt) - new Date(e.startedAt))
  .reduce((sum, time) => sum + time, 0) / submitEvents.length;

// Count hint usage by question type
const hintsByType = hintEvents.reduce((acc, event) => {
  acc[event.questionType] = (acc[event.questionType] || 0) + 1;
  return acc;
}, {});
```

## Privacy and Security

### Data Protection
- No personally identifiable information stored by default
- Student IDs can be anonymized or hashed
- Local storage can be cleared by user
- GDPR compliance through data export/deletion

### Security Considerations
- API endpoints should use HTTPS
- Authentication tokens for backend communication
- Rate limiting on analytics endpoints
- Data validation on all inputs

## Troubleshooting

### Common Issues

**Events not appearing in console:**
- Check if analytics is enabled: `analyticsTracker.getSessionInfo()`
- Verify user profile is set: `analyticsTracker.getUserProfile()`

**Missing timing data:**
- Ensure `startQuestionTimer()` is called before question display
- Check that timer is started in component `useEffect`

**Inconsistent event structure:**
- All events now follow standardized format
- Use `analyticsDemo.testStructure()` to verify

**AI feedback not captured:**
- Verify evaluation object structure matches expected format
- Check that feedback conversion is working in `trackQuestionAnswer`

## API Reference

### AnalyticsTracker Methods
- `setUserProfile(profile)` - Set student/class information
- `trackSubmitAnswer(params)` - Track answer submissions
- `trackAskForHint(params)` - Track hint requests
- `trackActivityStart(params)` - Track activity beginning
- `trackActivityComplete(params)` - Track activity completion
- `startQuestionTimer(activityId, questionId)` - Start question timing
- `stopQuestionTimer(activityId, questionId)` - Stop question timing

### Redux Actions
- `trackQuestionAnswerThunk` - Async action for answer tracking
- `trackHintRequestThunk` - Async action for hint tracking
- `trackActivityStartThunk` - Async action for activity start
- `trackActivityCompleteThunk` - Async action for activity completion
- `startQuestionTimerThunk` - Async action for timer start

## Contributing

### Adding New Event Types
1. Define event structure in `Analytics.ts`
2. Add tracking method to `AnalyticsTracker`
3. Create helper function in `helpers.ts`
4. Add Redux action to `analyticsSlice.ts`
5. Update documentation and tests

### Testing Changes
1. Run `analyticsDemo.testStructure()` to verify consistency
2. Test in multiple activity types
3. Verify console output format
4. Check localStorage persistence

## License

This analytics system is part of the AI Literacy Game project and follows the same license terms. 