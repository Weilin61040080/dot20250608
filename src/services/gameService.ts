import { TileMap } from '../types/TileMap';
import testMapData from '../assets/maps/test-map.json';
// import { store } from '../store/store'; // Commented out since it's unused
import debugHelper from '../utils/debugHelper';

/**
 * Class to manage game engine and state
 */
class GameService {
  private isInitialized: boolean = false;
  
  initialize() {
    if (this.isInitialized) return;
    
    // Initialize game service
    this.isInitialized = true;
    
    // Initialize debug helpers if available
    if (debugHelper) {
      debugHelper.logDebug('GameService initialized');
    }
    
    console.log('GameService initialized');
  }
  
  /**
   * Start a new game session
   */
  startNewGame() {
    debugHelper?.logDebug('Starting new game session');
    // Implementation...
  }
  
  /**
   * Handle player interaction with NPCs
   */
  interactWithNPC(npcId: string) {
    debugHelper?.logDebug(`Interaction requested with NPC: ${npcId}`);
    // Implementation...
  }
  
  /**
   * Get the correct asset path for maps
   */
  private getAssetBasePath() {
    // The public URL is either set in the env or uses the current basename
    const publicUrl = process.env.PUBLIC_URL || '';
    return `${publicUrl}/assets/`;
  }
  
  /**
   * Load a map by ID
   */
  async loadMap(mapId: string): Promise<TileMap> {
    console.log(`Loading map: ${mapId}`);
    
    try {
      // First try to use the static import
      if (mapId === 'test-map-1' && testMapData) {
        console.log('Using static test map data');
        return Promise.resolve(testMapData as unknown as TileMap);
      }
      
      // If not found, try to fetch from assets directory
      console.log(`Fetching map from assets: ${mapId}`);
      const assetPath = this.getAssetBasePath();
      const response = await fetch(`${assetPath}maps/${mapId}.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch map: ${response.status} ${response.statusText}`);
      }
      
      const mapData = await response.json();
      console.log(`Successfully loaded map: ${mapId}`);
      return mapData as TileMap;
    } catch (error) {
      console.error(`Error loading map ${mapId}:`, error);
      
      // Fallback to the test map if fetch fails
      console.log('Falling back to static test map data');
      return testMapData as unknown as TileMap;
    }
  }
  
  async getAllMaps(): Promise<{id: string, name: string}[]> {
    // Mock implementation
    return [
      {
        id: 'test-map-1',
        name: 'Test Map'
      }
    ];
  }
}

// Create a named instance before exporting as default
const gameService = new GameService();
export default gameService; 