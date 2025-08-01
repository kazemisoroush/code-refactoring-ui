import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../services/authService';

// Mock the auth service
jest.mock('../services/authService', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
    confirmSignUp: jest.fn(),
    forgotPassword: jest.fn(),
    forgotPasswordSubmit: jest.fn(),
  },
}));

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">
        {auth.isLoading ? 'loading' : 'not-loading'}
      </span>
      <span data-testid="authenticated">
        {auth.isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </span>
      <span data-testid="user">
        {auth.user ? auth.user.username : 'no-user'}
      </span>
      <span data-testid="error">{auth.error || 'no-error'}</span>
      <button
        data-testid="login-btn"
        onClick={() => auth.login('testuser', 'password123')}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => auth.logout()}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthProvider', () => {
    test('should provide initial state and check auth on mount', async () => {
      authService.getCurrentUser.mockResolvedValue({
        success: false,
        isAuthenticated: false,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      // Initially loading
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      // Wait for auth check to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent(
        'not-authenticated',
      );
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      expect(authService.getCurrentUser).toHaveBeenCalled();
    });

    test('should set authenticated user if logged in on mount', async () => {
      const mockUser = {
        username: 'testuser',
        attributes: { email: 'test@example.com' },
      };
      authService.getCurrentUser.mockResolvedValue({
        success: true,
        isAuthenticated: true,
        user: mockUser,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      // Wait for user to be set and loading to complete
      await waitFor(
        () => {
          expect(screen.getByTestId('user')).toHaveTextContent('testuser');
        },
        { timeout: 3000 },
      );

      expect(screen.getByTestId('authenticated')).toHaveTextContent(
        'authenticated',
      );
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
  });

  describe('login', () => {
    test('should handle successful login', async () => {
      const mockUser = { username: 'testuser' };
      authService.getCurrentUser.mockResolvedValue({
        success: false,
        isAuthenticated: false,
      });
      authService.signIn.mockResolvedValue({
        success: true,
        user: mockUser,
        message: 'Login successful',
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      // Wait for initial auth check
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      // Trigger login
      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'authenticated',
        );
      });

      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
      expect(authService.signIn).toHaveBeenCalledWith(
        'testuser',
        'password123',
      );
    });

    test('should handle failed login', async () => {
      authService.getCurrentUser.mockResolvedValue({
        success: false,
        isAuthenticated: false,
      });
      authService.signIn.mockResolvedValue({
        success: false,
        message: 'Invalid credentials',
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      // Wait for initial auth check
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      // Trigger login
      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Invalid credentials',
        );
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent(
        'not-authenticated',
      );
    });
  });

  describe('logout', () => {
    test('should handle successful logout', async () => {
      const mockUser = { username: 'testuser' };
      authService.getCurrentUser.mockResolvedValue({
        success: true,
        isAuthenticated: true,
        user: mockUser,
      });
      authService.signOut.mockResolvedValue({ success: true });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      // Wait for user to be authenticated
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'authenticated',
        );
      });

      // Trigger logout
      await act(async () => {
        screen.getByTestId('logout-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'not-authenticated',
        );
      });

      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(authService.signOut).toHaveBeenCalled();
    });
  });

  describe('useAuth hook', () => {
    test('should throw error when used outside AuthProvider', () => {
      const TestComponentOutsideProvider = () => {
        useAuth();
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponentOutsideProvider />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });
});
