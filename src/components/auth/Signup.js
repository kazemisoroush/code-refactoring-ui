import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

export const Signup = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      const result = await signup(formData.email, formData.password);

      if (result.success) {
        // If signup includes automatic login, navigate to admin
        if (result.user) {
          navigate('/admin');
        } else {
          // Otherwise, show success message or navigate to login
          navigate('/auth/signin');
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
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
          Sign Up
        </Heading>

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

            <FormControl isInvalid={!!formErrors.password}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                autoComplete="new-password"
              />
              <FormErrorMessage>{formErrors.password}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!formErrors.confirmPassword}>
              <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              <FormErrorMessage>{formErrors.confirmPassword}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={loading}
              loadingText="Creating account..."
              isDisabled={loading}
            >
              Sign Up
            </Button>
          </VStack>
        </Box>

        <VStack spacing={2} textAlign="center">
          <Text fontSize="sm">
            Already have an account?{' '}
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
