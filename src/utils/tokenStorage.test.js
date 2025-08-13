import { tokenStorage } from './tokenStorage';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('TokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setToken', () => {
    it('should store token in localStorage', () => {
      const token = 'test-token';
      tokenStorage.setToken(token);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth_token',
        token,
      );
    });

    it('should remove token if null is passed', () => {
      tokenStorage.setToken(null);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('getToken', () => {
    it('should retrieve token from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      const token = tokenStorage.getToken();
      expect(token).toBe('test-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('setRefreshToken', () => {
    it('should store refresh token in localStorage', () => {
      const refreshToken = 'test-refresh-token';
      tokenStorage.setRefreshToken(refreshToken);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'refresh_token',
        refreshToken,
      );
    });
  });

  describe('getRefreshToken', () => {
    it('should retrieve refresh token from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('test-refresh-token');
      const refreshToken = tokenStorage.getRefreshToken();
      expect(refreshToken).toBe('test-refresh-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('setUser', () => {
    it('should store user data in localStorage', () => {
      const user = { id: '1', username: 'testuser' };
      tokenStorage.setUser(user);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user_data',
        JSON.stringify(user),
      );
    });
  });

  describe('getUser', () => {
    it('should retrieve and parse user data from localStorage', () => {
      const user = { id: '1', username: 'testuser' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
      const userData = tokenStorage.getUser();
      expect(userData).toEqual(user);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user_data');
    });

    it('should return null if user data is invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      const userData = tokenStorage.getUser();
      expect(userData).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should remove all stored authentication data', () => {
      tokenStorage.clearAll();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false if no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(tokenStorage.isAuthenticated()).toBe(false);
    });

    it('should return true for valid non-expired token', () => {
      const payload = {
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorageMock.getItem.mockReturnValue(token);
      expect(tokenStorage.isAuthenticated()).toBe(true);
    });

    it('should return false for expired token', () => {
      const payload = {
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorageMock.getItem.mockReturnValue(token);
      expect(tokenStorage.isAuthenticated()).toBe(false);
    });

    it('should return false for invalid token format', () => {
      localStorageMock.getItem.mockReturnValue('invalid-token');
      expect(tokenStorage.isAuthenticated()).toBe(false);
    });
  });

  describe('isTokenExpiringSoon', () => {
    it('should return false if no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(tokenStorage.isTokenExpiringSoon()).toBe(false);
    });

    it('should return true if token expires within 5 minutes', () => {
      const payload = {
        exp: Math.floor(Date.now() / 1000) + 240, // Expires in 4 minutes
      };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorageMock.getItem.mockReturnValue(token);
      expect(tokenStorage.isTokenExpiringSoon()).toBe(true);
    });

    it('should return false if token expires in more than 5 minutes', () => {
      const payload = {
        exp: Math.floor(Date.now() / 1000) + 600, // Expires in 10 minutes
      };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorageMock.getItem.mockReturnValue(token);
      expect(tokenStorage.isTokenExpiringSoon()).toBe(false);
    });
  });
});
