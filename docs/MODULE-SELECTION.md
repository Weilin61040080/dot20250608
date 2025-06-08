# Module Selection System

This document outlines the module selection system implemented in the AI Literacy Game, including how modules are structured, displayed, and how they connect to game maps.

## Overview

The module selection system allows players to choose from different learning modules, each with its own:
- Title and description
- Associated map
- Learning activities
- Thematic focus

When a player selects a module, they are directed to the game page with the appropriate map loaded, allowing them to begin their learning journey in that specific module.

## Module Structure

Each module is defined with the following properties:

```typescript
interface Module {
  id: string;         // Unique identifier for the module
  title: string;      // Display name shown to the user
  description: string; // Brief explanation of the module content
  theme: string;      // Visual theme (could affect UI colors/styles)
  mapIds: string[];   // Maps associated with this module (currently just using the first one)
  mainStoryScriptId: string; // The script that drives the main story for this module
  learningActivityIds: string[]; // Activities available in this module
  requiredPoints: number; // Points needed to complete the module
}
```

## Module-to-Map Mapping

Each module is associated with one or more maps. The current implementation uses a simple mapping from module IDs to map IDs:

```typescript
const moduleMapMapping: Record<string, string> = {
  'module-test': 'test-map-1',
  'module-ethics': 'campus-map',
  'module-ml': 'lab-map'
};
```

This mapping is used in the `GamePage` component to load the correct map when a module is selected.

## Module Thumbnails

Each module displays a thumbnail image that provides a visual preview of the associated map. Thumbnails are stored in the following path structure:

```
public/assets/maps/{mapId}/thumbnail/thumbnail.svg
```

The system includes a utility script (`src/utils/createPlaceholderThumbnails.js`) that can generate placeholder SVG thumbnails for maps that don't have custom thumbnails yet.

## User Flow

1. User navigates to the module selection page (`/modules`)
2. User sees a grid of available modules with thumbnails, titles, and descriptions
3. User clicks on a module (or its "Start Module" button)
4. The system stores the selected module ID in Redux state
5. User is redirected to the game page (`/game`)
6. The game page loads the map associated with the selected module
7. If no module is selected when accessing the game page directly, the user is automatically redirected to the module selection page

## Implementation Details

### ModuleSelectPage Component

The `ModuleSelectPage` component displays all available modules in a grid layout. Each module is rendered as a card with:
- A thumbnail image from the associated map
- The module title
- A brief description
- A "Start Module" button

When a module is selected, the component:
1. Dispatches the `setCurrentModule` action to update Redux state
2. Navigates to the game page

### GamePage Component

The `GamePage` component handles loading the appropriate map based on the selected module:
1. Gets the current module ID from Redux state
2. If no module is selected, redirects to the module selection page
3. Uses the module-to-map mapping to determine which map to load
4. Loads the map using the `gameService`
5. Dispatches the `setCurrentMap` action to update Redux state

## Styling

The module selection page uses a responsive grid layout that adapts to different screen sizes. Module cards have hover effects to improve user interaction feedback.

## Future Enhancements

1. **Dynamic Module Loading**: Fetch module data from an API instead of using static data
2. **Module Progress Tracking**: Show completion status and earned points for each module
3. **Module Prerequisites**: Implement a system where some modules require completing others first
4. **Module Categories**: Group modules by category or difficulty
5. **Custom Module Thumbnails**: Replace placeholder SVGs with custom designed thumbnails
6. **Module Search and Filtering**: Allow users to search or filter modules

## Adding New Modules

To add a new module:

1. Add the module data to the `modules` state in `ModuleSelectPage`
2. Add a map ID to module ID mapping in the `moduleMapMapping` object in `GamePage`
3. Create a thumbnail for the module's map in the appropriate directory
4. Create the actual map file in the maps directory

Example:

```typescript
// In ModuleSelectPage.tsx
const [modules, setModules] = useState<ModuleData[]>([
  // ... existing modules
  {
    id: 'module-new',
    title: 'New Module Title',
    description: 'Description of the new module',
    mapId: 'new-map'
  }
]);

// In GamePage.tsx
const moduleMapMapping: Record<string, string> = {
  // ... existing mappings
  'module-new': 'new-map'
};
``` 