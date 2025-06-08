import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useAppDispatch } from '../../store';
import { answerQuestion, nextQuestion, finishActivity, retryQuestion } from '../../store/slices/activitySlice';
import { trackQuestionAnswerThunk } from '../../store/slices/analyticsSlice';
import { DragDropQuestion, getRetryConfig } from '../../data/activityContext';

// Styled components for the Drag & Drop Activity
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

const DragDropArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 24px;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const OptionsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  min-height: 200px;
`;

const TargetContainer = styled.div<{ isOver?: boolean; hasItem?: boolean; isCorrect?: boolean; isIncorrect?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: ${props => 
    props.isCorrect ? '#d4edda' :
    props.isIncorrect ? '#f8d7da' :
    props.isOver ? 'rgba(0, 123, 255, 0.1)' : 
    '#f8f9fa'
  };
  border: 2px dashed ${props => 
    props.isCorrect ? '#c3e6cb' :
    props.isIncorrect ? '#f5c6cb' :
    props.isOver ? 'var(--primary-color)' : 
    '#dee2e6'
  };
  border-radius: 8px;
  min-height: 200px;
  transition: all 0.2s;
`;

const TargetText = styled.p`
  text-align: center;
  margin-bottom: 12px;
  font-weight: bold;
`;

const TargetImage = styled.img`
  max-width: 100%;
  max-height: 120px;
  margin-bottom: 12px;
  object-fit: contain;
`;

interface OptionItemProps {
  isDragging?: boolean;
  isDropped?: boolean;
}

const OptionItem = styled.div<OptionItemProps>`
  padding: 12px;
  background-color: ${props => props.isDragging ? 'rgba(0, 123, 255, 0.1)' : 'white'};
  border: 1px solid ${props => props.isDragging ? 'var(--primary-color)' : '#dee2e6'};
  border-radius: 6px;
  cursor: ${props => props.isDropped ? 'default' : 'grab'};
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: ${props => props.isDropped ? 0.5 : 1};
  user-select: none;
  
  &:active {
    cursor: grabbing;
  }
`;

const OptionText = styled.span`
  flex: 1;
`;

const OptionImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
`;

const DroppedOption = styled.div`
  padding: 12px;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 300px;
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
  margin-top: 20px;
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

interface DragDropActivityProps {
  question: DragDropQuestion;
}

const DragDropActivity: React.FC<DragDropActivityProps> = ({ question }) => {
  const dispatch = useAppDispatch();
  const answers = useSelector((state: RootState) => state.activity.answers);
  const questionAttempts = useSelector((state: RootState) => state.activity.questionAttempts);
  const questionStates = useSelector((state: RootState) => state.activity.questionStates);
  const currentActivity = useSelector((state: RootState) => state.activity.currentActivity);
  const currentQuestionIndex = useSelector((state: RootState) => state.activity.currentQuestionIndex);
  
  const [isDragging, setIsDragging] = useState(false);
  const [droppedItem, setDroppedItem] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOver, setIsOver] = useState(false);
  
  const dragItemRef = useRef<string | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  
  // Get retry configuration for this question
  const retryConfig = getRetryConfig(question);
  const currentAttempts = questionAttempts[question.id] || 0;
  const questionState = questionStates[question.id] || 'unanswered';
  
  // Initialize with existing answer if available
  React.useEffect(() => {
    // Reset state when question changes
    setDroppedItem(null);
    setIsSubmitted(false);
    setIsOver(false);
    
    const existingAnswer = answers[question.id];
    if (existingAnswer !== undefined) {
      setDroppedItem(existingAnswer);
      setIsSubmitted(true);
    }
  }, [answers, question.id]);
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setIsDragging(true);
    dragItemRef.current = id;
    
    // Required for Firefox
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    dragItemRef.current = null;
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) {
      setIsOver(true);
    }
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    
    if (dragItemRef.current && !isSubmitted) {
      setDroppedItem(dragItemRef.current);
    }
  };
  
  const handleRemoveDrop = () => {
    if (!isSubmitted) {
      setDroppedItem(null);
    }
  };
  
  const handleSubmit = () => {
    if (droppedItem) {
      dispatch(answerQuestion({ questionId: question.id, answer: droppedItem }));
      
      // Get the actual targeted feedback that will be shown to the user
      const droppedOption = question.options.find(opt => opt.id === droppedItem);
      const actualFeedback = (() => {
        if (!droppedOption) return '';
        
        // Use targeted feedback if available
        if (droppedOption.feedback) {
          return droppedOption.feedback;
        }
        
        // Fallback to generic feedback
        const isCorrect = droppedItem === question.correctAnswer;
        return isCorrect 
          ? 'Correct! Great match.' 
          : 'That\'s not the right match. Please try again and think about which option best fits the target area.';
      })();
      
      // Track analytics for question answer with the actual feedback
      if (currentActivity) {
        dispatch(trackQuestionAnswerThunk(
          currentActivity.id,
          question,
          droppedItem,
          undefined, // no AI evaluation for drag-drop
          actualFeedback // pass the actual feedback shown to the user
        ));
      }
      
      setIsSubmitted(true);
    }
  };

  const handleTryAgain = () => {
    dispatch(retryQuestion({ questionId: question.id }));
    setDroppedItem(null);
    setIsSubmitted(false);
    setIsOver(false);
  };
  
  // Check if this is the last question
  const isLastQuestion = currentActivity ? currentQuestionIndex === currentActivity.questions.length - 1 : false;
  
  const handleNext = () => {
    if (isLastQuestion) {
      dispatch(finishActivity());
    } else {
      dispatch(nextQuestion());
    }
  };
  
  const isCorrect = droppedItem === question.correctAnswer;
  const droppedOption = question.options.find(opt => opt.id === droppedItem);
  const canRetry = questionState === 'incorrect' && currentAttempts < retryConfig.maxAttempts;
  const showNextButton = questionState === 'correct' || 
    (questionState === 'incorrect' && (currentAttempts >= retryConfig.maxAttempts || retryConfig.showNextAfterMaxAttempts));
  
  // Log attempt counter to console for debugging
  if (currentAttempts > 0) {
    console.log(`Question ${question.id}: Attempt ${currentAttempts} of ${retryConfig.maxAttempts}`);
  }
  
  // Get targeted feedback for the dropped option
  const getDroppedOptionFeedback = () => {
    if (!droppedOption) return '';
    
    // Use targeted feedback if available
    if (droppedOption.feedback) {
      return droppedOption.feedback;
    }
    
    // Fallback to generic feedback
    return isCorrect 
      ? 'Correct! Great match.' 
      : 'That\'s not the right match. Please try again and think about which option best fits the target area.';
  };
  
  return (
    <ActivityContainer>
      <QuestionHeader>Question</QuestionHeader>
      <QuestionText>{question.question}</QuestionText>
      
      <DragDropArea>
        <OptionsContainer>
          {question.options.map((option) => (
            <OptionItem
              key={option.id}
              draggable={!isSubmitted && droppedItem !== option.id}
              onDragStart={(e) => handleDragStart(e, option.id)}
              onDragEnd={handleDragEnd}
              isDragging={isDragging && dragItemRef.current === option.id}
              isDropped={droppedItem === option.id}
            >
              {option.imageUrl && (
                <OptionImage src={option.imageUrl} alt={option.text} />
              )}
              <OptionText>{option.text}</OptionText>
            </OptionItem>
          ))}
        </OptionsContainer>
        
        <TargetContainer 
          ref={targetRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          isOver={isOver}
          hasItem={Boolean(droppedItem)}
          isCorrect={isSubmitted && isCorrect}
          isIncorrect={isSubmitted && !isCorrect}
        >
          <TargetText>{question.targetArea.text}</TargetText>
          {question.targetArea.imageUrl && (
            <TargetImage src={question.targetArea.imageUrl} alt={question.targetArea.text} />
          )}
          
          {droppedItem && droppedOption && (
            <DroppedOption onClick={!isSubmitted ? handleRemoveDrop : undefined}>
              {droppedOption.imageUrl && (
                <OptionImage src={droppedOption.imageUrl} alt={droppedOption.text} />
              )}
              <OptionText>{droppedOption.text}</OptionText>
              {!isSubmitted && (
                <small>(Click to remove)</small>
              )}
            </DroppedOption>
          )}
          
          {!droppedItem && (
            <FeedbackText color="#6c757d">Drag an option here</FeedbackText>
          )}
        </TargetContainer>
      </DragDropArea>
      
      {isSubmitted && (
        <ExplanationContainer>
          <FeedbackText isBold>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </FeedbackText>
          <FeedbackText>
            {getDroppedOptionFeedback()}
          </FeedbackText>
        </ExplanationContainer>
      )}
      
      <ButtonContainer>
        {!isSubmitted ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!droppedItem}
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

export default DragDropActivity; 