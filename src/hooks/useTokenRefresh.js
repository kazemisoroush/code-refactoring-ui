import { useEffect, useRef } from 'react';
import { tokenStorage } from '../utils/tokenStorage';
import { authService } from '../services/authService';

/**
 * Hook that handles automatic token refresh when token is about to expire
 */
export const useTokenRefresh = () => {
  const refreshIntervalRef = useRef(null);

  const startTokenRefreshCheck = () => {
    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Check token expiration every minute
    refreshIntervalRef.current = setInterval(() => {
      if (
        tokenStorage.isAuthenticated() &&
        tokenStorage.isTokenExpiringSoon()
      ) {
        refreshToken();
      }
    }, 60000); // Check every minute
  };

  const stopTokenRefreshCheck = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  const refreshToken = async () => {
    try {
      await authService.refreshToken();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Token refresh failed, user will be redirected to login by the apiClient
    }
  };

  useEffect(() => {
    // Start token refresh checking if user is authenticated
    if (tokenStorage.isAuthenticated()) {
      startTokenRefreshCheck();
    }

    // Cleanup on unmount
    return () => {
      stopTokenRefreshCheck();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    startTokenRefreshCheck,
    stopTokenRefreshCheck,
  };
};
