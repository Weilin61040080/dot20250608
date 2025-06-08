# Game State Logging Feature

## Overview

The Game State Logging feature automatically saves player progress whenever a mission is completed. This system is designed to be decoupled and easily updatable, with placeholder API calls and comprehensive console logging for development.

## Architecture

### Core Components

1. **GameStateService** (`src/services/gameStateService.ts`)
   - Main service class for saving and loading game states
   - Configurable with logging, auto-save intervals, and API endpoints
   - Mock API implementation ready for backend integration

2. **GameStateCollector** (`src/services/gameStateCollector.ts`)
   - Collects current game state from Redux store
   - Determines when significant changes warrant saving
   - Provides game state summaries for logging

3. **Integration Point** (`src/store/slices/activitySlice.ts`)
   - Triggers game state saving after mission completion
   - Integrated into the `completeCurrentActivityAndMission` thunk

## Data Structure

### GameStateData Interface

```typescript
interface MissionTracker {
  id: string;
  activityId: string;
  completed: boolean;
}

interface GameStateData {
  studentId: string;
  moduleName: string;
  classId: string;
  missionTracker: MissionTracker[];
  playerPosition: string;
  currentPoints: number;
  timeLeft: string;
  timestamp: number;
}
```

### Example JSON Structure

```json
{
  "studentId": "student_john_doe",
  "moduleName": "Introduction to AI Concepts",
  "classId": "N/A",
  "missionTracker": [
    {
      "id": "mission-1",
      "activityId": "activity-npc-1",
      "completed": false
    },
    {
      "id": "mission-2",
      "activityId": "activity-npc-2",
      "completed": true
    },
    {
      "id": "mission-3",
      "activityId": "activity-npc-3",
      "completed": false
    },
    {
      "id": "mission-4",
      "activityId": "activity-npc-4",
      "completed": false
    }
  ],
  "playerPosition": "(15,11)",
  "currentPoints": 80,
  "timeLeft": "425s",
  "timestamp": 1703123456789
}
```

### Captured Information

- **Student ID**: Generated from player name or "N/A" if not available
- **Module Name**: Title of the current module
- **Class ID**: Currently set to "N/A" (ready for future implementation)
- **Mission Tracker**: Array of all missions with their completion status
  - `id`: Mission identifier
  - `activityId`: Associated activity identifier
  - `completed`: Boolean indicating completion status
- **Player Position**: Current coordinates as string format "(x,y)"
- **Current Points**: Points earned in the current module
- **Time Left**: Remaining time formatted as string with "s" suffix
- **Timestamp**: When the state was captured (Unix timestamp)

## Configuration

### Service Configuration

```typescript
interface GameStateServiceConfig {
  enableLogging: boolean;        // Enable console logging
  autoSaveInterval: number;      // Auto-save interval in milliseconds
  apiEndpoint?: string;          // Backend API endpoint
}
```

### Default Configuration

```typescript
const defaultConfig = {
  enableLogging: true,
  autoSaveInterval: 30000,       // 30 seconds
  apiEndpoint: '/api/gamestate'
};
```

## Usage

### Automatic Saving

Game state is automatically saved when:
- A mission is completed
- Significant changes are detected (via auto-save timer)

### Manual Operations

```typescript
import { gameStateService } from '../services/gameStateService';

// Save current state
const success = await gameStateService.saveGameState(gameStateData);

// Load player state
const gameState = await gameStateService.loadGameState('player-id');

// Check if state should be saved
const shouldSave = gameStateService.shouldSaveGameState(reduxState);
```

### Auto-Save Management

```typescript
// Start auto-save timer
gameStateService.startAutoSave(() => store.getState());

// Stop auto-save timer
gameStateService.stopAutoSave();
```

## Significant Change Detection

The system saves state when significant changes occur:

- **Mission Completion**: New missions added to completed list
- **Module Change**: Player switches to a different module
- **Activity Completion**: Current activity changes to null
- **Point Threshold**: 10+ point difference from last save
- **Position Change**: Player moves 3+ tiles from last saved position

## Console Logging

### Mission Completion Logs

```
🏆 Mission completed, saving game state: {
  missionId: "mission-basic-ai-1",
  summary: "Player at (15,11), Module: Introduction to AI Concepts, Points: 80, Missions: 2/4, Time: 425s"
}
```

### Save Operation Logs

```
🎮 Saving Game State: {
  summary: "Player at (15,11), Module: Introduction to AI Concepts, Points: 80, Missions: 2/4, Time: 425s",
  fullState: {
    "studentId": "student_john_doe",
    "moduleName": "Introduction to AI Concepts",
    "classId": "N/A",
    "missionTracker": [
      {
        "id": "mission-1",
        "activityId": "activity-npc-1",
        "completed": false
      },
      {
        "id": "mission-2",
        "activityId": "activity-npc-2",
        "completed": true
      }
    ],
    "playerPosition": "(15,11)",
    "currentPoints": 80,
    "timeLeft": "425s",
    "timestamp": 1703123456789
  }
}
✅ Game state saved successfully
```

### Auto-Save Logs

```
🔄 Auto-save started with 30000ms interval
⏹️ Auto-save stopped
```

## Testing

### Browser Console Testing

The feature includes a test function available in the browser console:

```javascript
// Test the game state logging feature
analyticsDemo.testGameState();
```

### Test Coverage

- Mock API call functionality
- Save/load operations
- Error handling
- Configuration validation

## Backend Integration

### Current Implementation

The system currently uses mock API calls that simulate network delays and return success responses.

### Ready for Backend Integration

To integrate with a real backend:

1. Replace `mockApiCall` and `mockLoadApiCall` methods in `GameStateService`
2. Update the `apiEndpoint` configuration
3. Add authentication headers if needed
4. Handle real error responses

### Expected API Endpoints

```
POST /api/gamestate
- Body: GameStateData
- Response: { success: boolean, error?: string }

GET /api/gamestate/:playerId
- Response: { success: boolean, data?: GameStateData, error?: string }
```

## Error Handling

### Graceful Degradation

- Failed saves are logged but don't interrupt gameplay
- Load failures return null (no saved state)
- Network errors are caught and logged

### Error Logging

```
❌ Failed to save game state: Network error
❌ Error loading game state: Player not found
```

## Performance Considerations

### Efficient Change Detection

- Only saves when significant changes occur
- Configurable auto-save interval
- Lightweight state comparison

### Memory Management

- Auto-save timer cleanup on component unmount
- Minimal state storage in memory
- Efficient JSON serialization

## Future Enhancements

### Planned Features

1. **Compression**: Compress game state data for large saves
2. **Versioning**: Handle game state schema changes
3. **Offline Support**: Queue saves when offline
4. **Encryption**: Encrypt sensitive game state data
5. **Analytics Integration**: Combine with existing analytics system

### Configuration Extensions

```typescript
interface ExtendedConfig {
  compression: boolean;
  encryption: boolean;
  offlineQueue: boolean;
  maxRetries: number;
  retryDelay: number;
}
```

## Troubleshooting

### Common Issues

1. **No Console Logs**: Check `enableLogging` configuration
2. **Auto-Save Not Working**: Verify timer is started and interval is reasonable
3. **State Not Saving**: Check for significant change detection criteria
4. **Load Failures**: Verify player ID format and API endpoint

### Debug Commands

```javascript
// Check current configuration
console.log(gameStateService.config);

// Test save with mock data
gameStateService.saveGameState(mockGameState);

// Check stored events
analyticsDemo.getEvents();
```

## Integration with Analytics

The game state logging system is designed to complement the existing analytics system:

- **Analytics**: Tracks user interactions and learning progress
- **Game State**: Saves complete game progress for restoration
- **Combined**: Provides comprehensive player data for analysis

Both systems use similar logging patterns and can be easily integrated for unified data collection. 