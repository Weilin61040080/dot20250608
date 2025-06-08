# Changelog

All notable changes to the AI Literacy Game project will be documented in this file.

## [Unreleased]

## [0.4.0] - 2025-01-15

### Added
- **Structured JSON Response System**: Complete overhaul of AI feedback system to use structured JSON responses from LLMs
  - LLMs now return explicit pass/fail decisions for each rubric criterion
  - Standardized response format across all AI services (real and simulated)
  - Detailed feedback for each evaluation criterion
  - Backward compatibility with legacy response fields
- **Enhanced AI Feedback Service**: Updated simulated AI service to return structured responses
  - Intelligent evaluation logic based on response length, keywords, structure, and relevance
  - Contextual feedback generation for different criterion types
  - Performance-based overall feedback calculation
- **Improved OpenAI Integration**: Updated direct API service for structured responses
  - Instructs LLM to return exact JSON format required
  - Proper rubric parsing and formatting for clear evaluation
  - Error handling with fallback responses for invalid JSON
  - Consistent temperature settings for reliable evaluation

### Changed
- **Activity Components Overhaul**: Completely refactored ChatbotActivity and OpenEndedActivity
  - **Removed**: Smart criteria detection logic and keyword-based evaluation
  - **Added**: Direct processing of structured AI responses
  - **Enhanced**: Pass/fail logic based on number of criteria met
  - **Improved**: Specific feedback display for each criterion
- **Data Structure Simplification**: Updated OpenEndedQuestion interface
  - **Removed**: `context` field (only used in ChatbotActivity)
  - **Hidden**: Task description from UI while maintaining it for API calls
  - **Cleaned**: Unused styled components (TaskDescription, TaskTitle, TaskText)
- **Evaluation Logic**: Standardized status calculation across all activities
  - Correct: 80%+ of criteria passed
  - Partial: 50-79% of criteria passed
  - Incorrect: <50% of criteria passed

### Fixed
- **Eliminated Keyword Detection Issues**: No more ambiguity from keyword-based evaluation
- **Improved Reliability**: Consistent grading through explicit pass/fail decisions
- **Enhanced User Experience**: Cleaner UI with hidden task descriptions
- **Better Error Handling**: Robust fallbacks for invalid AI responses

### Technical Improvements
- **Type Safety**: Updated AIFeedbackResponse interface to use 'feedback' instead of 'explanation'
- **Code Cleanup**: Removed unused imports and components
- **Documentation**: Comprehensive updates to AI-FEEDBACK.md reflecting new system
- **Build Process**: All TypeScript errors resolved and successful builds confirmed

### Added
- Comprehensive asset management structure documented in `docs/ASSET-MANAGEMENT.md`.
- New directory structure for map, module, and shared assets under `public/assets/`.
- AI feedback service for open-ended responses with simulated evaluation.
- Enhanced open-ended activity assessment with robust rubric-based evaluation.
- Direct OpenAI API integration for AI feedback (for testing purposes only).
- Support for GitHub Pages deployment with proper routing configuration.
- Simple placeholder pages for routes that aren't fully implemented yet.
- Fallback rendering for missing assets with colored placeholders.
- Timeout detection for asset loading to improve error handling.
- Functional Module Selection page with thumbnails for each available module.
- Module-to-map connection system for loading the correct map based on module selection.
- SVG placeholder thumbnails for map previews in the module selection screen.
- Mission tracking system to monitor player progress through learning activities.
- Mission UI in the top right corner showing completion status of each mission.
- Module completion modal that appears when all missions in a module are completed.
- Connection between NPC interactions, activities, and mission completion.

### Changed
- Migrated existing assets to the new organized directory structure.
- Updated all asset paths in map JSON files (`src/assets/maps/test-map.json`) to reflect new locations.
- Modified `src/engine/TileSystem.ts` to correctly load tile and NPC assets from the new paths and handle NPC-specific images.
- Updated `src/engine/CharacterSystem.ts` to load the player character image from the new shared assets directory.
- Adjusted `src/data/activityContext.ts` to use module-specific asset paths for images in learning activities.
- Updated `src/types/TileMap.ts` to include an optional `assetPath` for NPCs.
- Replaced mock evaluation in OpenEndedActivity with AI-powered feedback.
- Refactored dialog system to use serializable state pattern instead of callback functions.
- Enhanced error handling for asset loading in GameContainer, TileSystem, and CharacterSystem.
- Improved fallback mechanisms for all asset loading to ensure the game works even with missing files.
- Updated App.tsx to use the actual ModuleSelectPage instead of a placeholder.
- Modified GamePage to route back to the module selection when exiting a game.
- Enhanced Redux store to track mission completion status.
- Expanded dialogue system to handle mission state and track completions.
- Updated HUD component to display mission information.
- Standardized `activityId` in mission definitions within module data (`ModuleSelectPage.tsx`) to align with actual activity IDs (e.g., `activity-npc-X`) for reliable mission completion.
- Refined `completeCurrentActivity` thunk in `activitySlice.ts` to improve mission finding logic and clarify console logging for easier debugging.
- Reduced console noise from `MissionTracker.tsx` by removing unnecessary re-renders and simplifying log messages.

### Fixed
- Fixed bug where answers from previous questions would automatically carry over to next questions in all learning activities.
- Improved state management in activity components to properly reset between questions.
- Resolved ESLint warnings for unused variables and imports in `DialogSystem.tsx`, `GameEngine.ts`, and `TileSystem.ts`.
- Fixed Redux serialization error with dialog callbacks by replacing function callbacks with action identifiers.
- Fixed routing issues when deployed to subdirectory by adding dynamic basename detection.
- Fixed image asset loading problems by correctly constructing asset paths based on environment.
- Resolved issues with missing placeholder pages for routes in development.
- Fixed asset path construction in TileSystem and CharacterSystem.
- Improved gameService map loading to gracefully handle missing map files.
- Added automatic redirection to module selection when no module is selected in the game page.
- Resolved issue where Mission Tracker UI was not updating upon activity completion due to mismatches between activity IDs and mission definitions.

## [0.3.0] - 2023-12-15

### Added
- OpenEndedActivity component for NPC-3 interactions
  - Support for AI-based evaluation of text responses
  - Rubric-based assessment with visual feedback
  - Hint system for guiding learner responses
- ChatbotActivity component for NPC-4 interactions
  - Interactive chat interface with AI responses
  - Evaluation of learner's conversation skills
  - Suggested questions to facilitate learning
- Two new NPCs added to the game map:
  - AI Researcher (NPC-3) focusing on AI ethics
  - ChatBot (NPC-4) for practicing AI interaction skills
- Updated activity framework to support new question types
- Documentation:
  - Added Activities Guide explaining all activity types
  - Added Running Guide with instructions for testing
  - Updated README with new features

### Changed
- Enhanced ActivityContainer to support all activity types
- Improved dialog system for more natural NPC interactions
- Refactored activity state management in Redux store
- Updated GamePage to properly render dialog and activities

### Fixed
- Resolved activity display issues in GameContainer
- Fixed Redux store type conflicts
- Corrected NPC positioning and interaction radius

## [0.2.0] - 2023-11-30

### Added
- Drag and drop activity implementation
- Basic dialog system for NPC interactions
- Multiple-choice question framework
- Initial activity tracking in Redux
- Player movement system with collision detection
- Simple HUD component displaying player position

### Changed
- Improved GameEngine performance
- Enhanced tile rendering with support for different tile types
- Updated map loading system to support NPC data

### Fixed
- Character movement edge cases
- Tile collision detection
- Map rendering performance issues

## [0.1.0] - 2023-11-15

### Added
- Initial project setup with React and TypeScript
- Basic game engine architecture
- Tile-based map rendering system
- Simple character controller
- Redux store for game state management
- Project documentation framework 