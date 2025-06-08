import { Vector2 } from './Vector2';

/**
 * Represents an NPC in the game
 */
export interface NPC {
  id: string;
  name: string;
  position: Vector2;
  spriteId: string;
  movementPattern?: string;
  dialogueScriptId: string;
  interactionRadius: number;
  assetPath?: string;
}

/**
 * Represents a tile in the map
 */
export interface Tile {
  id: string;
  type: string;
  walkable: boolean;
  assetPath: string;
}

/**
 * Represents a trigger area in the map
 */
export interface Trigger {
  id: string;
  type: string;
  position: Vector2;
  size: Vector2;
  targetMapId?: string;
  targetPosition?: Vector2;
  dialogueScriptId?: string;
  activityId?: string;
}

/**
 * Represents a map in the game
 */
export interface MapData {
  moduleId: string;
  mapId: string;
  name: string;
  theme: string;
  dimensions: Vector2;
  playerStart?: Vector2;
  layers: Array<{
    id: string;
    data: number[][];
  }>;
  tilesets: {
    [key: string]: {
      id: string;
      tiles: {
        [key: string]: Tile;
      };
    };
  };
  npcs: NPC[];
  triggers?: Trigger[];
} 