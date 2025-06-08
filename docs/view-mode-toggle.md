# Player Perspective & Configurable Canvas

## Overview

The AI Literacy Game features a configurable canvas system with a focused player perspective that provides an immersive gaming experience. The system allows users to customize their viewing experience through canvas sizing and tile visibility controls.

## Features

### Player Perspective
- Shows a limited viewport centered on the player character
- Configurable tile visibility (e.g., 15x11 tiles by default)
- Larger tile sizes for better visibility and immersion
- Smooth camera movement that follows the player
- Focused gaming experience that prevents seeing the entire map at once

### Configurable Settings

#### Canvas Size
- Width: 400-2000 pixels (step: 32px)
- Height: 300-1500 pixels (step: 32px)
- Real-time canvas updates
- Default: 1024x768 pixels

#### Visible Tiles
- Horizontal tiles: 5-30 tiles
- Vertical tiles: 5-25 tiles
- Automatic tile size calculation based on canvas size
- Default: 15x11 tiles visible

## Usage

### Accessing the Controls

The View Controls panel is located in the top-right corner of the game screen and includes:

1. **Canvas Size Controls**: Adjust the game canvas dimensions (width × height)
2. **Visible Tiles Controls**: Configure how many tiles are visible (horizontal × vertical)
3. **Real-time Info**: Shows current tile size and perspective information

### Default Configuration

```typescript
{
  canvasWidth: 1024,
  canvasHeight: 768,
  playerViewTilesX: 15,
  playerViewTilesY: 11
}
```

## Technical Implementation

### Redux State Management

The view configuration is managed in the UI slice:

```typescript
interface ViewConfig {
  canvasWidth: number;
  canvasHeight: number;
  playerViewTilesX: number; // How many tiles visible horizontally
  playerViewTilesY: number; // How many tiles visible vertically
}
```

### Game Engine Integration

The GameEngine automatically:
- Calculates effective tile sizes based on canvas size and visible tiles
- Updates viewport positioning to center on the player
- Handles canvas resizing in real-time
- Maintains smooth camera movement

### Viewport Calculations

The tile size is calculated to fit the desired number of tiles within the canvas:

```typescript
const tileSizeX = canvasWidth / playerViewTilesX;
const tileSizeY = canvasHeight / playerViewTilesY;
const effectiveTileSize = Math.min(tileSizeX, tileSizeY);
const scale = effectiveTileSize / baseTileSize;
```

The viewport is centered on the player and clamped to map boundaries:

```typescript
const centerX = (position.x + 0.5) * effectiveTileSize;
const centerY = (position.y + 0.5) * effectiveTileSize;

viewport.x = centerX - viewport.width / 2;
viewport.y = centerY - viewport.height / 2;
```

## Benefits

1. **Immersive Experience**: Players get a focused view that enhances gameplay immersion
2. **Customizable Interface**: Users can adjust canvas size and tile visibility to their preferences
3. **Performance Optimization**: Viewport culling ensures efficient rendering
4. **Responsive Design**: Adapts to different screen sizes and user preferences
5. **Smooth Gameplay**: Camera smoothly follows the player with proper boundary clamping

## User Interface

### View Controls Panel

The control panel provides:
- **Canvas Size**: Two input fields for width and height adjustment
- **Visible Tiles**: Two input fields for horizontal and vertical tile count
- **Information Display**: Shows current tile size and viewing configuration
- **Real-time Updates**: All changes apply immediately without requiring restarts

### Visual Feedback

The interface displays:
- Current effective tile size in pixels
- Number of tiles visible (e.g., "15×11 tiles")
- Confirmation of player perspective mode

## Configuration Guidelines

### Recommended Settings

For different use cases:

**Standard Play** (Default):
- Canvas: 1024×768
- Tiles: 15×11
- Result: ~68px tiles

**Large Screen**:
- Canvas: 1600×1200
- Tiles: 20×15
- Result: ~80px tiles

**Compact View**:
- Canvas: 800×600
- Tiles: 12×9
- Result: ~67px tiles

**High Detail**:
- Canvas: 1200×900
- Tiles: 10×8
- Result: ~112px tiles

### Performance Considerations

- Larger canvas sizes require more rendering resources
- Fewer visible tiles result in larger, more detailed sprites
- More visible tiles provide broader situational awareness
- The system automatically optimizes rendering based on viewport culling

## Future Enhancements

- Save user preferences to localStorage
- Keyboard shortcuts for quick adjustments
- Preset configurations for different play styles
- Mobile-responsive touch controls
- Zoom controls for fine-tuned scaling
- Mini-map overlay option 