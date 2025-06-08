import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { setCurrentModule, setModules } from '../store/slices/moduleSlice';
import { Mission } from '../store/slices/moduleSlice';

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

const ModuleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
`;

const ModuleCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    cursor: pointer;
  }
`;

const ModuleImage = styled.div<{ bgImage?: string }>`
  height: 160px;
  background-color: #ddd;
  background-image: ${props => props.bgImage ? `url(${props.bgImage})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1.25rem;
`;

const ModuleContent = styled.div`
  padding: 1.5rem;
`;

const ModuleTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
`;

const ModuleDescription = styled.p`
  color: var(--text-color);
  margin-bottom: 1.5rem;
`;

const StartButton = styled.button`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #3a7bc8;
  }
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

// Helper function to get the asset base path
const getAssetBasePath = () => {
  const publicUrl = process.env.PUBLIC_URL || '';
  return `${publicUrl}/assets/`;
};

interface ModuleData {
  id: string;
  title: string;
  description: string;
  mapId: string; // The map associated with this module
  missions: Mission[];
  theme: string;
  mapIds: string[];
  mainStoryScriptId: string;
  learningActivityIds: string[];
  requiredPoints: number;
}

const ModuleSelectPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Since we don't have real module data from API yet, we'll use this static data
  // In a real app, you would fetch this from an API or load from Redux
  const [modules] = useState<ModuleData[]>([
    {
      id: 'module-test',
      title: 'Introduction to AI Concepts',
      description: 'Learn the basic concepts of artificial intelligence through interactive examples.',
      mapId: 'test-map',
      theme: 'tech',
      mapIds: ['test-map-1'],
      mainStoryScriptId: 'intro-ai-script',
      learningActivityIds: ['activity-npc-1', 'activity-npc-2', 'activity-npc-3', 'activity-npc-4'],
      requiredPoints: 100,
      missions: [
        {
          id: 'mission-1',
          title: 'Talk to the AI Teacher',
          description: 'Learn about basic AI concepts from the teacher',
          activityId: 'activity-npc-1',
          completed: false
        },
        {
          id: 'mission-2',
          title: 'Complete the AI Applications Matching Activity',
          description: 'Test your knowledge of AI applications by matching them.',
          activityId: 'activity-npc-2',
          completed: false
        },
        {
          id: 'mission-3',
          title: 'Reflect on AI Ethics',
          description: 'Explore ethical considerations in AI development.',
          activityId: 'activity-npc-3',
          completed: false
        },
        {
          id: 'mission-4',
          title: 'Practice AI Prompts',
          description: 'Practice interacting with an AI assistant.',
          activityId: 'activity-npc-4',
          completed: false
        }
      ]
    },
    {
      id: 'module-ethics',
      title: 'AI Ethics',
      description: 'Explore the ethical considerations when developing and using AI systems.',
      mapId: 'campus',
      theme: 'ethics',
      mapIds: ['campus-map'],
      mainStoryScriptId: 'ethics-script',
      learningActivityIds: ['ethics-101', 'ethics-102', 'ethics-103', 'ethics-104'],
      requiredPoints: 120,
      missions: [
        {
          id: 'ethics-mission-1',
          title: 'Discuss AI Bias',
          description: 'Learn about bias in AI systems',
          activityId: 'ethics-101',
          completed: false
        },
        {
          id: 'ethics-mission-2',
          title: 'Privacy Case Study',
          description: 'Analyze privacy concerns in AI applications',
          activityId: 'ethics-102',
          completed: false
        },
        {
          id: 'ethics-mission-3',
          title: 'Ethical Decision Making',
          description: 'Make ethical decisions in AI scenarios',
          activityId: 'ethics-103',
          completed: false
        },
        {
          id: 'ethics-mission-4',
          title: 'AI Governance',
          description: 'Learn about AI governance and regulation',
          activityId: 'ethics-104',
          completed: false
        }
      ]
    },
    {
      id: 'module-ml',
      title: 'Machine Learning Basics',
      description: 'Understand how machines learn from data through interactive visualizations.',
      mapId: 'lab',
      theme: 'data',
      mapIds: ['lab-map'],
      mainStoryScriptId: 'ml-script',
      learningActivityIds: ['ml-101', 'ml-102', 'ml-103', 'ml-104'],
      requiredPoints: 150,
      missions: [
        {
          id: 'ml-mission-1',
          title: 'Collect Training Data',
          description: 'Help collect data for machine learning',
          activityId: 'ml-101',
          completed: false
        },
        {
          id: 'ml-mission-2',
          title: 'Train a Model',
          description: 'Learn how to train a machine learning model',
          activityId: 'ml-102',
          completed: false
        },
        {
          id: 'ml-mission-3',
          title: 'Evaluate Model Performance',
          description: 'Understand how to evaluate ML models',
          activityId: 'ml-103',
          completed: false
        },
        {
          id: 'ml-mission-4',
          title: 'Deploy Your Model',
          description: 'Learn about deploying ML models',
          activityId: 'ml-104',
          completed: false
        }
      ]
    }
  ]);
  
  // Set modules in Redux state on initial load
  useEffect(() => {
    dispatch(setModules(modules));
  }, [dispatch, modules]);
  
  // Function to handle module selection
  const handleModuleSelect = (moduleId: string) => {
    // Dispatch action to set the current module
    dispatch(setCurrentModule(moduleId));
    
    // Navigate to game page
    navigate('/game');
  };
  
  return (
    <PageContainer>
      <BackButton to="/">← Back</BackButton>
      <Title>Select a Learning Module</Title>
      <ModuleGrid>
        {modules.map(module => {
          // Construct the thumbnail path based on the module's map
          const thumbnailPath = `${getAssetBasePath()}maps/${module.mapId}/thumbnail/thumbnail.svg`;
          
          return (
            <ModuleCard key={module.id} onClick={() => handleModuleSelect(module.id)}>
              <ModuleImage 
                bgImage={thumbnailPath}
              >
                {/* Fallback text if image fails to load */}
                <div style={{ 
                  backgroundColor: 'rgba(0,0,0,0.5)', 
                  padding: '5px 10px', 
                  borderRadius: '4px',
                  display: module.mapId ? 'none' : 'block' 
                }}>
                  {module.title}
                </div>
              </ModuleImage>
              <ModuleContent>
                <ModuleTitle>{module.title}</ModuleTitle>
                <ModuleDescription>{module.description}</ModuleDescription>
                <StartButton onClick={() => handleModuleSelect(module.id)}>
                  Start Module
                </StartButton>
              </ModuleContent>
            </ModuleCard>
          );
        })}
      </ModuleGrid>
    </PageContainer>
  );
};

export default ModuleSelectPage; 