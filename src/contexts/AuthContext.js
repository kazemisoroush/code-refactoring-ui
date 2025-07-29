import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

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

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    dispatch({ type: authActions.SET_LOADING, payload: true });

    try {
      const result = await authService.getCurrentUser();
      if (result.success && result.isAuthenticated) {
        dispatch({ type: authActions.LOGIN_SUCCESS, payload: result.user });
      } else {
        dispatch({ type: authActions.LOGOUT });
      }
    } catch (error) {
      dispatch({ type: authActions.LOGOUT });
    }
  };

  const login = async (username, password) => {
    dispatch({ type: authActions.SET_LOADING, payload: true });
    dispatch({ type: authActions.CLEAR_ERROR });

    try {
      const result = await authService.signIn(username, password);
      if (result.success) {
        dispatch({ type: authActions.LOGIN_SUCCESS, payload: result.user });
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
      return { success: true };
    } catch (error) {
      // Even if logout fails on server, clear local state
      dispatch({ type: authActions.LOGOUT });
      return { success: true };
    }
  };

  const signup = async (username, password, email) => {
    dispatch({ type: authActions.SET_LOADING, payload: true });
    dispatch({ type: authActions.CLEAR_ERROR });

    try {
      const result = await authService.signUp(username, password, email);
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

  const confirmSignUp = async (username, code) => {
    dispatch({ type: authActions.SET_LOADING, payload: true });
    dispatch({ type: authActions.CLEAR_ERROR });

    try {
      const result = await authService.confirmSignUp(username, code);
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

  const forgotPassword = async (username) => {
    dispatch({ type: authActions.SET_LOADING, payload: true });
    dispatch({ type: authActions.CLEAR_ERROR });

    try {
      const result = await authService.forgotPassword(username);
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

  const resetPassword = async (username, code, newPassword) => {
    dispatch({ type: authActions.SET_LOADING, payload: true });
    dispatch({ type: authActions.CLEAR_ERROR });

    try {
      const result = await authService.forgotPasswordSubmit(
        username,
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
