/**
 * Service for getting AI feedback on student responses
 * 
 * IMPORTANT: This is a placeholder implementation.
 * In a production environment, API calls to OpenAI should be made from a secure backend,
 * not directly from the client-side code.
 */

// Import the direct OpenAI service
import { getDirectAIFeedback, isOpenAIConfigured } from './directOpenAIService';

export interface AIFeedbackRequest {
  prompt: string;
  studentResponse: string;
  rubric?: {
    [key: string]: string;
  };
}

export interface AIFeedbackResponse {
  rubric?: Array<{
    criteria: string;
    passed: boolean;
    feedback: string;
  }>;
  overall_feedback?: string;
  success: boolean;
  // Legacy fields for backward compatibility
  feedback?: string;
  score?: number;
  strengths?: string[];
  areas_for_improvement?: string[];
}

/**
 * Gets AI feedback - currently using direct API calls for testing
 * NOTE: This is not secure for production use
 */
export const getAIFeedback = async (request: AIFeedbackRequest): Promise<AIFeedbackResponse> => {
  // Check if OpenAI is configured
  if (isOpenAIConfigured()) {
    try {
      console.log('Using direct OpenAI API for feedback');
      // Use the direct OpenAI service for testing
      return await getDirectAIFeedback(request);
    } catch (error) {
      console.error('Error with direct OpenAI call, falling back to simulation:', error);
      // Fall back to simulation if there's an error
      return getSimulatedAIFeedback(request);
    }
  } else {
    console.warn('OpenAI API is not configured, using simulation instead');
    // Fall back to simulation if no API key is available
    return getSimulatedAIFeedback(request);
  }
};

/**
 * Simulates getting AI feedback from a backend service
 * 
 * NOTE: This is a placeholder. In a real implementation, this would call a secure backend
 * that handles the OpenAI API call with proper authentication.
 */
export const getSimulatedAIFeedback = async (request: AIFeedbackRequest): Promise<AIFeedbackResponse> => {
  console.log('Simulating backend call for AI feedback:', request);
  
  // This is a mock response - in production this would come from your backend
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Extract key words from the student response for more personalized feedback
      const responseWords = request.studentResponse.toLowerCase().split(' ');
      const keyTerms = responseWords.filter(word => word.length > 4).slice(0, 3);
      
      // Create structured rubric based on the request rubric
      const mockRubric = [];
      if (request.rubric && Object.keys(request.rubric).length > 0) {
        // Use the provided rubric criteria
        Object.entries(request.rubric).forEach(([key, criteriaText], index) => {
          // Extract criteria name (before the colon)
          const criteriaName = criteriaText.split(':')[0].trim();
          
          // Simple evaluation logic based on response characteristics
          let passed = false;
          let feedback = "";
          
          // Basic heuristics for different types of criteria
          const responseLength = request.studentResponse.length;
          const hasKeywords = keyTerms.length > 0;
          const hasStructure = request.studentResponse.split('.').length > 2;
          const mentionsRelevantTerms = responseWords.some(word => 
            criteriaText.toLowerCase().includes(word) || 
            ['bias', 'ai', 'algorithm', 'data', 'system', 'example', 'strategy'].includes(word)
          );
          
          // Evaluate based on criteria type and response quality
          if (criteriaName.toLowerCase().includes('identif') || criteriaName.toLowerCase().includes('source')) {
            passed = responseLength > 50 && mentionsRelevantTerms;
            feedback = passed 
              ? `Your response successfully identifies key sources and demonstrates understanding of the concept.`
              : `Your response could better identify specific sources or provide more detailed explanations.`;
          } else if (criteriaName.toLowerCase().includes('explain') || criteriaName.toLowerCase().includes('strateg')) {
            passed = responseLength > 80 && hasStructure;
            feedback = passed 
              ? `Your response provides clear explanations and demonstrates good understanding of strategies.`
              : `Your response would benefit from more detailed explanations and specific strategies.`;
          } else if (criteriaName.toLowerCase().includes('understand') || criteriaName.toLowerCase().includes('demonstrat')) {
            passed = hasKeywords && responseLength > 40;
            feedback = passed 
              ? `Your response demonstrates solid understanding of the underlying concepts.`
              : `Your response could demonstrate deeper understanding of the key concepts involved.`;
          } else if (criteriaName.toLowerCase().includes('example') || criteriaName.toLowerCase().includes('specific')) {
            passed = mentionsRelevantTerms && responseLength > 60;
            feedback = passed 
              ? `Your response includes relevant examples that support your points effectively.`
              : `Your response would be strengthened by including more specific examples or scenarios.`;
          } else if (criteriaName.toLowerCase().includes('critical') || criteriaName.toLowerCase().includes('thinking')) {
            passed = hasStructure && responseLength > 100;
            feedback = passed 
              ? `Your response shows thoughtful analysis and critical thinking about the topic.`
              : `Your response could demonstrate more critical analysis and deeper reflection on the implications.`;
          } else {
            // Default evaluation for other criteria
            passed = responseLength > 30 && hasKeywords;
            feedback = passed 
              ? `Your response adequately addresses this criteria.`
              : `Your response could better address this specific criteria with more detail.`;
          }
          
          mockRubric.push({
            criteria: criteriaName,
            passed: passed,
            feedback: feedback
          });
        });
      } else {
        // Default rubric if none provided
        mockRubric.push(
          {
            criteria: "Addresses the main question directly",
            passed: request.studentResponse.length > 20,
            feedback: request.studentResponse.length > 20 
              ? "Your response directly addresses the question with sufficient detail."
              : "Your response needs to more directly address the main question."
          },
          {
            criteria: "Demonstrates understanding of key concepts",
            passed: keyTerms.length > 0,
            feedback: keyTerms.length > 0 
              ? `Shows understanding by mentioning relevant concepts: ${keyTerms.join(', ')}.`
              : "Try to demonstrate understanding by using key concepts from the topic."
          },
          {
            criteria: "Provides clear and structured response",
            passed: request.studentResponse.split('.').length > 2,
            feedback: request.studentResponse.split('.').length > 2 
              ? "Response is well-structured with clear organization."
              : "Try to organize your response with clearer structure and multiple sentences."
          }
        );
      }
      
      // Calculate overall performance
      const passedCount = mockRubric.filter(item => item.passed).length;
      const totalCount = mockRubric.length;
      const passRate = passedCount / totalCount;
      
      // Generate overall feedback based on performance
      let overallFeedback = "";
      if (passRate >= 0.8) {
        overallFeedback = `Excellent work! You've successfully met ${passedCount} out of ${totalCount} criteria. Your response demonstrates strong understanding and addresses the key aspects effectively. ${keyTerms.length > 0 ? `I particularly appreciate how you incorporated concepts like "${keyTerms.join('", "')}" into your response.` : ''} Keep up the great work!`;
      } else if (passRate >= 0.5) {
        overallFeedback = `Good effort! You've met ${passedCount} out of ${totalCount} criteria. Your response shows understanding but could be strengthened in several areas. ${keyTerms.length > 0 ? `You've made good use of relevant terms like "${keyTerms.join('", "')}" which shows you're on the right track.` : ''} Focus on the areas marked for improvement to enhance your response.`;
      } else {
        overallFeedback = `Your response needs significant improvement. You've only met ${passedCount} out of ${totalCount} criteria. Consider providing more detailed explanations, specific examples, and demonstrating deeper understanding of the key concepts. Review the feedback for each criteria and try to address those specific areas in your next attempt.`;
      }
      
      // Return structured response matching the new format
      resolve({
        rubric: mockRubric,
        overall_feedback: overallFeedback,
        success: true,
        // Legacy fields for backward compatibility
        feedback: overallFeedback,
        score: Math.round(passRate * 100),
        strengths: mockRubric.filter(item => item.passed).map(item => item.criteria),
        areas_for_improvement: mockRubric.filter(item => !item.passed).map(item => item.criteria)
      });
    }, 1000);
  });
};

/**
 * Calls the actual backend endpoint for AI feedback
 */
export const getActualAIFeedback = async (request: AIFeedbackRequest): Promise<AIFeedbackResponse> => {
  try {
    const response = await fetch('http://localhost:3001/api/ai-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get AI feedback');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting AI feedback:', error);
    return {
      feedback: 'Sorry, there was an error processing your response. Please try again later.',
      success: false
    };
  }
}; 