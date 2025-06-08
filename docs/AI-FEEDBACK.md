# AI Feedback System

This document explains the AI-powered feedback system implemented in the AI Literacy Game for evaluating open-ended responses.

## Overview

The AI Literacy Game includes an AI-powered feedback system that provides intelligent evaluation of student responses to open-ended questions. The system uses **structured JSON responses** from Large Language Models (LLMs) to provide explicit pass/fail decisions for each evaluation criterion, eliminating the need for keyword-based detection logic.

## Key Features

- **Structured JSON Responses**: LLMs return explicit pass/fail decisions for each rubric criterion
- **Detailed Feedback**: Each criterion includes specific feedback explaining the evaluation
- **Reliable Grading**: No more ambiguity from keyword-based detection
- **Consistent Format**: Both real AI and simulated responses use the same structured format

## Implementation

The system consists of three main components:

1. **Client-side Simulation**: A placeholder service that simulates AI feedback in the browser
2. **Direct API Integration**: A testing-only implementation that calls OpenAI API directly from the frontend
3. **Server-side Implementation**: A secure backend service that calls the OpenAI API (recommended for production)

### Structured Response Format

All AI feedback services now return responses in this standardized format:

```json
{
  "success": true,
  "rubric": [
    {
      "criteria": "Identifies Sources of Bias",
      "passed": true,
      "feedback": "The response clearly identifies training data and algorithmic design as sources of bias."
    },
    {
      "criteria": "Explains Mitigation Strategies", 
      "passed": false,
      "feedback": "The response mentions some strategies but could provide more specific examples of bias testing and fairness metrics."
    }
  ],
  "overall_feedback": "Good analysis with relevant examples. Could explore more specific mitigation techniques.",
  // Legacy fields for backward compatibility
  "feedback": "Good analysis with relevant examples...",
  "strengths": ["Clear identification of bias sources"],
  "areasForImprovement": ["More specific mitigation strategies"]
}
```

### Client-side Simulation

Located in `src/services/aiFeedbackService.ts`, this service provides a simulated AI feedback experience without requiring an actual OpenAI API key. 

Key features:
- **Structured Evaluation**: Simulates the same JSON format as real AI responses
- **Intelligent Logic**: Evaluates responses based on length, keyword presence, structure, and relevance
- **Contextual Feedback**: Generates specific feedback for each criterion type
- **Backward Compatibility**: Maintains legacy fields for existing components

### Direct API Integration (Testing Only)

Located in `src/services/directOpenAIService.ts`, this implementation calls the OpenAI API directly from the browser for testing.

⚠️ **IMPORTANT**: This approach is for local testing only and should never be used in production due to security risks.

Key features:
- **Structured Prompts**: Instructs the LLM to return the exact JSON format required
- **Rubric Processing**: Parses evaluation rubrics into numbered criteria for clear evaluation
- **Error Handling**: Provides fallback responses if the LLM returns invalid JSON
- **Consistent Temperature**: Uses lower temperature (0.3) for consistent evaluation results

### Activity Component Integration

Both `ChatbotActivity` and `OpenEndedActivity` components have been updated to:

1. **Remove Smart Detection**: No more keyword-based criteria detection logic
2. **Direct Processing**: Directly use the structured response from AI services
3. **Pass/Fail Logic**: Calculate overall status based on number of criteria met
4. **Enhanced Feedback**: Display specific feedback for each criterion

## Security Considerations

⚠️ **IMPORTANT**: Never expose your OpenAI API key in client-side code that's deployed to production.

The system is designed with security in mind:
1. API keys are stored in environment variables
2. The direct API integration approach should only be used for local testing
3. The server implementation includes error handling and validation
4. The system falls back to simulation mode if API key is not available

## Usage

### Using the Simulated Feedback (Default)

By default, the game uses the simulated feedback service. No setup is required for this to work.

### Using Direct API Integration (Testing Only)

For quick local testing:

1. Create a `.env` file in the project root with your OpenAI API key:
   ```
   REACT_APP_OPENAI_API_KEY=your_api_key_here
   ```

2. The system will automatically use the direct API integration if an API key is available

### Data Structure Changes

The `OpenEndedQuestion` interface has been simplified:
- **Removed**: `context` field (only used in ChatbotActivity)
- **Hidden**: Task description is no longer shown to learners but still used for API calls
- **Maintained**: All evaluation rubric and sample answer fields

## Evaluation Logic

### Criteria Evaluation
The system evaluates responses against multiple criteria types:
- **Source Identification**: Checks for mentions of bias sources
- **Strategy Explanation**: Looks for mitigation strategies
- **Understanding Demonstration**: Assesses conceptual understanding
- **Example Provision**: Evaluates use of specific examples
- **Critical Thinking**: Measures analytical depth

### Status Calculation
Overall status is determined by the number of criteria met:
- **Correct**: 80%+ of criteria passed
- **Partial**: 50-79% of criteria passed  
- **Incorrect**: <50% of criteria passed

## Customization

### Modifying Evaluation Criteria

You can customize evaluation by:

1. **Updating Rubrics**: Modify the `evaluationRubric` field in question definitions
2. **Adjusting Thresholds**: Change the pass/fail thresholds in activity components
3. **Custom Logic**: Implement specialized evaluation logic for specific question types

### Adjusting AI Prompts

To change how the AI evaluates responses:

1. **System Message**: Modify the system message in `directOpenAIService.ts`
2. **Rubric Format**: Adjust how rubrics are formatted for the LLM
3. **Response Structure**: Update the required JSON structure if needed

## Benefits of Structured Responses

1. **Reliability**: No ambiguity from keyword parsing
2. **Transparency**: Clear pass/fail decisions for each criterion
3. **Consistency**: Same format across all evaluation methods
4. **Maintainability**: Easier to debug and modify evaluation logic
5. **Scalability**: Can easily add new criteria types

## Limitations

- API calls may incur costs if using the OpenAI API
- Direct API integration exposes your API key if used in production
- Response time may vary depending on API availability and network conditions
- LLM responses may occasionally return invalid JSON (handled with fallbacks)

## Future Improvements

- Implement caching to reduce API calls for similar responses
- Add support for different LLM providers
- Enhanced security with rate limiting and authentication
- Real-time feedback as students type their responses
- Adaptive rubrics that adjust based on student level 