import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { userProfileService } from '../../services/userProfileService';

export interface Mission {
  id: string;
  title: string;
  description: string;
  activityId: string;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  theme: string;
  mapIds: string[];
  mainStoryScriptId: string;
  learningActivityIds: string[];
  requiredPoints: number;
  missions: Mission[];
}

interface ModuleState {
  modules: Module[];
  currentModuleId: string | null;
  isLoading: boolean;
  error: string | null;
  completedMissions: string[]; // IDs of completed missions
  showCompletionModal: boolean;
  currentModulePoints: number; // Added for tracking points in current module
  // Timer related state
  moduleStartTime: number | null;
  initialDuration_ms: number;
  timeRemaining_ms: number;
  timerActive: boolean;
  bonusAwardedMessage: string | null; // For displaying bonus points message
}

const initialState: ModuleState = {
  modules: [],
  currentModuleId: null,
  isLoading: false,
  error: null,
  completedMissions: [],
  showCompletionModal: false,
  currentModulePoints: 0, // Initialize to 0
  // Timer initial state
  moduleStartTime: null,
  initialDuration_ms: 10 * 60 * 1000, // Default to 10 minutes
  timeRemaining_ms: 10 * 60 * 1000,
  timerActive: false,
  bonusAwardedMessage: null,
};

const moduleSlice = createSlice({
  name: 'module',
  initialState,
  reducers: {
    setModules: (state, action: PayloadAction<Module[]>) => {
      state.modules = action.payload;
    },
    setCurrentModule: (state, action: PayloadAction<string>) => {
      state.currentModuleId = action.payload;
      state.showCompletionModal = false;
      state.currentModulePoints = 0; // Reset points when module changes
      state.completedMissions = []; // Also reset completed missions for new module
      // Reset and start timer for the new module
      state.moduleStartTime = Date.now();
      state.initialDuration_ms = 10 * 60 * 1000; // Can be configurable per module later
      state.timeRemaining_ms = state.initialDuration_ms;
      state.timerActive = true;
      state.bonusAwardedMessage = null;

      // Initialize user profile when module starts
      const currentModule = state.modules.find(m => m.id === action.payload);
      if (currentModule) {
        // Generate student ID from current profile or create default
        const currentProfile = userProfileService.getCurrentProfile();
        const studentId = currentProfile?.studentId || `student_${Date.now()}`;
        const classId = currentProfile?.classId || "N/A";

        // Initialize or update user profile
        userProfileService.initializeProfile(studentId, classId).then(() => {
          console.log('\n🚀 MODULE STARTED');
          console.log('================');
          console.log('Module:', currentModule.title);
          console.log('Module ID:', currentModule.id);
          console.log('Start Time:', new Date().toLocaleString());
          
          // Print user profile at module start
          userProfileService.printProfile();
        }).catch(error => {
          console.error('❌ Failed to initialize user profile:', error);
        });
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addPointsToCurrentModule: (state, action: PayloadAction<number>) => {
      state.currentModulePoints += action.payload;
    },
    // Timer Actions
    startTimer: (state, action: PayloadAction<{ startTime: number, duration_ms: number }>) => {
      state.moduleStartTime = action.payload.startTime;
      state.initialDuration_ms = action.payload.duration_ms;
      state.timeRemaining_ms = action.payload.duration_ms;
      state.timerActive = true;
      state.bonusAwardedMessage = null;
    },
    tickTimer: (state) => {
      if (state.timerActive && state.timeRemaining_ms > 0) {
        state.timeRemaining_ms = Math.max(0, state.timeRemaining_ms - 1000);
        if (state.timeRemaining_ms === 0) {
          state.timerActive = false;
          // Potentially dispatch an action here if something should happen when timer strictly hits 0
        }
      } else if (state.timeRemaining_ms <= 0) {
        state.timerActive = false;
      }
    },
    stopTimer: (state) => {
      state.timerActive = false;
    },
    resetTimer: (state) => {
      state.moduleStartTime = null;
      state.initialDuration_ms = 10 * 60 * 1000;
      state.timeRemaining_ms = 10 * 60 * 1000;
      state.timerActive = false;
      state.bonusAwardedMessage = null;
    },
    setBonusMessage: (state, action: PayloadAction<string | null>) => {
      state.bonusAwardedMessage = action.payload;
    },
    completeMission: (state, action: PayloadAction<string>) => {
      const missionId = action.payload;
      
      console.log('Completing mission in reducer:', missionId);
      console.log('Current completed missions:', [...state.completedMissions]);
      
      if (!state.completedMissions.includes(missionId)) {
        state.completedMissions.push(missionId);
        console.log('Updated completed missions:', [...state.completedMissions]);
      }
      
      if (state.currentModuleId) {
        const currentModule = state.modules.find(m => m.id === state.currentModuleId);
        if (currentModule && currentModule.missions) {
          const allMissionsCompleted = currentModule.missions.every(
            mission => state.completedMissions.includes(mission.id)
          );
          
          if (allMissionsCompleted) {
            state.showCompletionModal = true;
            state.timerActive = false; // Stop timer on module completion
            if (state.timeRemaining_ms > 0) {
              state.currentModulePoints += 50; // Award bonus points
              state.bonusAwardedMessage = "Module Complete! Time Bonus: +50 Points!";
            } else {
              state.bonusAwardedMessage = "Module Complete! No time bonus.";
            }
            console.log('All missions completed, showing completion modal');
          }
        }
      }
    },
    setShowCompletionModal: (state, action: PayloadAction<boolean>) => {
      state.showCompletionModal = action.payload;
      if (!action.payload) { // If modal is being hidden, clear bonus message
        state.bonusAwardedMessage = null;
      }
    },
    resetModuleProgress: (state) => {
      state.completedMissions = [];
      state.showCompletionModal = false;
      state.currentModulePoints = 0;
      // Reset timer as well
      state.moduleStartTime = null;
      state.initialDuration_ms = 10 * 60 * 1000;
      state.timeRemaining_ms = 10 * 60 * 1000;
      state.timerActive = false;
      state.bonusAwardedMessage = null;
    },
  },
});

export const { 
  setModules, 
  setCurrentModule, 
  setLoading, 
  setError, 
  addPointsToCurrentModule,
  startTimer,
  tickTimer,
  stopTimer,
  resetTimer,
  setBonusMessage,
  completeMission, 
  setShowCompletionModal,
  resetModuleProgress
} = moduleSlice.actions;

export default moduleSlice.reducer; 