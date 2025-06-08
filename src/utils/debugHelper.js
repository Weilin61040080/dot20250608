/**
 * Debug Helper Utility
 * Add this to your React app to help visualize NPC interaction zones
 * and track keyboard events for debugging purposes.
 */

// Debug state
let isDebugMode = true;
let showInteractionZones = true;
let keyboardLog = [];
const maxLogEntries = 20;

// Initialize debug overlay
export function initDebugOverlay() {
  if (!isDebugMode) return;
  
  // Create debug container
  const debugContainer = document.createElement('div');
  debugContainer.id = 'debug-overlay';
  debugContainer.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
    max-width: 400px;
    max-height: 400px;
    overflow-y: auto;
  `;
  
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.innerText = 'Toggle Debug';
  toggleButton.style.cssText = `
    background-color: #4CAF50;
    border: none;
    color: white;
    padding: 5px 10px;
    text-align: center;
    margin-bottom: 10px;
    cursor: pointer;
    border-radius: 3px;
  `;
  toggleButton.onclick = toggleDebugVisibility;
  
  // Create keyboard log container
  const keyboardLogContainer = document.createElement('div');
  keyboardLogContainer.id = 'keyboard-log';
  
  // Add elements to container
  debugContainer.appendChild(toggleButton);
  debugContainer.appendChild(keyboardLogContainer);
  
  // Add to body
  document.body.appendChild(debugContainer);
  
  // Set up keyboard event listeners
  setupKeyboardLogger();
  
  console.log('Debug overlay initialized');
}

// Toggle debug visibility
function toggleDebugVisibility() {
  const overlay = document.getElementById('debug-overlay');
  if (overlay) {
    overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
  }
}

// Setup keyboard logger
function setupKeyboardLogger() {
  window.addEventListener('keydown', (e) => {
    logKeyEvent(e, 'down');
  });
  
  window.addEventListener('keyup', (e) => {
    logKeyEvent(e, 'up');
  });
}

// Log a key event
function logKeyEvent(event, type) {
  if (!isDebugMode) return;
  
  const timestamp = new Date().toLocaleTimeString();
  const keyInfo = {
    time: timestamp,
    type: type,
    key: event.key,
    code: event.code
  };
  
  // Add to log and limit size
  keyboardLog.unshift(keyInfo);
  if (keyboardLog.length > maxLogEntries) {
    keyboardLog.pop();
  }
  
  // Update display
  updateKeyboardLogDisplay();
}

// Update keyboard log display
function updateKeyboardLogDisplay() {
  const logContainer = document.getElementById('keyboard-log');
  if (!logContainer) return;
  
  logContainer.innerHTML = '<h3>Keyboard Events:</h3>';
  
  keyboardLog.forEach(entry => {
    const logEntry = document.createElement('div');
    logEntry.style.color = entry.type === 'down' ? '#8eff8e' : '#ff9e9e';
    logEntry.innerText = `[${entry.time}] ${entry.type.toUpperCase()}: ${entry.key} (${entry.code})`;
    logContainer.appendChild(logEntry);
  });
}

// Draw NPC interaction zones
export function drawInteractionZones(ctx, npcs, tileSize, viewport) {
  if (!isDebugMode || !showInteractionZones || !ctx) return;
  
  const { x: viewX, y: viewY, scale } = viewport;
  
  // Save current context state
  ctx.save();
  
  npcs.forEach(npc => {
    const screenX = npc.position.x * tileSize * scale - viewX;
    const screenY = npc.position.y * tileSize * scale - viewY;
    const radius = npc.interactionRadius * tileSize * scale;
    
    // Draw interaction radius
    ctx.beginPath();
    ctx.arc(
      screenX + (tileSize * scale) / 2,
      screenY + (tileSize * scale) / 2,
      radius,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.stroke();
    
    // Draw NPC ID
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `${10 * scale}px Arial`;
    ctx.fillText(
      `ID: ${npc.id}`,
      screenX + (tileSize * scale) / 2,
      screenY - 15 * scale
    );
  });
  
  // Restore context
  ctx.restore();
}

// Log debug message
export function logDebug(message, data) {
  if (!isDebugMode) return;
  
  console.log(`%c[DEBUG] ${message}`, 'color: #4CAF50; font-weight: bold;', data);
}

// Create debugHelper object
const debugHelper = {
  initDebugOverlay,
  drawInteractionZones,
  logDebug,
  toggleDebugMode: () => { isDebugMode = !isDebugMode; },
  toggleInteractionZones: () => { showInteractionZones = !showInteractionZones; }
};

// Export debug utilities
export default debugHelper; 