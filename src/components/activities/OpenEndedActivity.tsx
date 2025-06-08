import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useAppDispatch } from '../../store';
import { answerQuestion, nextQuestion, finishActivity, retryQuestion } from '../../store/slices/activitySlice';
import { trackQuestionAnswerThunk } from '../../store/slices/analyticsSlice';
import { OpenEndedQuestion, getRetryConfig } from '../../data/activityContext';
import { getAIFeedback } from '../../services/aiFeedbackService';

// Styled components for the Open-Ended Activity
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

const QuestionText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const TextAreaContainer = styled.div`
  margin-bottom: 20px;
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  }
`;

const CharacterCount = styled.div`
  text-align: right;
  font-size: 0.8rem;
  color: #666;
  margin-top: 8px;
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

interface OpenEndedActivityProps {
  question: OpenEndedQuestion;
}

const OpenEndedActivity: React.FC<OpenEndedActivityProps> = ({ question }) => {
  const dispatch = useAppDispatch();
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    rubrics: Array<{ id: number; description: string; met: boolean; feedback?: string }>;
    metCount: number;
    totalCount: number;
    status: 'correct' | 'partial' | 'incorrect' | null;
    feedback: string;
  } | null>(null);
  
  const answers = useSelector((state: RootState) => state.activity.answers);
  const questionAttempts = useSelector((state: RootState) => state.activity.questionAttempts);
  const questionStates = useSelector((state: RootState) => state.activity.questionStates);
  const currentActivity = useSelector((state: RootState) => state.activity.currentActivity);
  const currentQuestionIndex = useSelector((state: RootState) => state.activity.currentQuestionIndex);
  
  // Get retry configuration for this question
  const retryConfig = getRetryConfig(question);
  const currentAttempts = questionAttempts[question.id] || 0;
  const questionState = questionStates[question.id] || 'unanswered';
  
  // Check if this question already has an answer
  React.useEffect(() => {
    // Reset state when question changes
    setAnswer('');
    setIsSubmitted(false);
    setIsEvaluating(false);
    setEvaluation(null);
    
    const existingAnswer = answers[question.id];
    if (existingAnswer) {
      setAnswer(existingAnswer.text || '');
      setEvaluation(existingAnswer.evaluation || null);
      setIsSubmitted(true);
    }
  }, [answers, question.id]);
  
  // Check if this is the last question
  const isLastQuestion = currentActivity ? currentQuestionIndex === currentActivity.questions.length - 1 : false;
  
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
  };
  
  const handleSubmit = async () => {
    if (answer.trim()) {
      setIsEvaluating(true);
      
      try {
        // Use the AI-powered evaluation
        const result = await evaluateWithAI(answer, question);
        setEvaluation(result);
        setIsSubmitted(true);
        
        // Determine if the answer meets the criteria (2 or more rubrics passed)
        const resultPassedRubrics = result.rubrics.filter((r: { met: boolean }) => r.met).length;
        const questionState = resultPassedRubrics >= 2 ? 'correct' : 'incorrect';
        
        // Update answer and question state in one action
        dispatch(answerQuestion({ 
          questionId: question.id, 
          answer: {
            text: answer,
            evaluation: result
          },
          questionState
        }));
        
        // Track analytics for question answer
        if (currentActivity) {
          dispatch(trackQuestionAnswerThunk(
            currentActivity.id,
            question,
            {
              text: answer,
              evaluation: result
            },
            result // AI evaluation
          ));
        }
      } catch (error) {
        console.error('Error evaluating answer:', error);
        // Handle error state here
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const handleTryAgain = () => {
    dispatch(retryQuestion({ questionId: question.id }));
    setAnswer('');
    setIsSubmitted(false);
    setIsEvaluating(false);
    setEvaluation(null);
  };
  
  const handleNext = () => {
    if (isLastQuestion) {
      dispatch(finishActivity());
    } else {
      dispatch(nextQuestion());
    }
  };

  // Determine retry logic for AI-evaluated questions
  const passedRubrics = evaluation ? evaluation.rubrics.filter((r: { met: boolean }) => r.met).length : 0;
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
  console.log(`[OpenEndedActivity] Question ${question.id} retry logic:`, {
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
    isSubmitted
  });
  
  // Log attempt counter to console for debugging
  if (currentAttempts > 0) {
    console.log(`Question ${question.id}: Attempt ${currentAttempts} of ${retryConfig.maxAttempts}`);
  }
  
  return (
    <ActivityContainer>
      <QuestionHeader>Open-Ended Question</QuestionHeader>
      
      <QuestionText>{question.question}</QuestionText>
      
      <TextAreaContainer>
        <StyledTextArea 
          value={answer} 
          onChange={handleAnswerChange}
          placeholder="Type your answer here..."
          disabled={isSubmitted && !canRetry}
          maxLength={question.maxLength || 500}
        />
        <CharacterCount>
          {answer.length}/{question.maxLength || 500} characters
        </CharacterCount>
      </TextAreaContainer>
      
      {!isSubmitted ? (
        <ButtonContainer>
          <Button 
            onClick={handleSubmit} 
            disabled={answer.trim().length < 10 || isEvaluating}
          >
            {isEvaluating ? 'Evaluating...' : 'Submit'}
          </Button>
        </ButtonContainer>
      ) : (
        <>
          {evaluation && (
            <>
              <FeedbackContainer status={evaluation.status}>
                <FeedbackTitle status={evaluation.status}>
                  {evaluation.status === 'correct' ? 'Excellent Response!' : 
                   evaluation.status === 'partial' ? 'Good Attempt' : 
                   'Needs Improvement'}
                </FeedbackTitle>
                <FeedbackText>{evaluation.feedback}</FeedbackText>
              </FeedbackContainer>
              
              <RubricContainer>
                <RubricTitle>Response Evaluation ({passedRubrics}/{evaluation.rubrics.length} met)</RubricTitle>
                {evaluation.rubrics.map(rubric => (
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
            </>
          )}
          
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

// Replace the mockEvaluate function with a new evaluateWithAI function
const evaluateWithAI = async (answer: string, question: OpenEndedQuestion) => {
  try {
    console.log('Attempting to evaluate open-ended response with OpenAI');
    
    // Parse the rubric into a map for the API request (same as ChatbotActivity)
    const rubricMap: { [key: string]: string } = {};
    const rubricLines = question.evaluationRubric.trim().split('\n').filter(line => line.trim() !== '');
    
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
    
    // Call AI API for evaluation (same as ChatbotActivity)
    const response = await getAIFeedback({
      prompt: `Evaluate this student's response based on the rubric. For each criteria, provide detailed feedback explaining whether it was met or not. Task description: "${question.taskDescription}"`,
      studentResponse: answer,
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
        feedback: response.overall_feedback || response.feedback || "Evaluation completed."
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
        feedback: "There was an error evaluating your response. Please try again."
      };
    }
  } catch (error) {
    console.error('Error evaluating response:', error);
    
    // Fallback to simple evaluation if AI feedback fails
    const rubricLines = question.evaluationRubric.trim().split('\n').filter(line => line.trim() !== '');
    
    const fallbackRubrics = rubricLines.map((line, i) => {
      const description = line.replace(/^\d+\s*/, '').trim();
      // Simple heuristic: longer answers are more likely to meet criteria
      const met = answer.length > 50 && answer.toLowerCase().includes('bias');
      return { 
        id: i + 1, 
        description: description,
        met: met,
        feedback: met ? "Your response addresses this criteria adequately." : "Your response could better address this criteria."
      };
    });
    
    const metRubrics = fallbackRubrics.filter(r => r.met);
    let fallbackStatus: 'correct' | 'partial' | 'incorrect' = 'incorrect';
    
    if (metRubrics.length >= Math.ceil(fallbackRubrics.length * 0.8)) {
      fallbackStatus = 'correct';
    } else if (metRubrics.length >= Math.ceil(fallbackRubrics.length * 0.5)) {
      fallbackStatus = 'partial';
    }
    
    const feedbacks = {
      correct: `Excellent work! Your answer demonstrates a strong understanding of the concepts. You've effectively addressed ${metRubrics.length} out of ${fallbackRubrics.length} evaluation criteria.`,
      partial: `Good attempt! You've addressed some key points, but there's room for improvement. You've met ${metRubrics.length} out of ${fallbackRubrics.length} evaluation criteria.`,
      incorrect: `Your answer needs more work. Try to focus on addressing the key concepts and providing specific examples. You've only met ${metRubrics.length} out of ${fallbackRubrics.length} evaluation criteria.`
    };
    
    return {
      rubrics: fallbackRubrics,
      metCount: metRubrics.length,
      totalCount: fallbackRubrics.length,
      status: fallbackStatus,
      feedback: feedbacks[fallbackStatus]
    };
  }
};

export default OpenEndedActivity; 