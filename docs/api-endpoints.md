# API Endpoints

## Authentication Endpoints

```
POST /api/auth/register     - Register new user
POST /api/auth/login        - Login user
POST /api/auth/logout       - Logout user
GET  /api/auth/me           - Get current user
PUT  /api/auth/me           - Update user profile
```

## Game Core Endpoints

```
GET  /api/modules                       - Get all available modules
GET  /api/modules/:moduleId             - Get specific module details
GET  /api/modules/:moduleId/maps        - Get all maps for a module
GET  /api/modules/:moduleId/maps/:mapId - Get specific map data
```

## Progress Endpoints

```
GET  /api/progress                          - Get user progress
PUT  /api/progress/:moduleId               - Update progress for module
POST /api/progress/:moduleId/activity      - Record activity completion
GET  /api/progress/:moduleId/next          - Get next recommended activity
```

## Learning Activity Endpoints

```
GET  /api/activities                   - Get available activities
GET  /api/activities/:activityId       - Get specific activity
POST /api/activities/:activityId/start - Record activity start
POST /api/activities/:activityId/end   - Record activity end with results
```

## Analytics Endpoints

```
POST /api/analytics/event         - Record general analytics event
GET  /api/analytics/dashboard     - Get user analytics dashboard
GET  /api/analytics/achievements  - Get user achievements
```

## Leaderboard Endpoints

```
GET  /api/leaderboard              - Get global leaderboard
GET  /api/leaderboard/:moduleId    - Get module-specific leaderboard
GET  /api/leaderboard/friends      - Get friends leaderboard
```

## Store Endpoints

```
GET  /api/store/items               - Get available store items
POST /api/store/purchase            - Make a purchase
GET  /api/store/inventory           - Get user's inventory
```

## Asset Generation Endpoints

```
POST /api/assets/generate           - Generate new assets based on theme
GET  /api/assets/themes             - Get available themes
GET  /api/assets/:themeId           - Get assets for specific theme
```

## Admin Endpoints

```
POST /api/admin/modules             - Create new module
PUT  /api/admin/modules/:moduleId   - Update module
POST /api/admin/maps                - Create new map
PUT  /api/admin/maps/:mapId         - Update map
POST /api/admin/activities          - Create new activity
PUT  /api/admin/activities/:id      - Update activity
```
