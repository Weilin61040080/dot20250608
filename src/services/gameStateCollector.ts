/**
 * Game State Collector
 * Collects current game state from Redux store for saving
 */

import { RootState } from '../store';

export interface MissionTracker {
  id: string;
  activityId: string;
  completed: boolean;
}

export interface GameStateData {
  studentId: string;
  moduleName: string;
  classId: string;
  missionTracker: MissionTracker[];
  playerPosition: string;
  currentPoints: number;
  timeLeft: string;
  timestamp: number;
}

export class GameStateCollector {
  private lastSavedState: GameStateData | null = null;

  /**
   * Collect current game state from Redux store
   */
  collectGameState(state: RootState): GameStateData {
    // Get current module to access missions
    const currentModule = state.module.modules.find(m => m.id === state.module.currentModuleId);
    
    // Build mission tracker array
    const missionTracker: MissionTracker[] = currentModule?.missions.map(mission => ({
      id: mission.id,
      activityId: mission.activityId || mission.id, // Use activityId if available, fallback to mission id
      completed: state.module.completedMissions.includes(mission.id)
    })) || [];

    // Format player position as string
    const playerPosition = `(${state.player.position.x},${state.player.position.y})`;
    
    // Format time left as string with seconds
    const timeLeftSeconds = Math.round(state.module.timeRemaining_ms / 1000);
    const timeLeft = `${timeLeftSeconds}s`;

    // Generate student ID from player name or use N/A
    const studentId = state.player.name && state.player.name !== 'Player' 
      ? `student_${state.player.name.toLowerCase().replace(/\s+/g, '_')}` 
      : "N/A";

    return {
      studentId,
      moduleName: currentModule?.title || state.module.currentModuleId || "N/A",
      classId: "N/A", // TODO: Add classId to player state when available
      missionTracker,
      playerPosition,
      currentPoints: state.module.currentModulePoints,
      timeLeft,
      timestamp: Date.now(),
    };
  }

  /**
   * Get a summary of the game state for logging
   */
  getGameStateSummary(gameState: GameStateData): string {
    const completedMissions = gameState.missionTracker.filter(m => m.completed).length;
    const totalMissions = gameState.missionTracker.length;
    
    return `Player at ${gameState.playerPosition}, ` +
           `Module: ${gameState.moduleName}, Points: ${gameState.currentPoints}, ` +
           `Missions: ${completedMissions}/${totalMissions}, Time: ${gameState.timeLeft}`;
  }

  /**
   * Check if game state has significant changes worth saving
   */
  hasSignificantChanges(newState: GameStateData): boolean {
    if (!this.lastSavedState) return true;

    const last = this.lastSavedState;
    
    // Check for mission completion changes
    const newCompletedCount = newState.missionTracker.filter(m => m.completed).length;
    const lastCompletedCount = last.missionTracker.filter(m => m.completed).length;
    if (newCompletedCount > lastCompletedCount) return true;
    
    // Check for module change
    if (newState.moduleName !== last.moduleName) return true;
    
    // Check for significant point difference (10+ points)
    if (Math.abs(newState.currentPoints - last.currentPoints) >= 10) return true;
    
    // Check for significant position change (moved 3+ tiles)
    const lastPos = last.playerPosition.match(/\((\d+),(\d+)\)/);
    const newPos = newState.playerPosition.match(/\((\d+),(\d+)\)/);
    
    if (lastPos && newPos) {
      const lastX = parseInt(lastPos[1]);
      const lastY = parseInt(lastPos[2]);
      const newX = parseInt(newPos[1]);
      const newY = parseInt(newPos[2]);
      
      const positionDistance = Math.abs(newX - lastX) + Math.abs(newY - lastY);
      if (positionDistance >= 3) return true;
    }
    
    return false;
  }

  updateLastSavedState(gameState: GameStateData): void {
    this.lastSavedState = { ...gameState };
  }
}

export default GameStateCollector; 