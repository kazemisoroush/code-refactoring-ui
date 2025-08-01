import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ProjectsTable from './ProjectsTable';
import { projectService } from '../../../../services/projectService';

// Mock the project service
jest.mock('../../../../services/projectService', () => ({
  projectService: {
    getProjects: jest.fn(),
    deleteProject: jest.fn(),
  },
}));

// Mock chakra theme
const mockTheme = {
  colors: {
    brand: { 500: '#4318FF' },
    secondaryGray: { 900: '#2D3748', 600: '#718096' },
    gray: { 200: '#E2E8F0' },
  },
};

const TestWrapper = ({ children }) => (
  <ChakraProvider theme={mockTheme}>{children}</ChakraProvider>
);

describe('ProjectsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render table with loading state initially', () => {
    projectService.getProjects.mockReturnValue(new Promise(() => {}));

    render(
      <TestWrapper>
        <ProjectsTable />
      </TestWrapper>,
    );

    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  test('should display projects data when loaded successfully', async () => {
    const mockProjects = {
      projects: [
        {
          project_id: 'proj-123',
          name: 'Test Project 1',
          created_at: '2024-01-15T10:30:00Z',
          tags: { env: 'prod', team: 'backend' },
        },
        {
          project_id: 'proj-456',
          name: 'Test Project 2',
          created_at: '2024-01-16T11:30:00Z',
          tags: { env: 'dev' },
        },
      ],
      next_token: null,
    };

    projectService.getProjects.mockResolvedValue({
      success: true,
      data: mockProjects,
    });

    render(
      <TestWrapper>
        <ProjectsTable />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    });

    expect(screen.getByText('proj-123')).toBeInTheDocument();
    expect(screen.getByText('proj-456')).toBeInTheDocument();
  });

  test('should display error message when projects fail to load', async () => {
    projectService.getProjects.mockResolvedValue({
      success: false,
      error: 'Failed to fetch projects',
    });

    render(
      <TestWrapper>
        <ProjectsTable />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Unable to load projects')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch projects')).toBeInTheDocument();
    });
  });

  test('should handle pagination', async () => {
    const mockProjects = {
      projects: [
        {
          project_id: 'proj-123',
          name: 'Test Project 1',
          created_at: '2024-01-15T10:30:00Z',
          tags: {},
        },
      ],
      next_token: 'token123',
    };

    projectService.getProjects.mockResolvedValue({
      success: true,
      data: mockProjects,
    });

    render(
      <TestWrapper>
        <ProjectsTable />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    // Should show next button when there's a next_token
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();

    // Should show page count with items
    expect(screen.getByText('Page 1 (1 items)')).toBeInTheDocument();
  });

  test('should format dates correctly', async () => {
    const mockProjects = {
      projects: [
        {
          project_id: 'proj-123',
          name: 'Test Project 1',
          created_at: '2024-01-15T10:30:00Z',
          tags: {},
        },
      ],
      next_token: null,
    };

    projectService.getProjects.mockResolvedValue({
      success: true,
      data: mockProjects,
    });

    render(
      <TestWrapper>
        <ProjectsTable />
      </TestWrapper>,
    );

    await waitFor(() => {
      // Should format the date properly
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
    });
  });

  test('should display tags as badges', async () => {
    const mockProjects = {
      projects: [
        {
          project_id: 'proj-123',
          name: 'Test Project 1',
          created_at: '2024-01-15T10:30:00Z',
          tags: { env: 'prod', team: 'backend' },
        },
      ],
      next_token: null,
    };

    projectService.getProjects.mockResolvedValue({
      success: true,
      data: mockProjects,
    });

    render(
      <TestWrapper>
        <ProjectsTable />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('env: prod')).toBeInTheDocument();
      expect(screen.getByText('team: backend')).toBeInTheDocument();
    });
  });
});
