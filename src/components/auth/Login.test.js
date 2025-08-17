import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';
import { AuthProvider } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

// Mock the auth service
jest.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    signIn: jest.fn(),
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

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authService.getCurrentUser.mockResolvedValue({
      success: false,
      isAuthenticated: false,
    });
  });

  test('should render login form', async () => {
    renderWithAuthAndRouter(<Login />);

    expect(
      screen.getByRole('heading', { name: /sign in/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    // Wait for loading to finish and normal button to appear
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /sign in/i }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  test('should handle input changes', async () => {
    const user = userEvent.setup();
    renderWithAuthAndRouter(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderWithAuthAndRouter(<Login />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /sign in/i }),
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  test('should handle successful login', async () => {
    const user = userEvent.setup();
    authService.signIn.mockResolvedValue({
      success: true,
      user: { email: 'test@example.com' },
      message: 'Login successful',
    });

    renderWithAuthAndRouter(<Login />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /sign in/i }),
      ).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  test('should handle login failure', async () => {
    const user = userEvent.setup({ delay: null });
    authService.signIn.mockResolvedValue({
      success: false,
      message: 'Invalid credentials',
    });

    renderWithAuthAndRouter(<Login />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /sign in/i }),
      ).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.clear(emailInput);
    await user.clear(passwordInput);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  }, 10000);

  test('should show loading state during login', async () => {
    const user = userEvent.setup();
    let resolveLogin;
    authService.signIn.mockImplementation(() => {
      return new Promise((resolve) => {
        resolveLogin = resolve;
      });
    });

    renderWithAuthAndRouter(<Login />);

    // Wait for initial loading to finish
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /sign in/i }),
      ).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Resolve the login
    resolveLogin({ success: true, user: { email: 'test@example.com' } });

    await waitFor(() => {
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument();
    });
  });

  test('should have links to signup and forgot password', () => {
    renderWithAuthAndRouter(<Login />);

    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });
});
