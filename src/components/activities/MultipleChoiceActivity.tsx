import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useAppDispatch } from '../../store';
import { answerQuestion, nextQuestion, finishActivity, retryQuestion } from '../../store/slices/activitySlice';
import { trackQuestionAnswerThunk, startQuestionTimerThunk } from '../../store/slices/analyticsSlice';
import { MultipleChoiceQuestion, getRetryConfig } from '../../data/activityContext';

// Styled components for the Multiple Choice Activity
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

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const OptionButton = styled.button<{ selected?: boolean; correct?: boolean; incorrect?: boolean }>`
  padding: 12px 16px;
  text-align: left;
  background-color: ${props => 
    props.correct ? '#d4edda' : 
    props.incorrect ? '#f8d7da' : 
    props.selected ? '#e2e3fc' : 
    '#f8f9fa'
  };
  border: 2px solid ${props => 
    props.correct ? '#c3e6cb' : 
    props.incorrect ? '#f5c6cb' : 
    props.selected ? '#b9bafa' : 
    '#e9ecef'
  };
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => 
      props.correct ? '#d4edda' : 
      props.incorrect ? '#f8d7da' : 
      '#e2e3fc'
    };
    border-color: ${props => 
      props.correct ? '#c3e6cb' : 
      props.incorrect ? '#f5c6cb' : 
      '#b9bafa'
    };
  }
  
  &:disabled {
    cursor: default;
    opacity: ${props => props.selected ? 1 : 0.7};
  }
`;

const FeedbackContainer = styled.div<{ correct?: boolean }>`
  padding: 12px;
  background-color: ${props => props.correct ? '#d4edda' : '#f8d7da'};
  border: 1px solid ${props => props.correct ? '#c3e6cb' : '#f5c6cb'};
  border-radius: 6px;
  margin-bottom: 16px;
`;

interface FeedbackTextProps {
  color?: string;
  isBold?: boolean;
}

const FeedbackText = styled.p<FeedbackTextProps>`
  margin: 0;
  color: ${props => props.color || 'inherit'};
  font-weight: ${props => props.isBold ? 'bold' : 'normal'};
`;

const ExplanationContainer = styled.div`
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid var(--primary-color);
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
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

interface MultipleChoiceActivityProps {
  question: MultipleChoiceQuestion;
}

const MultipleChoiceActivity: React.FC<MultipleChoiceActivityProps> = ({ question }) => {
  const dispatch = useAppDispatch();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
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
  
  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setIsSubmitted(false);
    
    // Check if this question already has an answer
    const existingAnswer = answers[question.id];
    if (existingAnswer !== undefined) {
      setSelectedOption(existingAnswer);
      setIsSubmitted(true);
    } else {
      // Start question timer for new questions
      if (currentActivity) {
        dispatch(startQuestionTimerThunk(currentActivity.id, question.id));
      }
    }
  }, [answers, question.id, currentActivity, dispatch]);
  
  const handleSelectOption = (index: number) => {
    if (!isSubmitted) {
      setSelectedOption(index);
    }
  };
  
  const handleSubmit = () => {
    if (selectedOption !== null) {
      dispatch(answerQuestion({ questionId: question.id, answer: selectedOption }));
      
      // Get the actual targeted feedback that will be shown to the user
      const actualFeedback = (() => {
        // Use targeted feedback if available
        if (question.optionFeedback && question.optionFeedback[selectedOption]) {
          return question.optionFeedback[selectedOption];
        }
        
        // Fallback to generic feedback
        const isCorrect = selectedOption === question.correctAnswer;
        return isCorrect 
          ? 'Correct! Well done.' 
          : 'That\'s not quite right. Please try again and think carefully about the question.';
      })();
      
      // Track analytics for question answer with the actual feedback
      if (currentActivity) {
        dispatch(trackQuestionAnswerThunk(
          currentActivity.id,
          question,
          selectedOption,
          undefined, // no AI evaluation for multiple choice
          actualFeedback // pass the actual feedback shown to the user
        ));
      }
      
      setIsSubmitted(true);
    }
  };

  const handleTryAgain = () => {
    dispatch(retryQuestion({ questionId: question.id }));
    setSelectedOption(null);
    setIsSubmitted(false);
  };
  
  const handleNext = () => {
    if (isLastQuestion) {
      dispatch(finishActivity());
    } else {
      dispatch(nextQuestion());
    }
  };
  
  const isCorrect = selectedOption === question.correctAnswer;
  const canRetry = questionState === 'incorrect' && currentAttempts < retryConfig.maxAttempts;
  const showNextButton = questionState === 'correct' || 
    (questionState === 'incorrect' && (currentAttempts >= retryConfig.maxAttempts || retryConfig.showNextAfterMaxAttempts));
  
  // Log attempt counter to console for debugging
  if (currentAttempts > 0) {
    console.log(`Question ${question.id}: Attempt ${currentAttempts} of ${retryConfig.maxAttempts}`);
  }
  
  // Get targeted feedback for the selected option
  const getSelectedOptionFeedback = () => {
    if (selectedOption === null) return '';
    
    // Use targeted feedback if available
    if (question.optionFeedback && question.optionFeedback[selectedOption]) {
      return question.optionFeedback[selectedOption];
    }
    
    // Fallback to generic feedback
    return isCorrect 
      ? 'Correct! Well done.' 
      : 'That\'s not quite right. Please try again and think carefully about the question.';
  };
  
  return (
    <ActivityContainer>
      <QuestionHeader>Question</QuestionHeader>
      <QuestionText>{question.question}</QuestionText>
      
      <OptionsContainer>
        {question.options.map((option, index) => (
          <OptionButton
            key={index}
            selected={selectedOption === index}
            correct={false}
            incorrect={isSubmitted && selectedOption === index && selectedOption !== question.correctAnswer}
            onClick={() => handleSelectOption(index)}
            disabled={isSubmitted}
          >
            {option}
          </OptionButton>
        ))}
      </OptionsContainer>
      
      {isSubmitted && (
        <>
          <FeedbackContainer correct={isCorrect}>
            <FeedbackText color={isCorrect ? '#155724' : '#721c24'} isBold>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </FeedbackText>
          </FeedbackContainer>
          
          <ExplanationContainer>
            <FeedbackText isBold>
              {isCorrect ? 'Explanation:' : 'Feedback:'}
            </FeedbackText>
            <FeedbackText>
              {getSelectedOptionFeedback()}
            </FeedbackText>
          </ExplanationContainer>
        </>
      )}
      
      <ButtonContainer>
        {!isSubmitted ? (
          <Button 
            onClick={handleSubmit} 
            disabled={selectedOption === null}
          >
            Submit
          </Button>
        ) : (
          <>
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
          </>
        )}
      </ButtonContainer>
    </ActivityContainer>
  );
};

export default MultipleChoiceActivity; 