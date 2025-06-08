/**
 * User Profile Service
 * Manages comprehensive player data including progress, points, and items
 */

export interface MissionTracker {
  id: string;
  activityId: string;
  completed: boolean;
}

export interface ModuleState {
  moduleId: string;
  moduleName: string;
  isCompleted: boolean;
  currentPoints: number;
  totalPossiblePoints: number;
  missionTracker: MissionTracker[];
  playerPosition: string;
  timeLeft: string;
  lastUpdated: number;
}

export interface Item {
  id: string;
  name: string;
  type: 'reward' | 'purchase' | 'achievement';
  description: string;
  iconUrl?: string;
  acquiredAt: number;
  sourceModule?: string;
  cost?: number;
}

export interface UserProfile {
  studentId: string;
  classId: string;
  totalPoints: number;
  moduleStates: Record<string, Omit<ModuleState, 'moduleId'>>;
  itemsList: Item[];
  createdAt: number;
  lastUpdated: number;
}

export interface UserProfileServiceConfig {
  enableLogging: boolean;
  autoSaveInterval: number;
  apiEndpoint?: string;
  storageKey: string;
}

export class UserProfileService {
  private config: UserProfileServiceConfig;
  private currentProfile: UserProfile | null = null;
  private autoSaveTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<UserProfileServiceConfig> = {}) {
    this.config = {
      enableLogging: true,
      autoSaveInterval: 10000, // 10 seconds
      apiEndpoint: '/api/userprofile',
      storageKey: 'user_profile',
      ...config
    };

    this.loadProfile();
  }

  /**
   * Initialize or load user profile
   */
  async initializeProfile(studentId: string, classId: string = "N/A"): Promise<UserProfile> {
    if (this.config.enableLogging) {
      console.log('👤 Initializing user profile:', { studentId, classId });
    }

    // Try to load existing profile first
    let profile = await this.loadProfileFromStorage(studentId);
    
    if (!profile) {
      // Create new profile
      profile = {
        studentId,
        classId,
        totalPoints: 0,
        moduleStates: {},
        itemsList: [],
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };

      if (this.config.enableLogging) {
        console.log('✨ Created new user profile:', profile);
      }
    } else {
      // Update classId if different
      if (profile.classId !== classId) {
        profile.classId = classId;
        profile.lastUpdated = Date.now();
      }

      if (this.config.enableLogging) {
        console.log('📂 Loaded existing user profile:', profile);
      }
    }

    this.currentProfile = profile;
    await this.saveProfile();
    return profile;
  }

  /**
   * Get current user profile
   */
  getCurrentProfile(): UserProfile | null {
    return this.currentProfile;
  }

  /**
   * Update module state from game state data
   */
  async updateModuleState(gameStateData: any): Promise<void> {
    if (!this.currentProfile) {
      console.warn('⚠️ No user profile initialized');
      return;
    }

    const moduleId = gameStateData.moduleName || 'unknown';
    const moduleState: Omit<ModuleState, 'moduleId'> = {
      moduleName: gameStateData.moduleName || 'Unknown Module',
      isCompleted: false, // Will be updated when module is completed
      currentPoints: gameStateData.currentPoints || 0,
      totalPossiblePoints: 0, // TODO: Calculate from module data
      missionTracker: gameStateData.missionTracker?.map((m: any) => ({
        id: m.id,
        activityId: m.activityId,
        completed: m.completed
      })) || [],
      playerPosition: gameStateData.playerPosition || "(0,0)",
      timeLeft: gameStateData.timeLeft || "0s",
      lastUpdated: Date.now()
    };

    // Update or add module state
    this.currentProfile.moduleStates[moduleId] = moduleState;
    this.currentProfile.lastUpdated = Date.now();

    if (this.config.enableLogging) {
      console.log('🎮 Updated module state:', {
        moduleId: moduleId,
        currentPoints: moduleState.currentPoints,
        completedMissions: moduleState.missionTracker.filter(m => m.completed).length,
        totalMissions: moduleState.missionTracker.length
      });
    }

    await this.saveProfile();
  }

  /**
   * Complete a module and add points to total
   */
  async completeModule(moduleId: string, pointsEarned: number): Promise<void> {
    if (!this.currentProfile) {
      console.warn('⚠️ No user profile initialized');
      return;
    }

    // Update module state to completed
    if (this.currentProfile.moduleStates[moduleId]) {
      this.currentProfile.moduleStates[moduleId].isCompleted = true;
      this.currentProfile.moduleStates[moduleId].lastUpdated = Date.now();
    }

    // Add points to total
    this.currentProfile.totalPoints += pointsEarned;
    this.currentProfile.lastUpdated = Date.now();

    if (this.config.enableLogging) {
      console.log('🏆 Module completed:', {
        moduleId,
        pointsEarned,
        newTotalPoints: this.currentProfile.totalPoints
      });
    }

    await this.saveProfile();
  }

  /**
   * Add item to user's inventory
   */
  async addItem(item: Omit<Item, 'acquiredAt'>): Promise<void> {
    if (!this.currentProfile) {
      console.warn('⚠️ No user profile initialized');
      return;
    }

    const newItem: Item = {
      ...item,
      acquiredAt: Date.now()
    };

    this.currentProfile.itemsList.push(newItem);
    this.currentProfile.lastUpdated = Date.now();

    if (this.config.enableLogging) {
      console.log('🎁 Item added:', newItem);
    }

    await this.saveProfile();
  }

  /**
   * Purchase item with points
   */
  async purchaseItem(item: Omit<Item, 'acquiredAt' | 'type'>, cost: number): Promise<boolean> {
    if (!this.currentProfile) {
      console.warn('⚠️ No user profile initialized');
      return false;
    }

    if (this.currentProfile.totalPoints < cost) {
      if (this.config.enableLogging) {
        console.log('❌ Insufficient points for purchase:', {
          required: cost,
          available: this.currentProfile.totalPoints
        });
      }
      return false;
    }

    // Deduct points
    this.currentProfile.totalPoints -= cost;

    // Add item
    const purchasedItem: Item = {
      ...item,
      type: 'purchase',
      cost,
      acquiredAt: Date.now()
    };

    this.currentProfile.itemsList.push(purchasedItem);
    this.currentProfile.lastUpdated = Date.now();

    if (this.config.enableLogging) {
      console.log('💰 Item purchased:', {
        item: purchasedItem,
        remainingPoints: this.currentProfile.totalPoints
      });
    }

    await this.saveProfile();
    return true;
  }

  /**
   * Get user profile summary for logging
   */
  getProfileSummary(): string {
    if (!this.currentProfile) {
      return 'No profile loaded';
    }

    const moduleStates = Object.values(this.currentProfile.moduleStates);
    const completedModules = moduleStates.filter(ms => ms.isCompleted).length;
    const totalModules = moduleStates.length;

    return `Student: ${this.currentProfile.studentId}, ` +
           `Class: ${this.currentProfile.classId}, ` +
           `Total Points: ${this.currentProfile.totalPoints}, ` +
           `Modules: ${completedModules}/${totalModules}, ` +
           `Items: ${this.currentProfile.itemsList.length}`;
  }

  /**
   * Print detailed profile to console
   */
  printProfile(): void {
    if (!this.currentProfile) {
      console.log('❌ No user profile loaded');
      return;
    }

    console.log('\n👤 USER PROFILE');
    console.log('================');
    console.log('Student ID:', this.currentProfile.studentId);
    console.log('Class ID:', this.currentProfile.classId);
    console.log('Total Points:', this.currentProfile.totalPoints);
    console.log('Profile Created:', new Date(this.currentProfile.createdAt).toLocaleString());
    console.log('Last Updated:', new Date(this.currentProfile.lastUpdated).toLocaleString());

    console.log('\n📚 MODULE STATES:');
    if (Object.keys(this.currentProfile.moduleStates).length === 0) {
      console.log('   No modules started yet');
    } else {
      Object.entries(this.currentProfile.moduleStates).forEach(([moduleId, module]) => {
        console.log(`   📖 ${module.moduleName} (${moduleId})`);
        console.log(`      Status: ${module.isCompleted ? '✅ Completed' : '⏳ In Progress'}`);
        console.log(`      Points: ${module.currentPoints}/${module.totalPossiblePoints}`);
        console.log(`      Missions: ${module.missionTracker.filter(m => m.completed).length}/${module.missionTracker.length}`);
        console.log(`      Position: ${module.playerPosition}`);
        console.log(`      Time Left: ${module.timeLeft}`);
        console.log(`      Last Updated: ${new Date(module.lastUpdated).toLocaleString()}`);
        
        // Show mission details
        if (module.missionTracker.length > 0) {
          console.log(`      🎯 Mission Details:`);
          module.missionTracker.forEach((mission, index) => {
            console.log(`         ${index + 1}. ${mission.id} (${mission.activityId}) - ${mission.completed ? '✅ Completed' : '⏳ Pending'}`);
          });
        }
      });
    }

    console.log('\n🎁 ITEMS INVENTORY:');
    if (this.currentProfile.itemsList.length === 0) {
      console.log('   No items acquired yet');
    } else {
      this.currentProfile.itemsList.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} (${item.type})`);
        console.log(`      Description: ${item.description}`);
        if (item.cost) console.log(`      Cost: ${item.cost} points`);
        if (item.sourceModule) console.log(`      Source: ${item.sourceModule}`);
        console.log(`      Acquired: ${new Date(item.acquiredAt).toLocaleString()}`);
      });
    }

    console.log('\n📊 SUMMARY:', this.getProfileSummary());
    console.log('================\n');
  }

  /**
   * Save profile to local storage
   */
  private async saveProfile(): Promise<void> {
    if (!this.currentProfile) return;

    try {
      // Save to localStorage
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.currentProfile));

      // TODO: Save to backend API
      if (this.config.apiEndpoint) {
        await this.mockApiSave(this.currentProfile);
      }

      if (this.config.enableLogging) {
        console.log('💾 User profile saved successfully');
      }
    } catch (error) {
      console.error('❌ Failed to save user profile:', error);
    }
  }

  /**
   * Load profile from storage
   */
  private loadProfile(): void {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        this.currentProfile = JSON.parse(stored);
        if (this.config.enableLogging) {
          console.log('📂 User profile loaded from storage');
        }
      }
    } catch (error) {
      console.error('❌ Failed to load user profile:', error);
    }
  }

  /**
   * Load profile for specific student
   */
  private async loadProfileFromStorage(studentId: string): Promise<UserProfile | null> {
    try {
      // For now, just check if current profile matches
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const profile = JSON.parse(stored);
        if (profile.studentId === studentId) {
          return profile;
        }
      }

      // TODO: Load from backend API
      if (this.config.apiEndpoint) {
        return await this.mockApiLoad(studentId);
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to load profile for student:', studentId, error);
      return null;
    }
  }

  /**
   * Mock API save (placeholder for backend integration)
   */
  private async mockApiSave(profile: UserProfile): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (this.config.enableLogging) {
      console.log('🌐 Mock API: User profile saved to backend');
    }
    
    return true;
  }

  /**
   * Mock API load (placeholder for backend integration)
   */
  private async mockApiLoad(studentId: string): Promise<UserProfile | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (this.config.enableLogging) {
      console.log('🌐 Mock API: Attempted to load profile for:', studentId);
    }
    
    return null; // No backend data available
  }

  /**
   * Start auto-save timer
   */
  startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(async () => {
      if (this.currentProfile) {
        await this.saveProfile();
      }
    }, this.config.autoSaveInterval);

    if (this.config.enableLogging) {
      console.log(`🔄 User profile auto-save started with ${this.config.autoSaveInterval}ms interval`);
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
        console.log('⏹️ User profile auto-save stopped');
      }
    }
  }
}

// Create singleton instance
export const userProfileService = new UserProfileService();

export default userProfileService; 