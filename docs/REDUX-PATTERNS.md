# Redux Patterns in AI Literacy Game

This document outlines the Redux patterns and best practices implemented in the AI Literacy Game.

## Serializable State Pattern

Redux requires that all state be serializable (convertible to JSON). This means we cannot store functions, class instances, promises, or other non-serializable data in our Redux store.

### Problem: Function Callbacks in Dialog System

Initially, we had a non-serializable pattern in our dialog system:

```typescript
// Non-serializable pattern (BAD)
interface DialogData {
  type: DialogType;
  title: string;
  content: string | string[];
  // ...other properties
  onComplete?: () => void;  // Function callback - NOT serializable
}
```

This created a Redux serialization error:
```
A non-serializable value was detected in the state, in the path: `ui.dialogData.onComplete`.
```

### Solution: Action Identifiers Pattern

We refactored the code to use a serializable pattern with action identifiers instead of function callbacks:

```typescript
// Serializable pattern (GOOD)
interface DialogData {
  type: DialogType;
  title: string;
  content: string | string[];
  // ...other properties
  completeAction?: {
    type: string;
    payload?: any;
  };
  activityId?: string;
  npcId?: string;
}
```

In this pattern:
1. Instead of storing a callback function, we store data about what action should be dispatched
2. When the dialog completes, we dispatch the action based on the stored data
3. For activities, we store the activityId and npcId, which are used to look up and start the activity

### Implementation

1. **Redux Slice (`uiSlice.ts`)**: Modified the DialogData interface to use the serializable pattern

2. **Dialog Component (`DialogSystem.tsx`)**: Updated to dispatch actions based on stored data:
   ```typescript
   const executeCompleteAction = () => {
     if (dialogData.completeAction) {
       dispatch(dialogData.completeAction);
     }
     
     if (dialogData.activityId && dialogData.npcId) {
       // Look up and start the activity
       const activity = getActivityById(dialogData.activityId);
       if (activity) {
         dispatch(startActivity(activity));
       }
     }
   };
   ```

3. **Game Engine (`GameEngine.ts`)**: Updated to provide action data instead of callbacks:
   ```typescript
   // Before:
   openDialog({
     // ...dialog data
     onComplete: () => { 
       dispatch(startActivity(activity));
     }
   })

   // After:
   openDialog({
     // ...dialog data
     activityId: activity.id,
     npcId: npcId
   })
   ```

## Benefits of Serializable State

1. **Time-Travel Debugging**: Redux DevTools can properly save and restore state snapshots
2. **State Persistence**: State can be saved to localStorage or transmitted over a network
3. **Better Performance**: Redux's internal optimizations work better with serializable state
4. **Predictable State Updates**: Easier to understand what actions modify the state

## Other Redux Patterns Used

### Slice Pattern

The application uses the modern Redux Toolkit slice pattern to organize state:

- `gameSlice.ts`: Game map and environment state
- `playerSlice.ts`: Player character state
- `uiSlice.ts`: UI elements like dialogs and notifications
- `activitySlice.ts`: Learning activities state

### Thunk Pattern

For async operations, we use Redux Thunks to handle side effects, particularly for:

- Loading map data
- Starting activities
- Handling dialog sequences

## Best Practices

1. **Keep State Serializable**: Never store functions, classes, or complex objects
2. **Use Normalized State**: Store entities by ID for efficient access
3. **Single Source of Truth**: Keep all game state in Redux, not split across components
4. **Immutable Updates**: Always use immutable patterns (handled by Redux Toolkit)
5. **Descriptive Action Types**: Use clear action types with a domain/action format 