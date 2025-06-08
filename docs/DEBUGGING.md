# Debugging NPC Interactions

This guide will help you troubleshoot issues with NPC interactions in the AI Literacy Game.

## Debug Tools Added

We've added several debugging tools to help diagnose issues with NPC interactions:

1. **Debug Overlay**: Provides real-time information about keyboard events
2. **NPC Interaction Zones**: Visualizes the interaction radius around NPCs
3. **Debug Logging**: Enhanced console logging for key events
4. **Keyboard Test Page**: A standalone test page for keyboard input

## How to Use the Debug Tools

### Debug Overlay

The debug overlay appears in the top-right corner of the game and shows:
- Recent keyboard events
- A toggle button to hide/show the overlay

### NPC Interaction Zones

With the debug mode enabled, you'll see:
- Green circles around NPCs showing their interaction radius
- NPC IDs displayed above each NPC

### Keyboard Test Page

We've added a standalone HTML page to test keyboard inputs:
1. Open `http://localhost:3000/keyboard-test.html` in your browser
2. Press keys to see how they're registered by the browser
3. This helps identify if your keyboard input is being properly detected

## Common Issues and Solutions

### Space/Enter Key Not Triggering Interactions

If pressing Space or Enter doesn't trigger NPC interactions:

1. **Check the Browser Console**: Look for debug messages when action key is pressed
2. **Verify Proximity**: Make sure your character is inside the NPC's interaction radius (green circle)
3. **Check Key Registration**: Use the keyboard test page to ensure your Space/Enter keys are properly registered

### Input Not Being Detected

If game doesn't respond to your keyboard input:

1. **Check Browser Focus**: Ensure the game window has focus
2. **Browser Extensions**: Disable browser extensions that might intercept keyboard inputs
3. **Keyboard Layout**: Ensure you're using a standard keyboard layout

### NPC Interaction Logic

The interaction system works as follows:

1. When Space/Enter/E is pressed, we look for nearby NPCs
2. We calculate the distance to each NPC
3. If an NPC is found within its interaction radius, we trigger the dialogue
4. Debug logs show this entire process in the console

## How to Report Issues

When reporting issues with NPC interactions, please include:

1. Screenshot of the debug overlay
2. Console log output when trying to interact
3. Steps to reproduce the issue
4. Browser and OS information

## Code Structure

The debug system consists of:

- `src/utils/debugHelper.js` - Main debug utilities
- `src/engine/NPCSystem.ts` - NPC interaction logic
- `src/engine/PlayerInputSystem.ts` - Keyboard input handling

These components work together to provide visibility into the interaction system. 