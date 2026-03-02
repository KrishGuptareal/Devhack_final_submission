import { BASE_URL } from './config';

/**
 * API Client - Wrapper for all API calls with automatic auth token injection
 */
class ApiClient {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  /**
   * Make an authenticated API request
   * @param {string} endpoint - The API endpoint (without base URL)
   * @param {Object} options - Fetch options
   * @param {Function} getToken - Function to get the auth token (from Clerk)
   * @returns {Promise<Object>} - The API response data
   */
  async request(endpoint, options = {}, getToken) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if getToken is provided
    if (getToken) {
      try {
        const token = await getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }

    const config = {
      ...options,
      headers,
      mode: 'cors', // Ensure CORS is handled
    };

    try {
      const response = await fetch(url, config);
      
      // Handle empty responses (like 204 No Content)
      const contentType = response.headers.get('content-type');
      let data = {};
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { message: text };
        }
      }

      if (!response.ok) {
        throw new ApiError(data.message || 'API request failed', response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || 'Network error', 0, null);
    }
  }

  async get(endpoint, getToken) {
    return this.request(endpoint, { method: 'GET' }, getToken);
  }

  async post(endpoint, body, getToken) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }, getToken);
  }

  async put(endpoint, body, getToken) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }, getToken);
  }

  async patch(endpoint, body, getToken) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }, getToken);
  }

  async postFormData(endpoint, formData, getToken) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {};

    // Add authorization header if getToken is provided
    if (getToken) {
      try {
        const token = await getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        mode: 'cors',
      });
      
      const contentType = response.headers.get('content-type');
      let data = {};
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new ApiError(data.message || 'File upload failed', response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || 'Network error', 0, null);
    }
  }

  async delete(endpoint, getToken) {
    return this.request(endpoint, { method: 'DELETE' }, getToken);
  }

  async deleteWithBody(endpoint, body, getToken) {
    return this.request(endpoint, {
      method: 'DELETE',
      body: JSON.stringify(body),
    }, getToken);
  }
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const apiClient = new ApiClient();

export { apiClient, ApiError };
