import debugHelper from '../utils/debugHelper';

/**
 * Interface for player input state
 */
export interface PlayerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean;
}

/**
 * Handles player input from keyboard
 */
export default class PlayerInputSystem {
  private inputState: PlayerInput = {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false
  };
  
  constructor() {
    this.setupInputListeners();
    debugHelper.logDebug('PlayerInputSystem initialized');
  }
  
  /**
   * Set up event listeners for keyboard input
   */
  private setupInputListeners(): void {
    // Key down events
    window.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
    });
    
    // Key up events
    window.addEventListener('keyup', (event) => {
      this.handleKeyUp(event);
    });
  }
  
  /**
   * Handle key down events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const keyCode = event.code;
    
    debugHelper.logDebug(`Key down: ${keyCode}`);
    
    switch (keyCode) {
      case 'ArrowUp':
      case 'KeyW':
        this.inputState.up = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.inputState.down = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.inputState.left = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.inputState.right = true;
        break;
      case 'Space':
      case 'Enter':
      case 'KeyE':
        this.inputState.action = true;
        debugHelper.logDebug('Action key pressed');
        break;
    }
  }
  
  /**
   * Handle key up events
   */
  private handleKeyUp(event: KeyboardEvent): void {
    const keyCode = event.code;
    
    switch (keyCode) {
      case 'ArrowUp':
      case 'KeyW':
        this.inputState.up = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.inputState.down = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.inputState.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.inputState.right = false;
        break;
      case 'Space':
      case 'Enter':
      case 'KeyE':
        this.inputState.action = false;
        break;
    }
  }
  
  /**
   * Get current input state
   */
  public getInput(): PlayerInput {
    return { ...this.inputState };
  }
  
  /**
   * Reset all inputs to default state
   */
  public resetInput(): void {
    this.inputState = {
      up: false,
      down: false,
      left: false,
      right: false,
      action: false
    };
  }
} 