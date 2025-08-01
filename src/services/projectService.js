const API_BASE_URL = '/api/v1';

class ProjectService {
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');

    // Check if response is JSON
    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (error) {
        throw new Error('Invalid JSON response from server');
      }
    }

    // If not JSON, get text content for error message
    const textContent = await response.text();

    // Extract meaningful error from HTML if possible
    if (textContent.includes('<')) {
      const titleMatch = textContent.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'Server Error';
      throw new Error(`Server returned HTML instead of JSON: ${title}`);
    }

    throw new Error(
      `Unexpected response format: ${textContent.substring(0, 100)}...`,
    );
  }

  async handleError(response) {
    const status = response.status;
    let errorMessage = `HTTP ${status}`;

    try {
      const errorData = await this.handleResponse(response);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (parseError) {
      // If we can't parse the error response, use status-based messages
      switch (status) {
        case 400:
          errorMessage = 'Bad Request - Invalid parameters';
          break;
        case 401:
          errorMessage = 'Unauthorized - Please check your credentials';
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

  async getProjects(params = {}) {
    try {
      const query = new URLSearchParams();

      if (params.next_token) {
        query.append('next_token', params.next_token);
      }
      if (params.max_results) {
        query.append('max_results', params.max_results.toString());
      }
      if (params.tag_filter) {
        query.append('tag_filter', params.tag_filter);
      }

      const queryString = query.toString();
      const url = `${API_BASE_URL}/projects${
        queryString ? `?${queryString}` : ''
      }`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorMessage = await this.handleError(response);
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await this.handleResponse(response);
      return {
        success: true,
        data,
      };
    } catch (error) {
      // Handle network errors, timeout, etc.
      let errorMessage = 'Network error occurred';

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage =
          'Unable to connect to server - please check your internet connection';
      } else if (error.name === 'AbortError') {
        errorMessage = 'Request was cancelled';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async getProject(projectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorMessage = await this.handleError(response);
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await this.handleResponse(response);
      return {
        success: true,
        data,
      };
    } catch (error) {
      let errorMessage = 'Network error occurred';

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage =
          'Unable to connect to server - please check your internet connection';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async createProject(projectData) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorMessage = await this.handleError(response);
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await this.handleResponse(response);
      return {
        success: true,
        data,
      };
    } catch (error) {
      let errorMessage = 'Network error occurred';

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage =
          'Unable to connect to server - please check your internet connection';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async updateProject(projectId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...updateData, projectID: projectId }),
      });

      if (!response.ok) {
        const errorMessage = await this.handleError(response);
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await this.handleResponse(response);
      return {
        success: true,
        data,
      };
    } catch (error) {
      let errorMessage = 'Network error occurred';

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage =
          'Unable to connect to server - please check your internet connection';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async deleteProject(projectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorMessage = await this.handleError(response);
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await this.handleResponse(response);
      return {
        success: true,
        data,
      };
    } catch (error) {
      let errorMessage = 'Network error occurred';

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage =
          'Unable to connect to server - please check your internet connection';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export const projectService = new ProjectService();
