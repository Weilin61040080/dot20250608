/**
 * OpenAI API Service for AI Literacy Game
 * 
 * This is a placeholder implementation of a server-side handler for OpenAI API requests.
 * In a production environment, this would be deployed to a secure server separate from
 * your client-side code.
 * 
 * IMPORTANT SECURITY NOTES:
 * 1. NEVER expose your API key in client-side code
 * 2. Use environment variables for API keys
 * 3. Implement rate limiting to prevent abuse
 * 4. Add proper authentication to your API endpoints
 */

// Express server setup example
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Get API key from .env file
});

/**
 * Endpoint for generating AI feedback on student responses
 */
app.post('/api/ai-feedback', async (req, res) => {
  try {
    const { prompt, studentResponse, rubric } = req.body;
    
    if (!prompt || !studentResponse) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: prompt and studentResponse'
      });
    }
    
    // Format rubric criteria for the prompt if provided
    let rubricText = '';
    if (rubric && Object.keys(rubric).length > 0) {
      rubricText = 'Evaluation Criteria:\n';
      Object.keys(rubric).forEach(key => {
        rubricText += `- ${rubric[key]}\n`;
      });
    }
    
    // Construct the system message
    const systemMessage = `You are an educational AI assistant that provides feedback on student responses. 
    Your goal is to provide constructive, encouraging feedback while also identifying areas for improvement.
    
    Based on the provided prompt and evaluation criteria, assess the student's response.
    Return your feedback in a JSON format with the following structure:
    {
      "feedback": "Your detailed feedback here",
      "score": A numerical score between 0-100,
      "strengths": ["Strength 1", "Strength 2", ...],
      "areas_for_improvement": ["Area 1", "Area 2", ...]
    }`;
    
    // Construct the user message
    const userMessage = `Prompt: ${prompt}
    
    ${rubricText}
    
    Student Response: ${studentResponse}
    
    Please provide feedback on this response.`;
    
    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // You can change this to another model as needed
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    let responseData;
    try {
      responseData = JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      responseData = {
        feedback: "There was an issue processing your response. The system generated an invalid response format.",
        score: 0,
        strengths: [],
        areas_for_improvement: []
      };
    }
    
    // Return the feedback
    return res.status(200).json({
      ...responseData,
      success: true
    });
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error processing your request'
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/**
 * Implementation notes:
 * 
 * To use this server:
 * 1. Create a .env file with your OPENAI_API_KEY
 * 2. Install dependencies: npm install express cors dotenv openai
 * 3. Run the server: node openai-service.js
 * 
 * Frontend would then call:
 * fetch('http://localhost:3001/api/ai-feedback', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     prompt: "Question text here",
 *     studentResponse: "Student's answer here",
 *     rubric: { "criterion1": "Description 1", ... }
 *   })
 * })
 */ 