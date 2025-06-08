# Backend Database Schema Documentation

## Overview
This document outlines the three main data structures that need database support: **User Profile**, **Learning Analytics**, and **Game State Logging**. Each has specific triggers for when data is logged/updated.

---

## 1. USER PROFILE DATA STRUCTURE


### **WHEN USER PROFILE IS UPDATED:**

1. **Module Start** - When `setCurrentModule` reducer is called
   - Initializes profile if not exists

2. **Game State Save** - When `saveGameState()` is called 
   - Updates `module_states` with current mission progress

3. **Mission Completion** - When `completeMission()` reducer is called
   - Updates mission tracker in `module_states`
   - Updates `last_updated` timestamp

4. **Module Completion** - When `completeModule()` is called
   - Sets `isCompleted: true` in module state
   - Adds points to `total_points`

5. **Item Management** - When `addItem()` or `purchaseItem()` is called
   - Adds items to `items_list`
   - Deducts points for purchases



{
  "studentId": "student_john_doe",
  "classId": "class_ai_101",
  "totalPoints": 185,
  "moduleStates": {
    "Introduction to AI Concepts": {
      "moduleName": "Introduction to AI Concepts",
      "isCompleted": false,
      "currentPoints": 75,
      "missionTracker": [
        {
          "id": "mission-1",
          "activityId": "activity-npc-1",
          "completed": true
        },
        {
          "id": "mission-2", 
          "activityId": "activity-npc-2",
          "completed": true
        },
        {
          "id": "mission-3",
          "activityId": "activity-npc-3",
          "completed": false
        },
        {
          "id": "mission-4",
          "activityId": "activity-npc-4",
          "completed": false
        }
      ],
      "playerPosition": "(12,8)",
      "timeLeft": "245s",
      "lastUpdated": 1702654245000
    },
    "Machine Learning Fundamentals": {
      "moduleName": "Machine Learning Fundamentals",
      "isCompleted": true,
      "currentPoints": 110,
      "totalPossiblePoints": 120,
      "missionTracker": [
        {
          "id": "ml-mission-1",
          "activityId": "ml-activity-1",
          "completed": true
        },
        {
          "id": "ml-mission-2",
          "activityId": "ml-activity-2", 
          "completed": true
        },
        {
          "id": "ml-mission-3",
          "activityId": "ml-activity-3",
          "completed": true
        }
      ],
      "playerPosition": "(20,15)",
      "timeLeft": "0s",
      "lastUpdated": 1702650000000
    }
  },
  "itemsList": [
    {
      "id": "ai_expert_badge",
      "name": "AI Expert Badge",
      "type": "achievement",
      "description": "Completed all AI fundamentals modules",
      "iconUrl": "https://example.com/badges/ai_expert.png",
      “rating”: “SSS”
      “price”: “none”
    },
    {
      "id": "learning_boost",
      "name": "Learning Speed Boost",
      "type": "reward", 
      "description": "Increases learning speed for 1 hour",
      "iconUrl": "https://example.com/badges/ai_expert.png",
      “rating”: “SSS”
      “price”: “50”
    }
}


## 2. LEARNING ANALYTICS DATA STRUCTURE

### **WHEN ANALYTICS ARE LOGGED:**

1. **Activity Start** - When activity component mounts/starts
   - `action: "ActivityStart"`
   - `input: ""` (empty)
   - `evaluation: null`
   - `started_at: timestamp`

2. **Question Answer** - When student submits any answer
   - `action: "SubmitAnswer"`
   - `input: "student's actual answer text"`
   - `evaluation: true/false`
   - `feedback: explanation or rubric object`
   - `finished_at: timestamp`

3. **Hint Request** - When student clicks hint button
   - `action: "AskForHint"`
   - `input: "current question context"`
   - `evaluation: null`
   - `feedback: { "hint": "hint text" }`

4. **Activity Complete** - When all questions finished
   - `action: "ActivityComplete"`
   - `input: ""` (empty)
   - `evaluation: null`
   - `feedback: null`
   - `finished_at: timestamp`


{
    "activityId": "activity-npc-2",
    "assignmentId": "N/A",
    "studentId": "N/A",
    "moduleName": "Introduction to AI Concepts",
    "classId": "N/A",
    "action": "SubmitAnswer",
    "input": "Speech Recognition",
    "evaluation": true,
    "feedback": "Speech Recognition is the AI technology used to convert spoken language into written text. It involves analyzing speech patterns and translating them into a format that computers can understand and process.",
    "attemptCreatedAt": "2025-06-03T21:27:55.590Z",
    "startedAt": "N/A",
    "finishedAt": "2025-06-03T21:27:55.590Z"
}


## 3. GAME STATE LOGGING DATA STRUCTURE


### **WHEN GAME STATE IS LOGGED:**


1. **Mission Completion** - When `completeMission()` reducer is called
   - Triggered from activity completion
   - Updates mission tracker completion status

2. **Manual Triggers:**
   - Module start/end
   - Major game events
   - Player logout/session end

3. **Auto-Save Timer** - Every 30 seconds (configurable, not implement yet)




{
    "studentId": "N/A",
    "moduleName": "Introduction to AI Concepts",
    "classId": "N/A",
    "missionTracker": [
        {
            "id": "mission-1",
            "activityId": "activity-npc-1",
            "completed": false
        },
        {
            "id": "mission-2",
            "activityId": "activity-npc-2",
            "completed": true
        },
        {
            "id": "mission-3",
            "activityId": "activity-npc-3",
            "completed": false
        },
        {
            "id": "mission-4",
            "activityId": "activity-npc-4",
            "completed": false
        }
    ],
    "playerPosition": "(15,11)",
    "currentPoints": 100,
    "timeLeft": "534s",
    "timestamp": 1748986132621
}


