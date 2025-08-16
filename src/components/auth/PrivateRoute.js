import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * PrivateRoute component that protects routes requiring authentication
 * Redirects to login page if user is not authenticated
 */
export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Center height="100vh">
        <Box>
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Box>
      </Center>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate to="/auth/signin" state={{ from: location.pathname }} replace />
    );
  }

  // Render protected content if authenticated
  return children;
};
