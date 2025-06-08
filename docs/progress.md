###Product Requirements Document (PRD)


##roduct Overview
The product is an educational game platform that enables learners to explore 2D tile-based worlds where they interact with objects and NPCs to trigger learning activities. The game is highly customizable, allowing for easy generation of themed assets using AI and the creation of diverse learning modules.
##Core Features

#Tile-Based World

2D grid-based movement system
AI-generated themed assets for tiles, objects, and characters
JSON-based map definition for easy editing and extension


#Module System

Each module contains unique maps, NPCs, scripts, and learning activities
Narrative progression through story plots triggered by learner activities
Learning activities tracked for analytics and progress


#Gamification Elements

Points system based on performance metrics
Leaderboards for competitive engagement
Mission/quest system with objectives
In-game store for rewards and customizations


#Learning Assessment

Track time spent on activities
Record correct/incorrect responses
Capture feedback provided to learners
Map activities to learning objectives


#Asset Generation System

AI-powered generation of themed assets
Consistent style generation across different themes
Designer input for theme specification



#User Flow

User selects or continues a module
User navigates character through the tile map
User interacts with objects/NPCs to trigger learning activities
User completes activities to earn points and progress the story
User views progress, leaderboards, and manages earned rewards

#MVP Scope
For the MVP version:

Support for manual creation of tile maps via JSON
Basic character movement and interaction system
Simple learning activity framework with 2-3 activity types
Core gamification elements (points, simple missions)
Basic analytics tracking
Support for one complete learning module

#Technical Architecture Document

Tech Stack
Frontend

Framework: React with TypeScript
State Management: Redux Toolkit
Styling: Styled-components
Animation: Framer Motion
Game Engine Layer: Custom built
Asset Management: Local assets with public folder structure

#Backend

API: Node.js with Express (future implementation)
Database: To be determined
Authentication: To be implemented
Real-time Communication: To be implemented
Serverless Functions: To be implemented

#AI Asset Generation

Image Generation: To be integrated
Style Transfer: To be implemented

#DevOps

CI/CD: To be implemented
Hosting: Local development for now
Monitoring: Console logging for development

## Project Progress

### Current Status
- Core game engine implemented
- Map system with JSON-based map loading
- Character movement system implemented
- NPC interaction system with dialogue
- Activity system with multiple activity types:
  - Multiple choice questions
  - Drag and drop activities
  - Open-ended questions with AI-based evaluation
  - Chatbot interactions with evaluation
- Basic UI components implemented
- Redux store setup for game state management
- Comprehensive asset management with error handling and fallbacks
- Placeholder pages for in-development routes
- Working routes for all menu items
- Robust asset loading system with timeout detection and fallback rendering

### Next Steps
1. Implement user authentication
2. Set up backend services for activity data storage
3. Develop leaderboard functionality
4. Improve game assets and styling
5. Add more learning modules and activities
6. Implement progress tracking across sessions
7. Complete implementation of module selection page
8. Develop the profile and leaderboard pages

### Completed Tasks
- Project structure setup
- React with TypeScript project initialization
- Core dependencies installation
- Game engine implementation
- Tile map rendering system
- Character controller with movement
- Dialog system for NPC interactions
- Activity framework with multiple activity types
- Module selection interface
- Basic game UI components
- Redux store for state management
- Open-ended question system with rubric-based evaluation
- Chatbot activity with conversation evaluation
- Asset loading with error handling and fallbacks
- Fixed Redux serialization errors
- Added placeholder pages for all routes
- Robust error handling for missing assets
- Enhanced asset path construction for different environments
