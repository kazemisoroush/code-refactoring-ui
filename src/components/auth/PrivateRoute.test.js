import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { AuthProvider } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

// Mock the auth service
jest.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: jest.fn(),
  },
}));

// Mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, state }) => {
    mockNavigate(to, state);
    return <div data-testid="navigate-mock">Redirecting to {to}</div>;
  },
}));

const TestComponent = () => (
  <div data-testid="protected-content">Protected Content</div>
);

const renderWithAuthAndRouter = (
  component,
  initialEntries = ['/protected'],
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>{component}</AuthProvider>
    </MemoryRouter>,
  );
};

describe('PrivateRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show loading spinner while checking authentication', () => {
    // Make getCurrentUser hang to simulate loading state
    authService.getCurrentUser.mockImplementation(() => new Promise(() => {}));

    renderWithAuthAndRouter(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should render protected content when user is authenticated', async () => {
    authService.getCurrentUser.mockResolvedValue({
      success: true,
      isAuthenticated: true,
      user: { username: 'testuser' },
    });

    renderWithAuthAndRouter(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
    );

    // Wait for auth check to complete
    await screen.findByTestId('protected-content');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  test('should redirect to login when user is not authenticated', async () => {
    authService.getCurrentUser.mockResolvedValue({
      success: false,
      isAuthenticated: false,
    });

    renderWithAuthAndRouter(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
      ['/protected'],
    );

    // Wait for redirect
    await screen.findByTestId('navigate-mock');

    expect(mockNavigate).toHaveBeenCalledWith('/auth/signin', {
      from: '/protected',
    });
  });

  test('should redirect to login when authentication check fails', async () => {
    authService.getCurrentUser.mockRejectedValue(new Error('Auth failed'));

    renderWithAuthAndRouter(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
    );

    // Wait for redirect
    await screen.findByTestId('navigate-mock');

    expect(mockNavigate).toHaveBeenCalledWith('/auth/signin', {
      from: '/protected',
    });
  });
});
