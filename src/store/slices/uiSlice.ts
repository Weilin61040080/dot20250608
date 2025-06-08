import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DialogType = 'npc' | 'object' | 'system' | 'activity' | 'conclusion';

export interface DialogData {
  type: DialogType;
  title: string;
  content: string | string[];
  options?: { text: string; action: string }[];
  speaker?: string;
  portraitUrl?: string;
  completeAction?: {
    type: string;
    payload?: any;
  };
  activityId?: string;
  npcId?: string;
  missionId?: string;
}

export interface ViewConfig {
  canvasWidth: number;
  canvasHeight: number;
  playerViewTilesX: number; // How many tiles visible horizontally
  playerViewTilesY: number; // How many tiles visible vertically
  // Camera smoothing settings
  cameraLerpSpeed: number; // Higher = more responsive, lower = smoother (1-20)
  cameraDeadzone: number; // Pixels - camera won't move for small movements (0-10)
}

interface UIState {
  dialogOpen: boolean;
  dialogData: DialogData | null;
  inventoryOpen: boolean;
  menuOpen: boolean;
  notifications: { id: string; message: string; type: 'info' | 'success' | 'error' }[];
  viewConfig: ViewConfig;
}

const initialState: UIState = {
  dialogOpen: false,
  dialogData: null,
  inventoryOpen: false,
  menuOpen: false,
  notifications: [],
  viewConfig: {
    canvasWidth: 1024, // Configurable canvas width
    canvasHeight: 768, // Configurable canvas height
    playerViewTilesX: 15, // Show 15 tiles horizontally in player view
    playerViewTilesY: 11, // Show 11 tiles vertically in player view
    cameraLerpSpeed: 8,
    cameraDeadzone: 2
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openDialog: (state, action: PayloadAction<DialogData>) => {
      state.dialogOpen = true;
      state.dialogData = action.payload;
    },
    closeDialog: (state) => {
      state.dialogOpen = false;
      state.dialogData = null;
    },
    toggleInventory: (state) => {
      state.inventoryOpen = !state.inventoryOpen;
    },
    toggleMenu: (state) => {
      state.menuOpen = !state.menuOpen;
    },
    addNotification: (state, action: PayloadAction<{ message: string; type: 'info' | 'success' | 'error' }>) => {
      const id = Date.now().toString();
      state.notifications.push({ id, ...action.payload });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    updateViewConfig: (state, action: PayloadAction<Partial<ViewConfig>>) => {
      state.viewConfig = { ...state.viewConfig, ...action.payload };
    },
  },
});

export const { 
  openDialog, 
  closeDialog, 
  toggleInventory, 
  toggleMenu, 
  addNotification, 
  removeNotification,
  updateViewConfig
} = uiSlice.actions;

export default uiSlice.reducer; 