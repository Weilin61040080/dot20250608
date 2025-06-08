/**
 * Analytics Demo - Demonstrates the standardized analytics tracking system
 * 
 * This demo showcases how the analytics system logs events in a standardized format
 * with proper evaluation and feedback structures.
 */

import { analyticsTracker } from './analyticsTracker';
import { 
  trackActivityStart, 
  trackActivityComplete, 
  trackQuestionAnswer,
  trackHintRequest,
  startQuestionTimer
} from './helpers';
import { 
  MultipleChoiceQuestion, 
  DragDropQuestion, 
  OpenEndedQuestion 
} from '../../data/activityContext';

// Demo configuration
const DEMO_CONFIG = {
  studentId: 'demo_student_123',
  classId: 'demo_class_456',
  activityId: 'demo_activity_789',
  moduleName: 'AI Fundamentals Demo'
};

// Create demo tracker with console and localStorage transports
const demoTracker = analyticsTracker;

/**
 * Simulates a complete learning session with multiple questions
 */
export async function runAnalyticsDemo(): Promise<void> {
  console.log('🚀 Starting Analytics Demo...');
  console.log('This demo will showcase the standardized analytics tracking system');
  
  try {
    // Set user profile for demo
    demoTracker.setUserProfile({
      studentId: DEMO_CONFIG.studentId,
      classId: DEMO_CONFIG.classId
    });

    // 1. Track activity start
    console.log('\n📚 Starting activity...');
    await trackActivityStart(
      DEMO_CONFIG.activityId,
      DEMO_CONFIG.moduleName,
      3 // total questions
    );

    // 2. Simulate multiple choice question
    console.log('\n❓ Question 1: Multiple Choice');
    const multipleChoiceQuestion: MultipleChoiceQuestion = {
      id: 'demo-mc-1',
      type: 'multiple-choice',
      question: 'What is artificial intelligence?',
      options: [
        'A computer program',
        'Machine learning algorithms',
        'Systems that can perform tasks typically requiring human intelligence',
        'A type of robot'
      ],
      correctAnswer: 2,
      optionFeedback: [
        'A computer program is too broad. While AI uses computer programs, this doesn\'t capture the intelligence aspect.',
        'Machine learning is a subset of AI, but AI encompasses much more than just ML algorithms.',
        'Correct! AI refers to systems that can perform tasks typically requiring human intelligence.',
        'Robots can use AI, but AI itself is not limited to physical robots.'
      ]
    };

    startQuestionTimer(DEMO_CONFIG.activityId, multipleChoiceQuestion.id);
    await sleep(2000); // Simulate thinking time

    // Submit correct answer with targeted feedback
    const mcTargetedFeedback = multipleChoiceQuestion.optionFeedback![2]; // Feedback for correct option
    await trackQuestionAnswer(
      DEMO_CONFIG.activityId,
      multipleChoiceQuestion,
      2, // correct answer
      DEMO_CONFIG.moduleName,
      undefined, // no AI evaluation
      mcTargetedFeedback // pass the targeted feedback
    );
    console.log('✅ Correct answer submitted with targeted feedback');

    // 3. Simulate drag-drop question
    console.log('\n❓ Question 2: Drag & Drop');
    const ddQuestion: DragDropQuestion = {
      id: 'q2_dd',
      type: 'drag-drop',
      question: 'Match the concept with its description',
      options: [
        { 
          id: 'ml', 
          text: 'Machine Learning',
          feedback: 'Correct! Machine Learning is specifically designed for algorithms that improve through experience.'
        },
        { 
          id: 'nn', 
          text: 'Neural Networks',
          feedback: 'Neural Networks are inspired by biological brains but are not specifically about learning from experience.'
        }
      ],
      correctAnswer: 'ml',
      targetArea: {
        text: 'Algorithms that improve through experience'
      }
    };

    startQuestionTimer(DEMO_CONFIG.activityId, ddQuestion.id);
    await sleep(1000);

    // Request a hint
    await trackHintRequest(
      DEMO_CONFIG.activityId,
      ddQuestion.id,
      'drag-drop',
      1,
      'Think about how each concept relates to learning and adaptation',
      DEMO_CONFIG.moduleName
    );
    console.log('💡 Hint requested and provided');

    await sleep(1500);

    // Submit incorrect answer with targeted feedback
    const wrongOption = ddQuestion.options.find(opt => opt.id === 'nn');
    const ddTargetedFeedback = wrongOption?.feedback || 'Generic fallback feedback';
    await trackQuestionAnswer(
      DEMO_CONFIG.activityId,
      ddQuestion,
      'nn', // wrong answer
      DEMO_CONFIG.moduleName,
      undefined, // no AI evaluation
      ddTargetedFeedback // pass the targeted feedback for the wrong option
    );
    console.log('⚠️ Incorrect answer submitted with targeted feedback');

    // 4. Simulate open-ended question
    console.log('\n❓ Question 3: Open-ended');
    const oeQuestion: OpenEndedQuestion = {
      id: 'q3_oe',
      type: 'open-ended',
      question: 'Explain how AI might impact society in the next 10 years',
      taskDescription: 'Provide a thoughtful analysis of how AI might impact society in the next 10 years, considering both benefits and challenges.',
      evaluationRubric: 'Identifies key AI applications (25%) | Discusses positive impacts (25%) | Addresses potential challenges (25%) | Provides specific examples (25%)',
      sampleAnswer: 'AI will transform industries through automation, enhance decision-making, but also raise concerns about job displacement and privacy.'
    };

    startQuestionTimer(DEMO_CONFIG.activityId, oeQuestion.id);
    await sleep(3000); // Longer thinking time for open-ended

    // Submit open-ended answer with AI evaluation
    const aiEvaluation = {
      score: 8,
      maxScore: 10,
      feedback: 'Good analysis with relevant examples. Could explore more societal implications.',
      criteria: [
        { name: 'Depth of analysis', score: 3, maxScore: 4 },
        { name: 'Use of examples', score: 3, maxScore: 3 },
        { name: 'Consideration of implications', score: 2, maxScore: 3 }
      ]
    };

    await trackQuestionAnswer(
      DEMO_CONFIG.activityId,
      oeQuestion,
      'AI will transform many industries through automation and enhanced decision-making. For example, healthcare will benefit from AI diagnostics, while education will become more personalized. However, we must consider job displacement and privacy concerns.',
      DEMO_CONFIG.moduleName,
      aiEvaluation
    );
    console.log('📝 Open-ended answer with AI evaluation submitted');

    // 5. Complete the activity
    console.log('\n🎯 Completing activity...');
    await trackActivityComplete(
      DEMO_CONFIG.activityId,
      DEMO_CONFIG.moduleName,
      3, // total questions
      3, // questions answered
      13, // final score (2 + 1 + 8 + 2 bonus)
      15  // max possible score
    );

    console.log('\n✨ Demo completed successfully!');
    console.log('📊 Check the console logs above to see the standardized event format');
    
    // Show summary
    await showDemoSummary();

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

/**
 * Demonstrates error handling in analytics tracking
 */
export async function runErrorHandlingDemo(): Promise<void> {
  console.log('\n🔧 Testing Error Handling...');
  
  try {
    // Test with invalid data
    const invalidQuestion: MultipleChoiceQuestion = {
      id: 'invalid_q',
      type: 'multiple-choice',
      question: '',
      options: [],
      correctAnswer: -1
    };

    await trackQuestionAnswer(
      'invalid_activity',
      invalidQuestion,
      null,
      'Invalid Module'
    );
    
    console.log('✅ Error handling test completed');
  } catch (error) {
    console.log('✅ Error properly caught and handled:', error);
  }
}

/**
 * Utility function to simulate async delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Shows a summary of the demo session
 */
async function showDemoSummary(): Promise<void> {
  console.log('\n📈 Demo Session Summary:');
  console.log('========================');
  
  const events = getStoredEvents();
  console.log(`Total events logged: ${events.length}`);
  
  const eventTypes = events.reduce((acc, event) => {
    acc[event.action] = (acc[event.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('Event breakdown:');
  Object.entries(eventTypes).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  const sessionInfo = demoTracker.getSessionInfo();
  const duration = Date.now() - new Date(sessionInfo.startTime).getTime();
  console.log(`Session duration: ${Math.round(duration / 1000)}s`);
  console.log(`Session ID: ${sessionInfo.sessionId}`);
}

/**
 * Retrieves all stored analytics events
 */
export function getStoredEvents(): any[] {
  try {
    const stored = localStorage.getItem('analytics_events');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to retrieve stored events:', error);
    return [];
  }
}

/**
 * Clears all stored analytics events
 */
export function clearStoredEvents(): void {
  try {
    localStorage.removeItem('analytics_events');
    console.log('✅ Stored events cleared');
  } catch (error) {
    console.error('Failed to clear stored events:', error);
  }
}

/**
 * Exports demo data for analysis
 */
export function exportDemoData(): string {
  const events = getStoredEvents();
  const sessionInfo = demoTracker.getSessionInfo();
  
  const exportData = {
    session: {
      id: sessionInfo.sessionId,
      startTime: sessionInfo.startTime,
      duration: Date.now() - new Date(sessionInfo.startTime).getTime(),
      userProfile: demoTracker.getUserProfile()
    },
    events: events,
    summary: {
      totalEvents: events.length,
      eventTypes: events.reduce((acc, event) => {
        acc[event.action] = (acc[event.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    }
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Runs all demo functions
 */
export async function runAllDemos(): Promise<void> {
  console.log('🎬 Running Complete Analytics Demo Suite');
  console.log('=========================================');
  
  // Clear previous data
  clearStoredEvents();
  
  // Run main demo
  await runAnalyticsDemo();
  
  // Run error handling demo
  await runErrorHandlingDemo();
  
  console.log('\n📋 Final Export Data:');
  console.log(exportDemoData());
  
  console.log('\n🎉 All demos completed!');
}

/**
 * Test AI feedback integration for analytics
 */
export async function testAIFeedbackIntegration(): Promise<void> {
  console.log('🧪 Testing AI Feedback Integration...');
  
  try {
    // Test ChatbotActivity AI evaluation format
    const chatbotAIEvaluation = {
      rubrics: [
        { 
          id: 1, 
          description: "Requests Elaboration or Explanation", 
          met: true,
          feedback: "The prompt requests elaboration about the water cycle." 
        },
        { 
          id: 2, 
          description: "Relevance to topic", 
          met: true,
          feedback: "The prompt is clearly related to the water cycle topic." 
        },
        { 
          id: 3, 
          description: "Clarity of Purpose", 
          met: false,
          explanation: "The prompt could be more specific about what aspects to explain." 
        }
      ],
      metCount: 2,
      totalCount: 3,
      status: 'partial' as const,
      feedback: "Good start! Your prompt shows understanding but could be more specific about what you want to learn.",
      success: true
    };

    const chatbotQuestion = {
      id: 'test-chatbot-1',
      type: 'chatbot' as const,
      initialPrompt: "Hello! I'm here to help with your questions.",
      context: "Test chatbot interaction for analytics",
      taskDescription: "Test task description for analytics testing",
      evaluationRubric: "Test evaluation rubric for analytics testing",
      suggestedQuestions: ["What is the water cycle?"],
      maxExchanges: 3
    };

    console.log('📝 Testing chatbot question with AI evaluation...');
    await trackQuestionAnswer(
      'test-activity-chatbot',
      chatbotQuestion,
      'Can you explain how the water cycle works?',
      'Test Module',
      chatbotAIEvaluation
    );

    // Test OpenEndedActivity AI evaluation format
    const openEndedAIEvaluation = {
      rubrics: [
        { 
          id: 1, 
          description: "Addresses the main question directly", 
          met: true,
          explanation: "The response directly addresses AI bias in hiring." 
        },
        { 
          id: 2, 
          description: "Includes specific examples", 
          met: true,
          explanation: "Good examples of biased datasets and algorithmic decisions." 
        },
        { 
          id: 3, 
          description: "Demonstrates understanding of mitigation strategies", 
          met: false,
          explanation: "Could provide more detailed mitigation strategies." 
        }
      ],
      metCount: 2,
      totalCount: 3,
      status: 'partial' as const,
      feedback: "Strong analysis with good examples. Consider expanding on specific mitigation techniques like bias auditing and diverse training data."
    };

    const openEndedQuestion: OpenEndedQuestion = {
      id: 'test-oe-1',
      type: 'open-ended' as const,
      question: 'Explain how bias can affect AI systems in hiring processes.',
      taskDescription: 'Explain how bias can affect AI systems in hiring processes, including sources of bias and potential solutions.',
      evaluationRubric: 'Identifies sources of bias (25%) | Explains impact on hiring decisions (25%) | Discusses mitigation strategies (25%) | Provides specific examples (25%)',
      sampleAnswer: 'AI bias in hiring can occur when training data reflects historical discrimination. For example, if past hiring data shows preference for certain demographics, the AI will learn these patterns. This can lead to unfair screening of candidates.',
      maxLength: 500
    };

    console.log('📝 Testing open-ended question with AI evaluation...');
    await trackQuestionAnswer(
      'test-activity-openended',
      openEndedQuestion,
      {
        text: 'AI bias in hiring can occur when training data reflects historical discrimination. For example, if past hiring data shows preference for certain demographics, the AI will learn these patterns. This can lead to unfair screening of candidates.',
        evaluation: openEndedAIEvaluation
      },
      'Test Module',
      openEndedAIEvaluation
    );

    console.log('✅ AI Feedback Integration Test Completed!');
    console.log('📊 Check the analytics logs to verify proper feedback structure');
    
    // Show the last few events to verify structure
    const events = getStoredEvents();
    const lastTwoEvents = events.slice(-2);
    
    console.log('\n📋 Last 2 Analytics Events:');
    lastTwoEvents.forEach((event: any, index: number) => {
      console.log(`\n${index + 1}. ${event.action} Event:`);
      console.log('   Input:', event.input);
      console.log('   Evaluation:', event.evaluation);
      console.log('   Feedback Structure:');
      if (event.feedback && typeof event.feedback === 'object') {
        console.log('     - Rubric items:', event.feedback.rubric?.length || 0);
        console.log('     - Overall feedback:', event.feedback.overall_feedback ? 'Present' : 'Missing');
        if (event.feedback.rubric && event.feedback.rubric.length > 0) {
          console.log('     - Sample rubric item:', {
            criteria: event.feedback.rubric[0].criteria,
            passed: event.feedback.rubric[0].passed,
            explanation: event.feedback.rubric[0].explanation ? 'Present' : 'Missing'
          });
        }
      }
    });

  } catch (error) {
    console.error('❌ AI Feedback Integration Test Failed:', error);
  }
}

/**
 * Test function to verify standardized analytics structure
 */
export const testStandardizedAnalyticsStructure = async (): Promise<void> => {
  console.log('🧪 Testing Standardized Analytics Structure...\n');
  
  const testConfig = {
    studentId: 'test-student-123',
    classId: 'test-class-456',
    activityId: 'test-activity-789',
    moduleName: 'Test Module'
  };

  // Test 1: Activity Start
  console.log('1️⃣ Testing ActivityStart event...');
  await trackActivityStart(testConfig.activityId, testConfig.moduleName, 3);
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Test 2: Question Answer (with timing)
  console.log('2️⃣ Testing SubmitAnswer event...');
  startQuestionTimer(testConfig.activityId, 'test-question-1');
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate thinking time
  
  const testQuestion: MultipleChoiceQuestion = {
    id: 'test-question-1',
    type: 'multiple-choice',
    question: 'Test question?',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 1
  };
  
  await trackQuestionAnswer(
    testConfig.activityId,
    testQuestion,
    1, // Correct answer
    testConfig.moduleName
  );
  
  // Test 3: Hint Request
  console.log('3️⃣ Testing AskForHint event...');
  await trackHintRequest(
    testConfig.activityId,
    'test-question-1',
    'multiple-choice',
    1,
    'This is a test hint',
    testConfig.moduleName
  );
  
  // Test 4: Activity Complete
  console.log('4️⃣ Testing ActivityComplete event...');
  await trackActivityComplete(
    testConfig.activityId,
    testConfig.moduleName,
    3, // totalQuestions
    1, // questionsAnswered
    1, // finalScore
    3  // maxPossibleScore
  );
  
  console.log('\n✅ All 4 analytics event types tested!');
  console.log('📋 Check the console logs above to verify all events have the same structure:');
  console.log('   - activityId, assignmentId, studentId, moduleName, classId');
  console.log('   - action, input, evaluation, feedback');
  console.log('   - attemptCreatedAt, startedAt, finishedAt');
};

/**
 * Test the game state logging integration
 */
export function testGameStateLogging(): void {
  console.log('\n🎮 Testing Game State Logging Feature');
  console.log('=====================================');
  
  // Import the game state service
  import('../../services/gameStateService').then(({ gameStateService }) => {
    console.log('✅ Game State Service imported successfully');
    console.log('📊 Service configuration:', {
      enableLogging: true,
      autoSaveInterval: 30000,
      apiEndpoint: process.env.REACT_APP_GAME_STATE_API || '/api/gamestate'
    });
    
    // Test mock game state data with new JSON structure
    const mockGameState = {
      studentId: "student_test_player",
      moduleName: "Introduction to AI Concepts",
      classId: "N/A",
      missionTracker: [
        {
          id: "mission-1",
          activityId: "activity-npc-1",
          completed: false
        },
        {
          id: "mission-2",
          activityId: "activity-npc-2",
          completed: true
        },
        {
          id: "mission-3",
          activityId: "activity-npc-3",
          completed: false
        },
        {
          id: "mission-4",
          activityId: "activity-npc-4",
          completed: false
        }
      ],
      playerPosition: "(15,11)",
      currentPoints: 80,
      timeLeft: "425s",
      timestamp: Date.now()
    };
    
    console.log('🧪 Testing with new JSON structure:', mockGameState);
    
    // Test save functionality
    gameStateService.saveGameState(mockGameState)
      .then((success) => {
        if (success) {
          console.log('✅ Game state save test: PASSED');
          console.log('📋 Saved game state structure:');
          console.log('   - Student ID:', mockGameState.studentId);
          console.log('   - Module Name:', mockGameState.moduleName);
          console.log('   - Class ID:', mockGameState.classId);
          console.log('   - Mission Tracker:', mockGameState.missionTracker.length, 'missions');
          console.log('   - Player Position:', mockGameState.playerPosition);
          console.log('   - Current Points:', mockGameState.currentPoints);
          console.log('   - Time Left:', mockGameState.timeLeft);
          
          // Show mission details
          console.log('🎯 Mission Details:');
          mockGameState.missionTracker.forEach((mission, index) => {
            console.log(`   ${index + 1}. ${mission.id} (${mission.activityId}) - ${mission.completed ? '✅ Completed' : '⏳ Pending'}`);
          });
        } else {
          console.log('❌ Game state save test: FAILED');
        }
      })
      .catch((error) => {
        console.error('❌ Game state save test error:', error);
      });
    
    // Test load functionality
    gameStateService.loadGameState('test-player-123')
      .then((loadedState) => {
        if (loadedState === null) {
          console.log('✅ Game state load test: PASSED (no saved state found, as expected)');
        } else {
          console.log('✅ Game state load test: PASSED (state loaded):', loadedState);
        }
      })
      .catch((error) => {
        console.error('❌ Game state load test error:', error);
      });
      
    console.log('🎯 Game State Logging test completed');
    console.log('📝 Check console for save/load results with new JSON structure');
  }).catch((error) => {
    console.error('❌ Failed to import Game State Service:', error);
  });
}

/**
 * Test the user profile feature
 */
export function testUserProfileFeature(): void {
  console.log('\n👤 Testing User Profile Feature');
  console.log('===============================');
  
  // Import the user profile service
  import('../../services/userProfileService').then(async ({ userProfileService }) => {
    console.log('✅ User Profile Service imported successfully');
    
    try {
      // Test 1: Initialize profile
      console.log('\n1️⃣ Testing profile initialization...');
      const profile = await userProfileService.initializeProfile('test_student_123', 'test_class_456');
      console.log('✅ Profile initialized:', {
        studentId: profile.studentId,
        classId: profile.classId,
        totalPoints: profile.totalPoints
      });

      // Test 2: Add some items
      console.log('\n2️⃣ Testing item management...');
      await userProfileService.addItem({
        id: 'item_1',
        name: 'AI Knowledge Badge',
        type: 'achievement',
        description: 'Earned for completing first AI module',
        sourceModule: 'Introduction to AI Concepts'
      });

      await userProfileService.addItem({
        id: 'item_2',
        name: 'Learning Boost',
        type: 'reward',
        description: 'Temporary learning speed increase',
        sourceModule: 'Introduction to AI Concepts'
      });

      console.log('✅ Items added successfully');

      // Test 3: Update module state with new missionTracker format
      console.log('\n3️⃣ Testing module state update...');
      const mockGameState = {
        studentId: "test_student_123",
        moduleName: "Introduction to AI Concepts",
        classId: "test_class_456",
        missionTracker: [
          { id: "mission-1", activityId: "activity-npc-1", completed: true },
          { id: "mission-2", activityId: "activity-npc-2", completed: false },
          { id: "mission-3", activityId: "activity-npc-3", completed: false },
          { id: "mission-4", activityId: "activity-npc-4", completed: false }
        ],
        playerPosition: "(10,5)",
        currentPoints: 75,
        timeLeft: "300s",
        timestamp: Date.now()
      };

      await userProfileService.updateModuleState(mockGameState);
      console.log('✅ Module state updated');

      // Test 4: Purchase item
      console.log('\n4️⃣ Testing item purchase...');
      
      // First add some points to test purchase
      await userProfileService.completeModule('Introduction to AI Concepts', 100);
      console.log('✅ Module completed, points added');

      const purchaseSuccess = await userProfileService.purchaseItem({
        id: 'item_3',
        name: 'Premium Avatar',
        description: 'Exclusive avatar for high achievers'
      }, 50);

      if (purchaseSuccess) {
        console.log('✅ Item purchased successfully');
      } else {
        console.log('❌ Item purchase failed');
      }

      // Test 5: Print final profile
      console.log('\n5️⃣ Final profile state:');
      userProfileService.printProfile();

      // Test 6: Profile summary
      console.log('\n6️⃣ Profile summary:');
      console.log('📊', userProfileService.getProfileSummary());

      console.log('\n✅ User Profile Feature test completed!');
      
    } catch (error) {
      console.error('❌ User Profile Feature test failed:', error);
    }
  }).catch((error) => {
    console.error('❌ Failed to import User Profile Service:', error);
  });
}

// Make functions available in browser console for testing
(window as any).analyticsDemo = {
  run: runAnalyticsDemo,
  runAll: runAllDemos,
  runErrorTest: runErrorHandlingDemo,
  testStructure: testStandardizedAnalyticsStructure,
  testGameState: testGameStateLogging,
  testUserProfile: testUserProfileFeature,
  getEvents: getStoredEvents,
  clearEvents: clearStoredEvents,
  exportData: exportDemoData
};

console.log('🔧 Analytics demo functions available in browser console:');
console.log('  analyticsDemo.run() - Run main demo');
console.log('  analyticsDemo.runAll() - Run all demos');
console.log('  analyticsDemo.testStructure() - Test standardized structure');
console.log('  analyticsDemo.testGameState() - Test game state logging');
console.log('  analyticsDemo.testUserProfile() - Test user profile feature');
console.log('  analyticsDemo.getEvents() - Get stored events');
console.log('  analyticsDemo.clearEvents() - Clear stored events');
console.log('  analyticsDemo.exportData() - Export demo data'); 