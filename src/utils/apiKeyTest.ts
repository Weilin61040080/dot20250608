/**
 * Utility file to test API key loading
 * 
 * This file is only for debugging purposes to verify that environment variables
 * are properly loaded in the React application.
 */

// Check if the API key exists in the environment
export const checkApiKey = () => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
  
  // Only show first few characters for security
  const maskedKey = apiKey 
    ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`
    : 'NOT FOUND';
  
  console.log('===== API KEY TEST =====');
  console.log('API Key exists:', !!apiKey);
  console.log('API Key length:', apiKey.length);
  console.log('API Key (masked):', maskedKey);
  
  // Check if the key starts with the expected prefix (sk-)
  const hasValidPrefix = apiKey.startsWith('sk-');
  console.log('API Key has valid prefix:', hasValidPrefix);
  
  // Check for NODE_ENV
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // Check if other environment variables are accessible
  console.log('PUBLIC_URL:', process.env.PUBLIC_URL || 'not set');
  
  return {
    exists: !!apiKey,
    length: apiKey.length,
    validPrefix: hasValidPrefix
  };
};

// Export utility function to call from components
const apiKeyTestUtils = {
  checkApiKey
};

export default apiKeyTestUtils; 