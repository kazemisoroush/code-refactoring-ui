/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the validation passed
 * @property {Record<string, string>} errors - Validation error messages by field
 */

/**
 * @typedef {Object} ResetPasswordFormData
 * @property {string} username - Username for password reset
 * @property {string} code - Verification code from email
 * @property {string} newPassword - New password
 * @property {string} confirmPassword - Password confirmation
 */

/**
 * @typedef {Object} AuthResult
 * @property {boolean} success - Whether the operation was successful
 * @property {string} [error] - Error message if operation failed
 */

/**
 * Interface for form validation (implemented as class)
 * @interface FormValidator
 */

/**
 * Interface for authentication services (implemented as class)
 * @interface AuthService
 */

/**
 * Interface for navigation services (implemented as class)
 * @interface NavigationService
 */
