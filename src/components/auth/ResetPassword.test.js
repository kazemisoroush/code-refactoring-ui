import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { ResetPassword } from './ResetPassword';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [
    new URLSearchParams('?email=test@example.com&code=123456'),
  ],
}));

// Mock AuthContext
const mockResetPassword = jest.fn();
const mockClearError = jest.fn();

const createMockAuth = (overrides = {}) => ({
  resetPassword: mockResetPassword,
  isLoading: false,
  error: null,
  clearError: mockClearError,
  ...overrides,
});

jest.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: jest.fn(),
}));

const renderWithAuthAndRouter = (component, authOverrides = {}) => {
  const { useAuth } = require('../../contexts/AuthContext');
  useAuth.mockReturnValue(createMockAuth(authOverrides));

  return render(
    <ChakraProvider>
      <MemoryRouter>
        <AuthProvider>{component}</AuthProvider>
      </MemoryRouter>
    </ChakraProvider>,
  );
};

describe('ResetPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders reset password form', () => {
    renderWithAuthAndRouter(<ResetPassword />);

    expect(
      screen.getByRole('heading', { name: /reset password/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reset password/i }),
    ).toBeInTheDocument();
  });

  test('displays email and code from URL parameters', () => {
    renderWithAuthAndRouter(<ResetPassword />);

    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123456')).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    renderWithAuthAndRouter(<ResetPassword />);

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });

    // Clear the prefilled values
    const emailInput = screen.getByLabelText(/email/i);
    const codeInput = screen.getByLabelText(/verification code/i);

    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.change(codeInput, { target: { value: '' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(
        screen.getByText('Verification code is required'),
      ).toBeInTheDocument();
      expect(screen.getByText('New password is required')).toBeInTheDocument();
    });

    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  test('validates password minimum length', async () => {
    renderWithAuthAndRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/new password/i);
    fireEvent.change(passwordInput, { target: { value: '123' } });

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 8 characters'),
      ).toBeInTheDocument();
    });

    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  test('validates passwords match', async () => {
    renderWithAuthAndRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'different123' },
    });

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  test('submits form with valid data', async () => {
    mockResetPassword.mockResolvedValue({ success: true });

    renderWithAuthAndRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'newpassword123' },
    });

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith(
        'test@example.com',
        '123456',
        'newpassword123',
      );
    });
  });

  test('navigates to login on successful reset', async () => {
    mockResetPassword.mockResolvedValue({ success: true });

    renderWithAuthAndRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'newpassword123' },
    });

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth/signin', {
        state: {
          message:
            'Password reset successful. Please sign in with your new password.',
        },
      });
    });
  });

  test('displays error message on reset failure', () => {
    renderWithAuthAndRouter(<ResetPassword />, {
      error: 'Invalid or expired token',
    });

    expect(screen.getByText('Invalid or expired token')).toBeInTheDocument();
  });

  test('clears errors when form changes', () => {
    renderWithAuthAndRouter(<ResetPassword />, {
      error: 'Some error',
    });

    const passwordInput = screen.getByLabelText(/new password/i);
    fireEvent.change(passwordInput, { target: { value: 'newvalue' } });

    expect(mockClearError).toHaveBeenCalled();
  });

  test('has link to sign in page', () => {
    renderWithAuthAndRouter(<ResetPassword />);

    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/auth/signin');
  });

  test('shows loading state during form submission', () => {
    renderWithAuthAndRouter(<ResetPassword />, {
      isLoading: true,
    });

    const submitButton = screen.getByRole('button', {
      name: /loading.*resetting password/i,
    });
    expect(submitButton).toBeDisabled();
  });
});
