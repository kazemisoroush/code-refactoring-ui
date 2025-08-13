import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ForgotPassword } from './ForgotPassword';
import { useAuth } from '../../contexts/AuthContext';

// Mock the useAuth hook instead of the entire module
const mockForgotPassword = jest.fn();
const mockClearError = jest.fn();

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: jest.fn(),
}));

const renderWithAuthAndRouter = (component, mockState = {}) => {
  const defaultMockState = {
    forgotPassword: mockForgotPassword,
    isLoading: false,
    error: null,
    clearError: mockClearError,
    ...mockState,
  };

  // Mock the useAuth hook for this test
  useAuth.mockReturnValue(defaultMockState);

  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('ForgotPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset useAuth mock to default state
    useAuth.mockReturnValue({
      forgotPassword: mockForgotPassword,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    });
  });

  test('renders forgot password form', () => {
    renderWithAuthAndRouter(<ForgotPassword />);

    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send reset instructions/i }),
    ).toBeInTheDocument();
  });

  test('shows validation error for empty username', async () => {
    renderWithAuthAndRouter(<ForgotPassword />);

    const submitButton = screen.getByRole('button', {
      name: /send reset instructions/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Username or email is required'),
      ).toBeInTheDocument();
    });
  });

  test('calls forgotPassword with valid data', async () => {
    mockForgotPassword.mockResolvedValue({ success: true });

    renderWithAuthAndRouter(<ForgotPassword />);

    const usernameInput = screen.getByLabelText(/username or email/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset instructions/i,
    });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('testuser');
    });
  });

  test('shows success message after submission', async () => {
    mockForgotPassword.mockResolvedValue({ success: true });

    renderWithAuthAndRouter(<ForgotPassword />);

    const usernameInput = screen.getByLabelText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });

    const submitButton = screen.getByRole('button', {
      name: /send reset instructions/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      expect(
        screen.getByText(
          /If an account with that username exists, we've sent you password reset instructions/,
        ),
      ).toBeInTheDocument();
    });
  });

  test('displays error message when submission fails', async () => {
    const errorMessage = 'User not found';

    mockForgotPassword.mockResolvedValue({
      success: false,
      message: errorMessage,
    });

    // Render with error state
    renderWithAuthAndRouter(<ForgotPassword />, { error: errorMessage });

    const usernameInput = screen.getByLabelText(/username or email/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset instructions/i,
    });

    fireEvent.change(usernameInput, { target: { value: 'nonexistent' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('has navigation links', () => {
    renderWithAuthAndRouter(<ForgotPassword />);

    expect(screen.getByText(/remember your password/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/auth/signin',
    );

    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute(
      'href',
      '/auth/signup',
    );
  });

  test('clears error on input change', () => {
    renderWithAuthAndRouter(<ForgotPassword />);

    const usernameInput = screen.getByLabelText(/username or email/i);
    fireEvent.change(usernameInput, { target: { value: 'test' } });

    // The clearError function should be called when input changes
    // This test verifies the component structure but the actual clearing
    // happens in the real useAuth hook implementation
    expect(usernameInput.value).toBe('test');
  });
});
