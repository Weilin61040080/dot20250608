import React, { useState } from 'react';
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

const LeaderboardCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 800px;
  width: 100%;
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
`;

interface TabButtonProps {
  active: boolean;
}

const TabButton = styled.button<TabButtonProps>`
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  border: none;
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-color)'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  }
  
  &:hover {
    color: var(--primary-color);
  }
`;

const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const LeaderboardItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #f5f7fa;
  border-radius: 4px;
  
  &:nth-child(-n+3) {
    background-color: #f0f8ff;
    border-left: 4px solid var(--primary-color);
  }
`;

const Rank = styled.div`
  width: 50px;
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ddd;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
`;

const Username = styled.div`
  font-weight: bold;
`;

const Score = styled.div`
  font-weight: bold;
  color: var(--primary-color);
  margin-left: auto;
  font-size: 1.25rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #999;
  text-align: center;
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

const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'module'>('global');
  
  // Mock data for now
  const leaderboards = {
    global: [
      { id: 1, username: 'Alexandra', score: 985, avatar: '👧' },
      { id: 2, username: 'Brandon', score: 872, avatar: '👦' },
      { id: 3, username: 'Catherine', score: 756, avatar: '👩' },
      { id: 4, username: 'David', score: 732, avatar: '👨' },
      { id: 5, username: 'Emily', score: 708, avatar: '👱‍♀️' },
      { id: 6, username: 'Frank', score: 694, avatar: '👴' },
      { id: 7, username: 'Grace', score: 653, avatar: '👵' },
      { id: 8, username: 'Henry', score: 591, avatar: '👨‍🦰' },
      { id: 9, username: 'Isabella', score: 540, avatar: '👩‍🦱' },
      { id: 10, username: 'Jack', score: 512, avatar: '👨‍🦳' }
    ],
    friends: [
      { id: 2, username: 'Brandon', score: 872, avatar: '👦' },
      { id: 4, username: 'David', score: 732, avatar: '👨' },
      { id: 7, username: 'Grace', score: 653, avatar: '👵' }
    ],
    module: []
  };
  
  const renderLeaderboard = () => {
    const data = leaderboards[activeTab];
    
    if (data.length === 0) {
      return (
        <EmptyState>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <div>No leaderboard data available yet.</div>
        </EmptyState>
      );
    }
    
    return (
      <LeaderboardList>
        {data.map((user, index) => (
          <LeaderboardItem key={user.id}>
            <Rank>{index + 1}</Rank>
            <UserInfo>
              <Avatar>{user.avatar}</Avatar>
              <Username>{user.username}</Username>
            </UserInfo>
            <Score>{user.score} pts</Score>
          </LeaderboardItem>
        ))}
      </LeaderboardList>
    );
  };
  
  return (
    <PageContainer>
      <BackButton to="/">← Back</BackButton>
      <Title>Leaderboards</Title>
      
      <LeaderboardCard>
        <TabsContainer>
          <TabButton 
            active={activeTab === 'global'} 
            onClick={() => setActiveTab('global')}
          >
            Global
          </TabButton>
          <TabButton 
            active={activeTab === 'friends'} 
            onClick={() => setActiveTab('friends')}
          >
            Friends
          </TabButton>
          <TabButton 
            active={activeTab === 'module'} 
            onClick={() => setActiveTab('module')}
          >
            Current Module
          </TabButton>
        </TabsContainer>
        
        {renderLeaderboard()}
      </LeaderboardCard>
    </PageContainer>
  );
};

export default LeaderboardPage; 