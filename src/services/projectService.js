import { apiClient } from '../utils/apiClient';

class ProjectService {
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
      const url = `/projects${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(url);

      if (!response.ok) {
        const errorMessage = await apiClient.handleError(response);
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await apiClient.handleResponse(response);
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
      const response = await apiClient.get(`/projects/${projectId}`);

      if (!response.ok) {
        const errorMessage = await apiClient.handleError(response);
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await apiClient.handleResponse(response);
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
      const response = await apiClient.post('/projects', projectData);

      if (!response.ok) {
        const errorMessage = await apiClient.handleError(response);
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await apiClient.handleResponse(response);
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
      const response = await apiClient.put(`/projects/${projectId}`, {
        ...updateData,
        projectID: projectId,
      });

      if (!response.ok) {
        const errorMessage = await apiClient.handleError(response);
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await apiClient.handleResponse(response);
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
      const response = await apiClient.delete(`/projects/${projectId}`);

      if (!response.ok) {
        const errorMessage = await apiClient.handleError(response);
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await apiClient.handleResponse(response);
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
