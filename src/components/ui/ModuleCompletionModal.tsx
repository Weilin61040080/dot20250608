import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { setShowCompletionModal, resetModuleProgress } from '../../store/slices/moduleSlice';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  background-color: var(--primary-color);
  color: white;
  padding: 1.5rem;
  text-align: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
`;

const ModalBody = styled.div`
  padding: 2rem;
  text-align: center;
`;

const ModalText = styled.p`
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 2rem;
  color: #333;
`;

const BonusMessageText = styled.p`
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--secondary-color);
  margin-top: -1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3a7bc8;
  }
`;

const ModuleCompletionModal: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    showCompletionModal, 
    currentModuleId, 
    modules, 
    bonusAwardedMessage 
  } = useSelector(
    (state: RootState) => state.module
  );
  
  if (!showCompletionModal) {
    return null;
  }
  
  const currentModule = currentModuleId 
    ? modules.find(m => m.id === currentModuleId) 
    : null;
  
  const handleBackToModules = () => {
    dispatch(setShowCompletionModal(false));
    dispatch(resetModuleProgress());
    navigate('/modules');
  };
  
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Module Completed!</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <ModalText>
            Congratulations! You have successfully completed all missions in 
            {currentModule ? ` "${currentModule.title}"` : ' this module'}.
          </ModalText>
          {bonusAwardedMessage && (
            <BonusMessageText>{bonusAwardedMessage}</BonusMessageText>
          )}
          <BackButton onClick={handleBackToModules}>
            Return to Module Selection
          </BackButton>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ModuleCompletionModal; 