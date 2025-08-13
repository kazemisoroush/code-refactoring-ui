import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
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

// Mock the token refresh hook
jest.mock('../hooks/useTokenRefresh', () => ({
  useTokenRefresh: () => ({
    startTokenRefreshCheck: jest.fn(),
    stopTokenRefreshCheck: jest.fn(),
  }),
}));

// Test component that uses the auth context
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
      <span data-testid="user">{auth.user?.username || 'no-user'}</span>
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
      <button
        data-testid="signup-btn"
        onClick={() =>
          auth.signup('testuser', 'password123', 'test@example.com')
        }
      >
        Signup
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
    });

    test('should handle authenticated user on mount', async () => {
      const mockUser = { username: 'testuser' };
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

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent(
        'authenticated',
      );
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
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
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });

    test('should handle login failure', async () => {
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

      // Wait for initial auth check
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
    });
  });

  describe('signup', () => {
    test('should handle successful signup', async () => {
      authService.getCurrentUser.mockResolvedValue({
        success: false,
        isAuthenticated: false,
      });
      authService.signUp.mockResolvedValue({
        success: true,
        user: { username: 'testuser' },
        message: 'Signup successful',
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

      // Trigger signup
      await act(async () => {
        screen.getByTestId('signup-btn').click();
      });

      await waitFor(() => {
        expect(authService.signUp).toHaveBeenCalledWith(
          'testuser',
          'password123',
          'test@example.com',
        );
      });
    });

    test('should handle signup failure', async () => {
      authService.getCurrentUser.mockResolvedValue({
        success: false,
        isAuthenticated: false,
      });
      authService.signUp.mockResolvedValue({
        success: false,
        message: 'Username already exists',
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

      // Trigger signup
      await act(async () => {
        screen.getByTestId('signup-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Username already exists',
        );
      });
    });
  });

  describe('useAuth hook', () => {
    test('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });
});
