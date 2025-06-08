import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TileMap } from '../../types/TileMap';

interface GameState {
  currentMap: TileMap | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GameState = {
  currentMap: null,
  isLoading: false,
  error: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCurrentMap: (state, action: PayloadAction<TileMap>) => {
      state.currentMap = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCurrentMap, setLoading, setError } = gameSlice.actions;
export default gameSlice.reducer;

/**
 * Action creator to set active map
 */
export const setActiveMap = (mapData: {
  mapId: string,
  mapName: string,
  theme: string,
  moduleId: string
}) => {
  return {
    type: 'game/setActiveMap',
    payload: mapData
  };
};

/**
 * Action creator to update map state
 */
export const updateMapState = (state: any) => {
  return {
    type: 'game/updateMapState',
    payload: state
  };
}; 