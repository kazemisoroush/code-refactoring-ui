/**
 * @typedef {Object} ResetPasswordConfig
 * @property {import('./resetPasswordValidator.js').ResetPasswordValidator} validator - Form validator
 * @property {Object} authService - Authentication service
 * @property {Object} navigationService - Navigation service
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
   * @param {import('../interfaces/auth.js').ResetPasswordFormData} data - Form data to validate
   * @returns {Record<string, string>} Validation errors
   */
  validateForm(data) {
    const result = this.config.validator.validate(data);
    return result.errors;
  }

  /**
   * Checks if form data is valid
   * @param {import('../interfaces/auth.js').ResetPasswordFormData} data - Form data to validate
   * @returns {boolean} Whether form is valid
   */
  isFormValid(data) {
    const result = this.config.validator.validate(data);
    return result.isValid;
  }

  /**
   * Handles form submission
   * @param {import('../interfaces/auth.js').ResetPasswordFormData} data - Form data to submit
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
      const authResult = await this.config.authService.resetPassword(
        data.username,
        data.code,
        data.newPassword,
      );

      if (authResult.success) {
        // Navigate to sign in on success
        this.config.navigationService.navigateToSignIn(
          'Password reset successful. Please sign in with your new password.',
        );
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
