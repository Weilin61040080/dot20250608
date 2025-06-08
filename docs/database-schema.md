erDiagram
    USER {
        string id PK
        string username
        string email
        string passwordHash
        date createdAt
        date lastLogin
        object preferences
    }
    
    MODULE {
        string id PK
        string title
        string description
        string theme
        array mapIds
        string mainStoryScriptId
        array learningActivityIds
        number requiredPoints
        object unlockRequirements
    }
    
    MAP {
        string id PK
        string moduleId FK
        string name
        string theme
        object dimensions
        array layers
        array tilesets
        array npcs
        array triggers
        object spawnPoint
    }
    
    LEARNING_ACTIVITY {
        string id PK
        string moduleId FK
        string type
        string title
        string description
        array learningObjectives
        object content
        object reward
        array prerequisites
        number estimatedTimeMin
    }
    
    PROGRESS {
        string id PK
        string userId FK
        string currentModule
        array moduleProgress
        array inventory
        object stats
    }
    
    SCRIPT {
        string id PK
        string moduleId FK
        string name
        string type
        array scenes
        object conditions
        array actions
    }
    
    LEADERBOARD {
        string id PK
        string moduleId FK
        array entries
        string type
        date updatedAt
    }
    
    ASSET_THEME {
        string id PK
        string name
        string description
        object styleParameters
        array assetTypes
    }
    
    ASSET {
        string id PK
        string themeId FK
        string type
        string url
        object metadata
        date createdAt
    }
    
    ANALYTICS_EVENT {
        string id PK
        string userId FK
        string type
        date timestamp
        object data
        string moduleId
        string activityId
    }
    
    USER ||--o{ PROGRESS : has
    MODULE ||--|{ MAP : contains
    MODULE ||--|{ LEARNING_ACTIVITY : includes
    MODULE ||--|{ SCRIPT : uses
    MODULE ||--o{ LEADERBOARD : has
    ASSET_THEME ||--|{ ASSET : contains
    USER ||--|{ ANALYTICS_EVENT : generates
    PROGRESS }|--|| USER : belongs_to
