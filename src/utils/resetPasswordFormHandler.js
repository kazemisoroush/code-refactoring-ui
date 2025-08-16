/**
 * @typedef {Object} ResetPasswordFormData
 * @property {string} username - Username for password reset
 * @property {string} code - Verification code from email
 * @property {string} newPassword - New password
 * @property {string} confirmPassword - Password confirmation
 */

/**
 * @typedef {Object} ResetPasswordConfig
 * @property {import('./resetPasswordValidator.js').ResetPasswordValidator} validator - Form validator
 * @property {Function} resetPassword - Reset password function from AuthContext
 * @property {Function} navigate - Navigate function from React Router
 */

/**
 * @typedef {Object} FormSubmissionResult
 * @property {boolean} success - Whether submission was successful
 * @property {Record<string, string>} [validationErrors] - Validation errors if any
 * @property {string} [error] - General error message if any
 */

/**
 * Reset password form logic handler
 * This class contains all the business logic for password reset form
 * It's designed to be easily testable with dependency injection
 */
export class ResetPasswordFormHandler {
  /**
   * @param {ResetPasswordConfig} config - Configuration object with dependencies
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * Validates form data
   * @param {ResetPasswordFormData} data - Form data to validate
   * @returns {Record<string, string>} Validation errors
   */
  validateForm(data) {
    const result = this.config.validator.validate(data);
    return result.errors;
  }

  /**
   * Checks if form data is valid
   * @param {ResetPasswordFormData} data - Form data to validate
   * @returns {boolean} Whether form is valid
   */
  isFormValid(data) {
    const result = this.config.validator.validate(data);
    return result.isValid;
  }

  /**
   * Handles form submission
   * @param {ResetPasswordFormData} data - Form data to submit
   * @returns {Promise<FormSubmissionResult>} Submission result
   */
  async submitForm(data) {
    // Validate form first
    const validationResult = this.config.validator.validate(data);
    if (!validationResult.isValid) {
      return {
        success: false,
        validationErrors: validationResult.errors,
      };
    }

    try {
      // Attempt password reset
      const authResult = await this.config.resetPassword(
        data.email,
        data.code,
        data.newPassword,
      );

      if (authResult.success) {
        // Navigate to sign in on success
        this.config.navigate('/auth/signin', {
          state: {
            message:
              'Password reset successful. Please sign in with your new password.',
          },
        });
        return { success: true };
      } else {
        return {
          success: false,
          error: authResult.error || 'Password reset failed',
        };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }
}

/**
 * Factory function to create reset password form handler
 * This can be easily mocked for testing
 * @param {ResetPasswordConfig} config - Configuration object
 * @returns {ResetPasswordFormHandler} Form handler instance
 */
export const createResetPasswordFormHandler = (config) => {
  return new ResetPasswordFormHandler(config);
};
