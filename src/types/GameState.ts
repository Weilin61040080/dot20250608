import { Vector2 } from './Vector2';
import { MapData } from './MapData';

/**
 * Represents the current state of the game
 */
export interface GameState {
  playerPosition: Vector2;
  playerDirection: Vector2;
  viewport: {
    x: number;
    y: number;
    scale: number;
  };
  tileSize: number;
  mapData: MapData | null;
  playerName: string;
} 