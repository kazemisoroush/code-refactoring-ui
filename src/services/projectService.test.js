import { projectService } from './projectService';

// Mock fetch
window.fetch = jest.fn();

describe('projectService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getProjects', () => {
    test('should fetch projects successfully', async () => {
      const mockProjects = {
        projects: [
          {
            project_id: 'proj-123',
            name: 'Test Project',
            created_at: '2024-01-15T10:30:00Z',
            tags: { env: 'prod' },
          },
        ],
        next_token: null,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockProjects,
      });

      const result = await projectService.getProjects();

      expect(fetch).toHaveBeenCalledWith('/api/v1/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual({
        success: true,
        data: mockProjects,
      });
    });

    test('should handle fetch error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await projectService.getProjects();

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });

    test('should handle HTTP error response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: async () => ({ message: 'Internal server error' }),
      });

      const result = await projectService.getProjects();

      expect(result).toEqual({
        success: false,
        error: 'Internal server error',
      });
    });

    test('should fetch projects with pagination parameters', async () => {
      const mockProjects = { projects: [], next_token: 'token123' };
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockProjects,
      });

      await projectService.getProjects({
        next_token: 'token123',
        max_results: 50,
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/projects?next_token=token123&max_results=50',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    test('should handle HTML error response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: jest.fn().mockReturnValue('text/html'),
        },
        text: async () => '<html><title>Internal Server Error</title></html>',
        json: async () => {
          throw new Error('Not JSON');
        },
      });

      const result = await projectService.getProjects();

      expect(result).toEqual({
        success: false,
        error: 'Internal Server Error - Please try again later',
      });
    });

    test('should handle network connection error', async () => {
      const networkError = new TypeError('Failed to fetch');
      fetch.mockRejectedValueOnce(networkError);

      const result = await projectService.getProjects();

      expect(result).toEqual({
        success: false,
        error:
          'Unable to connect to server - please check your internet connection',
      });
    });
  });

  describe('createProject', () => {
    test('should create project successfully', async () => {
      const projectData = {
        name: 'New Project',
        description: 'Test project',
        language: 'javascript',
        tags: { env: 'dev' },
      };

      const mockResponse = {
        project_id: 'proj-456',
        created_at: '2024-01-15T10:30:00Z',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockResponse,
      });

      const result = await projectService.createProject(projectData);

      expect(fetch).toHaveBeenCalledWith('/api/v1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      expect(result).toEqual({
        success: true,
        data: mockResponse,
      });
    });

    test('should handle validation error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ message: 'Name is required' }),
      });

      const result = await projectService.createProject({});

      expect(result).toEqual({
        success: false,
        error: 'Name is required',
      });
    });
  });

  describe('deleteProject', () => {
    test('should delete project successfully', async () => {
      const mockResponse = { success: true };
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockResponse,
      });

      const result = await projectService.deleteProject('proj-123');

      expect(fetch).toHaveBeenCalledWith('/api/v1/projects/proj-123', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual({
        success: true,
        data: mockResponse,
      });
    });

    test('should handle project not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ message: 'Project not found' }),
      });

      const result = await projectService.deleteProject('proj-nonexistent');

      expect(result).toEqual({
        success: false,
        error: 'Project not found',
      });
    });
  });

  describe('updateProject', () => {
    test('should update project successfully', async () => {
      const updateData = {
        projectID: 'proj-123',
        name: 'Updated Project',
        description: 'Updated description',
      };

      const mockResponse = {
        project_id: 'proj-123',
        updated_at: '2024-01-15T11:30:00Z',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockResponse,
      });

      const result = await projectService.updateProject('proj-123', updateData);

      expect(fetch).toHaveBeenCalledWith('/api/v1/projects/proj-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual({
        success: true,
        data: mockResponse,
      });
    });
  });

  describe('getProject', () => {
    test('should get single project successfully', async () => {
      const mockProject = {
        project_id: 'proj-123',
        name: 'Test Project',
        description: 'A test project',
        language: 'javascript',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        tags: { env: 'prod', team: 'backend' },
        metadata: { version: '1.0.0' },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockProject,
      });

      const result = await projectService.getProject('proj-123');

      expect(fetch).toHaveBeenCalledWith('/api/v1/projects/proj-123', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual({
        success: true,
        data: mockProject,
      });
    });
  });
});
