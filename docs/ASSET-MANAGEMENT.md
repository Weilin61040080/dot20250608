# Asset Management Structure

This document outlines the asset management strategy for the AI Literacy Game, focused on creating a scalable, modular approach that separates map-specific assets from module-specific assets.

## Directory Structure

```
public/assets/
├── shared/                # Shared assets used across modules and maps
│   ├── characters/        # Player character and shared character assets
│   ├── icons/             # UI icons and common visual elements
│   └── ui/                # UI elements like buttons, panels, etc.
│
├── maps/                  # Map-specific assets organized by map ID
│   ├── test-map/          # Assets for the test map
│   │   ├── tiles/         # Tile images (floor, wall, etc.)
│   │   ├── npcs/          # NPC sprites specific to this map
│   │   └── background/    # Background elements for this map
│   │
│   ├── campus/            # Assets for the campus map
│   │   ├── tiles/         # ...
│   │   ├── npcs/          # ...
│   │   └── background/    # ...
│   │
│   └── lab/               # Assets for the laboratory map
│       ├── tiles/         # ...
│       ├── npcs/          # ...
│       └── background/    # ...
│
└── modules/               # Module-specific assets organized by module ID
    ├── basic-ai/          # Assets for the AI fundamentals module
    │   ├── activities/    # Activity-specific assets
    │   └── images/        # Module-specific imagery
    │
    ├── ai-ethics/         # Assets for the AI ethics module
    │   ├── activities/    # ...
    │   └── images/        # ...
    │
    ├── machine-learning/  # Assets for the machine learning module
    │   ├── activities/    # ...
    │   └── images/        # ...
    │
    └── conversational-ai/ # Assets for the conversational AI module
        ├── activities/    # ...
        └── images/        # ...
```

## Asset Path Format

To ensure consistency and enable reuse across different maps and modules, we use a standardized path format:

- **Map assets**: `/assets/maps/{mapId}/{assetType}/{assetName}`
- **Module assets**: `/assets/modules/{moduleId}/{assetType}/{assetName}`
- **Shared assets**: `/assets/shared/{assetType}/{assetName}`

## Asset Types

### Map Assets

Map assets are specific to the visual representation of game environments:

1. **Tiles**: Floor, wall, and other environmental elements
2. **NPCs**: NPC sprites that appear on a specific map
3. **Backgrounds**: Map-specific background elements

### Module Assets

Module assets are specific to the educational content:

1. **Activities**: Images used in learning activities (drag-drop elements, illustrations for questions)
2. **Images**: Supplementary imagery related to the module content

### Shared Assets

Assets used across multiple maps or modules:

1. **Characters**: Player character sprites and animations
2. **Icons**: Common icons used throughout the game
3. **UI**: Interface elements and components

## Asset References in Map Files

In map definition files (JSON), asset paths should be structured as follows:

```json
{
  "tilesets": [
    {
      "tiles": [
        {
          "properties": {
            "assetPath": "maps/test-map/tiles/floor.png"
          }
        }
      ]
    }
  ],
  "npcs": [
    {
      "spriteId": "npc-1",
      "assetPath": "maps/test-map/npcs/npc-1.png"
    }
  ]
}
```

## Asset References in Activity Files

In activity definition files, asset paths should be structured as follows:

```javascript
{
  type: 'drag-drop',
  options: [
    {
      id: 'opt-1',
      text: 'Computer Vision',
      imageUrl: '/assets/modules/basic-ai/activities/computer-vision-icon.png'
    }
  ],
  targetArea: {
    imageUrl: '/assets/modules/basic-ai/activities/object-detection.png'
  }
}
```

## Considerations for Reuse

This structure enables us to:

1. **Share maps across modules**: A single map can be used by multiple modules by simply changing the module-specific content.
2. **Reuse module content**: Module content can be reused across different maps for different learning contexts.
3. **Maintain separation of concerns**: Visual assets (maps) are separate from educational content (modules).
4. **Scale efficiently**: New maps and modules can be added without restructuring existing assets.

## Asset Loading Strategy

The game engine is configured to load assets from the appropriate paths based on the current map and module:

1. Map assets are loaded when a map is initialized
2. Module assets are loaded when activities are started
3. Shared assets are preloaded at game startup

This approach ensures efficient loading and memory usage while maintaining a clean, organized asset structure. 