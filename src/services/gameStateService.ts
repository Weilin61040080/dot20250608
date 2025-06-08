/**
 * Game State Service
 * Handles saving and loading of game state with configurable options
 */

import { GameStateData, GameStateCollector } from './gameStateCollector';
import { userProfileService } from './userProfileService';

export interface GameStateServiceConfig {
  enableLogging: boolean;
  autoSaveInterval: number;
  apiEndpoint?: string;
}

export class GameStateService {
  private config: GameStateServiceConfig;
  private collector: GameStateCollector;
  private autoSaveTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<GameStateServiceConfig> = {}) {
    this.config = {
      enableLogging: true,
      autoSaveInterval: 30000, // 30 seconds
      apiEndpoint: process.env.REACT_APP_GAME_STATE_API || '/api/gamestate',
      ...config
    };
    
    this.collector = new GameStateCollector();
  }

  /**
   * Save game state to storage and backend
   */
  async saveGameState(gameStateData: GameStateData): Promise<boolean> {
    try {
      if (this.config.enableLogging) {
        const summary = this.collector.getGameStateSummary(gameStateData);
        console.log('🎮 Saving Game State:', {
          summary,
          fullState: gameStateData
        });
      }

      // Save to backend (mock for now)
      const success = await this.mockApiCall(gameStateData);
      
      if (success) {
        // Update the collector's last saved state
        this.collector.updateLastSavedState(gameStateData);
        
        // Update user profile with module state
        await userProfileService.updateModuleState(gameStateData);
        
        if (this.config.enableLogging) {
          console.log('✅ Game state saved successfully');
          
          // Print user profile after game state update
          console.log('\n📋 Updated User Profile:');
          userProfileService.printProfile();
        }
        
        return true;
      } else {
        if (this.config.enableLogging) {
          console.log('❌ Failed to save game state');
        }
        return false;
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.error('❌ Error saving game state:', error);
      }
      return false;
    }
  }

  /**
   * Load game state from storage/backend
   */
  async loadGameState(playerId: string): Promise<GameStateData | null> {
    try {
      if (this.config.enableLogging) {
        console.log('📂 Loading game state for player:', playerId);
      }

      // Load from backend (mock for now)
      const gameState = await this.mockLoadApiCall(playerId);
      
      if (gameState && this.config.enableLogging) {
        const summary = this.collector.getGameStateSummary(gameState);
        console.log('✅ Game state loaded:', summary);
      }
      
      return gameState;
    } catch (error) {
      if (this.config.enableLogging) {
        console.error('❌ Error loading game state:', error);
      }
      return null;
    }
  }

  /**
   * Check if current state should be saved
   */
  shouldSaveGameState(reduxState: any): boolean {
    const currentState = this.collector.collectGameState(reduxState);
    return this.collector.hasSignificantChanges(currentState);
  }

  /**
   * Save current Redux state
   */
  async saveCurrentState(reduxState: any): Promise<boolean> {
    const gameState = this.collector.collectGameState(reduxState);
    return await this.saveGameState(gameState);
  }

  /**
   * Start auto-save timer
   */
  startAutoSave(getState: () => any): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(async () => {
      const state = getState();
      if (this.shouldSaveGameState(state)) {
        await this.saveCurrentState(state);
      }
    }, this.config.autoSaveInterval);

    if (this.config.enableLogging) {
      console.log(`🔄 Auto-save started with ${this.config.autoSaveInterval}ms interval`);
    }
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;

      if (this.config.enableLogging) {
        console.log('⏹️ Auto-save stopped');
      }
    }
  }

  /**
   * Mock API call for saving (placeholder for backend integration)
   */
  private async mockApiCall(gameState: GameStateData): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock successful save
    return true;
  }

  /**
   * Mock API call for loading (placeholder for backend integration)
   */
  private async mockLoadApiCall(playerId: string): Promise<GameStateData | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock no saved data
    return null;
  }
}

// Create singleton instance
export const gameStateService = new GameStateService();

export default gameStateService; 