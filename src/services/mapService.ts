import { MapData } from '../types/MapData';
import debugHelper from '../utils/debugHelper';

/**
 * Load a map by ID
 */
export const loadMap = async (mapId: string): Promise<MapData | null> => {
  try {
    debugHelper.logDebug(`Loading map data for: ${mapId}`);
    
    // In a real implementation, this might be fetched from an API
    const response = await fetch(`/assets/maps/${mapId}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load map: ${mapId}`);
    }
    
    const mapData = await response.json();
    debugHelper.logDebug('Map data loaded successfully', mapData);
    return mapData;
  } catch (error) {
    console.error(`Error loading map ${mapId}:`, error);
    return null;
  }
}; 