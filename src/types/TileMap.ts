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
  type: 'floor' | 'wall' | 'object' | 'npc' | 'trigger' | 'empty';
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
  data: number[][];
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
  assetPath?: string;
};

export type Trigger = {
  id: string;
  position: TilePosition;
  size?: { width: number; height: number };
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