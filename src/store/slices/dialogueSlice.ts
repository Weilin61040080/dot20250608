import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DialogueState {
  activeDialogue: boolean;
  dialogueId: string | null;
  npcId: string | null;
  npcName: string | null;
}

const initialState: DialogueState = {
  activeDialogue: false,
  dialogueId: null,
  npcId: null,
  npcName: null
};

const dialogueSlice = createSlice({
  name: 'dialogue',
  initialState,
  reducers: {
    startDialogue: (state, action: PayloadAction<{
      dialogueId: string,
      npcId: string,
      npcName: string
    }>) => {
      state.activeDialogue = true;
      state.dialogueId = action.payload.dialogueId;
      state.npcId = action.payload.npcId;
      state.npcName = action.payload.npcName;
    },
    endDialogue: (state) => {
      state.activeDialogue = false;
      state.dialogueId = null;
      state.npcId = null;
      state.npcName = null;
    }
  }
});

export const { startDialogue, endDialogue } = dialogueSlice.actions;
export default dialogueSlice.reducer; 