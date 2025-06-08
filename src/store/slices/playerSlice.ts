import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TilePosition } from '../../types/TileMap';

export type PlayerDirection = 'up' | 'down' | 'left' | 'right';

interface PlayerState {
  position: TilePosition;
  direction: PlayerDirection;
  moving: boolean;
  spritePath: string;
  name: string;
}

const initialState: PlayerState = {
  position: { x: 0, y: 0 },
  direction: 'down',
  moving: false,
  spritePath: '/assets/sprites/player.png',
  name: 'Player'
};

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPosition: (state, action: PayloadAction<TilePosition>) => {
      state.position = action.payload;
    },
    setDirection: (state, action: PayloadAction<PlayerDirection>) => {
      state.direction = action.payload;
    },
    setMoving: (state, action: PayloadAction<boolean>) => {
      state.moving = action.payload;
    },
    setSpritePath: (state, action: PayloadAction<string>) => {
      state.spritePath = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    }
  }
});

export const { setPosition, setDirection, setMoving, setSpritePath, setName } = playerSlice.actions;

export default playerSlice.reducer;

/**
 * Action creator to update player position
 */
export const updatePlayerPosition = (position: { x: number, y: number }) => {
  return {
    type: 'player/updatePosition',
    payload: position
  };
}; 