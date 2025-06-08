# Retry Logic and Attempt Tracking System

This document provides a comprehensive overview of the retry logic and attempt tracking system implemented in the AI Literacy Game for AI-evaluated questions (open-ended and chatbot questions).

## Overview

The game implements a sophisticated retry system that allows learners to attempt AI-evaluated questions multiple times with intelligent button display logic based on their performance and attempt count.

## System Architecture

### Core Components

1. **Redux State Management** (`src/store/slices/activitySlice.ts`)
   - `questionAttempts`: Tracks attempts per question ID
   - `questionStates`: Tracks question states ('unanswered', 'submitted', 'correct', 'incorrect')
   - `answerQuestion`: Action that increments attempt counter
   - `retryQuestion`: Action that resets question state for retry

2. **Retry Configuration** (`src/data/activityContext.ts`)
   - `getRetryConfig()`: Returns retry settings per question type
   - Default: 3 max attempts, 2 minimum rubrics to pass

3. **Component Implementation**
   - `OpenEndedActivity.tsx`: Handles open-ended question retry logic
   - `ChatbotActivity.tsx`: Handles chatbot question retry logic

## Button Display Logic

### For Both Question Types (Open-Ended & Chatbot)

The system follows a consistent logic across both question types:

#### **When Learner Passes (< 2 unmet rubrics)**
- ✅ **Shows**: "Next/Finish" button only
- ❌ **Hides**: "Try Again" button
- **Rationale**: Learner has met the minimum requirements and can proceed

#### **When Learner Fails (2+ unmet rubrics)**
- ✅ **Shows**: "Try Again" button only
- ❌ **Hides**: "Next/Finish" button
- **Rationale**: Learner needs to improve their response

#### **When Max Attempts Reached**
- ✅ **Shows**: Both "Try Again" AND "Next/Finish" buttons
- **Rationale**: Learner can choose to retry or proceed despite not passing

### Implementation Code

```typescript
// Logic for showing buttons:
const maxAttemptsReached = currentAttempts >= retryConfig.maxAttempts;
const hasPassed = unmetRubrics < 2;
const hasFailed = unmetRubrics >= 2;

const canRetry = (hasFailed && currentAttempts < retryConfig.maxAttempts) || maxAttemptsReached;
const showNextButton = hasPassed || maxAttemptsReached;
```

## Attempt Counting System

### Open-Ended Questions

**Trigger**: User clicks "Submit Answer" button
- ✅ Each submission increments attempt counter by 1
- ✅ Immediate evaluation and feedback
- ✅ Button logic updates based on results

**Flow**:
1. User types response
2. User clicks "Submit Answer"
3. `answerQuestion` action called → attempt counter increments
4. AI evaluation performed
5. Button display logic applied

### Chatbot Questions

**Trigger**: User clicks "Evaluate Your Prompt" button
- ✅ Only evaluation increments attempt counter
- ❌ Sending chat messages does NOT increment counter
- ✅ Multiple chat exchanges allowed before evaluation

**Flow**:
1. User sends multiple chat messages (no attempt increment)
2. User clicks "Evaluate Your Prompt"
3. `answerQuestion` action called → attempt counter increments
4. AI evaluation of first user message
5. Button display logic applied

### Key Fix: Double Counting Prevention

**Problem**: Chatbot questions were incrementing attempts twice
- Once in `handleSendMessage()` when storing conversation
- Once in `handleEvaluate()` when evaluating prompt

**Solution**: 
- ❌ Removed `answerQuestion` call from `handleSendMessage()`
- ✅ Only `handleEvaluate()` calls `answerQuestion`

## Retry Configuration

### Default Settings

```typescript
const retryConfig = {
  maxAttempts: 3,
  minRubricsToPass: 2
};
```

### Per Question Type Configuration

The system supports different retry configurations per question type through the `getRetryConfig()` function:

- **Open-ended questions**: 3 max attempts
- **Chatbot questions**: 3 max attempts
- **Multiple choice**: No retries (immediate feedback)
- **Drag-and-drop**: No retries (immediate feedback)

## Attempt Isolation

### Per-Question Tracking

Each question maintains its own attempt counter:
- ✅ `state.questionAttempts[questionId]` - isolated per question
- ✅ Moving to next question starts fresh with attempt 0
- ✅ No carryover between questions

### State Reset Points

1. **New Question**: `currentAttempts = 0`
2. **Retry Question**: Attempt counter preserved, state reset to 'unanswered'
3. **Close Activity**: All attempts and states cleared

## Example Scenarios

### Scenario 1: Failed First Attempt
```
Question: "Explain AI bias"
Attempt 1: User submits poor response
Result: 1/5 rubrics passed (4 unmet)
Display: "Try Again" button only
State: currentAttempts = 1, questionState = 'incorrect'
```

### Scenario 2: Passed First Attempt
```
Question: "Explain AI bias"
Attempt 1: User submits good response
Result: 4/5 rubrics passed (1 unmet)
Display: "Next" button only
State: currentAttempts = 1, questionState = 'correct'
```

### Scenario 3: Failed at Max Attempts
```
Question: "Explain AI bias"
Attempt 3: User submits poor response
Result: 1/5 rubrics passed (4 unmet)
Display: Both "Try Again" AND "Next" buttons
State: currentAttempts = 3, questionState = 'incorrect'
```

### Scenario 4: Chatbot Interaction
```
Question: "Create a prompt for AI assistant"
Actions:
1. User: "Hello" → Bot: "Hi there!" (no attempt increment)
2. User: "Help me" → Bot: "How can I help?" (no attempt increment)
3. User clicks "Evaluate Your Prompt" (attempt increments to 1)
4. AI evaluates first user message: "Hello"
5. Result: 0/5 rubrics passed
6. Display: "Try Again" button only
```

## Debug Logging

The system includes comprehensive debug logging for troubleshooting:

```typescript
console.log(`[ActivityType] Question ${question.id} retry logic:`, {
  questionState,
  currentAttempts,
  maxAttempts: retryConfig.maxAttempts,
  passedRubrics,
  totalRubrics,
  unmetRubrics,
  hasPassedMinimumRubrics,
  maxAttemptsReached,
  hasPassed,
  hasFailed,
  canRetry,
  showNextButton,
  isEvaluated
});
```

## Testing Guidelines

### Manual Testing Checklist

**Open-Ended Questions:**
- [ ] Submit poor response → "Try Again" appears
- [ ] Submit good response → "Next" appears
- [ ] Reach max attempts with poor response → Both buttons appear
- [ ] Attempt counter shows correct values (1/3, 2/3, 3/3)

**Chatbot Questions:**
- [ ] Send multiple messages → No attempt increment
- [ ] Click "Evaluate" → Attempt increments by 1 only
- [ ] Poor evaluation → "Try Again" appears
- [ ] Good evaluation → "Next" appears
- [ ] Max attempts reached → Both buttons appear

**Cross-Question Isolation:**
- [ ] Move to next question → Attempt counter resets to 0
- [ ] Previous question attempts don't affect new question

## Troubleshooting

### Common Issues

1. **Double Counting in Chatbot**
   - **Symptom**: Attempt shows 2/3 after first evaluation
   - **Cause**: `answerQuestion` called in both send and evaluate
   - **Fix**: Only call `answerQuestion` in `handleEvaluate`

2. **Attempts Carrying Over**
   - **Symptom**: New question starts with attempt > 0
   - **Cause**: Question ID collision or state not reset
   - **Fix**: Ensure unique question IDs and proper state management

3. **Wrong Button Display**
   - **Symptom**: Both buttons show when only one should
   - **Cause**: Logic error in button display conditions
   - **Fix**: Check `hasPassed`, `hasFailed`, and `maxAttemptsReached` logic

### Debug Steps

1. Check browser console for retry logic logs
2. Verify `currentAttempts` and `maxAttempts` values
3. Confirm `questionState` is correctly set
4. Validate rubric evaluation results
5. Test button display logic with different scenarios

## Future Enhancements

### Potential Improvements

1. **Configurable Retry Settings**
   - Per-activity retry limits
   - Dynamic retry based on difficulty
   - Adaptive feedback based on attempt number

2. **Enhanced Analytics**
   - Track retry patterns
   - Identify difficult questions
   - Measure learning progression

3. **Progressive Hints**
   - Provide more specific feedback on later attempts
   - Unlock hints after failed attempts
   - Guided improvement suggestions

## Related Files

- `src/store/slices/activitySlice.ts` - Redux state management
- `src/data/activityContext.ts` - Retry configuration
- `src/components/activities/OpenEndedActivity.tsx` - Open-ended implementation
- `src/components/activities/ChatbotActivity.tsx` - Chatbot implementation
- `docs/DEBUGGING.md` - General debugging information 