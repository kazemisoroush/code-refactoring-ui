import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Signup } from './Signup';
import { AuthProvider } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

// Mock the auth service
jest.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    signUp: jest.fn(),
  },
}));

// Mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithAuthAndRouter = (component) => {
  return render(
    <MemoryRouter>
      <AuthProvider>{component}</AuthProvider>
    </MemoryRouter>,
  );
};

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authService.getCurrentUser.mockResolvedValue({
      success: false,
      isAuthenticated: false,
    });
  });

  test('should render signup form', async () => {
    renderWithAuthAndRouter(<Signup />);

    expect(
      screen.getByRole('heading', { name: /sign up/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    // Wait for loading to finish and normal button to appear
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /sign up/i }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  test('should handle input changes', async () => {
    const user = userEvent.setup();
    renderWithAuthAndRouter(<Signup />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(confirmPasswordInput).toHaveValue('password123');
  });

  test('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderWithAuthAndRouter(<Signup />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /sign up/i }),
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/^password is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/please confirm your password/i),
    ).toBeInTheDocument();
  });

  test('should show validation errors for invalid input', async () => {
    const user = userEvent.setup();
    renderWithAuthAndRouter(<Signup />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /sign up/i }),
      ).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    // Invalid inputs
    await user.type(emailInput, 'invalid-email'); // invalid email
    await user.type(passwordInput, '123'); // too short
    await user.type(confirmPasswordInput, '456'); // doesn't match

    await user.click(submitButton);

    expect(screen.getByText(/email address is invalid/i)).toBeInTheDocument();
    expect(
      screen.getByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  test('should handle successful signup with auto-login', async () => {
    const user = userEvent.setup();
    authService.signUp.mockResolvedValue({
      success: true,
      user: { email: 'test@example.com' },
      message: 'Signup successful',
    });

    renderWithAuthAndRouter(<Signup />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /sign up/i }),
      ).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.signUp).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  test('should handle successful signup without auto-login', async () => {
    const user = userEvent.setup();
    authService.signUp.mockResolvedValue({
      success: true,
      user: null, // No user returned means no auto-login
      message: 'Signup successful. Please check your email.',
    });

    renderWithAuthAndRouter(<Signup />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /sign up/i }),
      ).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth/signin');
    });
  });

  test('should handle signup failure', async () => {
    const user = userEvent.setup();
    authService.signUp.mockResolvedValue({
      success: false,
      message: 'Email already exists',
    });

    renderWithAuthAndRouter(<Signup />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /sign up/i }),
      ).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should show loading state during signup', async () => {
    const user = userEvent.setup();
    let resolveSignup;
    authService.signUp.mockImplementation(() => {
      return new Promise((resolve) => {
        resolveSignup = resolve;
      });
    });

    renderWithAuthAndRouter(<Signup />);

    // Wait for initial loading to finish
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /sign up/i }),
      ).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Resolve the signup
    resolveSignup({ success: true, user: { email: 'test@example.com' } });

    await waitFor(() => {
      expect(screen.queryByText(/creating account/i)).not.toBeInTheDocument();
    });
  });

  test('should have link to signin', () => {
    renderWithAuthAndRouter(<Signup />);

    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });
});
