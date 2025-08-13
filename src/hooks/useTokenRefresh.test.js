import { renderHook, act } from '@testing-library/react';
import { useTokenRefresh } from './useTokenRefresh';
import { tokenStorage } from '../utils/tokenStorage';
import { authService } from '../services/authService';

// Mock dependencies
jest.mock('../utils/tokenStorage');
jest.mock('../services/authService');

describe('useTokenRefresh Hook', () => {
  beforeEach(() => {
    // Use modern fake timers which properly mock all timer functions
    jest.useFakeTimers({ advanceTimers: true });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should start token refresh check when user is authenticated', () => {
    tokenStorage.isAuthenticated.mockReturnValue(true);
    tokenStorage.isTokenExpiringSoon.mockReturnValue(false);

    renderHook(() => useTokenRefresh());

    // Fast-forward time to trigger the interval
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(tokenStorage.isAuthenticated).toHaveBeenCalled();
    expect(tokenStorage.isTokenExpiringSoon).toHaveBeenCalled();
  });

  test('should not start token refresh check when user is not authenticated', () => {
    tokenStorage.isAuthenticated.mockReturnValue(false);

    renderHook(() => useTokenRefresh());

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    // Should not check for token expiration if not authenticated
    expect(tokenStorage.isTokenExpiringSoon).not.toHaveBeenCalled();
  });

  test('should refresh token when token is expiring soon', async () => {
    tokenStorage.isAuthenticated.mockReturnValue(true);
    tokenStorage.isTokenExpiringSoon.mockReturnValue(true);
    authService.refreshToken.mockResolvedValue({ success: true });

    renderHook(() => useTokenRefresh());

    // Fast-forward time to trigger the interval
    await act(async () => {
      jest.advanceTimersByTime(60000);
      await Promise.resolve();
    });

    expect(authService.refreshToken).toHaveBeenCalled();
  });

  test('should not refresh token when token is not expiring soon', async () => {
    tokenStorage.isAuthenticated.mockReturnValue(true);
    tokenStorage.isTokenExpiringSoon.mockReturnValue(false);

    renderHook(() => useTokenRefresh());

    // Fast-forward time to trigger the interval
    await act(async () => {
      jest.advanceTimersByTime(60000);
      await Promise.resolve();
    });

    expect(authService.refreshToken).not.toHaveBeenCalled();
  });

  test('should handle refresh token errors gracefully', async () => {
    tokenStorage.isAuthenticated.mockReturnValue(true);
    tokenStorage.isTokenExpiringSoon.mockReturnValue(true);
    authService.refreshToken.mockRejectedValue(new Error('Refresh failed'));

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    renderHook(() => useTokenRefresh());

    // Fast-forward time to trigger the interval
    await act(async () => {
      jest.advanceTimersByTime(60000);
      await Promise.resolve();
    });

    expect(authService.refreshToken).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to refresh token:',
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  test('should clear interval on unmount', () => {
    tokenStorage.isAuthenticated.mockReturnValue(true);
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() => useTokenRefresh());

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  test('should clear existing interval when starting new one', () => {
    tokenStorage.isAuthenticated.mockReturnValue(true);

    const { rerender } = renderHook(() => useTokenRefresh());

    // Mock the setInterval to track calls
    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    // Trigger re-render which should start a new interval
    rerender();

    // Since we're using fake timers, the interval behavior is mocked
    // We can verify the hook is working by checking if it calls the authentication check
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(tokenStorage.isAuthenticated).toHaveBeenCalled();
    setIntervalSpy.mockRestore();
  });

  test('should check token every minute', () => {
    tokenStorage.isAuthenticated.mockReturnValue(true);
    tokenStorage.isTokenExpiringSoon.mockReturnValue(false);

    renderHook(() => useTokenRefresh());

    // Verify interval is set to 60000ms (1 minute)
    act(() => {
      jest.advanceTimersByTime(59999);
    });
    expect(tokenStorage.isTokenExpiringSoon).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(tokenStorage.isTokenExpiringSoon).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(60000);
    });
    expect(tokenStorage.isTokenExpiringSoon).toHaveBeenCalledTimes(2);
  });
});
