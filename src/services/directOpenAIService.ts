/**
 * Direct OpenAI Service
 * 
 * ⚠️ WARNING: This service calls the OpenAI API directly from the frontend.
 * This approach is ONLY FOR TESTING and should NEVER be used in production
 * as it exposes your API key to potential security risks.
 */

import OpenAI from 'openai';
import { AIFeedbackRequest, AIFeedbackResponse } from './aiFeedbackService';

// Get API key from environment or use a fallback for testing
const apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';

// Debug log for API key presence (masked for security)
console.log('OpenAI API Key configured:', apiKey ? 'Yes (key exists)' : 'No (key missing)');
console.log('API Key first few chars:', apiKey ? `${apiKey.substring(0, 5)}...` : 'N/A');

// Initialize OpenAI with API key directly (TESTING ONLY)
const openai = new OpenAI({
  apiKey: apiKey,  // Use the value extracted above
  dangerouslyAllowBrowser: true // This flag is required for browser usage and indicates you understand the risks
});

/**
 * Check if the OpenAI client is properly initialized
 */
export const isOpenAIConfigured = () => {
  const configured = !!apiKey && apiKey.length > 0;
  console.log('OpenAI is configured:', configured);
  return configured;
};

/**
 * Get AI feedback directly using the OpenAI API
 * 
 * CAUTION: This makes API calls directly from the browser using your API key
 * This should only be used for development/testing purposes
 */
export const getDirectAIFeedback = async (request: AIFeedbackRequest): Promise<AIFeedbackResponse> => {
  console.log('Making direct OpenAI API call for feedback (TEST ONLY)');
  
  // Check if OpenAI is configured
  if (!isOpenAIConfigured()) {
    console.error('OpenAI API key is not configured');
    return {
      feedback: 'The OpenAI API key is not configured. Please check your environment variables.',
      success: false
    };
  }
  
  try {
    // For prompt evaluation (has rubric) vs simple chat (no rubric)
    const isEvaluation = request.rubric && Object.keys(request.rubric).length > 0;
    
    if (isEvaluation) {
      // Format rubric criteria for the prompt if provided
      let rubricText = '';
      if (request.rubric && Object.keys(request.rubric).length > 0) {
        rubricText = 'Evaluation Criteria:\n';
        Object.keys(request.rubric).forEach((key, index) => {
          const criteriaText = request.rubric?.[key] || '';
          // Extract just the criteria name (before the colon)
          const criteriaName = criteriaText.split(':')[0].trim();
          rubricText += `${index + 1}. ${criteriaName}: ${criteriaText}\n`;
        });
      }
      
      // Construct the system message for evaluation with explicit JSON structure
      const systemMessage = `You are an educational AI assistant that evaluates student responses against specific criteria.

IMPORTANT: You must respond with ONLY a valid JSON object in this exact format:
{
    "rubric": [
        {
            "criteria": "Exact criteria name",
            "passed": true,
            "feedback": "Detailed explanation of why this criteria was met or not met"
        }
    ],
    "overall_feedback": "Overall assessment and suggestions for improvement"
}

For each criteria, you must:
1. Determine if the student's response meets the criteria (true/false)
2. Provide specific feedback explaining your decision
3. Use the exact criteria names provided

Be thorough but constructive in your feedback. Focus on what the student did well and specific areas for improvement.`;
      
      // Construct the user message
      const userMessage = `Task: ${request.prompt}

${rubricText}

Student Response: "${request.studentResponse}"

Please evaluate this response against each criteria and return your assessment in the required JSON format.`;
      
      console.log('Calling OpenAI API with structured evaluation request');
      console.log('Rubric text:', rubricText);
      
      // Call the OpenAI API directly for evaluation
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3 // Lower temperature for more consistent evaluation
      });
      
      console.log('OpenAI API evaluation response received');
      
      // Parse the response
      let responseData;
      try {
        const responseContent = completion.choices[0].message.content || '{}';
        console.log('Raw OpenAI response:', responseContent);
        responseData = JSON.parse(responseContent);
        
        // Validate the response structure
        if (!responseData.rubric || !Array.isArray(responseData.rubric)) {
          throw new Error('Invalid rubric format in response');
        }
        
        // Ensure all rubric items have required fields
        responseData.rubric = responseData.rubric.map((item: any, index: number) => ({
          criteria: item.criteria || `Criteria ${index + 1}`,
          passed: Boolean(item.passed),
          feedback: item.feedback || item.explanation || "No feedback provided"
        }));
        
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        console.error('Raw response content:', completion.choices[0].message.content);
        
        // Create fallback response with proper structure
        const rubricKeys = Object.keys(request.rubric || {});
        responseData = {
          rubric: rubricKeys.map((key, index) => ({
            criteria: (request.rubric?.[key] || '').split(':')[0].trim() || `Criteria ${index + 1}`,
            passed: false,
            feedback: "Unable to evaluate this criteria due to a system error. Please try again."
          })),
          overall_feedback: "There was an issue processing your response. Please try submitting again."
        };
      }
      
      // Return the feedback in the expected format
      return {
        rubric: responseData.rubric || [],
        overall_feedback: responseData.overall_feedback || "Evaluation completed.",
        success: true
      };
    } else {
      // Simple chat response (not evaluation)
      console.log('Calling OpenAI API for simple chat response');
      
      // Call the OpenAI API directly for chat
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: request.prompt || "You are a helpful assistant." },
          { role: "user", content: request.studentResponse }
        ]
      });
      
      console.log('OpenAI API chat response received');
      
      // Return the response text directly
      return {
        feedback: completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.",
        success: true
      };
    }
  } catch (error) {
    console.error('Direct OpenAI API error:', error);
    return {
      feedback: 'Sorry, there was an error connecting to the OpenAI API. Please check your API key and try again.',
      success: false
    };
  }
}; 