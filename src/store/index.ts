import { configureStore, Action } from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
import { useDispatch } from 'react-redux';
import gameReducer from './slices/gameSlice';
import playerReducer from './slices/playerSlice';
import moduleReducer from './slices/moduleSlice';
import activityReducer from './slices/activitySlice';
import uiReducer from './slices/uiSlice';
import dialogueReducer from './slices/dialogueSlice';
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    player: playerReducer,
    module: moduleReducer,
    activity: activityReducer,
    ui: uiReducer,
    dialogue: dialogueReducer,
    analytics: analyticsReducer,
  },
});

export type RootState = {
  game: ReturnType<typeof gameReducer>;
  player: ReturnType<typeof playerReducer>;
  module: ReturnType<typeof moduleReducer>;
  activity: ReturnType<typeof activityReducer>;
  ui: ReturnType<typeof uiReducer>;
  dialogue: ReturnType<typeof dialogueReducer>;
  analytics: ReturnType<typeof analyticsReducer>;
};

export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch`
export const useAppDispatch = () => useDispatch<AppDispatch>();

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>; 