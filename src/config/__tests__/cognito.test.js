import {
  cognitoConfig,
  amplifyConfig,
  validateCognitoConfig,
} from '../cognito';

describe('Cognito Configuration', () => {
  describe('cognitoConfig', () => {
    it('should use default region when REACT_APP_AWS_REGION is not set', () => {
      expect(cognitoConfig.region).toBe('us-east-1');
    });

    it('should have correct authentication flow type', () => {
      expect(cognitoConfig.authenticationFlowType).toBe('USER_SRP_AUTH');
    });

    it('should configure cookie storage correctly', () => {
      expect(cognitoConfig.cookieStorage).toEqual({
        domain: 'localhost',
        secure: false, // NODE_ENV is test, not production
        path: '/',
        expires: 365,
        sameSite: 'strict',
      });
    });
  });

  describe('amplifyConfig', () => {
    it('should structure config correctly for Amplify', () => {
      expect(amplifyConfig).toHaveProperty('Auth');
      expect(amplifyConfig.Auth).toEqual({
        region: cognitoConfig.region,
        userPoolId: cognitoConfig.userPoolId,
        userPoolWebClientId: cognitoConfig.userPoolWebClientId,
        authenticationFlowType: cognitoConfig.authenticationFlowType,
        cookieStorage: cognitoConfig.cookieStorage,
      });
    });
  });

  describe('validateCognitoConfig', () => {
    it('should return invalid when required fields are missing', () => {
      const result = validateCognitoConfig();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'REACT_APP_COGNITO_USER_POOL_ID is required',
      );
      expect(result.errors).toContain(
        'REACT_APP_COGNITO_USER_POOL_WEB_CLIENT_ID is required',
      );
    });
  });
});
