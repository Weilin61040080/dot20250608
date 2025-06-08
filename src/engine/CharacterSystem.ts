import { TilePosition } from '../types/TileMap';
import TileSystem from './TileSystem';
import { Viewport } from '../types/Engine';

type Direction = 'up' | 'down' | 'left' | 'right';

class CharacterSystem {
  private position: TilePosition = { x: 0, y: 0 };
  private targetPosition: TilePosition | null = null;
  private direction: Direction = 'down';
  private moving: boolean = false;
  private moveSpeed: number = 3; // tiles per second
  private moveProgress: number = 0;
  private tileSystem: TileSystem;
  private tileSize: number;
  private playerImage: HTMLImageElement | null = null;
  private assetBasePath: string;
  
  constructor(tileSystem: TileSystem, tileSize: number, assetBasePath: string = '/assets/') {
    this.tileSystem = tileSystem;
    this.tileSize = tileSize;
    this.assetBasePath = assetBasePath;
    console.log('CharacterSystem initialized with assetBasePath:', assetBasePath);
    this.loadPlayerImage();
  }
  
  private loadPlayerImage(): void {
    const img = new Image();
    img.onload = () => {
      this.playerImage = img;
      console.log('Player image loaded successfully:', img.src);
    };
    img.onerror = (error) => {
      console.warn('Failed to load player image, using fallback', error);
    };
    
    // Complete path to player image
    const playerImagePath = `${this.assetBasePath}shared/characters/player.png`;
    console.log('Loading player image from:', playerImagePath);
    img.src = playerImagePath;
    
    // If the image takes too long to load, proceed with fallback
    setTimeout(() => {
      if (!this.playerImage) {
        console.warn('Player image load timeout');
      }
    }, 5000);
  }
  
  teleport(position: TilePosition): void {
    // Only teleport if the position is walkable
    if (this.tileSystem.isWalkable(position)) {
      this.position = { ...position };
      this.targetPosition = null;
      this.moving = false;
      this.moveProgress = 0;
    }
  }
  
  move(direction: Direction): void {
    // Set the direction even if we can't move
    this.direction = direction;
    
    // If already moving, do nothing
    if (this.moving) return;
    
    // Calculate the target position based on direction
    const targetPosition: TilePosition = { ...this.position };
    
    switch (direction) {
      case 'up':
        targetPosition.y -= 1;
        break;
      case 'down':
        targetPosition.y += 1;
        break;
      case 'left':
        targetPosition.x -= 1;
        break;
      case 'right':
        targetPosition.x += 1;
        break;
    }
    
    // Check if the target position is walkable
    if (this.tileSystem.isWalkable(targetPosition)) {
      this.targetPosition = targetPosition;
      this.moving = true;
      this.moveProgress = 0;
    }
  }
  
  stopMoving(): void {
    this.moving = false;
    this.targetPosition = null;
    this.moveProgress = 0;
  }
  
  update(deltaTime: number): void {
    if (!this.moving || !this.targetPosition) return;
    
    // Update move progress
    this.moveProgress += (deltaTime / 1000) * this.moveSpeed;
    
    // If we reached the target position
    if (this.moveProgress >= 1) {
      this.position = { ...this.targetPosition };
      this.targetPosition = null;
      this.moving = false;
      this.moveProgress = 0;
    }
  }
  
  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    const { x: viewX, y: viewY, scale } = viewport;
    const tileSize = this.tileSize * scale;
    
    // Calculate the screen position
    let screenX: number;
    let screenY: number;
    
    if (this.moving && this.targetPosition) {
      // Interpolate between current and target position
      const dx = this.targetPosition.x - this.position.x;
      const dy = this.targetPosition.y - this.position.y;
      
      screenX = (this.position.x + dx * this.moveProgress) * tileSize - viewX;
      screenY = (this.position.y + dy * this.moveProgress) * tileSize - viewY;
    } else {
      screenX = this.position.x * tileSize - viewX;
      screenY = this.position.y * tileSize - viewY;
    }
    
    // Draw character based on image or fallback
    if (this.playerImage) {
      ctx.drawImage(this.playerImage, screenX, screenY, tileSize, tileSize);
    } else {
      // Fallback rendering if image not loaded
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.arc(
        screenX + tileSize / 2,
        screenY + tileSize / 2,
        tileSize / 2.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.strokeStyle = '#e67e22';
      ctx.lineWidth = 2 * scale;
      ctx.stroke();
      
      // Direction indicator
      ctx.fillStyle = '#2c3e50';
      
      const indicatorSize = tileSize / 5;
      let indicatorX = screenX + tileSize / 2;
      let indicatorY = screenY + tileSize / 2;
      
      switch (this.direction) {
        case 'up':
          indicatorY -= tileSize / 4;
          break;
        case 'down':
          indicatorY += tileSize / 4;
          break;
        case 'left':
          indicatorX -= tileSize / 4;
          break;
        case 'right':
          indicatorX += tileSize / 4;
          break;
      }
      
      ctx.beginPath();
      ctx.arc(indicatorX, indicatorY, indicatorSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw name above character
    ctx.fillStyle = 'white';
    ctx.font = `bold ${12 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Player', screenX + tileSize / 2, screenY - 5 * scale);
  }
  
  getPosition(): TilePosition {
    return { ...this.position };
  }
  
  getTargetPosition(): TilePosition | null {
    return this.targetPosition ? { ...this.targetPosition } : null;
  }
  
  getMoveProgress(): number {
    return this.moveProgress;
  }
  
  getDirection(): Direction {
    return this.direction;
  }
  
  isMoving(): boolean {
    return this.moving;
  }
}

export default CharacterSystem; 