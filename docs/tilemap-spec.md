// Core Types for Tile Map System

export type TilePosition = {
  x: number;
  y: number;
};

export type TileProperties = {
  walkable: boolean;
  interactable: boolean;
  triggerScriptId: string | null;
  assetPath: string;
  animationFrames?: string[];
  collisionMask?: number;
};

export type Tile = {
  id: number;
  type: 'floor' | 'wall' | 'object' | 'npc' | 'trigger';
  properties: TileProperties;
};

export type Tileset = {
  id: string;
  name: string;
  tiles: Tile[];
};

export type MapLayer = {
  id: string;
  name: string;
  type: 'background' | 'interactive' | 'foreground';
  data: number[][]; // 2D array of tile indices
  visible: boolean;
};

export type NPC = {
  id: string;
  name: string;
  position: TilePosition;
  spriteId: string;
  movementPattern: 'static' | 'patrol' | 'follow';
  patrolPath?: TilePosition[];
  dialogueScriptId: string;
  interactionRadius: number;
};

export type Trigger = {
  id: string;
  position: TilePosition;
  size?: { width: number; height: number }; // Default: 1x1
  type: 'proximity' | 'interaction' | 'completion';
  scriptId: string;
  oneTime: boolean;
  activated: boolean;
};

export type TileMap = {
  moduleId: string;
  mapId: string;
  name: string;
  theme: string;
  dimensions: {
    width: number;
    height: number;
  };
  layers: MapLayer[];
  tilesets: Tileset[];
  npcs: NPC[];
  triggers: Trigger[];
  spawnPoint: TilePosition;
};

// Tile Map Renderer Interface

export interface TileMapRenderer {
  loadMap(map: TileMap): Promise<void>;
  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void;
  getTileAt(layer: string, position: TilePosition): Tile | null;
  isWalkable(position: TilePosition): boolean;
  getInteractablesAt(position: TilePosition): Array<Tile | NPC | Trigger>;
  getTriggersInRange(position: TilePosition, radius: number): Trigger[];
}

export type Viewport = {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
};

// Collision System

export enum CollisionLayer {
  NONE = 0,
  PLAYER = 1,
  NPC = 2,
  OBJECT = 4,
  TRIGGER = 8,
  ALL = 15
}

export interface CollisionSystem {
  checkCollision(position: TilePosition, layer: CollisionLayer): boolean;
  registerCollidable(entity: any, position: TilePosition, layer: CollisionLayer): void;
  unregisterCollidable(entity: any): void;
  updatePosition(entity: any, newPosition: TilePosition): void;
}

// Sample Implementation of the TileMap Loading Function

export const loadTileMap = async (mapId: string): Promise<TileMap> => {
  try {
    // In a real implementation, this would fetch from your API
    const response = await fetch(`/api/maps/${mapId}`);
    if (!response.ok) {
      throw new Error(`Failed to load map: ${response.statusText}`);
    }
    
    const mapData: TileMap = await response.json();
    
    // Validate map structure
    if (!mapData.dimensions || !mapData.layers || !mapData.tilesets) {
      throw new Error('Invalid map structure');
    }
    
    // Pre-process map data if needed
    preprocessMapData(mapData);
    
    return mapData;
  } catch (error) {
    console.error('Error loading tile map:', error);
    throw error;
  }
};

const preprocessMapData = (mapData: TileMap): void => {
  // Example preprocessing:
  // 1. Ensure all NPCs have valid positions
  mapData.npcs.forEach(npc => {
    if (npc.position.x < 0 || npc.position.x >= mapData.dimensions.width ||
        npc.position.y < 0 || npc.position.y >= mapData.dimensions.height) {
      console.warn(`NPC ${npc.id} has invalid position and will be adjusted`);
      npc.position.x = Math.max(0, Math.min(npc.position.x, mapData.dimensions.width - 1));
      npc.position.y = Math.max(0, Math.min(npc.position.y, mapData.dimensions.height - 1));
    }
  });
  
  // 2. Ensure all triggers have valid positions
  mapData.triggers.forEach(trigger => {
    if (trigger.position.x < 0 || trigger.position.x >= mapData.dimensions.width ||
        trigger.position.y < 0 || trigger.position.y >= mapData.dimensions.height) {
      console.warn(`Trigger ${trigger.id} has invalid position and will be adjusted`);
      trigger.position.x = Math.max(0, Math.min(trigger.position.x, mapData.dimensions.width - 1));
      trigger.position.y = Math.max(0, Math.min(trigger.position.y, mapData.dimensions.height - 1));
    }
  });
  
  // 3. Initialize additional properties if needed
  mapData.layers.forEach(layer => {
    if (layer.visible === undefined) {
      layer.visible = true;
    }
  });
};
