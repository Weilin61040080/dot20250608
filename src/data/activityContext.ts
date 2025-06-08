// Activity Context - Defines the data structure for learning activities

// Retry configuration for questions
export interface RetryConfig {
  maxAttempts: number; // Maximum number of attempts allowed
  showNextAfterMaxAttempts: boolean; // Whether to show next button after max attempts
  resetOnRetry: boolean; // Whether to reset question UI on retry
}

// Default retry configurations for different question types
export const DEFAULT_RETRY_CONFIGS = {
  'multiple-choice': {
    maxAttempts: 999, // Unlimited retries - must get it right eventually
    showNextAfterMaxAttempts: false,
    resetOnRetry: true
  } as RetryConfig,
  'drag-drop': {
    maxAttempts: 999, // Unlimited retries - must get it right eventually
    showNextAfterMaxAttempts: false,
    resetOnRetry: true
  } as RetryConfig,
  'open-ended': {
    maxAttempts: 3, // Allow 3 attempts for open-ended
    showNextAfterMaxAttempts: true,
    resetOnRetry: false
  } as RetryConfig,
  'chatbot': {
    maxAttempts: 3, // Allow 3 attempts for chatbot
    showNextAfterMaxAttempts: true,
    resetOnRetry: false
  } as RetryConfig
};

// Multiple Choice Question Type
export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  optionFeedback?: string[]; // Optional feedback for each option (same order as options array)
  imageUrl?: string;
  retryConfig?: RetryConfig; // Optional custom retry configuration
}

// Drag and Drop Question Type
export interface DragDropQuestion {
  id: string;
  type: 'drag-drop';
  question: string;
  options: {
    id: string;
    text: string;
    imageUrl?: string;
    feedback?: string; // Optional feedback for this specific option
  }[];
  correctAnswer: string; // ID of the correct option
  targetArea: {
    text: string;
    imageUrl?: string;
  };
  retryConfig?: RetryConfig; // Optional custom retry configuration
}

// Open-Ended Question Type
export interface OpenEndedQuestion {
  id: string;
  type: 'open-ended';
  question: string;
  taskDescription: string; // The task description used for API calls (not shown to user)
  evaluationRubric: string; // The rubric used for evaluating the user's response
  sampleAnswer: string; // Example of a good answer (for reference only)
  imageUrl?: string;
  maxLength?: number;
  retryConfig?: RetryConfig; // Optional custom retry configuration
}

// Chatbot Question Type
export interface ChatbotQuestion {
  id: string;
  type: 'chatbot';
  initialPrompt: string;
  context: string; // Background information for the AI
  taskDescription: string; // The task description shown to the user
  evaluationRubric: string; // The rubric used for evaluating the user's prompt
  suggestedQuestions: string[]; // Suggested questions for the user
  imageUrl?: string;
  maxExchanges: number;
  retryConfig?: RetryConfig; // Optional custom retry configuration
}

// Helper function to get retry configuration for a question
export const getRetryConfig = (question: ActivityQuestion): RetryConfig => {
  return question.retryConfig || DEFAULT_RETRY_CONFIGS[question.type];
};

// Union type for all question types
export type ActivityQuestion = 
  | MultipleChoiceQuestion 
  | DragDropQuestion 
  | OpenEndedQuestion 
  | ChatbotQuestion;

// Activity structure
export interface Activity {
  id: string;
  title: string;
  description: string;
  npcId: string;
  questions: ActivityQuestion[];
  introduction: string[];  // Pre-activity dialog
  conclusion: string[];    // Post-activity dialog
  completionPoints: number;
}

// Sample activities for each NPC
export const activities: Activity[] = [
  {
    id: 'activity-npc-1',
    title: 'AI Fundamentals Quiz',
    description: 'Test your knowledge of AI fundamentals with these multiple choice questions.',
    npcId: 'npc-1',
    questions: [
      {
        id: 'mc-1',
        type: 'multiple-choice',
        question: 'What does AI stand for?',
        options: [
          'Automated Intelligence',
          'Artificial Intelligence',
          'Advanced Interfaces',
          'Algorithmic Integration'
        ],
        correctAnswer: 1,
        optionFeedback: [
          'Automated Intelligence is not correct. While AI systems can be automated, the "A" in AI stands for "Artificial".',
          'Correct! AI stands for Artificial Intelligence.',
          'Advanced Interfaces is not correct. AI is about intelligence, not just user interfaces.',
          'Algorithmic Integration is not correct. While AI uses algorithms, this is not what AI stands for.'
        ]
      },
      {
        id: 'mc-2',
        type: 'multiple-choice',
        question: 'Which of these is NOT considered a branch of AI?',
        options: [
          'Machine Learning',
          'Digital Storage',
          'Natural Language Processing',
          'Computer Vision'
        ],
        correctAnswer: 1,
        optionFeedback: [
          'Machine Learning is actually a major branch of AI that focuses on algorithms that can learn from data.',
          'Correct! Digital Storage is about data storage technology, not artificial intelligence.',
          'Natural Language Processing is a branch of AI that deals with understanding and generating human language.',
          'Computer Vision is a branch of AI that enables machines to interpret and understand visual information.'
        ]
      },
      {
        id: 'mc-3',
        type: 'multiple-choice',
        question: 'What is machine learning?',
        options: [
          'Programming computers to follow exact instructions',
          'Teaching machines to physically assemble products',
          'Enabling systems to learn and improve from experience',
          'Designing user interfaces for robots'
        ],
        correctAnswer: 2,
        optionFeedback: [
          'Programming computers to follow exact instructions is traditional programming, not machine learning.',
          'Teaching machines to physically assemble products is more related to robotics and automation.',
          'Correct! Machine learning enables systems to learn and improve from experience without explicit programming.',
          'Designing user interfaces for robots is about user experience design, not machine learning.'
        ]
      }
    ],
    introduction: [
      "Hello there! I'm the AI Teacher. I'm here to help you understand the basics of artificial intelligence.",
      "Before we dive too deep, let's make sure you have a solid foundation. Would you like to take a short quiz on AI fundamentals?",
      "Great! I'll ask you three multiple-choice questions. Choose the answer you think is correct, and I'll provide feedback along the way."
    ],
    conclusion: [
      "Well done! You've completed the AI Fundamentals Quiz.",
      "Understanding these basic concepts is essential as you learn more about artificial intelligence.",
      "Feel free to explore more of the classroom and talk to other NPCs to continue your learning journey!"
    ],
    completionPoints: 30
  },
  {
    id: 'activity-npc-2',
    title: 'AI Applications Matching',
    description: 'Match the AI technology with its correct application.',
    npcId: 'npc-2',
    questions: [
      {
        id: 'dd-1',
        type: 'drag-drop',
        question: 'Which AI technology is best suited for this application: "Converting spoken words into written text"?',
        options: [
          {
            id: 'opt-1',
            text: 'Computer Vision',
            imageUrl: '/assets/modules/basic-ai/activities/computer-vision-icon.png',
            feedback: 'Computer Vision is used for analyzing visual data like images and videos, not for processing audio or speech.'
          },
          {
            id: 'opt-2',
            text: 'Speech Recognition',
            imageUrl: '/assets/modules/basic-ai/activities/speech-recognition-icon.png',
            feedback: 'Correct! Speech Recognition is specifically designed to convert spoken language into written text.'
          },
          {
            id: 'opt-3',
            text: 'Robotics',
            imageUrl: '/assets/modules/basic-ai/activities/robotics-icon.png',
            feedback: 'Robotics involves physical machines and automation, not speech-to-text conversion.'
          }
        ],
        correctAnswer: 'opt-2',
        targetArea: {
          text: 'Converting spoken words into written text',
          imageUrl: '/assets/modules/basic-ai/activities/dictation-app.png'
        }
      },
      {
        id: 'dd-2',
        type: 'drag-drop',
        question: 'Which AI technology is best suited for this application: "Detecting objects in photographs"?',
        options: [
          {
            id: 'opt-1',
            text: 'Computer Vision',
            imageUrl: '/assets/modules/basic-ai/activities/computer-vision-icon.png',
            feedback: 'Correct! Computer Vision is specifically designed to analyze and understand visual content like photographs.'
          },
          {
            id: 'opt-2',
            text: 'Natural Language Processing',
            imageUrl: '/assets/modules/basic-ai/activities/nlp-icon.png',
            feedback: 'Natural Language Processing deals with understanding and generating human language, not analyzing images.'
          },
          {
            id: 'opt-3',
            text: 'Recommendation Systems',
            imageUrl: '/assets/modules/basic-ai/activities/recommendation-icon.png',
            feedback: 'Recommendation Systems suggest items based on user preferences, not for detecting objects in images.'
          }
        ],
        correctAnswer: 'opt-1',
        targetArea: {
          text: 'Detecting objects in photographs',
          imageUrl: '/assets/modules/basic-ai/activities/object-detection.png'
        }
      }
    ],
    introduction: [
      "Hi there! I'm a student in this AI classroom.",
      "I've been learning about different AI technologies and their applications. It's really fascinating!",
      "Would you like to try a matching activity? I'll show you some applications, and you can drag the correct AI technology that would be used for each one."
    ],
    conclusion: [
      "Great job with the matching activity!",
      "Understanding which AI technologies are used for different applications helps you see how AI is being used in the real world.",
      "There are so many exciting ways AI is changing how we live and work. Keep exploring to learn more!"
    ],
    completionPoints: 40
  },
  {
    id: 'activity-npc-3',
    title: 'AI Ethics Reflection',
    description: 'Explore ethical considerations in AI development and deployment.',
    npcId: 'npc-3',
    questions: [
      {
        id: 'oe-1',
        type: 'open-ended',
        question: 'Quesiton: Explain how bias can enter AI systems and what developers can do to mitigate this problem.',
        taskDescription: 'taskDescription here ---- As an AI researcher, you need to understand the sources of bias in AI systems and how to address them. Write a comprehensive response explaining how bias can enter AI systems and what developers can do to mitigate this problem.',
        evaluationRubric: `1 Identifies Sources of Bias: The response identifies specific ways bias can enter AI systems (e.g., training data, algorithmic design, human assumptions).
2 Explains Mitigation Strategies: The response provides concrete strategies developers can use to reduce bias (e.g., diverse datasets, bias testing, fairness metrics).
3 Demonstrates Understanding: The response shows clear understanding of AI ethics concepts and the complexity of bias in AI systems.
4 Provides Specific Examples: The response includes specific examples or scenarios to illustrate points about bias sources or mitigation strategies.
5 Shows Critical Thinking: The response demonstrates thoughtful analysis and consideration of multiple perspectives on AI bias and ethics.`,
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
  },
  {
    id: 'activity-npc-4',
    title: 'AI Prompt Practice',
    description: 'Learn how to craft effective prompts for AI assistants across different subjects.',
    npcId: 'npc-4',
    questions: [
      {
        id: 'chatbot-1',
        type: 'chatbot',
        initialPrompt: "Hi, how can I help you today?",
        context: "This is a water cycle exercise. The learner is practicing how to ask effective questions about the water cycle for exam preparation.",
        taskDescription: "Last week, your geography teacher explained how the water cycle works. Tomorrow, there will be a test on how and why each step occurs. While you have a diagram of the water cycle in your textbook, you've forgotten how it works. Write a prompt to ask the AI Chatbot to help you prepare for this geography quiz about water cycle.",
        evaluationRubric: `1 Requests Elaboration or Explanation: The prompt requests elaboration, extension, or explanation besides explicitly seeking a direct response.
2 Relevance: The prompt is related to the topic "water cycle".
3 Clarity of Purpose: The prompt identify a specific and clear purpose of "how" or "why" each water cycle step work.
4 Conciseness: The prompt itself is brief and concise.
5 Background/Context: The prompt provides the context for why this question was asked, such as including the background information (middle school geography or a middle school student).`,
        suggestedQuestions: [],
        maxExchanges: 2
      },
      {
        id: 'chatbot-2',
        type: 'chatbot',
        initialPrompt: "Hi, how can I help you today?",
        context: "This is a biology exercise about cells. The learner is practicing how to ask effective questions to broaden their understanding of cells.",
        taskDescription: "Yesterday, you learned 'what is a cell' in the biology class. You roughly understood what cells are and main components in a cell. Now, as you are interested in biology, you want to broaden your understanding of cells. This isn't about course requirements, just a topic (cell) you're interested in learning more about. The only resource you have is your biology textbook. Write a prompt to the AI Chatbot to help you extend your knowledge about cells!",
        evaluationRubric: `1 Relevance: The prompt is related to the topic about cells.
2 Clarity of Purpose: The prompt identify a specific and clear purpose.
3 Conciseness: The prompt itself is brief and concise.
4 Background/Context: The prompt explains why this question was asked, such as the background about middle school biology learning.`,
        suggestedQuestions: [],
        maxExchanges: 2
      },
      {
        id: 'chatbot-3',
        type: 'chatbot',
        initialPrompt: "Hi, how can I help you today?",
        context: "This is a math exercise about linear equations. The learner is practicing how to ask for help understanding math concepts without directly asking for answers.",
        taskDescription: "You're struggling to find the values of x and y when solving a system of linear equations with two variables in the assignment: 10x+4y = 3 and -2x+10y = 4. This assignment is due in one day. Write a prompt for the AI Chatbot to help you understand the math concepts of two-variable linear equations.",
        evaluationRubric: `1 Not Explicitly Seeking a Direct Response: The prompt does not ask for a solution to solve a problem or the answers (what are x and y).
2 Requests Elaboration or Explanation: The prompt requests elaboration, extension, or explanation of this two-variable linear equation question.
3 Relevance: The prompt is related to the topic of two-variable linear equations.
4 Clarity of Purpose: The prompt identifies a specific and clear purpose such as explaining the involved math concepts.
5 Conciseness: The prompt itself is brief and concise.
6 Background/Context: The prompt explains why this question was asked, such as the background of completing a middle school math assignment.`,
        suggestedQuestions: [],
        maxExchanges: 2
      }
    ],
    introduction: [
      "Hello! I'm Chatty, an AI assistant designed to help you practice creating effective prompts.",
      "Knowing how to craft good prompts for AI systems is an important skill in the age of artificial intelligence.",
      "I'll give you three different scenarios where you'll need to write prompts for different subjects. After each prompt, I'll give you feedback on how effective your prompt was.",
      "Let's start with our first exercise about the water cycle in geography!"
    ],
    conclusion: [
      "Great job completing all the prompt exercises!",
      "You've practiced creating prompts across different subjects: geography, biology, and math.",
      "Remember, a good prompt is clear, specific, provides context, and asks for the right level of detail.",
      "These skills will help you get better results when working with AI systems in the future!"
    ],
    completionPoints: 50
  }
];

// Helper function to get activity by NPC ID
export const getActivityByNpcId = (npcId: string): Activity | undefined => {
  return activities.find(activity => activity.npcId === npcId);
};

// Helper function to get activity by activity ID
export const getActivityById = (activityId: string): Activity | undefined => {
  return activities.find(activity => activity.id === activityId);
}; 