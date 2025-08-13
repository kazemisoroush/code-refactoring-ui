import { apiClient } from '../utils/apiClient';
import { tokenStorage } from '../utils/tokenStorage';

export class AuthService {
  // Sign in user
  async signIn(username, password) {
    try {
      const response = await apiClient.post('/auth/signin', {
        username,
        password,
      });

      if (!response.ok) {
        const errorMessage = await apiClient.handleError(response);
        return {
          success: false,
          message: errorMessage,
        };
      }

      const data = await apiClient.handleResponse(response);

      // Store tokens and user data
      if (data.access_token) {
        tokenStorage.setToken(data.access_token);
      }
      if (data.refresh_token) {
        tokenStorage.setRefreshToken(data.refresh_token);
      }
      if (data.user) {
        tokenStorage.setUser(data.user);
      }

      return {
        success: true,
        user: data.user,
        message: 'Sign in successful',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An unexpected error occurred during login',
      };
    }
  }

  // Sign up user
  async signUp(username, password, email) {
    try {
      const response = await apiClient.post('/auth/signup', {
        username,
        password,
        email,
      });

      if (!response.ok) {
        const errorMessage = await apiClient.handleError(response);
        return {
          success: false,
          message: errorMessage,
        };
      }

      const data = await apiClient.handleResponse(response);

      // Store tokens and user data if provided (some APIs might auto-login after signup)
      if (data.access_token) {
        tokenStorage.setToken(data.access_token);
      }
      if (data.refresh_token) {
        tokenStorage.setRefreshToken(data.refresh_token);
      }
      if (data.user) {
        tokenStorage.setUser(data.user);
      }

      return {
        success: true,
        user: data.user,
        userSub: data.user_id,
        message:
          data.message ||
          'Sign up successful. Please check your email for verification.',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An unexpected error occurred during signup',
      };
    }
  }

  // Confirm sign up with verification code (if needed by the API)
  async confirmSignUp(username, code) {
    try {
      // This endpoint might not exist in the current API, but keeping for compatibility
      const response = await apiClient.post('/auth/confirm', {
        username,
        code,
      });

      if (!response.ok) {
        const errorMessage = await apiClient.handleError(response);
        return {
          success: false,
          message: errorMessage,
        };
      }

      return {
        success: true,
        message: 'Account verified successfully',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || 'An unexpected error occurred during confirmation',
      };
    }
  }

  // Sign out user
  async signOut() {
    try {
      const token = tokenStorage.getToken();

      if (token) {
        // Call the API signout endpoint
        const response = await apiClient.post('/auth/signout', {
          access_token: token,
        });

        // Even if the API call fails, we should clear local tokens
        if (!response.ok) {
          console.warn('Server signout failed, but clearing local tokens');
        }
      }

      // Clear all local authentication data
      tokenStorage.clearAll();

      return {
        success: true,
        message: 'Sign out successful',
      };
    } catch (error) {
      // Even if signout fails on server, clear local state
      tokenStorage.clearAll();
      return {
        success: true,
        message: 'Sign out successful',
      };
    }
  }

  // Forgot password
  async forgotPassword(username) {
    try {
      // This endpoint might not exist in the current API, but keeping for compatibility
      const response = await apiClient.post('/auth/forgot-password', {
        username,
      });

      if (!response.ok) {
        const errorMessage = await apiClient.handleError(response);
        return {
          success: false,
          message: errorMessage,
        };
      }

      const data = await apiClient.handleResponse(response);

      return {
        success: true,
        message: data.message || 'Password reset code sent to your email',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
      };
    }
  }

  // Confirm forgot password
  async forgotPasswordSubmit(username, code, newPassword) {
    try {
      // This endpoint might not exist in the current API, but keeping for compatibility
      const response = await apiClient.post('/auth/reset-password', {
        username,
        code,
        new_password: newPassword,
      });

      if (!response.ok) {
        const errorMessage = await apiClient.handleError(response);
        return {
          success: false,
          message: errorMessage,
        };
      }

      return {
        success: true,
        message: 'Password reset successful',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || 'An unexpected error occurred during password reset',
      };
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      // Check if we have a valid token
      if (!tokenStorage.isAuthenticated()) {
        return {
          success: false,
          user: null,
          isAuthenticated: false,
          message: 'User not authenticated',
        };
      }

      // Get user data from storage
      const user = tokenStorage.getUser();

      if (user) {
        return {
          success: true,
          user,
          isAuthenticated: true,
        };
      }

      // If no user data in storage, try to fetch from API
      const response = await apiClient.get('/auth/me');

      if (!response.ok) {
        // Token might be invalid
        tokenStorage.clearAll();
        return {
          success: false,
          user: null,
          isAuthenticated: false,
          message: 'User not authenticated',
        };
      }

      const userData = await apiClient.handleResponse(response);

      // Store the user data
      tokenStorage.setUser(userData.user);

      return {
        success: true,
        user: userData.user,
        isAuthenticated: true,
      };
    } catch (error) {
      // Clear tokens if there's an error
      tokenStorage.clearAll();
      return {
        success: false,
        user: null,
        isAuthenticated: false,
        message: error.message || 'User not authenticated',
      };
    }
  }

  // Refresh access token
  async refreshToken() {
    try {
      const newToken = await apiClient.refreshAccessToken();
      return {
        success: true,
        access_token: newToken,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Token refresh failed',
      };
    }
  }
}

// Create a singleton instance
export const authService = new AuthService();
