# Project File Structure

```
/ai-literacy-game
|-- /public
|   |-- /assets
|   |   |-- /images
|   |   |-- /fonts
|   |   |-- /sounds
|   |-- favicon.ico
|   |-- index.html
|
|-- /src
|   |-- /assets
|   |   |-- /maps
|   |   |   |-- test-map.json
|   |   |-- /images
|   |   |   |-- floor.png
|   |   |   |-- wall.png
|   |   |   |-- empty.png
|   |   |   |-- object.png
|   |   |   |-- player.png
|   |
|   |-- /components
|   |   |-- /core
|   |   |   |-- GameContainer.tsx
|   |   |   |-- Canvas.tsx
|   |   |
|   |   |-- /ui
|   |   |   |-- HUD.tsx
|   |   |   |-- DialogSystem.tsx
|   |   |   |-- /common
|   |   |       |-- Button.tsx
|   |   |
|   |   |-- /activities
|   |       |-- ActivityContainer.tsx
|   |       |-- MultipleChoiceActivity.tsx
|   |       |-- DragDropActivity.tsx
|   |       |-- OpenEndedActivity.tsx
|   |       |-- ChatbotActivity.tsx
|   |
|   |-- /engine
|   |   |-- GameEngine.ts
|   |   |-- TileSystem.ts
|   |   |-- CollisionSystem.ts
|   |   |-- InteractionSystem.ts
|   |   |-- CharacterSystem.ts
|   |   |-- DialogSystem.ts
|   |   |-- ActivitySystem.ts
|   |
|   |-- /data
|   |   |-- activityContext.ts
|   |   |-- dialogContext.ts
|   |   |-- npcContext.ts
|   |
|   |-- /hooks
|   |   |-- useGameLoop.ts
|   |   |-- useKeyPress.ts
|   |
|   |-- /store
|   |   |-- index.ts
|   |   |-- /slices
|   |       |-- gameSlice.ts
|   |       |-- playerSlice.ts
|   |       |-- dialogSlice.ts
|   |       |-- activitySlice.ts
|   |       |-- uiSlice.ts
|   |
|   |-- /services
|   |   |-- gameService.ts
|   |   |-- activityService.ts
|   |   |-- dialogService.ts
|   |
|   |-- /utils
|   |   |-- assetLoader.ts
|   |   |-- constants.ts
|   |
|   |-- /pages
|   |   |-- HomePage.tsx
|   |   |-- GamePage.tsx
|   |   |-- ModuleSelectPage.tsx
|   |
|   |-- /types
|   |   |-- gameTypes.ts
|   |   |-- mapTypes.ts
|   |
|   |-- App.tsx
|   |-- index.tsx
|   |-- routes.tsx
|
|-- /memory-bank
|   |-- file-structure.md
|   |-- progress.md
|
|-- package.json
|-- tsconfig.json
|-- README.md
```
