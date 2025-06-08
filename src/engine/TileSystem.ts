import { TileMap, TilePosition, Tile, NPC, Trigger } from '../types/TileMap';
import { TileMapRenderer, Viewport } from '../types/Engine';

class TileSystem implements TileMapRenderer {
  private map: TileMap | null = null;
  private tileSize: number = 32;
  private tileImages: Map<string, HTMLImageElement> = new Map();
  private assetBasePath: string = '';
  private loaded: boolean = false;

  constructor(tileSize: number = 32, assetBasePath: string = '') {
    this.tileSize = tileSize;
    this.assetBasePath = assetBasePath;
    console.log('TileSystem initialized with assetBasePath:', assetBasePath);
  }

  async loadMap(map: TileMap): Promise<void> {
    this.map = map;
    this.loaded = false;
    this.tileImages.clear();
    
    try {
      // Load all tile images
      const loadPromises: Promise<void>[] = [];
      
      // Load tile assets
      for (const tileset of map.tilesets) {
        for (const tile of tileset.tiles) {
          const tileId = tile.id.toString();
          const imagePath = `${this.assetBasePath}${tile.properties.assetPath}`;
          console.log(`Loading tile image: ${imagePath}`);
          loadPromises.push(this.loadImage(imagePath, tileId));
        }
      }
      
      // Load NPC assets
      for (const npc of map.npcs) {
        const imagePath = `${this.assetBasePath}${npc.assetPath}`;
        console.log(`Loading NPC image: ${imagePath}`);
        loadPromises.push(this.loadImage(imagePath, npc.id));
      }
      
      // Wait for all images to load
      await Promise.all(loadPromises);
      
      this.loaded = true;
      console.log('Map loaded successfully with all assets');
    } catch (error) {
      console.error('Error loading map assets:', error);
      // Even if some assets fail to load, mark as loaded
      // to allow fallback rendering
      this.loaded = true;
      throw error;
    }
  }

  private async loadImage(src: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.tileImages.set(id, img);
        console.log(`Image loaded successfully: ${src}`);
        resolve();
      };
      img.onerror = (error) => {
        console.warn(`Failed to load image: ${src}`, error);
        // Create a fallback colored rectangle
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Check if this is an empty tile
          if (src.includes('empty.png')) {
            // Make empty tiles black
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, this.tileSize, this.tileSize);
          } else {
            // Use a random color based on the id
            const color = `hsl(${parseInt(id) * 50 % 360}, 70%, 50%)`;
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, this.tileSize, this.tileSize);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(0, 0, this.tileSize, this.tileSize);
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText(id, 2, 12);
          }
        }
        
        const fallbackImg = new Image();
        fallbackImg.src = canvas.toDataURL();
        fallbackImg.onload = () => {
          this.tileImages.set(id, fallbackImg);
          resolve();
        };
      };
      
      // Try to load the image
      img.src = src;
      
      // If the image takes too long to load, use a fallback
      setTimeout(() => {
        if (!this.tileImages.has(id)) {
          console.warn(`Image load timeout: ${src}`);
          // Create a synthetic error event rather than calling onerror directly
          const errorEvent = new Event('error');
          img.dispatchEvent(errorEvent);
        }
      }, 5000);
    });
  }

  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    if (!this.map || !this.loaded) return;
    
    const { x: viewX, y: viewY, width: viewWidth, height: viewHeight, scale } = viewport;
    const tileSize = this.tileSize * scale;
    
    // Calculate visible tile range
    const startCol = Math.max(0, Math.floor(viewX / tileSize));
    const endCol = Math.min(
      this.map.dimensions.width - 1,
      Math.ceil((viewX + viewWidth) / tileSize)
    );
    const startRow = Math.max(0, Math.floor(viewY / tileSize));
    const endRow = Math.min(
      this.map.dimensions.height - 1,
      Math.ceil((viewY + viewHeight) / tileSize)
    );
    
    // Render each layer
    this.map.layers.forEach(layer => {
      if (!layer.visible) return;
      
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const tileId = layer.data[row][col];
          if (tileId === 0) continue; // Skip empty tiles
          
          const tile = this.getTileById(tileId);
          if (!tile) continue;
          
          const screenX = col * tileSize - viewX;
          const screenY = row * tileSize - viewY;
          
          const tileImage = this.tileImages.get(tileId.toString());
          if (tileImage) {
            ctx.drawImage(tileImage, screenX, screenY, tileSize, tileSize);
          } else {
            // Fallback rendering if image not loaded
            ctx.fillStyle = '#ccc';
            ctx.fillRect(screenX, screenY, tileSize, tileSize);
            ctx.strokeStyle = '#999';
            ctx.strokeRect(screenX, screenY, tileSize, tileSize);
          }
        }
      }
    });
    
    // Render NPCs
    this.map.npcs.forEach(npc => {
      const screenX = npc.position.x * tileSize - viewX;
      const screenY = npc.position.y * tileSize - viewY;
      
      // Use the NPC's ID to find its image
      const npcImage = this.tileImages.get(npc.id);
      if (npcImage) {
        ctx.drawImage(npcImage, screenX, screenY, tileSize, tileSize);
      } else {
        // Simple NPC rendering as fallback
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(
          screenX + tileSize / 2,
          screenY + tileSize / 2,
          tileSize / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.strokeStyle = '#2980b9';
        ctx.stroke();
      }
      
      // Add NPC name
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.font = `${12 * scale}px Arial`;
      ctx.fillText(npc.name, screenX + tileSize / 2, screenY - 5);
    });
  }

  getTileAt(layerId: string, position: TilePosition): Tile | null {
    if (!this.map) return null;
    
    const layer = this.map.layers.find(l => l.id === layerId);
    if (!layer) return null;
    
    const { x, y } = position;
    
    // Check bounds
    if (x < 0 || y < 0 || x >= this.map.dimensions.width || y >= this.map.dimensions.height) {
      return null;
    }
    
    const tileId = layer.data[y][x];
    return this.getTileById(tileId);
  }

  private getTileById(id: number): Tile | null {
    if (!this.map) return null;
    
    for (const tileset of this.map.tilesets) {
      const tile = tileset.tiles.find(t => t.id === id);
      if (tile) return tile;
    }
    
    return null;
  }

  isWalkable(position: TilePosition): boolean {
    if (!this.map) return false;
    
    // Check map boundaries
    if (
      position.x < 0 ||
      position.y < 0 ||
      position.x >= this.map.dimensions.width ||
      position.y >= this.map.dimensions.height
    ) {
      return false;
    }
    
    // Check tiles in all layers
    for (const layer of this.map.layers) {
      const tileId = layer.data[position.y][position.x];
      if (tileId !== 0) { // Not an empty tile
        const tile = this.getTileById(tileId);
        if (tile && !tile.properties.walkable) {
          return false;
        }
      }
    }
    
    // Check if any NPC is at the position
    const npcAtPosition = this.map.npcs.find(
      npc => npc.position.x === position.x && npc.position.y === position.y
    );
    if (npcAtPosition) {
      return false;
    }
    
    return true;
  }

  getInteractablesAt(position: TilePosition): Array<Tile | NPC | Trigger> {
    const result: Array<Tile | NPC | Trigger> = [];
    
    if (!this.map) return result;
    
    // Check for interactable tiles
    for (const layer of this.map.layers) {
      const tileId = layer.data[position.y][position.x];
      if (tileId !== 0) {
        const tile = this.getTileById(tileId);
        if (tile && tile.properties.interactable) {
          result.push(tile);
        }
      }
    }
    
    // Check for NPCs
    const npcAtPosition = this.map.npcs.find(
      npc => npc.position.x === position.x && npc.position.y === position.y
    );
    if (npcAtPosition) {
      result.push(npcAtPosition);
    }
    
    // Check for triggers
    const triggerAtPosition = this.map.triggers.find(
      trigger => trigger.position.x === position.x && trigger.position.y === position.y
    );
    if (triggerAtPosition) {
      result.push(triggerAtPosition);
    }
    
    return result;
  }

  getTriggersInRange(position: TilePosition, radius: number): Trigger[] {
    if (!this.map) return [];
    
    return this.map.triggers.filter(trigger => {
      const dx = trigger.position.x - position.x;
      const dy = trigger.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= radius;
    });
  }
}

export default TileSystem; 