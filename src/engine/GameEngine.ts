import { TileMap, TilePosition, NPC, Tile } from '../types/TileMap';
import { GameEngineOptions, Viewport } from '../types/Engine';
import TileSystem from './TileSystem';
import CharacterSystem from './CharacterSystem';
import { setCurrentMap, setLoading, setError } from '../store/slices/gameSlice';
import { setPosition, setDirection, setMoving } from '../store/slices/playerSlice';
import { openDialog } from '../store/slices/uiSlice';
import { Store } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Activity, getActivityByNpcId } from '../data/activityContext';
import { startDialogue } from '../store/slices/dialogueSlice';
import debugHelper from '../utils/debugHelper';

class GameEngine {
  // Core systems
  private tileSystem: TileSystem;
  private characterSystem: CharacterSystem;
  
  // Canvas and rendering
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private baseTileSize: number; // Base tile size (32px)
  private assetBasePath: string;
  private viewport: Viewport;
  
  // Camera smoothing properties
  private cameraTarget: { x: number; y: number } = { x: 0, y: 0 };
  private cameraPosition: { x: number; y: number } = { x: 0, y: 0 };
  
  // Input and state management
  private keysPressed: Set<string> = new Set();
  private store: Store | null = null;
  private gameLoopActive: boolean = false;
  private debugMode: boolean = true;

  constructor(options: GameEngineOptions) {
    this.baseTileSize = options.tileSize || 32;
    this.assetBasePath = options.assetsBasePath || '';
    
    // Initialize viewport with default values
    this.viewport = {
      x: 0,
      y: 0,
      width: 1024,
      height: 768,
      scale: 1
    };
    
    // Initialize systems
    this.tileSystem = new TileSystem(this.baseTileSize, this.assetBasePath);
    this.characterSystem = new CharacterSystem(this.tileSystem, this.baseTileSize, this.assetBasePath);
    
    // Find canvas and initialize context
    this.canvas = document.getElementById(options.canvasId) as HTMLCanvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.setupInputHandlers();
      
      // Set initial canvas size from viewport
      this.updateCanvasSize();
    } else {
      console.error(`Canvas with ID ${options.canvasId} not found`);
    }
    
    // Initialize debug overlay
    if (debugHelper) {
      debugHelper.initDebugOverlay();
      debugHelper.logDebug('GameEngine initialized', {
        canvasId: options.canvasId,
        baseTileSize: this.baseTileSize,
        assetBasePath: this.assetBasePath
      });
    }
  }

  // Connect to Redux store
  setStore(store: Store): void {
    this.store = store;
  }

  // Set up keyboard input handlers
  private setupInputHandlers(): void {
    if (!this.canvas) return;
    
    window.addEventListener('keydown', (e) => {
      this.keysPressed.add(e.key.toLowerCase());
      
      // Log key presses in debug mode
      if (this.debugMode) {
        debugHelper.logDebug('Key pressed', { key: e.key, code: e.code });
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keysPressed.delete(e.key.toLowerCase());
    });
    
    // Stop movement when canvas loses focus
    window.addEventListener('blur', () => {
      this.keysPressed.clear();
      this.characterSystem.stopMoving();
      this.updateStore();
    });
  }

  // Load a map into the game
  async loadMap(map: TileMap): Promise<void> {
    if (this.store) {
      this.store.dispatch(setLoading(true));
    }
    
    try {
      await this.tileSystem.loadMap(map);
      
      // Teleport character to spawn point
      this.characterSystem.teleport(map.spawnPoint);
      
      if (this.store) {
        this.store.dispatch(setCurrentMap(map));
        this.store.dispatch(setPosition(map.spawnPoint));
        this.store.dispatch(setLoading(false));
      }
      
      // Start game loop if it's not already running
      if (!this.gameLoopActive) {
        this.start();
      }
      
      if (this.debugMode) {
        debugHelper.logDebug('Map loaded successfully', { 
          mapName: map.name,
          npcs: map.npcs?.length || 0
        });
      }
    } catch (error) {
      console.error('Error loading map:', error);
      if (this.store) {
        this.store.dispatch(setError('Failed to load map'));
        this.store.dispatch(setLoading(false));
      }
    }
  }

  // Start the game loop
  start(): void {
    if (this.gameLoopActive) return;
    
    this.gameLoopActive = true;
    let lastTime = performance.now();
    
    const loop = (time: number) => {
      if (!this.gameLoopActive) return;
      
      const deltaTime = time - lastTime;
      lastTime = time;
      
      this.update(deltaTime);
      this.render();
      
      requestAnimationFrame(loop);
    };
    
    requestAnimationFrame(loop);
    debugHelper.logDebug('Game engine started');
  }

  // Stop the game loop
  stop(): void {
    this.gameLoopActive = false;
    debugHelper.logDebug('Game engine stopped');
  }

  // Update game state
  private update(deltaTime: number): void {
    // Handle input
    this.handleInput();
    
    // Update character
    this.characterSystem.update(deltaTime);
    
    // Update viewport to follow character with smooth camera
    this.updateViewport(deltaTime);
    
    // Update store with character state
    this.updateStore();
  }

  // Handle keyboard input
  private handleInput(): void {
    // Skip input handling if character is already moving
    if (this.characterSystem.isMoving()) return;
    
    if (this.keysPressed.has('w') || this.keysPressed.has('arrowup')) {
      this.characterSystem.move('up');
    } else if (this.keysPressed.has('s') || this.keysPressed.has('arrowdown')) {
      this.characterSystem.move('down');
    } else if (this.keysPressed.has('a') || this.keysPressed.has('arrowleft')) {
      this.characterSystem.move('left');
    } else if (this.keysPressed.has('d') || this.keysPressed.has('arrowright')) {
      this.characterSystem.move('right');
    }
    
    // Handle interaction
    if (this.keysPressed.has(' ') || this.keysPressed.has('e') || this.keysPressed.has('enter')) {
      debugHelper.logDebug('Interaction key pressed', {
        position: this.characterSystem.getPosition(),
        direction: this.characterSystem.getDirection()
      });
      
      this.handleInteraction();
      
      // Remove the key to prevent multiple interactions
      this.keysPressed.delete(' ');
      this.keysPressed.delete('e');
      this.keysPressed.delete('enter');
    }
  }

  // Handle interaction with objects and NPCs
  private handleInteraction(): void {
    const position = this.characterSystem.getPosition();
    const direction = this.characterSystem.getDirection();
    
    const frontPosition: TilePosition = { ...position };
    
    switch (direction) {
      case 'up': frontPosition.y -= 1; break;
      case 'down': frontPosition.y += 1; break;
      case 'left': frontPosition.x -= 1; break;
      case 'right': frontPosition.x += 1; break;
    }
    
    debugHelper.logDebug('Checking interaction at position', frontPosition);
    const interactables = this.tileSystem.getInteractablesAt(frontPosition);
    debugHelper.logDebug('Interactables found', { count: interactables.length });

    if (interactables.length > 0) {
      const interactable = interactables[0];

      if ('spriteId' in interactable && interactable.spriteId !== undefined && 'name' in interactable && 'id' in interactable && 'dialogueScriptId' in interactable) {
        const npc = interactable as NPC;
        const npcId = npc.id;
        const npcName = npc.name;
        const dialogueId = npc.dialogueScriptId;
        const npcAssetPath = npc.assetPath;
        
        debugHelper.logDebug('[GameEngine] Interacting with NPC', { npcId, npcName, dialogueId, npcAssetPath });
        
        const activity = this.getActivityForNpc(npcId);
        
        if (this.store) {
          const state = this.store.getState() as RootState;
          const currentModuleId = state.module.currentModuleId;
          let associatedMissionId: string | undefined;
          
          if (currentModuleId && activity) {
            const currentModule = state.module.modules.find(m => m.id === currentModuleId);
            if (currentModule && currentModule.missions) {
              const mission = currentModule.missions.find(m => m.activityId === activity.id);
              if (mission) associatedMissionId = mission.id;
            }
          }
          
          if (activity) {
            debugHelper.logDebug('[GameEngine] NPC has activity, dispatching openDialog', { activityId: activity.id, npcAssetPath, title: npcName, speaker: npcName });
            this.store.dispatch(openDialog({
              type: 'npc',
              title: npcName,
              content: activity.introduction,
              speaker: npcName,
              activityId: activity.id,
              npcId: npcId,
              missionId: associatedMissionId,
              portraitUrl: npcAssetPath
            }));
          } else {
            debugHelper.logDebug('[GameEngine] NPC has no activity, dispatching openDialog for generic dialogue', { npcId, npcAssetPath, title: npcName, speaker: npcName });
            this.store.dispatch(startDialogue({ dialogueId, npcId, npcName }));
            this.store.dispatch(openDialog({
              type: 'npc',
              title: npcName,
              content: [`Hello! I am ${npcName}.`, 'How can I help you?'],
              speaker: npcName,
              portraitUrl: npcAssetPath
            }));
          }
        }
      } else if ('properties' in interactable && (interactable as Tile).properties.interactable) {
        const object = interactable as Tile;
        debugHelper.logDebug('Interacting with object', object);
        if (this.store) {
          this.store.dispatch(openDialog({
            type: 'object',
            title: 'Object',
            content: `You examine the object... (ID: ${object.id})`
          }));
        }
      }
    } else {
      debugHelper.logDebug('No interactables found in front of character');
    }
  }
  
  // Helper method to get activity data for an NPC
  private getActivityForNpc(npcId: string): Activity | undefined {
    try {
      // Get the activity for the NPC
      const activity = getActivityByNpcId(npcId);
      
      if (activity) {
        debugHelper.logDebug(`Found activity for NPC ${npcId}`, { title: activity.title });
      } else {
        debugHelper.logDebug(`No activity found for NPC ${npcId}`);
      }
      
      return activity;
    } catch (error) {
      console.error('Error loading activity:', error);
      return undefined;
    }
  }

  // Easing function for smooth camera movement
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  // Get the character's current visual position (including movement interpolation)
  private getCharacterVisualPosition(): { x: number; y: number } {
    const basePosition = this.characterSystem.getPosition();
    
    // If character is moving, get the interpolated position
    if (this.characterSystem.isMoving()) {
      const targetPosition = this.characterSystem.getTargetPosition();
      const moveProgress = this.characterSystem.getMoveProgress();
      
      if (targetPosition) {
        // Apply easing to movement for smoother visual
        const easedProgress = this.easeOutCubic(moveProgress);
        
        return {
          x: basePosition.x + (targetPosition.x - basePosition.x) * easedProgress,
          y: basePosition.y + (targetPosition.y - basePosition.y) * easedProgress
        };
      }
    }
    
    return { x: basePosition.x, y: basePosition.y };
  }

  private updateViewport(deltaTime?: number): void {
    if (!this.canvas || !this.store) return;
    
    const state = this.store.getState() as RootState;
    const viewConfig = state.ui.viewConfig;
    const map = state.game.currentMap;
    
    // Update canvas size if it changed
    this.updateCanvasSize();
    
    // Calculate effective tile size for player perspective
    const tilesX = viewConfig.playerViewTilesX;
    const tilesY = viewConfig.playerViewTilesY;
    
    const tileSizeX = this.viewport.width / tilesX;
    const tileSizeY = this.viewport.height / tilesY;
    
    // Use the smaller dimension to ensure all tiles fit
    const effectiveTileSize = Math.min(tileSizeX, tileSizeY);
    const scale = effectiveTileSize / this.baseTileSize;
    
    // Get character's visual position (including movement interpolation)
    const characterVisualPos = this.getCharacterVisualPosition();
    
    // Calculate target camera position (center on character)
    const targetCenterX = (characterVisualPos.x + 0.5) * effectiveTileSize;
    const targetCenterY = (characterVisualPos.y + 0.5) * effectiveTileSize;
    
    this.cameraTarget.x = targetCenterX - this.viewport.width / 2;
    this.cameraTarget.y = targetCenterY - this.viewport.height / 2;
    
    // Apply camera smoothing with deadzone using configurable settings
    if (deltaTime) {
      const deltaSeconds = deltaTime / 1000;
      
      // Calculate distance to target
      const dx = this.cameraTarget.x - this.cameraPosition.x;
      const dy = this.cameraTarget.y - this.cameraPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only move camera if outside deadzone (use config value)
      if (distance > viewConfig.cameraDeadzone) {
        // Smooth interpolation with configurable speed
        const lerpFactor = Math.min(1, viewConfig.cameraLerpSpeed * deltaSeconds);
        
        this.cameraPosition.x += dx * lerpFactor;
        this.cameraPosition.y += dy * lerpFactor;
      }
    } else {
      // Immediate positioning (for initial setup)
      this.cameraPosition.x = this.cameraTarget.x;
      this.cameraPosition.y = this.cameraTarget.y;
    }
    
    // Apply camera position to viewport
    this.viewport.x = this.cameraPosition.x;
    this.viewport.y = this.cameraPosition.y;
    
    // Clamp viewport to map bounds
    if (map) {
      const mapWidth = map.dimensions.width * effectiveTileSize;
      const mapHeight = map.dimensions.height * effectiveTileSize;
      
      this.viewport.x = Math.max(0, Math.min(this.viewport.x, mapWidth - this.viewport.width));
      this.viewport.y = Math.max(0, Math.min(this.viewport.y, mapHeight - this.viewport.height));
      
      // Update camera position to match clamped viewport
      this.cameraPosition.x = this.viewport.x;
      this.cameraPosition.y = this.viewport.y;
    }
    
    this.viewport.scale = scale;
  }

  // Update canvas size based on view configuration
  private updateCanvasSize(): void {
    if (!this.canvas || !this.store) return;
    
    const state = this.store.getState() as RootState;
    const viewConfig = state.ui.viewConfig;
    
    // Update canvas size if it changed
    if (this.canvas.width !== viewConfig.canvasWidth || this.canvas.height !== viewConfig.canvasHeight) {
      this.canvas.width = viewConfig.canvasWidth;
      this.canvas.height = viewConfig.canvasHeight;
      this.viewport.width = viewConfig.canvasWidth;
      this.viewport.height = viewConfig.canvasHeight;
      
      console.log(`Canvas resized to ${viewConfig.canvasWidth}x${viewConfig.canvasHeight}`);
    }
  }

  // Update Redux store with character state
  private updateStore(): void {
    if (!this.store) return;
    
    const position = this.characterSystem.getPosition();
    const direction = this.characterSystem.getDirection();
    const moving = this.characterSystem.isMoving();
    
    this.store.dispatch(setPosition(position));
    this.store.dispatch(setDirection(direction));
    this.store.dispatch(setMoving(moving));
  }

  // Render game elements
  private render(): void {
    if (!this.ctx || !this.canvas) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render map
    this.tileSystem.render(this.ctx, this.viewport);
    
    // Render character
    this.characterSystem.render(this.ctx, this.viewport);
    
    // Render NPC interaction zones if debug mode is enabled
    if (this.debugMode) {
      const state = this.store?.getState() as RootState;
      const map = state?.game?.currentMap;
      
      if (map?.npcs && debugHelper) {
        debugHelper.drawInteractionZones(
          this.ctx,
          map.npcs,
          this.baseTileSize,
          this.viewport
        );
      }
    }
  }

  // Public method to handle canvas resize (keep for compatibility)
  resize(width: number, height: number): void {
    if (!this.canvas || !this.store) return;
    
    // Update the view config in the store
    this.store.dispatch({
      type: 'ui/updateViewConfig',
      payload: {
        canvasWidth: width,
        canvasHeight: height
      }
    });
  }

  // Public method to toggle view mode
  toggleViewMode(): void {
    console.log('View mode toggle is no longer available - using player perspective only');
  }

  // Public method to get current view mode
  getViewMode(): string {
    return 'player';
  }
}

export default GameEngine;