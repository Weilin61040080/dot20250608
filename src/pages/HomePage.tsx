import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--background-color);
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 3rem;
  color: var(--text-color);
  text-align: center;
  max-width: 600px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 1rem;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1.25rem;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: var(--primary-color-dark);
  }
`;

const SecondaryLink = styled(StyledLink)`
  background-color: white;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const Footer = styled.footer`
  margin-top: 4rem;
  text-align: center;
  color: var(--text-color-light);
`;

const HomePage: React.FC = () => {
  return (
    <PageContainer>
      <Title>AI Literacy Game</Title>
      <Subtitle>
        Learn about AI concepts through interactive gameplay and engaging challenges
      </Subtitle>
      
      <ButtonsContainer>
        <StyledLink to="/modules">Start Learning</StyledLink>
        <SecondaryLink to="/profile">Profile</SecondaryLink>
        <SecondaryLink to="/leaderboard">Leaderboard</SecondaryLink>
        <SecondaryLink to="/game">Continue Game</SecondaryLink>
      </ButtonsContainer>
      
      <Footer>
        &copy; {new Date().getFullYear()} AI Literacy Game
      </Footer>
    </PageContainer>
  );
};

export default HomePage; 