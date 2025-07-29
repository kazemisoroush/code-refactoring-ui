import { Auth } from 'aws-amplify';

export class AuthService {
  // Sign in user
  async signIn(username, password) {
    try {
      const user = await Auth.signIn(username, password);
      return {
        success: true,
        user,
        message: 'Sign in successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
      };
    }
  }

  // Sign up user
  async signUp(username, password, email) {
    try {
      const result = await Auth.signUp({
        username,
        password,
        attributes: {
          email,
        },
      });
      return {
        success: true,
        user: result.user,
        userSub: result.userSub,
        message:
          'Sign up successful. Please check your email for verification.',
      };
    } catch (error) {
      return {
        success: false,
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
      };
    }
  }

  // Confirm sign up with verification code
  async confirmSignUp(username, code) {
    try {
      await Auth.confirmSignUp(username, code);
      return {
        success: true,
        message: 'Account verified successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
      };
    }
  }

  // Sign out user
  async signOut() {
    try {
      await Auth.signOut();
      return {
        success: true,
        message: 'Sign out successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
      };
    }
  }

  // Forgot password
  async forgotPassword(username) {
    try {
      await Auth.forgotPassword(username);
      return {
        success: true,
        message: 'Password reset code sent to your email',
      };
    } catch (error) {
      return {
        success: false,
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
      };
    }
  }

  // Confirm forgot password
  async forgotPasswordSubmit(username, code, newPassword) {
    try {
      await Auth.forgotPasswordSubmit(username, code, newPassword);
      return {
        success: true,
        message: 'Password reset successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
      };
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const user = await Auth.currentAuthenticatedUser();
      return {
        success: true,
        user,
        isAuthenticated: true,
      };
    } catch (error) {
      return {
        success: false,
        user: null,
        isAuthenticated: false,
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'User not authenticated',
      };
    }
  }

  // Resend confirmation code
  async resendConfirmationCode(username) {
    try {
      await Auth.resendSignUp(username);
      return {
        success: true,
        message: 'Confirmation code resent',
      };
    } catch (error) {
      return {
        success: false,
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
      };
    }
  }
}

// Create a singleton instance
export const authService = new AuthService();
