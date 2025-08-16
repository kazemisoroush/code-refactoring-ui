import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
import { createResetPasswordValidator } from '../../utils/resetPasswordValidator';
import { createResetPasswordFormHandler } from '../../utils/resetPasswordFormHandler';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authContext = useAuth();
  const { isLoading, error, clearError } = authContext;

  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    code: searchParams.get('code') || '',
    newPassword: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Create instances of our business logic with dependency injection
  const validator = useMemo(() => createResetPasswordValidator(), []);
  const formHandler = useMemo(
    () =>
      createResetPasswordFormHandler({
        validator,
        resetPassword: authContext.resetPassword,
        navigate,
      }),
    [validator, authContext.resetPassword, navigate],
  );

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
    setIsSubmitting(true);

    try {
      const result = await formHandler.submitForm(formData);

      if (result.validationErrors) {
        setFormErrors(result.validationErrors);
      }
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = isLoading || isSubmitting;

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
          Reset Password
        </Heading>

        <Text fontSize="sm" textAlign="center" color="gray.600">
          Enter the verification code from your email and your new password.
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

            <FormControl isInvalid={!!formErrors.code}>
              <FormLabel htmlFor="code">Verification Code</FormLabel>
              <Input
                id="code"
                name="code"
                type="text"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="Enter verification code"
                autoComplete="off"
              />
              <FormErrorMessage>{formErrors.code}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!formErrors.newPassword}>
              <FormLabel htmlFor="newPassword">New Password</FormLabel>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter your new password"
                autoComplete="new-password"
              />
              <FormErrorMessage>{formErrors.newPassword}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!formErrors.confirmPassword}>
              <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
                autoComplete="new-password"
              />
              <FormErrorMessage>{formErrors.confirmPassword}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={loading}
              loadingText="Resetting password..."
              isDisabled={loading}
            >
              Reset Password
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
        </VStack>
      </VStack>
    </Box>
  );
};
