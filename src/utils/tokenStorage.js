/**
 * Token storage utility for managing JWT tokens
 * Uses localStorage with encryption for security
 */

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

class TokenStorage {
  /**
   * Store access token
   * @param {string} token - JWT access token
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  /**
   * Get access token
   * @returns {string|null} JWT access token
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Store refresh token
   * @param {string} refreshToken - JWT refresh token
   */
  setRefreshToken(refreshToken) {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  /**
   * Get refresh token
   * @returns {string|null} JWT refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Store user data
   * @param {object} user - User data object
   */
  setUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  /**
   * Get user data
   * @returns {object|null} User data object
   */
  getUser() {
    const userData = localStorage.getItem(USER_KEY);
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Clear all stored authentication data
   */
  clearAll() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Check if user is authenticated (has valid token)
   * @returns {boolean} True if user has a token
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic JWT expiration check
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // Return false if token is expired
      if (payload.exp && payload.exp < currentTime) {
        return false;
      }

      return true;
    } catch (error) {
      // If we can't parse the token, assume it's invalid
      console.error('Error parsing token:', error);
      return false;
    }
  }

  /**
   * Check if token is about to expire (within 5 minutes)
   * @returns {boolean} True if token expires soon
   */
  isTokenExpiringSoon() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const fiveMinutesFromNow = currentTime + 5 * 60; // 5 minutes

      return payload.exp && payload.exp < fiveMinutesFromNow;
    } catch (error) {
      return false;
    }
  }
}

export const tokenStorage = new TokenStorage();
