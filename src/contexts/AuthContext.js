import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { useTokenRefresh } from '../hooks/useTokenRefresh';

// Authentication state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Authentication actions
export const authActions = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Authentication reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case authActions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case authActions.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case authActions.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case authActions.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case authActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { startTokenRefreshCheck, stopTokenRefreshCheck } = useTokenRefresh();

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthState();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuthState = async () => {
    dispatch({ type: authActions.SET_LOADING, payload: true });

    try {
      const result = await authService.getCurrentUser();
      if (result.success && result.isAuthenticated) {
        dispatch({ type: authActions.LOGIN_SUCCESS, payload: result.user });
        // Start token refresh checking for authenticated users
        startTokenRefreshCheck();
      } else {
        dispatch({ type: authActions.LOGOUT });
        stopTokenRefreshCheck();
      }
    } catch (error) {
      dispatch({ type: authActions.LOGOUT });
      stopTokenRefreshCheck();
    }
  };

  const login = async (email, password) => {
    dispatch({ type: authActions.SET_LOADING, payload: true });
    dispatch({ type: authActions.CLEAR_ERROR });

    try {
      const result = await authService.signIn(email, password);
      if (result.success) {
        dispatch({ type: authActions.LOGIN_SUCCESS, payload: result.user });
        // Start token refresh checking after successful login
        startTokenRefreshCheck();
        return result;
      } else {
        dispatch({ type: authActions.LOGIN_FAILURE, payload: result.message });
        return result;
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during login';
      dispatch({ type: authActions.LOGIN_FAILURE, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    dispatch({ type: authActions.SET_LOADING, payload: true });

    try {
      await authService.signOut();
      dispatch({ type: authActions.LOGOUT });
      // Stop token refresh checking after logout
      stopTokenRefreshCheck();
      return { success: true };
    } catch (error) {
      // Even if logout fails on server, clear local state
      dispatch({ type: authActions.LOGOUT });
      stopTokenRefreshCheck();
      return { success: true };
    }
  };

  const signup = async (email, password) => {
    dispatch({ type: authActions.SET_LOADING, payload: true });
    dispatch({ type: authActions.CLEAR_ERROR });

    try {
      const result = await authService.signUp(email, password);
      dispatch({ type: authActions.SET_LOADING, payload: false });

      if (!result.success) {
        dispatch({ type: authActions.SET_ERROR, payload: result.message });
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during signup';
      dispatch({ type: authActions.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const confirmSignUp = async (email, code) => {
    dispatch({ type: authActions.SET_LOADING, payload: true });
    dispatch({ type: authActions.CLEAR_ERROR });

    try {
      const result = await authService.confirmSignUp(email, code);
      dispatch({ type: authActions.SET_LOADING, payload: false });

      if (!result.success) {
        dispatch({ type: authActions.SET_ERROR, payload: result.message });
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during confirmation';
      dispatch({ type: authActions.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const forgotPassword = async (email) => {
    dispatch({ type: authActions.SET_LOADING, payload: true });
    dispatch({ type: authActions.CLEAR_ERROR });

    try {
      const result = await authService.forgotPassword(email);
      dispatch({ type: authActions.SET_LOADING, payload: false });

      if (!result.success) {
        dispatch({ type: authActions.SET_ERROR, payload: result.message });
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      dispatch({ type: authActions.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    dispatch({ type: authActions.SET_LOADING, payload: true });
    dispatch({ type: authActions.CLEAR_ERROR });

    try {
      const result = await authService.forgotPasswordSubmit(
        email,
        code,
        newPassword,
      );
      dispatch({ type: authActions.SET_LOADING, payload: false });

      if (!result.success) {
        dispatch({ type: authActions.SET_ERROR, payload: result.message });
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during password reset';
      dispatch({ type: authActions.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: authActions.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    logout,
    signup,
    confirmSignUp,
    forgotPassword,
    resetPassword,
    clearError,
    checkAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
