// Configuration for AWS Cognito
export const cognitoConfig = {
  region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
  userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || '',
  userPoolWebClientId:
    process.env.REACT_APP_COGNITO_USER_POOL_WEB_CLIENT_ID || '',
  authenticationFlowType: 'USER_SRP_AUTH',
  cookieStorage: {
    domain: process.env.REACT_APP_COOKIE_DOMAIN || 'localhost',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: 365,
    sameSite: 'strict',
  },
};

export const amplifyConfig = {
  Auth: {
    region: cognitoConfig.region,
    userPoolId: cognitoConfig.userPoolId,
    userPoolWebClientId: cognitoConfig.userPoolWebClientId,
    authenticationFlowType: cognitoConfig.authenticationFlowType,
    cookieStorage: cognitoConfig.cookieStorage,
  },
};

// Validation function for configuration
export const validateCognitoConfig = () => {
  const errors = [];

  if (!cognitoConfig.userPoolId) {
    errors.push('REACT_APP_COGNITO_USER_POOL_ID is required');
  }

  if (!cognitoConfig.userPoolWebClientId) {
    errors.push('REACT_APP_COGNITO_USER_POOL_WEB_CLIENT_ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
