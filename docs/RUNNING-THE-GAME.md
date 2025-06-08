# Running the AI Literacy Game

This guide explains how to run the AI Literacy Game and test the different activity types.

## Prerequisites

Before running the game, ensure you have:

- Node.js (v14+)
- npm or yarn
- A modern web browser (Chrome, Firefox, Edge, or Safari)

## Installation

1. Clone the repository or download the source code
2. Navigate to the project directory in your terminal
3. Install dependencies:

```bash
npm install
# or
yarn install
```

## Running the Development Server

Start the development server:

```bash
npm start
# or
yarn start
```

The game will be available at `http://localhost:3000` in your web browser.

## Game Navigation

1. **Home Page**: The landing page with options to start the game, view modules, or check settings
2. **Module Select Page**: Choose from available learning modules 
3. **Game Page**: The main game environment with the 2D tile map and character

## Controls

- **Arrow Keys**: Move the player character (up, down, left, right)
- **Spacebar or Enter**: Interact with NPCs or objects
- **Escape**: Open the pause menu (not implemented in current version)

## Testing Activities

### Finding NPCs

The game features four NPCs, each offering a different type of learning activity:

1. **AI Teacher (NPC-1)**: Located in the top-left area of the classroom
   - Offers multiple-choice questions about AI fundamentals

2. **Student (NPC-2)**: Located in the bottom-right area of the classroom
   - Offers drag-and-drop matching activities about AI applications

3. **AI Researcher (NPC-3)**: Located in the bottom-left area of the classroom
   - Offers open-ended questions about AI ethics with AI-evaluated responses

4. **ChatBot (NPC-4)**: Located in the top-right area of the classroom
   - Offers an interactive chatbot experience to practice AI interaction skills

### Interacting with NPCs

1. Walk up to an NPC using the arrow keys
2. Press Spacebar or Enter when you're next to them
3. Read through their dialog (press Spacebar to advance)
4. When the dialog offers an activity, select "Yes" to start it

### Multiple Choice Activity (NPC-1)

- Read the question and select one of the options
- Submit your answer to see if you're correct
- Read the explanation and proceed to the next question
- Complete all questions to finish the activity

### Drag and Drop Activity (NPC-2)

- Read the question prompt
- Drag the correct option to the target area
- Submit your answer to see if you're correct
- View the explanation and continue to the next question
- Complete all questions to finish the activity

### Open-Ended Question Activity (NPC-3)

1. Read the question about AI ethics
2. Type your response in the text area (up to 500 characters)
3. Use the "Show Hint" button if you need guidance
4. Click "Submit" when you're ready
5. Your response will be evaluated against multiple rubrics:
   - Addressing the main question directly
   - Including specific examples
   - Demonstrating understanding of key concepts
   - Using appropriate terminology
   - Presenting a clear, structured response
6. Review your feedback and which rubrics you met
7. Click "Next" to complete the activity

### Chatbot Activity (NPC-4)

1. Read the initial prompt from the chatbot
2. Type your first message or select from suggested questions
3. Read the AI's response
4. Continue the conversation with additional questions
5. When ready, click "Evaluate Conversation"
6. Your conversation skills will be evaluated based on:
   - Question clarity and specificity
   - Relation to AI topics
   - Critical thinking
   - Use of appropriate terminology
   - Engagement with the content
7. Review your feedback and which criteria you met
8. Click "Next" to complete the activity

## Restarting or Continuing

- After completing an activity, you can continue exploring the map to find other NPCs
- To restart the game, refresh the page (progress is not saved in the current version)

## Troubleshooting

If you encounter issues:

- Ensure all dependencies are installed correctly
- Check the browser console for any error messages
- Make sure you're using a supported browser
- Try clearing your browser cache and restarting the application

## Next Steps

Future versions of the game will include:

- User accounts to save progress
- Additional modules covering more AI topics
- Improved graphics and animations
- Multiplayer capabilities
- Integration with real AI models for more sophisticated evaluation 