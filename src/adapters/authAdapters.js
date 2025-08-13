/**
 * Adapter for the existing useAuth hook to implement AuthService interface
 */
export class AuthContextAdapter {
  /**
   * @param {Object} authContext - Auth context with resetPassword method
   */
  constructor(authContext) {
    this.authContext = authContext;
  }

  /**
   * Reset user password
   * @param {string} username - Username
   * @param {string} code - Verification code
   * @param {string} newPassword - New password
   * @returns {Promise<import('../interfaces/auth.js').AuthResult>} Auth result
   */
  async resetPassword(username, code, newPassword) {
    return this.authContext.resetPassword(username, code, newPassword);
  }
}

/**
 * Adapter for React Router navigation to implement NavigationService interface
 */
export class ReactRouterNavigationAdapter {
  /**
   * @param {Function} navigate - React Router navigate function
   */
  constructor(navigate) {
    this.navigate = navigate;
  }

  /**
   * Navigate to sign in page
   * @param {string} [message] - Optional message to pass
   */
  navigateToSignIn(message) {
    this.navigate('/auth/signin', {
      state: message ? { message } : undefined,
    });
  }
}

/**
 * Factory function for creating auth context adapter
 * @param {any} authContext - Auth context object
 * @returns {AuthContextAdapter} Auth service adapter
 */
export const createAuthContextAdapter = (authContext) => {
  return new AuthContextAdapter(authContext);
};

/**
 * Factory function for creating React Router navigation adapter
 * @param {any} navigate - Navigate function
 * @returns {ReactRouterNavigationAdapter} Navigation service adapter
 */
export const createReactRouterNavigationAdapter = (navigate) => {
  return new ReactRouterNavigationAdapter(navigate);
};
