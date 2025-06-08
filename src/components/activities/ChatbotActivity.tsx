import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useAppDispatch } from '../../store';
import { answerQuestion, nextQuestion, finishActivity, retryQuestion } from '../../store/slices/activitySlice';
import { trackQuestionAnswerThunk, startQuestionTimerThunk } from '../../store/slices/analyticsSlice';
import { ChatbotQuestion, getRetryConfig } from '../../data/activityContext';
import { getAIFeedback } from '../../services/aiFeedbackService';

// Styled components for the Chatbot Activity
const ActivityContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 800px;
  width: 90%;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const QuestionHeader = styled.h2`
  color: var(--primary-color);
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.5rem;
`;

const TaskDescription = styled.div`
  background-color: #f0f7ff;
  border-left: 4px solid var(--primary-color);
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 0 4px 4px 0;
`;

const TaskTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 1.2rem;
  color: var(--primary-color);
`;

const TaskText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 0;
  line-height: 1.5;
`;

const ChatContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 400px;
`;

const ChatHistory = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageContainer = styled.div<{ isUser: boolean }>`
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 8px;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  background-color: ${props => props.isUser ? 'var(--primary-color)' : '#e9e9eb'};
  color: ${props => props.isUser ? 'white' : '#333'};
  border-radius: 18px;
  border-bottom-right-radius: ${props => props.isUser ? '4px' : '18px'};
  border-bottom-left-radius: ${props => props.isUser ? '18px' : '4px'};
  word-wrap: break-word;
`;

const ChatInputContainer = styled.div`
  display: flex;
  padding: 12px;
  border-top: 1px solid #ddd;
  background-color: white;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SendButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  
  &:hover {
    background-color: var(--secondary-color);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: default;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  background-color: ${props => props.variant === 'secondary' ? '#6c757d' : 'var(--primary-color)'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.variant === 'secondary' ? '#5a6268' : 'var(--secondary-color)'};
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: default;
  }
`;

const FeedbackContainer = styled.div<{ status: 'correct' | 'partial' | 'incorrect' | null }>`
  padding: 16px;
  background-color: ${props => 
    props.status === 'correct' ? '#d4edda' : 
    props.status === 'partial' ? '#fff3cd' : 
    props.status === 'incorrect' ? '#f8d7da' : 
    '#f8f9fa'
  };
  border: 1px solid ${props => 
    props.status === 'correct' ? '#c3e6cb' : 
    props.status === 'partial' ? '#ffeeba' : 
    props.status === 'incorrect' ? '#f5c6cb' : 
    '#dee2e6'
  };
  border-radius: 6px;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const FeedbackTitle = styled.h3<{ status: 'correct' | 'partial' | 'incorrect' | null }>`
  margin-top: 0;
  margin-bottom: 12px;
  color: ${props => 
    props.status === 'correct' ? '#155724' : 
    props.status === 'partial' ? '#856404' : 
    props.status === 'incorrect' ? '#721c24' : 
    '#212529'
  };
`;

const FeedbackText = styled.p`
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const RubricContainer = styled.div`
  margin-top: 24px;
  margin-bottom: 16px;
`;

const RubricTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1.2rem;
  color: #333;
`;

const RubricItem = styled.div<{ met: boolean }>`
  display: flex;
  align-items: flex-start;
  padding: 10px;
  background-color: ${props => props.met ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)'};
  border-radius: 4px;
  margin-bottom: 8px;
`;

const RubricIcon = styled.div<{ met: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.met ? '#28a745' : '#dc3545'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
`;

const RubricText = styled.div`
  flex: 1;
`;

const RubricExplanation = styled.div`
  margin-top: 6px;
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
`;

// Get AI chatbot response using OpenAI API
const getAIChatbotResponse = async (message: string, context: string) => {
  try {
    console.log('Attempting to call OpenAI API for chat response');
    
    // Call AI API for response with simplified prompt
    const response = await getAIFeedback({
      prompt: 'You are a helpful assistant.',
      studentResponse: message
    });
    
    console.log('AI response received:', response.success ? 'Success' : 'Failed');
    
    return response.feedback || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Error getting AI response:', error);
    return "I'm sorry, there was an error processing your request. Please try again.";
  }
};

// Evaluate the user's prompt using AI
const evaluateUserPrompt = async (prompt: string, taskDescription: string, rubric: string): Promise<any> => {
  try {
    console.log('Attempting to evaluate prompt with OpenAI');
    
    // Parse the rubric into a map for the API request
    const rubricMap: { [key: string]: string } = {};
    const rubricLines = rubric.trim().split('\n').filter(line => line.trim() !== '');
    
    rubricLines.forEach((line, index) => {
      // Extract the criteria number and description
      const match = line.match(/^\s*(\d+)\s*(.*?):\s*(.*?)\s*$/);
      if (match) {
        const [, num, criteriaName, description] = match;
        rubricMap[`criteria${num}`] = `${criteriaName}: ${description}`;
      } else {
        // If the parsing fails, just use the whole line
        rubricMap[`criteria${index + 1}`] = line.trim();
      }
    });
    
    console.log('Parsed rubric:', rubricMap);
    
    // Call AI API for evaluation
    const response = await getAIFeedback({
      prompt: `Evaluate this student's prompt based on the rubric. For each criteria, provide detailed feedback explaining whether it was met or not. Task description: "${taskDescription}"`,
      studentResponse: prompt,
      rubric: rubricMap
    });
    
    console.log('Evaluation response received:', response.success ? 'Success' : 'Failed');
    console.log('Raw response:', response);
    
    // Process the structured response directly
    if (response.success && response.rubric && Array.isArray(response.rubric)) {
      console.log('Processing structured rubric response');
      
      // Use the rubric data directly from the AI response
      const rubricResults = response.rubric.map((item, index) => ({
        id: index + 1,
        description: item.criteria,
        met: item.passed,
        feedback: item.feedback
      }));
      
      // Calculate status based on passed criteria
      const passedCount = rubricResults.filter(r => r.met).length;
      const totalCount = rubricResults.length;
      
      let status: 'correct' | 'partial' | 'incorrect' = 'incorrect';
      if (passedCount >= Math.ceil(totalCount * 0.8)) {
        status = 'correct';
      } else if (passedCount >= Math.ceil(totalCount * 0.5)) {
        status = 'partial';
      }
      
      console.log('Final evaluation data:', {
        rubrics: rubricResults.length,
        passedCount,
        totalCount,
        status
      });
      
      return {
        rubrics: rubricResults,
        metCount: passedCount,
        totalCount,
        status,
        feedback: response.overall_feedback || response.feedback || "Evaluation completed.",
        success: true
      };
    } else {
      // Fallback for invalid response format
      console.error('Invalid response format from AI service');
      return {
        rubrics: rubricLines.map((line, i) => ({ 
          id: i + 1, 
          description: line.replace(/^\d+\s*/, '').trim(), 
          met: false,
          feedback: "Unable to evaluate this criteria due to invalid response format"
        })),
        metCount: 0,
        totalCount: rubricLines.length,
        status: 'incorrect' as const,
        feedback: "There was an error evaluating your prompt. Please try again.",
        success: false
      };
    }
  } catch (error) {
    console.error('Error evaluating prompt:', error);
    return {
      rubrics: [],
      metCount: 0,
      totalCount: 0,
      status: 'incorrect' as const,
      feedback: "There was an error evaluating your prompt. Please try again.",
      success: false
    };
  }
};

// Geography prompt task
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const geographyTask = {
  task_description:
    "Last week, your geography teacher explained how the water cycle works. Tomorrow, there will be a test on how and why each step occurs. While you have a diagram of the water cycle in your textbook, you've forgotten how it works. Write a prompt to ask the AI Chatbot to help you prepare for this geography quiz about water cycle.",
  prompt_evaluation_rubric: `
1 Requests Elaboration or Explanation: The prompt requests elaboration, extension, or explanation besides explicitly seeking a direct response.
2 Relevance: The prompt is related to the topic "water cycle".
3 Clarity of Purpose: The prompt identify a specific and clear purpose of "how" or "why" each water cycle step work.
4 Conciseness: The prompt itself is brief and concice.
5 Background/Context: The prompt provides the context for why this question was asked, such as including the background information (middle school geography or a middle school student).
`
};

// Biology prompt task
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const biologyTask = {
  task_description:
    "Yesterday, you learned 'what is a cell' in the biology class. You roughly understood what cells are and main components in a cell. Now, as you are interested in biology, you want to broaden your understanding of cells. This isn't about course requirements, just a topic (cell) you're interested in learning more about. The only resource you have is your biology textbook. Write a prompt to the AI Chatbot to help you extend your knowledge about cells!",
  prompt_evaluation_rubric: `
1 Relevance: The prompt is related to the topic about cells.
2 Clarity of Purpose: The prompt identify a specific and clear purpose.
3 Conciseness: The prompt itself is brief and concise.
4 Background/Context: The prompt explains why this question was asked, such as the background about middle school biology learning.
`
};

// Math prompt task
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mathTask = {
  task_description:
    "You're struggling to find the values of x and y when solving a system of linear equations with two variables in the assignment: 10x+4y = 3 and -2x+10y = 4. This assignment is due in one day. Write a prompt for the AI Chatbot to help you understand the math concepts of two-variable linear equations.",
  prompt_evaluation_rubric: `
1 Not Explicitly Seeking a Direct Response: The prompt does not ask for a solution to solve a problem or the answers (what are x and y).
2 Requests Elaboration or Explanation: The prompt requests elaboration, extension, or explanation of this two-variable linear equation question.
3 Relevance: The prompt is related to the topic of two-variable linear equations.
4 Clarity of Purpose: The prompt identifies a specific and clear purpose such as explaining the involved math concepts.
5 Conciseness: The prompt itself is brief and concise.
6 Background/Context: The prompt explains why this question was asked, such as the background of completing a middle school math assignment.
`
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatbotActivityProps {
  question: ChatbotQuestion;
}

const ChatbotActivity: React.FC<ChatbotActivityProps> = ({ question }) => {
  const dispatch = useAppDispatch();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  
  const answers = useSelector((state: RootState) => state.activity.answers);
  const questionAttempts = useSelector((state: RootState) => state.activity.questionAttempts);
  const questionStates = useSelector((state: RootState) => state.activity.questionStates);
  const currentActivity = useSelector((state: RootState) => state.activity.currentActivity);
  const currentQuestionIndex = useSelector((state: RootState) => state.activity.currentQuestionIndex);
  
  // Get retry configuration for this question
  const retryConfig = getRetryConfig(question);
  const currentAttempts = questionAttempts[question.id] || 0;
  const questionState = questionStates[question.id] || 'unanswered';
  
  // Check if this is the last question
  const isLastQuestion = currentActivity ? currentQuestionIndex === currentActivity.questions.length - 1 : false;
  
  // Reset state when question changes and start timer
  useEffect(() => {
    const existingAnswer = answers[question.id];
    if (existingAnswer) {
      // Restore previous state if answer exists
      if (existingAnswer.messages) {
        setMessages(existingAnswer.messages);
      }
      if (existingAnswer.evaluation) {
        setEvaluation(existingAnswer.evaluation);
        setIsEvaluated(true);
      }
    } else {
      // Reset for new question or retry
      setMessages([{ id: '0', text: "Hi, 我可以怎麼幫助你呢？", isUser: false }]);
      setInputValue('');
      setIsLoading(false);
      setEvaluation(null);
      setIsEvaluated(false);
      setIsEvaluating(false);
      
      // Start question timer for new questions
      if (currentActivity) {
        dispatch(startQuestionTimerThunk(currentActivity.id, question.id) as any);
      }
    }
  }, [question.id, answers, currentActivity, dispatch]);
  
  // Auto scroll to the bottom of chat history
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;
    
    setIsLoading(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    try {
      // Generate bot response using AI
      const botResponseText = await getAIChatbotResponse(userMessage.text, question.context);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        isUser: false
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // DO NOT call answerQuestion here - only store messages locally
      // The attempt counter should only increment when user clicks "Evaluate Your Prompt"
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, there was an error processing your message. Please try again.",
        isUser: false
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEvaluate = async () => {
    // Find the first user message to evaluate
    const firstUserMessage = messages.find(m => m.isUser);
    
    if (firstUserMessage && currentActivity) {
      setIsEvaluating(true);
      
      try {
        // Evaluate the prompt using the context as task description
        const result = await evaluateUserPrompt(
          firstUserMessage.text, 
          question.taskDescription,
          question.evaluationRubric
        );
        
        setEvaluation(result);
        setIsEvaluated(true);
        
        // Determine if the answer meets the criteria (2 or more rubrics passed)
        const passedRubrics = result.rubrics.filter((r: any) => r.met).length;
        const questionState = passedRubrics >= 2 ? 'correct' : 'incorrect';
        
        // Update Redux store with evaluation results and question state in one action
        // This is the ONLY place where answerQuestion should be called for chatbot questions
        // to ensure attempt counter is incremented only once per evaluation
        dispatch(answerQuestion({ 
          questionId: question.id, 
          answer: {
            messages, // Store the complete conversation
            firstUserMessage: firstUserMessage.text,
            evaluation: result
          },
          questionState
        }));

        // Track analytics for the chatbot question answer
        dispatch(trackQuestionAnswerThunk(
          currentActivity.id,
          question,
          firstUserMessage.text,
          result
        ) as any);
        
      } catch (error) {
        console.error('Error evaluating prompt:', error);
        // Handle error
      } finally {
        setIsEvaluating(false);
      }
    }
  };
  
  const handleTryAgain = () => {
    dispatch(retryQuestion({ questionId: question.id }));
    setMessages([{ id: '0', text: "Hi, 我可以怎麼幫助你呢？", isUser: false }]);
    setInputValue('');
    setIsLoading(false);
    setEvaluation(null);
    setIsEvaluated(false);
    setIsEvaluating(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const handleNext = () => {
    if (isLastQuestion) {
      dispatch(finishActivity());
    } else {
      dispatch(nextQuestion());
    }
  };
  
  const canEvaluate = messages.some(m => m.isUser) && !isEvaluated;
  
  // Determine retry logic for AI-evaluated questions
  const passedRubrics = evaluation ? evaluation.rubrics.filter((r: any) => r.met).length : 0;
  const totalRubrics = evaluation ? evaluation.rubrics.length : 0;
  const unmetRubrics = totalRubrics - passedRubrics;
  const hasPassedMinimumRubrics = passedRubrics >= 2;
  
  // Logic for showing buttons:
  // - When passed (< 2 unmet): Show only "Next"
  // - When failed (2+ unmet) and attempts < max: Show only "Try Again"
  // - When max attempts reached: Show both "Try Again" and "Next"
  const maxAttemptsReached = currentAttempts >= retryConfig.maxAttempts;
  const hasPassed = unmetRubrics < 2;
  const hasFailed = unmetRubrics >= 2;
  
  const canRetry = (hasFailed && currentAttempts < retryConfig.maxAttempts) || maxAttemptsReached;
  const showNextButton = hasPassed || maxAttemptsReached;
  
  // Debug logging for retry logic
  console.log(`[ChatbotActivity] Question ${question.id} retry logic:`, {
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
  
  // Log attempt counter to console for debugging
  if (currentAttempts > 0) {
    console.log(`Question ${question.id}: Attempt ${currentAttempts} of ${retryConfig.maxAttempts}`);
  }
  
  return (
    <ActivityContainer>
      <QuestionHeader>AI Prompt Practice</QuestionHeader>
      
      <TaskDescription>
        <TaskTitle>Task:</TaskTitle>
        <TaskText>{question.taskDescription}</TaskText>
      </TaskDescription>
      
      <ChatContainer>
        <ChatHistory ref={chatHistoryRef}>
          {messages.map((message) => (
            <MessageContainer key={message.id} isUser={message.isUser}>
              <MessageBubble isUser={message.isUser}>
                {message.text}
              </MessageBubble>
            </MessageContainer>
          ))}
          {isLoading && (
            <MessageContainer isUser={false}>
              <MessageBubble isUser={false}>
                Thinking...
              </MessageBubble>
            </MessageContainer>
          )}
        </ChatHistory>
        
        <ChatInputContainer>
          <ChatInput 
            value={inputValue} 
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your prompt here..."
            disabled={isEvaluated || isLoading || messages.length >= (question.maxExchanges * 2)}
          />
          <SendButton 
            onClick={handleSendMessage}
            disabled={inputValue.trim() === '' || isEvaluated || isLoading || messages.length >= (question.maxExchanges * 2)}
          >
            →
          </SendButton>
        </ChatInputContainer>
      </ChatContainer>
      
      {canEvaluate && (
        <ButtonContainer>
          <Button onClick={handleEvaluate} disabled={isEvaluating}>
            {isEvaluating ? 'Evaluating...' : 'Evaluate Your Prompt'}
          </Button>
        </ButtonContainer>
      )}
      
      {isEvaluated && evaluation && (
        <>
          <FeedbackContainer status={evaluation.status}>
            <FeedbackTitle status={evaluation.status}>
              {evaluation.status === 'correct' ? 'Excellent Prompt!' : 
               evaluation.status === 'partial' ? 'Good Attempt' : 
               'Needs Improvement'}
            </FeedbackTitle>
            <FeedbackText>{evaluation.feedback}</FeedbackText>
          </FeedbackContainer>
          
          <RubricContainer>
            <RubricTitle>Prompt Evaluation ({passedRubrics}/{evaluation.rubrics.length} met)</RubricTitle>
            {evaluation.rubrics.map((rubric: any) => (
              <RubricItem key={rubric.id} met={rubric.met}>
                <RubricIcon met={rubric.met}>
                  {rubric.met ? '✓' : '✗'}
                </RubricIcon>
                <RubricText>
                  {rubric.description}
                  {rubric.feedback && (
                    <RubricExplanation>{rubric.feedback}</RubricExplanation>
                  )}
                </RubricText>
              </RubricItem>
            ))}
          </RubricContainer>
          
          <ButtonContainer>
            {canRetry && (
              <Button 
                variant="secondary"
                onClick={handleTryAgain}
              >
                Try Again
              </Button>
            )}
            {showNextButton && (
              <Button onClick={handleNext}>
                {isLastQuestion ? 'Finish' : 'Next'}
              </Button>
            )}
          </ButtonContainer>
        </>
      )}
    </ActivityContainer>
  );
};

export default ChatbotActivity; 