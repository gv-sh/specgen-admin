// Get stored API URL from localStorage or use default
const getStoredApiUrl = () => {
  const storedUrl = localStorage.getItem('specgen_api_url');
  // Default to http://localhost:3000 without the /api suffix
  return storedUrl || process.env.REACT_APP_API_URL || 'http://localhost:3000';
};

const config = {
  API_URL: getStoredApiUrl()
};

console.log('API URL is configured as:', config.API_URL);

// Function to update API URL and save to localStorage
export const updateApiUrl = (newUrl) => {
  if (newUrl && newUrl.trim() !== '') {
    localStorage.setItem('specgen_api_url', newUrl.trim());
    config.API_URL = newUrl.trim();
    console.log('API URL updated to:', config.API_URL);
    return true;
  }
  return false;
};

export default config; 