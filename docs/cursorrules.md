# Cursor Rules for Educational Game Project

## Project Overview

This is a React-based educational game platform featuring:
- 2D tile-based world navigation
- AI-generated themed assets
- Interactive learning activities
- Gamification elements (points, leaderboards, missions)
- Progress tracking and analytics

## Development Guidelines

### Architecture Principles

1. **Component-Based Design**
   - Create reusable, self-contained components
   - Follow single responsibility principle
   - Minimize component coupling

2. **State Management**
   - Use Redux for global application state
   - Prefer local state for component-specific concerns
   - Normalize data structures
   - Implement selectors for data access

3. **Performance Optimization**
   - Implement render optimizations for the game engine
   - Use memoization for expensive calculations
   - Apply virtualization for large lists/grids
   - Batch updates where possible

4. **Scalability**
   - Design systems with future expansion in mind
   - Implement plugin architecture for activities
   - Use lazy loading for modules and assets
   - Create clear interfaces between subsystems

### Coding Standards

1. **TypeScript Best Practices**
   - Use strict type checking
   - Create comprehensive interfaces for all data structures
   - Avoid `any` type - use generic types instead
   - Leverage discriminated unions for type safety

2. **React Patterns**
   - Use functional components with hooks
   - Implement custom hooks for reusable logic
   - Follow React's immutability principles
   - Optimize renders with useCallback and useMemo

3. **File Structure**
   - Maintain the folder structure as defined in the project documentation
   - Group files by feature rather than file type
   - Keep components and their styles colocated
   - Use index files for cleaner imports

4. **Naming Conventions**
   - PascalCase for React components and TypeScript interfaces/types
   - camelCase for variables, functions, and instances
   - Use descriptive, intention-revealing names
   - Prefix interfaces with 'I' and types with 'T' (optional)

5. **Comments and Documentation**
   - Document complex logic and algorithms
   - Add JSDoc comments for public APIs
   - Keep inline comments focused on "why" not "what"
   - Create README files for major subsystems

### Game Engine Guidelines

1. **Tile Map System**
   - Use the defined JSON format for tile maps
   - Implement efficient rendering with canvas
   - Apply culling to only render visible tiles
   - Use sprite batching for performance

2. **Character System**
   - Implement smooth movement between tiles
   - Support directional animations
   - Use state machines for character behavior
   - Handle collision detection efficiently

3. **Interaction System**
   - Follow the defined interaction flow
   - Implement dialog system using state machines
   - Create reusable interaction components
   - Ensure interactions are interruptible/resumable

4. **Learning Activities**
   - Follow the activity component structure
   - Implement the defined activity types
   - Support analytics tracking for all activities
   - Design activities for accessibility

### Asset Management

1. **AI-Generated Assets**
   - Implement consistent theming system
   - Set up asset generation pipeline
   - Create fallbacks for missing assets
   - Optimize asset loading and caching

2. **Performance Considerations**
   - Use sprite sheets and texture atlases
   - Implement progressive loading
   - Apply proper asset compression
   - Cache assets for offline use

## Technical Implementation Details

### Core Game Loop

The game loop should:
1. Use requestAnimationFrame for smooth rendering
2. Implement a fixed time step for physics/logic
3. Separate update and render phases
4. Include input handling in the loop

```typescript
// Sample Game Loop Pattern
class GameLoop {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private timeStep: number = 1000 / 60; // 60 FPS

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  private loop = (currentTime: number) => {
    // Calculate elapsed time
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.accumulator += deltaTime;

    // Process input
    this.processInput();
    
    // Fixed time step updates
    while (this.accumulator >= this.timeStep) {
      this.update(this.timeStep);
      this.accumulator -= this.timeStep;
    }
    
    // Render at animation frame rate
    this.render();
    
    // Schedule next frame
    requestAnimationFrame(this.loop);
  }

  private processInput() {
    // Handle input events
  }

  private update(deltaTime: number) {
    // Update game state
  }

  private render() {
    // Render game state
  }
}
```

### Tile Map Rendering

Implement efficient tile map rendering using:
1. Canvas for performance
2. Layer-based rendering (background, interactive, foreground)
3. Viewport culling to only render visible tiles
4. Sprite batching to minimize draw calls

### Character Movement System

Implement smooth character movement with:
1. Interpolation between grid positions
2. Collision detection with the tile map
3. Direction-based animation selection
4. Input buffering for responsive controls

### Learning Activity Framework

When implementing learning activities:
1. Create a base Activity class/interface
2. Implement specific activity types as extensions
3. Track analytics for all user interactions
4. Support saving/resuming activities

## Database Structure

Follow the MongoDB schema as defined in the technical documentation, ensuring:
1. Proper indexing for frequently queried fields
2. Data validation using Mongoose schemas
3. Efficient storage of large data sets
4. Appropriate use of references vs. embedding

## API Implementation

When implementing API endpoints:
1. Follow RESTful conventions
2. Implement proper error handling
3. Add authentication middleware
4. Use validation for request data
5. Follow the endpoint structure defined in the documentation

## Testing Guidelines

1. **Unit Testing**
   - Test individual components in isolation
   - Mock dependencies appropriately
   - Focus on business logic and edge cases
   - Achieve high coverage for core systems

2. **Integration Testing**
   - Test component interactions
   - Verify state management flows
   - Test API integrations

3. **Performance Testing**
   - Benchmark rendering performance
   - Test with large data sets
   - Verify memory usage patterns
   - Ensure smooth animations

## AI Asset Generation Guidelines

1. **Style Consistency**
   - Define clear style parameters for each theme
   - Implement style transfer algorithms
   - Create fallback mechanisms for generation failures
   - Add post-processing for consistency

2. **Generation Process**
   - Implement queuing system for generation requests
   - Cache generated assets for reuse
   - Add variation parameters for diversity
   - Include metadata for asset categorization

## Deployment Considerations

1. **Build Optimization**
   - Split code into chunks for efficient loading
   - Optimize asset bundles
   - Implement proper caching strategies
   - Use CDN for asset delivery

2. **CI/CD Pipeline**
   - Automate testing before deployment
   - Implement staging environments
   - Use feature flags for gradual rollouts
   - Set up monitoring and alerting

## Cursor-Specific Instructions

When working with Cursor AI:

1. **Code Generation**
   - Prioritize TypeScript with strict typing
   - Follow the component patterns established in the project
   - Implement error handling for all async operations
   - Add comments for complex logic

2. **File Management**
   - Create new files in the appropriate directories
   - Respect the established file structure
   - Update imports when moving or renaming files
   - Add index files for clean exports

3. **Problem Solving**
   - Focus on modular, maintainable solutions
   - Consider performance implications for game engine code
   - Prioritize user experience and accessibility
   - Think about edge cases and error states

4. **Working With Existing Code**
   - Analyze the existing implementation before making changes
   - Maintain consistent patterns and naming conventions
   - Consider backwards compatibility
   - Update related components when changing interfaces

5. **Documentation**
   - Document complex algorithms
   - Update README files when adding features
   - Add JSDoc comments to public APIs
   - Create usage examples for new components

## MVP Development Priority

Follow this priority order when building the MVP:
1. Core game engine and tile map rendering
2. Basic character movement and interaction
3. Simple quiz and matching activity types
4. Progress tracking and persistence
5. Basic UI for navigation and game state
6. Module selection and configuration
7. Basic gamification elements
8. Analytics tracking

## Future Extensions to Consider

1. **Multiplayer Capabilities**
   - Real-time collaboration
   - Competitive activities
   - Shared world exploration

2. **Advanced AI Integration**
   - Dynamic difficulty adjustment
   - Personalized learning paths
   - Content generation based on learning objectives

3. **Extended Platform Support**
   - Mobile applications
   - Offline mode
   - LMS integrations

4. **Advanced Analytics**
   - Learning pattern recognition
   - Predictive performance modeling
   - Detailed engagement metrics