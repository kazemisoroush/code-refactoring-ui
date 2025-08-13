import { createResetPasswordValidator } from './resetPasswordValidator.js';

describe('ResetPasswordValidator', () => {
  let validator;

  beforeEach(() => {
    validator = createResetPasswordValidator();
  });

  describe('username validation', () => {
    test('should require username', () => {
      const data = {
        username: '',
        code: '123456',
        newPassword: 'password123',
        confirmPassword: 'password123',
      };

      const result = validator.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBe('Username is required');
    });

    test('should require non-whitespace username', () => {
      const data = {
        username: '   ',
        code: '123456',
        newPassword: 'password123',
        confirmPassword: 'password123',
      };

      const result = validator.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBe('Username is required');
    });

    test('should accept valid username', () => {
      const data = {
        username: 'testuser',
        code: '123456',
        newPassword: 'password123',
        confirmPassword: 'password123',
      };

      const result = validator.validate(data);

      expect(result.errors.username).toBeUndefined();
    });
  });

  describe('verification code validation', () => {
    test('should require verification code', () => {
      const data = {
        username: 'testuser',
        code: '',
        newPassword: 'password123',
        confirmPassword: 'password123',
      };

      const result = validator.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.code).toBe('Verification code is required');
    });

    test('should accept valid verification code', () => {
      const data = {
        username: 'testuser',
        code: '123456',
        newPassword: 'password123',
        confirmPassword: 'password123',
      };

      const result = validator.validate(data);

      expect(result.errors.code).toBeUndefined();
    });
  });

  describe('password validation', () => {
    test('should require new password', () => {
      const data = {
        username: 'testuser',
        code: '123456',
        newPassword: '',
        confirmPassword: 'password123',
      };

      const result = validator.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.newPassword).toBe('New password is required');
    });

    test('should enforce minimum password length', () => {
      const data = {
        username: 'testuser',
        code: '123456',
        newPassword: '123',
        confirmPassword: '123',
      };

      const result = validator.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.newPassword).toBe(
        'Password must be at least 8 characters',
      );
    });

    test('should require password confirmation', () => {
      const data = {
        username: 'testuser',
        code: '123456',
        newPassword: 'password123',
        confirmPassword: '',
      };

      const result = validator.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toBe(
        'Please confirm your password',
      );
    });

    test('should require passwords to match', () => {
      const data = {
        username: 'testuser',
        code: '123456',
        newPassword: 'password123',
        confirmPassword: 'different123',
      };

      const result = validator.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toBe('Passwords do not match');
    });

    test('should accept valid matching passwords', () => {
      const data = {
        username: 'testuser',
        code: '123456',
        newPassword: 'password123',
        confirmPassword: 'password123',
      };

      const result = validator.validate(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe('overall validation', () => {
    test('should return valid result for complete valid data', () => {
      const data = {
        username: 'testuser',
        code: '123456',
        newPassword: 'password123',
        confirmPassword: 'password123',
      };

      const result = validator.validate(data);

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('should return all validation errors for invalid data', () => {
      const data = {
        username: '',
        code: '',
        newPassword: '',
        confirmPassword: '',
      };

      const result = validator.validate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBeDefined();
      expect(result.errors.code).toBeDefined();
      expect(result.errors.newPassword).toBeDefined();
      expect(result.errors.confirmPassword).toBeDefined();
    });
  });
});
