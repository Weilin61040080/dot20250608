# Try Again Feature Documentation

## Overview

The Try Again feature allows learners to retry questions when they provide incorrect answers, with different retry logic based on question type. This feature ensures learners understand concepts before proceeding to the next question.

## Feature Requirements

### Core Functionality
- Learners cannot proceed to the next question without answering correctly
- Feedback is provided for incorrect answers without revealing the correct answer
- "Try Again" button appears for incorrect answers
- Configurable retry attempts at the question type level

### Question Type Specific Logic

#### Multiple Choice & Drag-and-Drop Questions
- **Immediate Feedback**: Show correct/incorrect status immediately
- **Retry Logic**: Allow retry until correct answer is provided
- **No Answer Reveal**: Never show the correct answer, only feedback
- **Progression**: Must answer correctly to proceed

#### Open-Ended & Chatbot Questions (AI-Evaluated)
- **Rubric-Based Evaluation**: Questions evaluated against multiple criteria
- **Minimum Threshold**: Must meet 2 or more rubrics to pass
- **Retry Conditions**: Can retry if fewer than 2 rubrics are met
- **Maximum Attempts**: After 3 attempts, show "Next" button regardless of score
- **Progression**: Can proceed after meeting threshold OR reaching max attempts

## Implementation Details

### Redux State Management

#### New State Properties
```typescript
interface ActivityState {
  // ... existing properties
  questionAttempts: Record<string, number>;  // Track attempts per question
  questionStates: Record<string, QuestionState>; // Track question status
}

type QuestionState = 'unanswered' | 'correct' | 'incorrect';
```

#### New Actions
```typescript
// Increment attempt counter for a question
retryQuestion(payload: { questionId: string })

// Update question state (correct/incorrect)
updateQuestionState(payload: { questionId: string, questionState: QuestionState })
```

### Retry Configuration

#### Configuration Structure
```typescript
interface RetryConfig {
  maxAttempts: number;
  allowRetry: boolean;
}

// Default configurations by question type
const DEFAULT_RETRY_CONFIGS = {
  multipleChoice: { maxAttempts: Infinity, allowRetry: true },
  dragDrop: { maxAttempts: Infinity, allowRetry: true },
  openEnded: { maxAttempts: 3, allowRetry: true },
  chatbot: { maxAttempts: 3, allowRetry: true }
};
```

#### Configuration Access
```typescript
// Get retry config for any question
const retryConfig = getRetryConfig(question);
```

### Component Updates

#### MultipleChoiceActivity
- **State Tracking**: Uses Redux to track attempts and question state
- **Immediate Evaluation**: Evaluates answers on selection
- **Retry Logic**: Shows "Try Again" button for incorrect answers
- **Progression**: Only shows "Next" button after correct answer

#### DragDropActivity
- **State Tracking**: Uses Redux to track attempts and question state
- **Immediate Evaluation**: Evaluates answers on drop completion
- **Retry Logic**: Shows "Try Again" button for incorrect answers
- **Reset Functionality**: Clears drag state on retry

#### OpenEndedActivity
- **AI Evaluation**: Uses `evaluateWithAI` function for assessment
- **Rubric Display**: Shows detailed rubric evaluation results
- **Threshold Logic**: Requires 2+ rubrics to pass
- **Attempt Limiting**: Maximum 3 attempts before allowing progression

#### ChatbotActivity
- **Prompt Evaluation**: Evaluates first user message against rubrics
- **Conversation Reset**: Clears chat history on retry
- **Threshold Logic**: Requires 2+ rubrics to pass
- **Attempt Limiting**: Maximum 3 attempts before allowing progression

### UI/UX Patterns

#### Attempt Counter Display
```jsx
{currentAttempts > 0 && (
  <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#6c757d' }}>
    Attempt {currentAttempts} of {retryConfig.maxAttempts}
  </div>
)}
```

#### Button Logic
```jsx
const canRetry = questionState === 'incorrect' && 
  currentAttempts < retryConfig.maxAttempts &&
  !hasPassedMinimumThreshold;

const showNextButton = questionState === 'correct' || 
  hasPassedMinimumThreshold ||
  currentAttempts >= retryConfig.maxAttempts;

// Button rendering
{canRetry && (
  <Button variant="secondary" onClick={handleTryAgain}>
    Try Again
  </Button>
)}
{showNextButton && (
  <Button onClick={handleNext}>
    {isLastQuestion ? 'Finish' : 'Next'}
  </Button>
)}
```

#### Feedback Display
- **Immediate Feedback**: Show evaluation results immediately
- **Constructive Messaging**: Provide helpful feedback without revealing answers
- **Visual Indicators**: Use color coding and icons for rubric status
- **Progress Indication**: Show rubric completion count (e.g., "2/4 met")

### Analytics Integration

The "Try Again" feature includes comprehensive analytics tracking to monitor learner progress and engagement:

### Tracked Events

1. **Question Attempts**: Number of attempts per question
2. **Question State Changes**: Transitions between unanswered → incorrect → correct
3. **Evaluation Results**: AI evaluation scores and rubric results for open-ended/chatbot questions
4. **Targeted Feedback Logging**: **NEW** - Logs the actual feedback shown to learners

### Targeted Feedback Analytics

**Previous Behavior**: Analytics logged generic question explanations for all learners
**New Behavior**: Analytics logs the specific targeted feedback each learner actually receives

#### Multiple Choice Questions
- **Correct answers**: Logs the explanation for the correct option
- **Incorrect answers**: Logs the specific feedback for the chosen wrong option
- **Example**: If a learner selects option A (wrong), analytics logs "A computer program is too broad..." instead of the generic explanation

#### Drag-Drop Questions  
- **Correct matches**: Logs the explanation for the correct option
- **Incorrect matches**: Logs the specific feedback for the chosen wrong option
- **Example**: If a learner drags "Neural Networks" (wrong), analytics logs "Neural Networks are inspired by biological brains..." instead of the generic explanation

#### Benefits
- **Personalized insights**: Understand what specific misconceptions learners have
- **Targeted interventions**: Identify common wrong answers and their associated feedback
- **Content optimization**: Improve feedback quality based on learner responses
- **Learning analytics**: Better data for adaptive learning systems

### Analytics Data Structure

```typescript
// Before: Generic feedback
{
  feedback: {
    explanation: "AI refers to systems that can perform tasks typically requiring human intelligence."
  }
}

// After: Targeted feedback
{
  feedback: {
    explanation: "A computer program is too broad. While AI uses computer programs, this doesn't capture the intelligence aspect."
  }
}
```

## Testing Scenarios

### Multiple Choice Questions
1. **Correct First Try**: Select correct answer → Show "Next" button
2. **Incorrect Then Correct**: Select wrong → "Try Again" → Select correct → "Next"
3. **Multiple Incorrect**: Multiple wrong attempts → Always show "Try Again"

### Drag-and-Drop Questions
1. **Correct First Try**: Complete correctly → Show "Next" button
2. **Incorrect Then Correct**: Complete wrong → "Try Again" → Complete correct → "Next"
3. **Reset Functionality**: Verify drag state clears on retry

### Open-Ended Questions
1. **Pass Threshold**: Meet 2+ rubrics → Show "Next" button
2. **Below Threshold**: Meet <2 rubrics → Show "Try Again" (if attempts < 3)
3. **Max Attempts**: After 3 attempts → Show "Next" regardless of score
4. **Rubric Display**: Verify detailed rubric feedback is shown

### Chatbot Questions
1. **Pass Threshold**: Meet 2+ rubrics → Show "Next" button
2. **Below Threshold**: Meet <2 rubrics → Show "Try Again" (if attempts < 3)
3. **Max Attempts**: After 3 attempts → Show "Next" regardless of score
4. **Chat Reset**: Verify conversation clears on retry

## Configuration Examples

### Custom Retry Limits
```typescript
// In activityContext.ts
const customQuestion: OpenEndedQuestion = {
  // ... other properties
  retryConfig: {
    maxAttempts: 5,  // Allow 5 attempts instead of default 3
    allowRetry: true
  }
};
```

### Disable Retries
```typescript
const noRetryQuestion: MultipleChoiceQuestion = {
  // ... other properties
  retryConfig: {
    maxAttempts: 1,
    allowRetry: false
  }
};
```

## Future Enhancements

### Potential Improvements
1. **Adaptive Hints**: Provide increasingly specific hints with each attempt
2. **Partial Credit**: Award partial points for partially correct answers
3. **Time Limits**: Add time constraints for attempts
4. **Difficulty Adjustment**: Adjust question difficulty based on attempt patterns
5. **Personalized Feedback**: Tailor feedback based on learner's previous performance

### Analytics Enhancements
1. **Attempt Pattern Analysis**: Identify common mistake patterns
2. **Difficulty Metrics**: Calculate question difficulty based on attempt data
3. **Learning Path Optimization**: Suggest review topics based on retry patterns
4. **Engagement Metrics**: Track how retries affect learner engagement

## Technical Notes

### Performance Considerations
- **State Management**: Efficient Redux state updates for attempt tracking
- **Memory Usage**: Clear evaluation data when not needed
- **Re-rendering**: Optimize component re-renders during retries

### Accessibility
- **Screen Readers**: Proper ARIA labels for attempt counters and buttons
- **Keyboard Navigation**: Ensure all retry functionality is keyboard accessible
- **Visual Indicators**: High contrast feedback for evaluation results

### Error Handling
- **AI Service Failures**: Graceful fallback when AI evaluation fails
- **Network Issues**: Handle connectivity problems during evaluation
- **State Corruption**: Recovery mechanisms for invalid state scenarios 