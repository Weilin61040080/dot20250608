# User Profile Feature

## Overview

The User Profile Feature provides comprehensive player data management, storing student information, progress tracking, points accumulation, and inventory management. It integrates seamlessly with the analytics and game state logging systems to provide a unified player experience.

## Architecture

### Core Components

1. **UserProfileService** (`src/services/userProfileService.ts`)
   - Main service class for managing user profiles
   - Handles profile initialization, updates, and persistence
   - Integrates with local storage and future backend APIs

2. **Integration Points**
   - **Analytics System**: Provides studentId and classId for tracking
   - **Game State Logging**: Updates module states when missions are completed
   - **Module System**: Initializes profile when modules start

## Data Structure

### UserProfile Interface

```typescript
interface UserProfile {
  studentId: string;
  classId: string;
  totalPoints: number;
  moduleStates: Record<string, Omit<ModuleState, 'moduleId'>>;
  itemsList: Item[];
  createdAt: number;
  lastUpdated: number;
}
```

### ModuleState Interface

```typescript
interface ModuleState {
  moduleId: string;
  moduleName: string;
  isCompleted: boolean;
  currentPoints: number;
  totalPossiblePoints: number;
  missionTracker: MissionTracker[];
  playerPosition: string;
  timeLeft: string;
  lastUpdated: number;
}
```

### MissionTracker Interface

```typescript
interface MissionTracker {
  id: string;
  activityId: string;
  completed: boolean;
}
```

### Item Interface

```typescript
interface Item {
  id: string;
  name: string;
  type: 'reward' | 'purchase' | 'achievement';
  description: string;
  iconUrl?: string;
  acquiredAt: number;
  sourceModule?: string;
  cost?: number;
}
```

## Key Features

### 1. Student & Class Management
- **Student ID**: Unique identifier for each learner
- **Class ID**: Groups students for analytics and management
- **Integration**: Automatically applied to analytics and game state tracking

### 2. Points System
- **Total Points**: Accumulated across all completed modules
- **Module Points**: Current points within active module
- **Point Sources**: Mission completion, time bonuses, achievements
- **Point Usage**: Purchase items from store, unlock content

### 3. Module State Tracking
- **Progress Tracking**: Monitors completion status for each module
- **Mission Progress**: Tracks individual mission completion with detailed mission tracker
- **Position Tracking**: Saves player location within modules
- **Time Management**: Records remaining time for timed modules
- **Structured Data**: Module states organized by moduleId for efficient access

### 4. Mission Tracking System
- **Aligned Format**: Uses same missionTracker format as game state logging
- **Detailed Tracking**: Each mission includes id, activityId, and completion status
- **Real-time Updates**: Mission status updated automatically during gameplay

### 5. Inventory System
- **Item Types**:
  - `reward`: Items earned through gameplay
  - `purchase`: Items bought with points
  - `achievement`: Special recognition items
- **Item Metadata**: Descriptions, source modules, acquisition dates
- **Purchase System**: Point-based item acquisition

## Data Structure Example

```json
{
  "studentId": "student_john_doe",
  "classId": "class_ai_101",
  "totalPoints": 250,
  "moduleStates": {
    "Introduction to AI Concepts": {
      "moduleName": "Introduction to AI Concepts",
      "isCompleted": false,
      "currentPoints": 75,
      "totalPossiblePoints": 150,
      "missionTracker": [
        {
          "id": "mission-1",
          "activityId": "activity-npc-1",
          "completed": true
        },
        {
          "id": "mission-2",
          "activityId": "activity-npc-2",
          "completed": false
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
      "playerPosition": "(10,5)",
      "timeLeft": "300s",
      "lastUpdated": 1702654245000
    }
  },
  "itemsList": [
    {
      "id": "ai_expert_badge",
      "name": "AI Expert Badge",
      "type": "achievement",
      "description": "Completed all AI fundamentals modules",
      "sourceModule": "Introduction to AI Concepts",
      "acquiredAt": 1702654200000
    }
  ],
  "createdAt": 1702654100000,
  "lastUpdated": 1702654245000
}
```

## Integration with Other Systems

### Analytics Integration

The UserProfile service automatically provides student and class IDs to the analytics system:

```typescript
// Analytics automatically gets profile data
const profile = userProfileService.getCurrentProfile();
const studentId = profile?.studentId || 'N/A';
const classId = profile?.classId || 'N/A';
```

### Game State Integration

Module states are updated whenever game state is saved, maintaining alignment with the game state logging format:

```typescript
// Automatic update when game state changes
await userProfileService.updateModuleState(gameStateData);
```

### Module System Integration

Profile is initialized and displayed when modules start:

```typescript
// Automatic initialization on module start
await userProfileService.initializeProfile(studentId, classId);
userProfileService.printProfile(); // Console output
```

## Usage Examples

### Profile Initialization

```typescript
import { userProfileService } from '../services/userProfileService';

// Initialize new profile
const profile = await userProfileService.initializeProfile(
  'student_john_doe', 
  'class_ai_101'
);
```

### Adding Items

```typescript
// Add achievement item
await userProfileService.addItem({
  id: 'ai_expert_badge',
  name: 'AI Expert Badge',
  type: 'achievement',
  description: 'Completed all AI fundamentals modules',
  sourceModule: 'AI Fundamentals'
});

// Add reward item
await userProfileService.addItem({
  id: 'speed_boost',
  name: 'Learning Speed Boost',
  type: 'reward',
  description: 'Increases learning speed for 1 hour'
});
```

### Purchasing Items

```typescript
// Purchase item with points
const success = await userProfileService.purchaseItem({
  id: 'premium_avatar',
  name: 'Premium Avatar',
  description: 'Exclusive avatar design'
}, 100); // Cost: 100 points

if (success) {
  console.log('Item purchased successfully!');
} else {
  console.log('Insufficient points for purchase');
}
```

### Module Completion

```typescript
// Complete module and award points
await userProfileService.completeModule('ai_basics_module', 150);
```

## Console Logging

### Module Start Output

```
🚀 MODULE STARTED
================
Module: Introduction to AI Concepts
Module ID: ai_intro_module
Start Time: 12/15/2023, 2:30:45 PM

👤 USER PROFILE
================
Student ID: student_john_doe
Class ID: class_ai_101
Total Points: 250
Profile Created: 12/15/2023, 1:15:30 PM
Last Updated: 12/15/2023, 2:30:45 PM

📚 MODULE STATES:
   📖 Introduction to AI Concepts (Introduction to AI Concepts)
      Status: ⏳ In Progress
      Points: 75/150
      Missions: 1/4
      Position: (10,5)
      Time Left: 300s
      Last Updated: 12/15/2023, 2:30:45 PM
      🎯 Mission Details:
         1. mission-1 (activity-npc-1) - ✅ Completed
         2. mission-2 (activity-npc-2) - ⏳ Pending
         3. mission-3 (activity-npc-3) - ⏳ Pending
         4. mission-4 (activity-npc-4) - ⏳ Pending

🎁 ITEMS INVENTORY:
   1. AI Knowledge Badge (achievement)
      Description: Earned for completing first AI module
      Source: Introduction to AI Concepts
      Acquired: 12/15/2023, 2:00:15 PM

📊 SUMMARY: Student: student_john_doe, Class: class_ai_101, Total Points: 250, Modules: 0/1, Items: 1
```

### Game State Update Output

```
🎮 Updated module state: {
  moduleId: "Introduction to AI Concepts",
  currentPoints: 75,
  completedMissions: 1,
  totalMissions: 4
}

📋 Updated User Profile:
[Full profile display as shown above]
```

## Storage & Persistence

### Local Storage

Currently stores profiles in browser localStorage:
- **Storage Key**: `user_profile`
- **Format**: JSON serialized UserProfile object
- **Automatic Saving**: Triggered on all profile updates

### Future Backend Integration

Ready for backend integration with:
- **API Endpoints**: `/api/userprofile`
- **Mock Implementation**: Simulates network delays and responses
- **Error Handling**: Graceful degradation when backend unavailable

### Expected API Structure

```typescript
// Save Profile
POST /api/userprofile
Body: UserProfile
Response: { success: boolean, error?: string }

// Load Profile
GET /api/userprofile/:studentId
Response: { success: boolean, data?: UserProfile, error?: string }
```

## Configuration

### Service Configuration

```typescript
interface UserProfileServiceConfig {
  enableLogging: boolean;        // Enable console logging
  autoSaveInterval: number;      // Auto-save interval in milliseconds
  apiEndpoint?: string;          // Backend API endpoint
  storageKey: string;           // Local storage key
}
```

### Default Configuration

```typescript
const defaultConfig = {
  enableLogging: true,
  autoSaveInterval: 10000,      // 10 seconds
  apiEndpoint: '/api/userprofile',
  storageKey: 'user_profile'
};
```

## Testing

### Browser Console Testing

```javascript
// Test the complete user profile feature
analyticsDemo.testUserProfile();
```

### Test Coverage

The test function covers:
1. Profile initialization
2. Item management (add/purchase)
3. Module state updates
4. Points system
5. Profile display and summary

### Test Output Example

```
👤 Testing User Profile Feature
===============================
✅ User Profile Service imported successfully

1️⃣ Testing profile initialization...
✅ Profile initialized: { studentId: "test_student_123", classId: "test_class_456", totalPoints: 0 }

2️⃣ Testing item management...
✅ Items added successfully

3️⃣ Testing module state update...
✅ Module state updated

4️⃣ Testing item purchase...
✅ Module completed, points added
✅ Item purchased successfully

5️⃣ Final profile state:
[Full profile display]

6️⃣ Profile summary:
📊 Student: test_student_123, Class: test_class_456, Total Points: 50, Modules: 1/1, Items: 3

✅ User Profile Feature test completed!
```

## Error Handling

### Graceful Degradation

- **Profile Not Found**: Creates new profile automatically
- **Storage Failures**: Logs errors but continues operation
- **Insufficient Points**: Returns false for purchases, maintains state
- **API Failures**: Falls back to local storage only

### Error Logging

```
⚠️ No user profile initialized
❌ Failed to save user profile: [error details]
❌ Insufficient points for purchase: { required: 100, available: 50 }
```

## Performance Considerations

### Efficient Updates

- **Incremental Saves**: Only saves when data changes
- **Auto-Save Timer**: Configurable interval for automatic persistence
- **Memory Management**: Minimal memory footprint with efficient data structures

### Optimization Features

- **Change Detection**: Only triggers saves on meaningful updates
- **Batch Operations**: Groups related updates together
- **Lazy Loading**: Loads profile data only when needed

## Future Enhancements

### Planned Features

1. **Profile Synchronization**: Multi-device profile sync
2. **Achievement System**: Expanded achievement tracking
3. **Social Features**: Friend lists and leaderboards
4. **Advanced Analytics**: Detailed learning pattern analysis
5. **Customization**: Profile themes and personalization options

### Integration Expansions

1. **LMS Integration**: Connect with learning management systems
2. **Grade Passback**: Automatic grade reporting
3. **Parent/Teacher Dashboards**: Progress monitoring interfaces
4. **Adaptive Learning**: AI-driven personalized content recommendations

## Troubleshooting

### Common Issues

1. **Profile Not Loading**: Check browser localStorage permissions
2. **Points Not Updating**: Verify module completion triggers
3. **Items Not Saving**: Check for storage quota limits
4. **Console Errors**: Enable logging and check error messages

### Debug Commands

```javascript
// Check current profile
userProfileService.getCurrentProfile();

// Print profile details
userProfileService.printProfile();

// Get profile summary
userProfileService.getProfileSummary();

// Test profile functionality
analyticsDemo.testUserProfile();
```

The User Profile Feature provides a comprehensive foundation for player data management, seamlessly integrating with existing systems while maintaining flexibility for future enhancements and backend integration. 