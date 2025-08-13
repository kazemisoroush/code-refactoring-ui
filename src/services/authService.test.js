import { AuthService } from './authService';
import { apiClient } from '../utils/apiClient';
import { tokenStorage } from '../utils/tokenStorage';

// Mock the API client
jest.mock('../utils/apiClient', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    handleResponse: jest.fn(),
    handleError: jest.fn(),
    refreshAccessToken: jest.fn(),
  },
}));

// Mock token storage
jest.mock('../utils/tokenStorage', () => ({
  tokenStorage: {
    setToken: jest.fn(),
    setRefreshToken: jest.fn(),
    setUser: jest.fn(),
    getToken: jest.fn(),
    getUser: jest.fn(),
    isAuthenticated: jest.fn(),
    clearAll: jest.fn(),
  },
}));

describe('AuthService', () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should return success when sign in is successful', async () => {
      const mockResponse = {
        ok: true,
      };
      const mockData = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: { username: 'testuser', email: 'test@example.com' },
      };

      apiClient.post.mockResolvedValue(mockResponse);
      apiClient.handleResponse.mockResolvedValue(mockData);

      const result = await authService.signIn('testuser', 'password123');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/signin', {
        username: 'testuser',
        password: 'password123',
      });
      expect(tokenStorage.setToken).toHaveBeenCalledWith('mock-access-token');
      expect(tokenStorage.setRefreshToken).toHaveBeenCalledWith(
        'mock-refresh-token',
      );
      expect(tokenStorage.setUser).toHaveBeenCalledWith(mockData.user);
      expect(result).toEqual({
        success: true,
        user: mockData.user,
        message: 'Sign in successful',
      });
    });

    it('should return error when sign in fails', async () => {
      const mockResponse = {
        ok: false,
      };
      const errorMessage = 'Invalid credentials';

      apiClient.post.mockResolvedValue(mockResponse);
      apiClient.handleError.mockResolvedValue(errorMessage);

      const result = await authService.signIn('testuser', 'wrongpassword');

      expect(result).toEqual({
        success: false,
        message: errorMessage,
      });
      expect(tokenStorage.setToken).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      apiClient.post.mockRejectedValue(networkError);

      const result = await authService.signIn('testuser', 'password123');

      expect(result).toEqual({
        success: false,
        message: 'Network error',
      });
    });
  });

  describe('signUp', () => {
    it('should return success when sign up is successful', async () => {
      const mockResponse = {
        ok: true,
      };
      const mockData = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: { username: 'testuser', email: 'test@example.com' },
        user_id: 'user-123',
        message: 'Sign up successful',
      };

      apiClient.post.mockResolvedValue(mockResponse);
      apiClient.handleResponse.mockResolvedValue(mockData);

      const result = await authService.signUp(
        'testuser',
        'password123',
        'test@example.com',
      );

      expect(apiClient.post).toHaveBeenCalledWith('/auth/signup', {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
      });
      expect(result).toEqual({
        success: true,
        user: mockData.user,
        userSub: mockData.user_id,
        message: mockData.message,
      });
    });

    it('should return error when sign up fails', async () => {
      const mockResponse = {
        ok: false,
      };
      const errorMessage = 'Username already exists';

      apiClient.post.mockResolvedValue(mockResponse);
      apiClient.handleError.mockResolvedValue(errorMessage);

      const result = await authService.signUp(
        'testuser',
        'password123',
        'test@example.com',
      );

      expect(result).toEqual({
        success: false,
        message: errorMessage,
      });
    });
  });

  describe('signOut', () => {
    it('should return success when sign out is successful', async () => {
      const mockToken = 'mock-token';
      const mockResponse = {
        ok: true,
      };

      tokenStorage.getToken.mockReturnValue(mockToken);
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.signOut();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/signout', {
        access_token: mockToken,
      });
      expect(tokenStorage.clearAll).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Sign out successful',
      });
    });

    it('should clear local storage even if API call fails', async () => {
      const mockToken = 'mock-token';
      const mockResponse = {
        ok: false,
      };

      tokenStorage.getToken.mockReturnValue(mockToken);
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.signOut();

      expect(tokenStorage.clearAll).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Sign out successful',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data from storage when authenticated', async () => {
      const mockUser = {
        username: 'testuser',
        email: 'test@example.com',
      };

      tokenStorage.isAuthenticated.mockReturnValue(true);
      tokenStorage.getUser.mockReturnValue(mockUser);

      const result = await authService.getCurrentUser();

      expect(result).toEqual({
        success: true,
        user: mockUser,
        isAuthenticated: true,
      });
    });

    it('should fetch user from API if not in storage', async () => {
      const mockResponse = {
        ok: true,
      };
      const mockData = {
        user: { username: 'testuser', email: 'test@example.com' },
      };

      tokenStorage.isAuthenticated.mockReturnValue(true);
      tokenStorage.getUser.mockReturnValue(null);
      apiClient.get.mockResolvedValue(mockResponse);
      apiClient.handleResponse.mockResolvedValue(mockData);

      const result = await authService.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(tokenStorage.setUser).toHaveBeenCalledWith(mockData.user);
      expect(result).toEqual({
        success: true,
        user: mockData.user,
        isAuthenticated: true,
      });
    });

    it('should return not authenticated when no valid token', async () => {
      tokenStorage.isAuthenticated.mockReturnValue(false);

      const result = await authService.getCurrentUser();

      expect(result).toEqual({
        success: false,
        user: null,
        isAuthenticated: false,
        message: 'User not authenticated',
      });
    });
  });

  describe('refreshToken', () => {
    it('should return success when token refresh is successful', async () => {
      const newToken = 'new-access-token';
      apiClient.refreshAccessToken.mockResolvedValue(newToken);

      const result = await authService.refreshToken();

      expect(result).toEqual({
        success: true,
        access_token: newToken,
      });
    });

    it('should return error when token refresh fails', async () => {
      const error = new Error('Token refresh failed');
      apiClient.refreshAccessToken.mockRejectedValue(error);

      const result = await authService.refreshToken();

      expect(result).toEqual({
        success: false,
        message: 'Token refresh failed',
      });
    });
  });
});
