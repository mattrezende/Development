import apiServerClient from '@/lib/apiServerClient.js';

/**
 * Validates the backend server endpoints.
 * @returns {Promise<Object>} Response data or error object
 */
export const validateBackend = async () => {
  try {
    const response = await apiServerClient.fetch('/admin/validate-backend', {
      method: 'GET'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        error: true, 
        message: data.error || data.message || `HTTP Error: ${response.status}` 
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error validating backend:', error);
    return { 
      error: true, 
      message: error.message || 'Network error occurred while validating backend' 
    };
  }
};

/**
 * Checks the status of the backend server.
 * @returns {Promise<Object>} Response data or error object
 */
export const checkBackendStatus = async () => {
  try {
    const response = await apiServerClient.fetch('/admin/backend-status', {
      method: 'GET'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        error: true, 
        message: data.error || data.message || `HTTP Error: ${response.status}` 
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error checking backend status:', error);
    return { 
      error: true, 
      message: error.message || 'Network error occurred while checking backend status' 
    };
  }
};

// Re-export apiServerClient for direct access
export { apiServerClient };