import { createResetPasswordFormHandler } from './resetPasswordFormHandler.js';

describe('ResetPasswordFormHandler', () => {
  let mockValidator;
  let mockResetPassword;
  let mockNavigate;
  let formHandler;

  beforeEach(() => {
    mockValidator = {
      validate: jest.fn(),
    };

    mockResetPassword = jest.fn();
    mockNavigate = jest.fn();

    formHandler = createResetPasswordFormHandler({
      validator: mockValidator,
      resetPassword: mockResetPassword,
      navigate: mockNavigate,
    });
  });

  describe('validateForm', () => {
    test('should return validation errors from validator', () => {
      const formData = {
        email: '',
        code: '123456',
        newPassword: 'password123',
        confirmPassword: 'password123',
      };

      const expectedErrors = { email: 'Email is required' };
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
        email: 'test@example.com',
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
        email: '',
        code: '123456',
        newPassword: 'password123',
        confirmPassword: 'password123',
      };

      mockValidator.validate.mockReturnValue({
        isValid: false,
        errors: { email: 'Email is required' },
      });

      const isValid = formHandler.isFormValid(formData);

      expect(mockValidator.validate).toHaveBeenCalledWith(formData);
      expect(isValid).toBe(false);
    });
  });

  describe('submitForm', () => {
    const validFormData = {
      email: 'test@example.com',
      code: '123456',
      newPassword: 'password123',
      confirmPassword: 'password123',
    };

    test('should return validation errors if form is invalid', async () => {
      const validationErrors = { email: 'Email is required' };
      mockValidator.validate.mockReturnValue({
        isValid: false,
        errors: validationErrors,
      });

      const result = await formHandler.submitForm(validFormData);

      expect(result).toEqual({
        success: false,
        validationErrors,
      });

      expect(mockResetPassword).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('should handle successful password reset', async () => {
      mockValidator.validate.mockReturnValue({ isValid: true, errors: {} });
      mockResetPassword.mockResolvedValue({
        success: true,
      });

      const result = await formHandler.submitForm(validFormData);

      expect(mockResetPassword).toHaveBeenCalledWith(
        'test@example.com',
        '123456',
        'password123',
      );
      expect(mockNavigate).toHaveBeenCalledWith('/auth/signin', {
        state: {
          message:
            'Password reset successful. Please sign in with your new password.',
        },
      });
      expect(result).toEqual({ success: true });
    });

    test('should handle failed password reset', async () => {
      mockValidator.validate.mockReturnValue({ isValid: true, errors: {} });
      mockResetPassword.mockResolvedValue({
        success: false,
        error: 'Invalid code',
      });

      const result = await formHandler.submitForm(validFormData);

      expect(mockResetPassword).toHaveBeenCalledWith(
        'test@example.com',
        '123456',
        'password123',
      );
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'Invalid code',
      });
    });

    test('should handle unexpected errors', async () => {
      mockValidator.validate.mockReturnValue({ isValid: true, errors: {} });
      mockResetPassword.mockRejectedValue(new Error('Network error'));

      const result = await formHandler.submitForm(validFormData);

      expect(mockResetPassword).toHaveBeenCalledWith(
        'test@example.com',
        '123456',
        'password123',
      );
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'An unexpected error occurred',
      });
    });

    test('should handle auth result without error message', async () => {
      mockValidator.validate.mockReturnValue({ isValid: true, errors: {} });
      mockResetPassword.mockResolvedValue({
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
