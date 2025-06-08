graph TD
    Client[Client Browser] --> FE[Frontend App]
    FE --> GameEngine[Game Engine Layer]
    FE --> UIComponents[UI Components]
    FE --> StateManagement[State Management]
    
    GameEngine --> TileSystem[Tile Rendering System]
    GameEngine --> CharacterSystem[Character System]
    GameEngine --> InteractionSystem[Interaction System]
    
    FE --> API[API Gateway]
    
    API --> AuthService[Auth Service]
    API --> GameService[Game Service]
    API --> LearningService[Learning Service]
    API --> AssetService[Asset Service]
    API --> AnalyticsService[Analytics Service]
    
    GameService --> MongoDB[(MongoDB)]
    LearningService --> MongoDB
    AnalyticsService --> MongoDB
    AssetService --> S3[(Asset Storage)]
    
    AssetService --> AIGenerator[AI Asset Generator]
    
    LearningService --> ActivityEngine[Learning Activity Engine]
    GameService --> ProgressionEngine[Progression Engine]
    
    style Client fill:#f9f9f9,stroke:#333,stroke-width:2px
    style FE fill:#d5e8d4,stroke:#82b366,stroke-width:2px
    style API fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px
    style MongoDB fill:#f8cecc,stroke:#b85450,stroke-width:2px
    style S3 fill:#f8cecc,stroke:#b85450,stroke-width:2px
    style AIGenerator fill:#e1d5e7,stroke:#9673a6,stroke-width:2px
