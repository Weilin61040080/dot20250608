# Frontend Component Structure

## Core Game Components

### GameContainer
- Main container for the game
- Manages game loop and core state
- Handles module loading and initialization

### TileMapRenderer
- Renders the tile map based on JSON configuration
- Manages tile layers (background, interactive, foreground)
- Handles viewport and camera movement

### CharacterController
- Manages player character movement and animation
- Processes user input for movement
- Handles collision detection with map tiles

### InteractionManager
- Detects and processes interactions with objects and NPCs
- Triggers scripts and learning activities
- Manages interaction UI elements (dialogs, prompts)

### NPCController
- Controls NPC movement and behavior
- Manages NPC state and dialog
- Handles AI for NPC pathfinding and decision making

## UI Components

### HUD (Heads-Up Display)
- Shows player stats, points, objectives
- Minimap display
- Contextual action buttons

### DialogSystem
- Displays character dialog
- Manages conversation trees and choices
- Shows script-driven story elements

### ActivityContainer
- Wrapper for different learning activities
- Manages activity state and progression
- Handles completion and scoring

### Inventory
- Displays collected items
- Provides item management and usage
- Shows collectibles and achievements

### Store
- Displays available items for purchase
- Handles point transactions
- Shows unlock requirements

## Learning Activity Components

### QuizActivity
- Multiple choice questions
- True/false questions
- Fill-in-the-blank questions

### MatchingActivity
- Drag and drop matching pairs
- Connect related items
- Sorting activities

### ConversationActivity
- Role-playing scenarios
- Language practice dialogs
- Decision-based conversations

### PuzzleActivity
- Logic puzzles
- Word puzzles
- Pattern recognition puzzles

## Utility Components

### AssetLoader
- Manages loading and caching of game assets
- Handles preloading for current module
- Error handling for asset loading failures

### AnimationController
- Manages sprite animations
- Handles transition effects
- Controls environmental animations

### SoundManager
- Manages background music
- Handles sound effects
- Controls audio settings

### NotificationSystem
- Displays in-game notifications
- Shows achievement pop-ups
- Provides feedback on actions
