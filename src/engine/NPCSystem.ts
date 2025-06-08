import { Vector2 } from '../types/Vector2';
import { NPC } from '../types/MapData';
import { store } from '../store/store';
import { startDialogue } from '../store/slices/dialogueSlice';
import debugHelper from '../utils/debugHelper';

export default class NPCSystem {
  private assetsBasePath: string;
  private npcImages: Map<string, HTMLImageElement> = new Map();
  
  constructor(assetsBasePath: string = '/assets/') {
    this.assetsBasePath = assetsBasePath;
  }
  
  /**
   * Update NPCs (animations, movement patterns, etc)
   */
  public updateNPCs(deltaTime: number, npcs: NPC[]): void {
    // In the future, handle NPC movement patterns, animations, etc.
  }
  
  /**
   * Render all NPCs
   */
  public renderNPCs(
    ctx: CanvasRenderingContext2D,
    npcs: NPC[],
    tileSize: number,
    viewport: { x: number, y: number, scale: number }
  ): void {
    npcs.forEach(npc => {
      this.renderNPC(ctx, npc, tileSize, viewport);
    });
  }
  
  /**
   * Render a single NPC
   */
  private renderNPC(
    ctx: CanvasRenderingContext2D,
    npc: NPC,
    tileSize: number,
    viewport: { x: number, y: number, scale: number }
  ): void {
    const { x: viewX, y: viewY, scale } = viewport;
    const screenX = npc.position.x * tileSize * scale - viewX;
    const screenY = npc.position.y * tileSize * scale - viewY;
    
    // Skip rendering if outside viewport
    if (
      screenX + tileSize * scale < 0 ||
      screenY + tileSize * scale < 0 ||
      screenX > ctx.canvas.width ||
      screenY > ctx.canvas.height
    ) {
      return;
    }
    
    // Get or load NPC image
    let npcImage = this.npcImages.get(npc.spriteId);
    if (!npcImage) {
      // If not loaded, load now
      npcImage = new Image();
      npcImage.src = `${this.assetsBasePath}images/${npc.spriteId}.png`;
      this.npcImages.set(npc.spriteId, npcImage);
      
      // Use placeholder until loaded
      ctx.fillStyle = '#FF6347'; // Tomato color
      ctx.fillRect(
        screenX,
        screenY,
        tileSize * scale,
        tileSize * scale
      );
    } else if (npcImage.complete) {
      // Draw NPC sprite
      ctx.drawImage(
        npcImage,
        screenX,
        screenY,
        tileSize * scale,
        tileSize * scale
      );
    } else {
      // Use placeholder if image not loaded yet
      ctx.fillStyle = '#FF6347'; // Tomato color
      ctx.fillRect(
        screenX,
        screenY,
        tileSize * scale,
        tileSize * scale
      );
    }
    
    // Draw NPC name
    ctx.fillStyle = 'white';
    ctx.font = `${12 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(
      npc.name,
      screenX + (tileSize * scale) / 2,
      screenY - 10 * scale
    );
  }
  
  /**
   * Find nearest NPC within interaction radius
   */
  public findNearbyNPC(playerPosition: Vector2, npcs: NPC[]): NPC | null {
    let nearestNpc: NPC | null = null;
    let nearestDistance = Infinity;
    
    debugHelper.logDebug('Finding nearby NPC', { playerPosition, npcsCount: npcs.length });
    
    npcs.forEach(npc => {
      const distance = this.calculateDistance(playerPosition, npc.position);
      
      debugHelper.logDebug(`Distance to ${npc.name}`, { 
        npcId: npc.id, 
        distance, 
        interactionRadius: npc.interactionRadius 
      });
      
      if (distance <= npc.interactionRadius && distance < nearestDistance) {
        nearestNpc = npc;
        nearestDistance = distance;
      }
    });
    
    return nearestNpc;
  }
  
  /**
   * Calculate distance between two points
   */
  private calculateDistance(pointA: Vector2, pointB: Vector2): number {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Start interaction with an NPC
   */
  public startInteraction(npc: NPC): void {
    debugHelper.logDebug(`Starting interaction with NPC: ${npc.name}`, npc);
    
    // Start dialogue
    store.dispatch(startDialogue({
      dialogueId: npc.dialogueScriptId,
      npcId: npc.id,
      npcName: npc.name
    }));
  }
} 