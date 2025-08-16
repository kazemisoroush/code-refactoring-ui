import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

export const ForgotPassword = () => {
  const { forgotPassword, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear auth error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await forgotPassword(formData.email);

      if (result.success) {
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = isLoading || isSubmitting;

  if (isSubmitted) {
    return (
      <Box
        maxWidth="400px"
        margin="auto"
        mt={8}
        p={6}
        bg={bgColor}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
        boxShadow="lg"
      >
        <VStack spacing={6}>
          <Heading size="lg" textAlign="center">
            Check Your Email
          </Heading>

          <Alert status="success" borderRadius="md">
            <AlertIcon />
            If an account with that email exists, we&apos;ve sent you password
            reset instructions.
          </Alert>

          <VStack spacing={2} textAlign="center">
            <Text fontSize="sm">
              Remember your password?{' '}
              <Link
                to="/auth/signin"
                style={{ color: 'blue', textDecoration: 'underline' }}
              >
                Sign In
              </Link>
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      maxWidth="400px"
      margin="auto"
      mt={8}
      p={6}
      bg={bgColor}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
      boxShadow="lg"
    >
      <VStack spacing={6}>
        <Heading size="lg" textAlign="center">
          Forgot Password
        </Heading>

        <Text fontSize="sm" textAlign="center" color="gray.600">
          Enter your email address and we&apos;ll send you instructions to reset
          your password.
        </Text>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Box as="form" width="100%" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!formErrors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                autoComplete="email"
              />
              <FormErrorMessage>{formErrors.email}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={loading}
              loadingText="Sending..."
              isDisabled={loading}
            >
              Send Reset Instructions
            </Button>
          </VStack>
        </Box>

        <VStack spacing={2} textAlign="center">
          <Text fontSize="sm">
            Remember your password?{' '}
            <Link
              to="/auth/signin"
              style={{ color: 'blue', textDecoration: 'underline' }}
            >
              Sign In
            </Link>
          </Text>
          <Text fontSize="sm">
            Don&apos;t have an account?{' '}
            <Link
              to="/auth/signup"
              style={{ color: 'blue', textDecoration: 'underline' }}
            >
              Sign Up
            </Link>
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};
