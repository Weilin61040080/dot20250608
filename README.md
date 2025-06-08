# AI Literacy Game

An interactive educational game designed to teach AI literacy concepts through engaging gameplay.

## Overview

This project is an educational game that helps players learn about artificial intelligence concepts through interactive gameplay, NPCs, and various learning activities.

## Features

- **Interactive Map Environment**: Navigate a digital world with your character
- **Player Perspective View**: Immersive focused view that centers on the player character
- **Configurable Canvas**: Adjustable canvas size and tile visibility for personalized gaming experience
- **Educational NPCs**: Engage in conversations with AI-themed characters
- **Learning Activities**: Complete multiple-choice quizzes, drag-and-drop exercises, open-ended questions, and chatbot interactions
- **AI-Powered Feedback**: Get intelligent feedback on open-ended responses using AI evaluation
- **Smart Retry Logic**: Adaptive retry system with proper attempt tracking for different question types
- **Visual UI**: Intuitive interface with dialogs and HUD elements
- **Achievement System**: Earn points and track progress
- **Real-time Controls**: Live adjustment of viewing preferences without game restarts

## Player Perspective & Canvas System

The game features a sophisticated viewing system that provides an immersive player experience:

**Key Features:**
- ✅ **Player-Centered View**: Camera follows the player with smooth movement
- ✅ **Configurable Canvas Size**: Adjust game window dimensions (400-2000px width, 300-1500px height)
- ✅ **Customizable Tile Visibility**: Control how many tiles are visible (5-30 horizontal, 5-25 vertical)
- ✅ **Real-time Updates**: All changes apply immediately without requiring restarts
- ✅ **Performance Optimized**: Viewport culling ensures efficient rendering
- ✅ **Responsive Design**: Adapts to different screen sizes and user preferences

For detailed information about the view system, see [**view-mode-toggle.md**](docs/view-mode-toggle.md).

## Retry Logic System

The game implements a sophisticated retry system for AI-evaluated questions with intelligent button display logic and proper attempt tracking. 

**Key Features:**
- ✅ **Smart Button Display**: Shows appropriate buttons based on performance and attempts
- ✅ **Proper Attempt Tracking**: Accurate counting for both open-ended and chatbot questions
- ✅ **Attempt Isolation**: Each question has its own attempt counter (no carryover)
- ✅ **Configurable Limits**: Default 3 max attempts, 2 minimum rubrics to pass

For detailed information about the retry logic implementation, see [**RETRY-LOGIC.md**](docs/RETRY-LOGIC.md).

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/ai_literacy_game.git
   cd ai_literacy_game
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Setting Up AI Feedback (Optional)

The game includes a simulated AI feedback system for open-ended responses. To enable real AI feedback with OpenAI:

1. Create a `.env` file in the server directory
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

2. Install server dependencies
   ```
   cd server
   npm install express cors dotenv openai
   ```

3. Start the server
   ```
   node openai-service.js
   ```

4. The game will now use real AI feedback for evaluating open-ended responses

## Documentation

- [**Game Instructions**](docs/RUNNING-THE-GAME.md) - How to play the game
- [**Retry Logic System**](docs/RETRY-LOGIC.md) - Detailed retry logic documentation
- [**Debugging Guide**](docs/DEBUGGING.md) - Development and debugging information
- [**Analytics System**](docs/README-ANALYTICS.md) - Analytics implementation details

## Project Structure

- `src/components`: UI components and game elements
- `src/data`: Game data and content
- `src/engine`: Game engine and systems (character, tile, NPC)
- `src/pages`: Application pages and routes
- `src/services`: Service layer for API interactions and business logic
- `src/store`: Redux state management
- `src/types`: TypeScript type definitions
- `src/utils`: Utility functions and helpers
- `public/assets`: Game assets (images, maps, etc.)
- `server`: Server-side implementation for AI feedback

## Technologies

- React
- TypeScript
- Redux Toolkit
- Styled Components
- OpenAI API (for AI feedback)

## License

[MIT License](LICENSE)

## Acknowledgments

This project was created as an educational tool to promote AI literacy and understanding. 