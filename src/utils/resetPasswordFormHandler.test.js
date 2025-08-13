import { createResetPasswordFormHandler } from './resetPasswordFormHandler.js';

describe('ResetPasswordFormHandler', () => {
  let mockValidator;
  let mockAuthService;
  let mockNavigationService;
  let formHandler;

  beforeEach(() => {
    mockValidator = {
      validate: jest.fn(),
    };

    mockAuthService = {
      resetPassword: jest.fn(),
    };

    mockNavigationService = {
      navigateToSignIn: jest.fn(),
    };

    formHandler = createResetPasswordFormHandler({
      validator: mockValidator,
      authService: mockAuthService,
      navigationService: mockNavigationService,
    });
  });

  describe('validateForm', () => {
    test('should return validation errors from validator', () => {
      const formData = {
        username: '',
        code: '123456',
        newPassword: 'password123',
        confirmPassword: 'password123',
      };

      const expectedErrors = { username: 'Username is required' };
      mockValidator.validate.mockReturnValue({
        isValid: false,
        errors: expectedErrors,
      });

      const errors = formHandler.validateForm(formData);

      expect(mockValidator.validate).toHaveBeenCalledWith(formData);
      expect(errors).toEqual(expectedErrors);
    });
  });

  describe('isFormValid', () => {
    test('should return true for valid form', () => {
      const formData = {
        username: 'testuser',
        code: '123456',
        newPassword: 'password123',
        confirmPassword: 'password123',
      };

      mockValidator.validate.mockReturnValue({
        isValid: true,
        errors: {},
      });

      const isValid = formHandler.isFormValid(formData);

      expect(mockValidator.validate).toHaveBeenCalledWith(formData);
      expect(isValid).toBe(true);
    });

    test('should return false for invalid form', () => {
      const formData = {
        username: '',
        code: '123456',
        newPassword: 'password123',
        confirmPassword: 'password123',
      };

      mockValidator.validate.mockReturnValue({
        isValid: false,
        errors: { username: 'Username is required' },
      });

      const isValid = formHandler.isFormValid(formData);

      expect(mockValidator.validate).toHaveBeenCalledWith(formData);
      expect(isValid).toBe(false);
    });
  });

  describe('submitForm', () => {
    const validFormData = {
      username: 'testuser',
      code: '123456',
      newPassword: 'password123',
      confirmPassword: 'password123',
    };

    test('should return validation errors if form is invalid', async () => {
      const validationErrors = { username: 'Username is required' };
      mockValidator.validate.mockReturnValue({
        isValid: false,
        errors: validationErrors,
      });

      const result = await formHandler.submitForm(validFormData);

      expect(result).toEqual({
        success: false,
        validationErrors,
      });
      expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
      expect(mockNavigationService.navigateToSignIn).not.toHaveBeenCalled();
    });

    test('should handle successful password reset', async () => {
      mockValidator.validate.mockReturnValue({
        isValid: true,
        errors: {},
      });

      mockAuthService.resetPassword.mockResolvedValue({
        success: true,
      });

      const result = await formHandler.submitForm(validFormData);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        'testuser',
        '123456',
        'password123',
      );
      expect(mockNavigationService.navigateToSignIn).toHaveBeenCalledWith(
        'Password reset successful. Please sign in with your new password.',
      );
      expect(result).toEqual({ success: true });
    });

    test('should handle failed password reset', async () => {
      mockValidator.validate.mockReturnValue({
        isValid: true,
        errors: {},
      });

      mockAuthService.resetPassword.mockResolvedValue({
        success: false,
        error: 'Invalid verification code',
      });

      const result = await formHandler.submitForm(validFormData);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        'testuser',
        '123456',
        'password123',
      );
      expect(mockNavigationService.navigateToSignIn).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'Invalid verification code',
      });
    });

    test('should handle auth service errors', async () => {
      mockValidator.validate.mockReturnValue({
        isValid: true,
        errors: {},
      });

      mockAuthService.resetPassword.mockRejectedValue(
        new Error('Network error'),
      );

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await formHandler.submitForm(validFormData);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        'testuser',
        '123456',
        'password123',
      );
      expect(mockNavigationService.navigateToSignIn).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'An unexpected error occurred',
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Reset password error:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    test('should handle auth result without explicit error message', async () => {
      mockValidator.validate.mockReturnValue({
        isValid: true,
        errors: {},
      });

      mockAuthService.resetPassword.mockResolvedValue({
        success: false,
      });

      const result = await formHandler.submitForm(validFormData);

      expect(result).toEqual({
        success: false,
        error: 'Password reset failed',
      });
    });
  });
});
