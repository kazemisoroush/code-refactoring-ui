/**
 * Password reset form validator implementation
 * This class encapsulates all validation logic and can be easily tested
 */
export class ResetPasswordValidator {
  /**
   * Validates reset password form data
   * @param {import('../interfaces/auth.js').ResetPasswordFormData} data - Form data to validate
   * @returns {import('../interfaces/auth.js').ValidationResult} Validation result
   */
  validate(data) {
    const errors = {};

    if (!data.username?.trim()) {
      errors.username = 'Username is required';
    }

    if (!data.code?.trim()) {
      errors.code = 'Verification code is required';
    }

    if (!data.newPassword?.trim()) {
      errors.newPassword = 'New password is required';
    } else if (data.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (!data.confirmPassword?.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

/**
 * Factory function to create password reset validator
 * This can be easily mocked for testing
 * @returns {ResetPasswordValidator} Validator instance
 */
export const createResetPasswordValidator = () => {
  return new ResetPasswordValidator();
};
