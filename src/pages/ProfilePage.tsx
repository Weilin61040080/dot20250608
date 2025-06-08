import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--background-color);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: var(--primary-color);
`;

const ProfileCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 800px;
  width: 100%;
`;

const ProfileSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  color: #999;
  font-size: 2rem;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const UserStat = styled.div`
  margin: 0.25rem 0;
  color: var(--text-color);
`;

const ProgressList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`;

const ProgressItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f5f7fa;
  border-radius: 4px;
`;

const ModuleName = styled.div`
  font-weight: bold;
`;

interface ProgressBarProps {
  progressValue: string;
}

const ProgressBar = styled.div<ProgressBarProps>`
  flex: 1;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin: 0 1rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progressValue};
    background-color: var(--primary-color);
  }
`;

const ProgressPercent = styled.div`
  width: 50px;
  text-align: right;
`;

const BackButton = styled(Link)`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: bold;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ProfilePage: React.FC = () => {
  // Mock data for now
  const user = {
    name: 'Student',
    totalPoints: 250,
    completedModules: 2,
    activeModules: 1
  };
  
  const moduleProgress = [
    { id: 'module-test', name: 'Introduction to AI Concepts', progress: '100%', completed: true },
    { id: 'module-ethics', name: 'AI Ethics', progress: '65%', completed: false },
    { id: 'module-ml', name: 'Machine Learning Basics', progress: '25%', completed: false }
  ];
  
  return (
    <PageContainer>
      <BackButton to="/">← Back</BackButton>
      <Title>Your Profile</Title>
      
      <ProfileCard>
        <ProfileInfo>
          <Avatar>👤</Avatar>
          <UserDetails>
            <UserName>{user.name}</UserName>
            <UserStat>Total Points: {user.totalPoints}</UserStat>
            <UserStat>Completed Modules: {user.completedModules}</UserStat>
            <UserStat>Active Modules: {user.activeModules}</UserStat>
          </UserDetails>
        </ProfileInfo>
        
        <ProfileSection>
          <SectionTitle>Module Progress</SectionTitle>
          <ProgressList>
            {moduleProgress.map(module => (
              <ProgressItem key={module.id}>
                <ModuleName>{module.name}</ModuleName>
                <ProgressBar progressValue={module.progress} />
                <ProgressPercent>{module.progress}</ProgressPercent>
              </ProgressItem>
            ))}
          </ProgressList>
        </ProfileSection>
      </ProfileCard>
    </PageContainer>
  );
};

export default ProfilePage; 