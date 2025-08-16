import { apiClient } from './apiClient';
import { tokenStorage } from './tokenStorage';

// Mock tokenStorage
jest.mock('./tokenStorage');

// Mock fetch
global.fetch = jest.fn();

describe('ApiClient', () => {
  beforeEach(() => {
    fetch.mockClear();
    tokenStorage.getToken.mockClear();
    tokenStorage.getRefreshToken.mockClear();
    tokenStorage.setToken.mockClear();
    tokenStorage.clearAll.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('refreshAccessToken', () => {
    test('should return error when no refresh token available', async () => {
      tokenStorage.getRefreshToken.mockReturnValue(null);

      const result = await apiClient.refreshAccessToken();

      expect(result).toEqual({
        success: false,
        error: 'No refresh token available',
      });
    });

    test('should return error when refresh request fails', async () => {
      tokenStorage.getRefreshToken.mockReturnValue('refresh_token_123');
      fetch.mockResolvedValue({
        ok: false,
        status: 401,
      });

      const result = await apiClient.refreshAccessToken();

      expect(result).toEqual({
        success: false,
        error: 'Token refresh failed',
      });
      expect(tokenStorage.clearAll).toHaveBeenCalled();
    });

    test('should return error when no access token in response', async () => {
      tokenStorage.getRefreshToken.mockReturnValue('refresh_token_123');
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ some_other_field: 'value' }),
      });

      const result = await apiClient.refreshAccessToken();

      expect(result).toEqual({
        success: false,
        error: 'No access token in refresh response',
      });
      expect(tokenStorage.clearAll).toHaveBeenCalled();
    });

    test('should return success with new token when refresh succeeds', async () => {
      const newToken = 'new_access_token_123';
      tokenStorage.getRefreshToken.mockReturnValue('refresh_token_123');
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ access_token: newToken }),
      });

      const result = await apiClient.refreshAccessToken();

      expect(result).toEqual({
        success: true,
        token: newToken,
      });
      expect(tokenStorage.setToken).toHaveBeenCalledWith(newToken);
      expect(fetch).toHaveBeenCalledWith('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: 'refresh_token_123' }),
      });
    });

    test('should handle network errors gracefully', async () => {
      tokenStorage.getRefreshToken.mockReturnValue('refresh_token_123');
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await apiClient.refreshAccessToken();

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
      expect(tokenStorage.clearAll).toHaveBeenCalled();
    });
  });

  describe('request', () => {
    test('should make successful request without token refresh', async () => {
      tokenStorage.getToken.mockReturnValue('valid_token');
      const mockResponse = { ok: true, status: 200 };
      fetch.mockResolvedValue(mockResponse);

      const result = await apiClient.request('/test-endpoint', {
        method: 'GET',
      });

      expect(result).toBe(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/v1/test-endpoint', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid_token',
        },
      });
    });

    test('should handle 401 response by attempting token refresh', async () => {
      tokenStorage.getToken.mockReturnValue('expired_token');
      tokenStorage.getRefreshToken.mockReturnValue('refresh_token_123');

      // First call returns 401
      const unauthorizedResponse = { ok: false, status: 401 };
      const successResponse = { ok: true, status: 200 };

      fetch
        .mockResolvedValueOnce(unauthorizedResponse)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'new_token_123' }),
        })
        .mockResolvedValueOnce(successResponse);

      const result = await apiClient.request('/test-endpoint', {
        method: 'GET',
      });

      expect(result).toBe(successResponse);
      expect(tokenStorage.setToken).toHaveBeenCalledWith('new_token_123');
      expect(fetch).toHaveBeenCalledTimes(3); // Original request + refresh + retry
    });

    test('should return 401 response when token refresh fails', async () => {
      tokenStorage.getToken.mockReturnValue('expired_token');
      tokenStorage.getRefreshToken.mockReturnValue('invalid_refresh');

      const unauthorizedResponse = { ok: false, status: 401 };

      fetch
        .mockResolvedValueOnce(unauthorizedResponse)
        .mockResolvedValueOnce({ ok: false, status: 401 }); // Refresh fails

      const result = await apiClient.request('/test-endpoint', {
        method: 'GET',
      });

      expect(result).toBe(unauthorizedResponse);
      expect(tokenStorage.clearAll).toHaveBeenCalled();
    });

    test('should handle concurrent requests during token refresh', async () => {
      tokenStorage.getToken.mockReturnValue('expired_token');
      tokenStorage.getRefreshToken.mockReturnValue('refresh_token_123');

      const unauthorizedResponse = { ok: false, status: 401 };
      const successResponse = { ok: true, status: 200 };

      fetch
        .mockResolvedValueOnce(unauthorizedResponse)
        .mockResolvedValueOnce(unauthorizedResponse)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'new_token_123' }),
        })
        .mockResolvedValue(successResponse);

      // Make two concurrent requests
      const request1 = apiClient.request('/endpoint1', { method: 'GET' });
      const request2 = apiClient.request('/endpoint2', { method: 'GET' });

      const [result1, result2] = await Promise.all([request1, request2]);

      expect(result1).toBe(successResponse);
      expect(result2).toBe(successResponse);
      expect(tokenStorage.setToken).toHaveBeenCalledWith('new_token_123');
    });
  });

  describe('getHeaders', () => {
    test('should return headers without authorization when no token', () => {
      tokenStorage.getToken.mockReturnValue(null);

      const headers = apiClient.getHeaders();

      expect(headers).toEqual({
        'Content-Type': 'application/json',
      });
    });

    test('should include authorization header when token exists', () => {
      tokenStorage.getToken.mockReturnValue('test_token');

      const headers = apiClient.getHeaders();

      expect(headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer test_token',
      });
    });

    test('should merge additional headers', () => {
      tokenStorage.getToken.mockReturnValue('test_token');

      const headers = apiClient.getHeaders({ 'Custom-Header': 'custom-value' });

      expect(headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer test_token',
        'Custom-Header': 'custom-value',
      });
    });
  });
});
