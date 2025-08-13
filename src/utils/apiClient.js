/**
 * HTTP client utility with automatic token management
 */

import { tokenStorage } from './tokenStorage';

const API_BASE_URL = '/api/v1';

class ApiClient {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  /**
   * Process the failed requests queue
   * @param {Error|null} error - Error if refresh failed
   * @param {string|null} token - New token if refresh succeeded
   */
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Refresh the access token
   * @returns {Promise<string>} New access token
   */
  async refreshAccessToken() {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newToken = data.access_token;

      if (!newToken) {
        throw new Error('No access token in refresh response');
      }

      tokenStorage.setToken(newToken);
      return newToken;
    } catch (error) {
      // Clear tokens if refresh fails
      tokenStorage.clearAll();
      throw error;
    }
  }

  /**
   * Get headers with authentication token
   * @param {object} additionalHeaders - Additional headers to include
   * @returns {object} Headers object
   */
  getHeaders(additionalHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };

    const token = tokenStorage.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request with automatic token refresh
   * @param {string} url - Request URL
   * @param {object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    // Add authentication headers
    const headers = this.getHeaders(options.headers);
    const requestOptions = {
      ...options,
      headers,
    };

    const response = await fetch(fullUrl, requestOptions);

    // If unauthorized and we have a refresh token, try to refresh
    if (response.status === 401 && tokenStorage.getRefreshToken()) {
      if (this.isRefreshing) {
        // Wait for the current refresh to complete
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(() => {
          // Retry the original request with new token
          const newHeaders = this.getHeaders(options.headers);
          return fetch(fullUrl, { ...options, headers: newHeaders });
        });
      }

      this.isRefreshing = true;

      try {
        await this.refreshAccessToken();
        this.processQueue(null);

        // Retry the original request with new token
        const newHeaders = this.getHeaders(options.headers);
        const retryResponse = await fetch(fullUrl, {
          ...options,
          headers: newHeaders,
        });

        return retryResponse;
      } catch (refreshError) {
        this.processQueue(refreshError);
        // Clear authentication and redirect to login
        tokenStorage.clearAll();
        throw refreshError;
      } finally {
        this.isRefreshing = false;
      }
    }

    return response;
  }

  /**
   * GET request
   * @param {string} url - Request URL
   * @param {object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   * @param {string} url - Request URL
   * @param {object} data - Request body data
   * @param {object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async post(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   * @param {string} url - Request URL
   * @param {object} data - Request body data
   * @param {object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async put(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   * @param {string} url - Request URL
   * @param {object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  /**
   * Handle response parsing
   * @param {Response} response - Fetch response
   * @returns {Promise<any>} Parsed response data
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  }

  /**
   * Handle API errors
   * @param {Response} response - Fetch response
   * @returns {Promise<string>} Error message
   */
  async handleError(response) {
    const status = response.status;
    let errorMessage = `HTTP ${status}`;

    try {
      const errorData = await this.handleResponse(response);
      if (typeof errorData === 'object' && errorData.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === 'string') {
        // Check if it's HTML content
        if (errorData.trim().startsWith('<') && errorData.includes('</')) {
          // This is HTML, use a generic error message instead
          throw new Error('HTML response received');
        }
        errorMessage = errorData;
      }
    } catch (parseError) {
      // Use status-based messages if we can't parse the error
      switch (status) {
        case 400:
          errorMessage = 'Bad Request - Invalid parameters';
          break;
        case 401:
          errorMessage = 'Unauthorized - Please log in again';
          break;
        case 403:
          errorMessage = 'Forbidden - Access denied';
          break;
        case 404:
          errorMessage = 'Not Found - Resource does not exist';
          break;
        case 500:
          errorMessage = 'Internal Server Error - Please try again later';
          break;
        case 502:
          errorMessage = 'Bad Gateway - Server is temporarily unavailable';
          break;
        case 503:
          errorMessage = 'Service Unavailable - Server is temporarily down';
          break;
        default:
          errorMessage = `HTTP ${status} - ${parseError.message}`;
      }
    }

    return errorMessage;
  }
}

export const apiClient = new ApiClient();
