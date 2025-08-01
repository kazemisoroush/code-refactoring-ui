import { AuthService } from './authService';
import { Auth } from 'aws-amplify';

// Mock AWS Amplify Auth
jest.mock('aws-amplify', () => ({
  Auth: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    confirmSignUp: jest.fn(),
    signOut: jest.fn(),
    forgotPassword: jest.fn(),
    forgotPasswordSubmit: jest.fn(),
    currentAuthenticatedUser: jest.fn(),
    resendSignUp: jest.fn(),
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
      const mockUser = {
        username: 'testuser',
        attributes: { email: 'test@example.com' },
      };
      Auth.signIn.mockResolvedValue(mockUser);

      const result = await authService.signIn('testuser', 'password123');

      expect(Auth.signIn).toHaveBeenCalledWith('testuser', 'password123');
      expect(result).toEqual({
        success: true,
        user: mockUser,
        message: 'Sign in successful',
      });
    });

    it('should return error when sign in fails', async () => {
      const mockError = {
        code: 'NotAuthorizedException',
        message: 'Incorrect username or password.',
      };
      Auth.signIn.mockRejectedValue(mockError);

      const result = await authService.signIn('testuser', 'wrongpassword');

      expect(result).toEqual({
        success: false,
        error: 'NotAuthorizedException',
        message: 'Incorrect username or password.',
      });
    });
  });

  describe('signUp', () => {
    it('should return success when sign up is successful', async () => {
      const mockResult = {
        user: { username: 'testuser' },
        userSub: 'user-sub-id',
      };
      Auth.signUp.mockResolvedValue(mockResult);

      const result = await authService.signUp(
        'testuser',
        'password123',
        'test@example.com',
      );

      expect(Auth.signUp).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
        attributes: {
          email: 'test@example.com',
        },
      });
      expect(result).toEqual({
        success: true,
        user: mockResult.user,
        userSub: mockResult.userSub,
        message:
          'Sign up successful. Please check your email for verification.',
      });
    });

    it('should return error when sign up fails', async () => {
      const mockError = {
        code: 'UsernameExistsException',
        message: 'An account with the given email already exists.',
      };
      Auth.signUp.mockRejectedValue(mockError);

      const result = await authService.signUp(
        'testuser',
        'password123',
        'test@example.com',
      );

      expect(result).toEqual({
        success: false,
        error: 'UsernameExistsException',
        message: 'An account with the given email already exists.',
      });
    });
  });

  describe('confirmSignUp', () => {
    it('should return success when confirmation is successful', async () => {
      Auth.confirmSignUp.mockResolvedValue();

      const result = await authService.confirmSignUp('testuser', '123456');

      expect(Auth.confirmSignUp).toHaveBeenCalledWith('testuser', '123456');
      expect(result).toEqual({
        success: true,
        message: 'Account verified successfully',
      });
    });

    it('should return error when confirmation fails', async () => {
      const mockError = {
        code: 'CodeMismatchException',
        message: 'Invalid verification code provided, please try again.',
      };
      Auth.confirmSignUp.mockRejectedValue(mockError);

      const result = await authService.confirmSignUp('testuser', '000000');

      expect(result).toEqual({
        success: false,
        error: 'CodeMismatchException',
        message: 'Invalid verification code provided, please try again.',
      });
    });
  });

  describe('signOut', () => {
    it('should return success when sign out is successful', async () => {
      Auth.signOut.mockResolvedValue();

      const result = await authService.signOut();

      expect(Auth.signOut).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Sign out successful',
      });
    });
  });

  describe('forgotPassword', () => {
    it('should return success when forgot password is successful', async () => {
      Auth.forgotPassword.mockResolvedValue();

      const result = await authService.forgotPassword('testuser');

      expect(Auth.forgotPassword).toHaveBeenCalledWith('testuser');
      expect(result).toEqual({
        success: true,
        message: 'Password reset code sent to your email',
      });
    });
  });

  describe('forgotPasswordSubmit', () => {
    it('should return success when password reset is successful', async () => {
      Auth.forgotPasswordSubmit.mockResolvedValue();

      const result = await authService.forgotPasswordSubmit(
        'testuser',
        '123456',
        'newpassword123',
      );

      expect(Auth.forgotPasswordSubmit).toHaveBeenCalledWith(
        'testuser',
        '123456',
        'newpassword123',
      );
      expect(result).toEqual({
        success: true,
        message: 'Password reset successful',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when authenticated', async () => {
      const mockUser = {
        username: 'testuser',
        attributes: { email: 'test@example.com' },
      };
      Auth.currentAuthenticatedUser.mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser();

      expect(result).toEqual({
        success: true,
        user: mockUser,
        isAuthenticated: true,
      });
    });

    it('should return not authenticated when user is not signed in', async () => {
      const mockError = {
        code: 'UserUnAuthenticated',
        message: 'The user is not authenticated',
      };
      Auth.currentAuthenticatedUser.mockRejectedValue(mockError);

      const result = await authService.getCurrentUser();

      expect(result).toEqual({
        success: false,
        user: null,
        isAuthenticated: false,
        error: 'UserUnAuthenticated',
        message: 'The user is not authenticated',
      });
    });
  });

  describe('resendConfirmationCode', () => {
    it('should return success when resend is successful', async () => {
      Auth.resendSignUp.mockResolvedValue();

      const result = await authService.resendConfirmationCode('testuser');

      expect(Auth.resendSignUp).toHaveBeenCalledWith('testuser');
      expect(result).toEqual({
        success: true,
        message: 'Confirmation code resent',
      });
    });
  });
});
