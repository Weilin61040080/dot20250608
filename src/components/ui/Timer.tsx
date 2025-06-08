import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled, { keyframes, css } from 'styled-components';
import { RootState } from '../../store';
import { tickTimer } from '../../store/slices/moduleSlice';

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const flashAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

interface TimerDisplayProps {
  isUrgent: boolean;
}

const TimerContainer = styled.div`
  width: 100%;
  padding: 8px 15px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  border-radius: 6px;
  font-size: 1.1em;
  font-weight: bold;
  text-align: center;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const TimerText = styled.span<TimerDisplayProps>`
  ${(props) =>
    props.isUrgent &&
    css`
      color: #ff4d4d; /* Red color for urgency */
      animation: ${flashAnimation} 1s linear infinite;
    `}
`;

const Timer: React.FC = () => {
  const dispatch = useDispatch();
  const { timerActive, timeRemaining_ms, currentModuleId } = useSelector(
    (state: RootState) => ({
      timerActive: state.module.timerActive,
      timeRemaining_ms: state.module.timeRemaining_ms,
      currentModuleId: state.module.currentModuleId,
    })
  );

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Log state once on mount/module change
  useEffect(() => {
    if (isClient && currentModuleId) {
      // Timer component initialized/module changed
    }
  }, [isClient, currentModuleId, timerActive, timeRemaining_ms]); // Include active/remaining to log if they differ on module change

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isClient && timerActive && timeRemaining_ms > 0 && currentModuleId) {
      intervalId = setInterval(() => {
        dispatch(tickTimer());
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isClient, timerActive, timeRemaining_ms, currentModuleId, dispatch]);

  if (!isClient || !currentModuleId) {
    // Don't render timer if not on client or no module active
    return null; 
  }

  const isUrgent = timeRemaining_ms < 2 * 60 * 1000 && timeRemaining_ms > 0;

  return (
    <TimerContainer>
      <TimerText isUrgent={isUrgent}>
        {formatTime(timeRemaining_ms)}
      </TimerText>
    </TimerContainer>
  );
};

export default Timer; 