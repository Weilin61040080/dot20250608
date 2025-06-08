# AI Literacy Game - Activities Guide

This guide explains the different types of learning activities available in the AI Literacy Game and how to configure them.

## Activity Types

The game currently supports four types of learning activities:

1. **Multiple Choice Questions**: Traditional quiz questions with multiple options
2. **Drag and Drop Activities**: Matching exercises where players drag items to their correct targets
3. **Open-Ended Questions**: Long-form responses that are evaluated using AI-based rubrics with structured JSON responses
4. **Chatbot Interactions**: Conversational activities where players interact with an AI assistant using the same structured JSON response system

## Activity Structure

All activities follow a common structure in the `activityContext.ts` file:

```typescript
export interface Activity {
  id: string;             // Unique identifier for the activity
  title: string;          // Activity title shown in the header
  description: string;    // Brief description of the activity
  npcId: string;          // Which NPC triggers this activity
  questions: ActivityQuestion[]; // Array of questions (can be of different types)
  introduction: string[]; // Dialog shown before the activity starts
  conclusion: string[];   // Dialog shown after completing the activity
  completionPoints: number; // Points awarded for completion
}
```

## Multiple Choice Questions

Multiple choice questions present learners with several options and require them to select the correct answer.

### Structure

```typescript
interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  optionFeedback: string[]; // Targeted feedback for each option
  imageUrl?: string;
}
```

### Example

```typescript
{
  id: 'mc-1',
  type: 'multiple-choice',
  question: 'What is the primary purpose of machine learning?',
  options: [
    'To replace human intelligence completely',
    'To enable computers to learn and improve from experience',
    'To create robots that look like humans',
    'To store large amounts of data'
  ],
  correctAnswer: 1,
  optionFeedback: [
    'Not quite. Machine learning aims to augment, not replace human intelligence.',
    'Correct! Machine learning enables computers to learn patterns and improve performance.',
    'That\'s more related to robotics and android development.',
    'That\'s data storage, not machine learning.'
  ],
  imageUrl: 'https://example.com/ml-diagram.png'
}
```

## Drag and Drop Questions

Drag and drop questions require learners to match items with appropriate target areas.

### Structure

```typescript
interface DragDropQuestion {
  id: string;
  type: 'drag-drop';
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  targetArea: string;
  imageUrl?: string;
}
```

### Example

```typescript
{
  id: 'dd-1',
  type: 'drag-drop',
  question: 'Match the AI technology with its primary application:',
  options: [
    'Natural Language Processing',
    'Computer Vision',
    'Reinforcement Learning'
  ],
  correctAnswer: 0,
  targetArea: 'Text Analysis and Understanding',
  imageUrl: 'https://example.com/ai-technologies.png'
}
```

## Open-Ended Questions

Open-ended questions allow players to provide longer, more thoughtful responses that are evaluated using AI-based rubrics with structured JSON responses. This is appropriate for complex topics requiring critical thinking.

```typescript
export interface OpenEndedQuestion {
  id: string;                // Unique identifier for the question
  type: 'open-ended';        // Type identifier
  question: string;          // The question text displayed to learners
  taskDescription: string;   // Task description used for API calls (hidden from UI)
  evaluationRubric: string;  // Detailed rubric for evaluation criteria
  sampleAnswer: string;      // Example of a good answer (for reference)
  imageUrl?: string;         // Optional image to display with the question
  maxLength?: number;        // Maximum character count (default: 500)
}
```

### Configuring Open-Ended Questions

When creating an open-ended question:

1. **Question**: Provide a clear, specific question that requires critical thinking
2. **Task Description**: Write detailed instructions for the AI evaluator (not shown to learners)
3. **Evaluation Rubric**: Define specific criteria in numbered format (e.g., "1 Criterion Name: Description")
4. **Sample Answer**: Include an example that demonstrates what a good response looks like
5. **Character Limit**: Set an appropriate limit based on the question's complexity

### AI Evaluation System

The AI evaluation system uses structured JSON responses to provide reliable, consistent grading:

#### Evaluation Process
1. **Rubric Parsing**: The system parses the evaluation rubric into numbered criteria
2. **AI Analysis**: The LLM evaluates the response against each criterion
3. **Structured Response**: Returns explicit pass/fail decisions with detailed feedback
4. **Status Calculation**: Determines overall status based on criteria met

#### Response Format
```json
{
  "success": true,
  "rubric": [
    {
      "criteria": "Identifies Sources of Bias",
      "passed": true,
      "feedback": "The response clearly identifies training data as a source of bias."
    },
    {
      "criteria": "Explains Mitigation Strategies",
      "passed": false,
      "feedback": "Could provide more specific examples of bias testing methods."
    }
  ],
  "overall_feedback": "Good analysis with room for more specific examples."
}
```

#### Grading Logic
- **Correct**: 80%+ of criteria passed (typically 4+ out of 5 criteria)
- **Partial**: 50-79% of criteria passed (typically 2-3 out of 5 criteria)  
- **Incorrect**: <50% of criteria passed (typically 0-1 out of 5 criteria)

## Chatbot Interactions

Chatbot activities simulate a conversation with an AI assistant. Players can ask questions and receive responses. Their conversation skills are evaluated using the same structured JSON response system.

```typescript
export interface ChatbotQuestion {
  id: string;                    // Unique identifier for the question
  type: 'chatbot';               // Type identifier
  initialPrompt: string;         // The bot's initial message
  context: string;               // Background information for the AI assistant
  taskDescription: string;       // Instructions shown to the learner
  evaluationRubric: string;      // Criteria for evaluating the learner's prompt
  suggestedQuestions: string[];  // Sample questions players can use
  imageUrl?: string;             // Optional image to display
  maxExchanges: number;          // Maximum allowed message exchanges
}
```

### Configuring Chatbot Activities

When creating a chatbot activity:

1. **Initial Prompt**: Write a clear greeting that explains the AI assistant's purpose
2. **Context**: Provide background information for the AI to understand the scenario
3. **Task Description**: Clear instructions for what the learner should accomplish
4. **Evaluation Rubric**: Define criteria for effective AI interaction (e.g., clarity, relevance, specificity)
5. **Suggested Questions**: Include examples to help players who may not know what to ask
6. **Exchange Limit**: Set a reasonable limit on the number of message exchanges

### AI Evaluation for Chatbot Activities

The system evaluates the learner's **first prompt** using structured criteria:

#### Common Evaluation Criteria
- **Requests Elaboration or Explanation**: Does the prompt ask for detailed information?
- **Relevance**: Is the prompt related to the specified topic?
- **Clarity of Purpose**: Does the prompt have a clear, specific goal?
- **Conciseness**: Is the prompt brief and well-structured?
- **Background/Context**: Does the prompt provide necessary context?

#### Evaluation Benefits
- **No Keyword Dependency**: Evaluation based on semantic understanding, not keyword matching
- **Explicit Feedback**: Clear explanations for each criterion
- **Consistent Grading**: Reliable pass/fail decisions across different responses
- **Educational Value**: Specific guidance on improving AI interaction skills

## Adding New Activities

To add a new activity:

1. Define the activity in the `activities` array in `src/data/activityContext.ts`
2. Create appropriate questions of the desired types
3. Link the activity to an NPC by setting the `npcId` to match an NPC in the map
4. Ensure any dialog scripts are updated to trigger the activity

## Example: Open-Ended Question Activity

Here's an example of an open-ended question activity for an AI Ethics topic:

```typescript
{
  id: 'activity-npc-3',
  title: 'AI Ethics Reflection',
  description: 'Explore ethical considerations in AI development and deployment.',
  npcId: 'npc-3',
  questions: [
    {
      id: 'oe-1',
      type: 'open-ended',
      question: 'Explain how bias can enter AI systems and what developers can do to mitigate this problem.',
      taskDescription: 'Explain how bias can enter AI systems and what developers can do to mitigate this problem.',
      evaluationRubric: '1. Identifies sources of bias in AI systems\n2. Explains mitigation strategies\n3. Provides specific examples of bias testing methods\n4. Discusses the importance of diverse development teams\n5. Discusses the importance of transparent systems with human oversight',
      sampleAnswer: 'Bias can enter AI systems through biased training data, algorithmic design choices, and incomplete testing. Developers can mitigate this by using diverse and representative datasets, implementing fairness metrics, conducting thorough bias audits, ensuring diverse development teams, and creating transparent systems with human oversight.',
      maxLength: 500
    }
  ],
  introduction: [
    "Hello, I'm an AI Researcher specializing in ethical considerations in artificial intelligence.",
    "Ethics is one of the most important aspects of AI development that is often overlooked until problems arise.",
    "I'd like to hear your thoughts on an important ethical challenge in AI. This will help you think critically about responsible AI development."
  ],
  conclusion: [
    "Thank you for your thoughtful response on AI ethics.",
    "These are the kinds of complex questions we must continually address as AI becomes more integrated into society.",
    "Remember that as AI systems become more powerful, our responsibility to develop them ethically becomes even more important."
  ],
  completionPoints: 50
}
```

## Example: Chatbot Activity

Here's an example of a chatbot interaction activity:

```typescript
{
  id: 'activity-npc-4',
  title: 'AI Assistant Interaction',
  description: 'Practice interacting with an AI chatbot assistant.',
  npcId: 'npc-4',
  questions: [
    {
      id: 'cb-1',
      type: 'chatbot',
      initialPrompt: "Hello! I'm an AI assistant designed to help answer your questions about artificial intelligence. What would you like to know about AI?",
      context: "This is a practice session for interacting with AI assistants. Try asking thoughtful questions about AI concepts, capabilities, or limitations. Your first question will be evaluated for clarity, relevance, and depth.",
      taskDescription: "Practice interacting with an AI chatbot assistant. Try asking thoughtful questions about AI concepts, capabilities, or limitations. Your first question will be evaluated for clarity, relevance, and depth.",
      evaluationRubric: "1. Requests elaboration or explanation\n2. Is the question related to the specified topic?\n3. Is the question clear, specific, and has a clear goal?\n4. Is the question brief and well-structured?\n5. Provides necessary context",
      suggestedQuestions: [
        "How do neural networks learn from data?",
        "What are the biggest challenges in creating ethical AI?",
        "How is AI different from traditional programming?",
        "What limitations do current AI systems have?"
      ],
      maxExchanges: 3
    }
  ],
  introduction: [
    "Hi there! I'm a demonstration chatbot designed to help you practice interacting with AI assistants.",
    "Learning how to effectively communicate with AI systems is becoming an essential skill in today's world.",
    "Would you like to try having a conversation with me? I can answer questions about AI concepts, and then we'll evaluate how effective your questions were."
  ],
  conclusion: [
    "Great job practicing your AI interaction skills!",
    "The quality of answers you get from AI systems often depends on how well you can formulate your questions.",
    "As AI continues to evolve, developing good prompting skills will help you get more accurate and useful responses."
  ],
  completionPoints: 45
} 