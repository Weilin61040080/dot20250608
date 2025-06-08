import { TileMap, TilePosition, Tile, NPC, Trigger } from './TileMap';

export type Viewport = {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
};

export enum CollisionLayer {
  NONE = 0,
  PLAYER = 1,
  NPC = 2,
  OBJECT = 4,
  TRIGGER = 8,
  ALL = 15
}

export interface TileMapRenderer {
  loadMap(map: TileMap): Promise<void>;
  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void;
  getTileAt(layer: string, position: TilePosition): Tile | null;
  isWalkable(position: TilePosition): boolean;
  getInteractablesAt(position: TilePosition): Array<Tile | NPC | Trigger>;
  getTriggersInRange(position: TilePosition, radius: number): Trigger[];
}

export interface CollisionSystem {
  checkCollision(position: TilePosition, layer: CollisionLayer): boolean;
  registerCollidable(entity: any, position: TilePosition, layer: CollisionLayer): void;
  unregisterCollidable(entity: any): void;
  updatePosition(entity: any, newPosition: TilePosition): void;
}

export interface CharacterController {
  move(direction: 'up' | 'down' | 'left' | 'right'): void;
  stopMoving(): void;
  teleport(position: TilePosition): void;
  getPosition(): TilePosition;
  getDirection(): 'up' | 'down' | 'left' | 'right';
  isMoving(): boolean;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void;
}

export interface InteractionSystem {
  interact(): void;
  checkProximityTriggers(position: TilePosition): void;
  getInteractableAtPosition(position: TilePosition): { entity: Tile | NPC | Trigger, type: string } | null;
  getInteractableInFrontOfCharacter(): { entity: Tile | NPC | Trigger, type: string } | null;
}

export interface AnimationSystem {
  loadSprite(id: string, assetPath: string, frameWidth: number, frameHeight: number): Promise<void>;
  playAnimation(id: string, animation: string, loop?: boolean): void;
  stopAnimation(id: string): void;
  update(deltaTime: number): void;
}

export type GameEngineOptions = {
  canvasId: string;
  tileSize: number;
  assetsBasePath: string;
}; 