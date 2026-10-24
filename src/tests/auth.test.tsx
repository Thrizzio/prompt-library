import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthModal } from '../components/auth/AuthModal';

const mockSignIn = vi.fn().mockResolvedValue({ error: null });
const mockSignUp = vi.fn().mockResolvedValue({ error: null, user: { id: '123' } });

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    isLoading: false,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: vi.fn(),
  }),
}));

describe('AuthModal Component', () => {
  it('renders modal in sign-in mode by default', () => {
    render(<AuthModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByTestId('auth-submit-button')).toHaveTextContent('Sign In');
  });

  it('switches between Sign In and Create Account modes', () => {
    render(<AuthModal isOpen={true} onClose={vi.fn()} />);
    const createAccountTab = screen.getByRole('button', { name: 'Create Account' });
    fireEvent.click(createAccountTab);
    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
    expect(screen.getByTestId('auth-submit-button')).toHaveTextContent('Create Account');
  });

  it('validates password minimum length on submission', async () => {
    render(<AuthModal isOpen={true} onClose={vi.fn()} />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByTestId('auth-submit-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } }); // < 6 chars
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long.')).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('calls signIn when form is valid', async () => {
    const handleClose = vi.fn();
    render(<AuthModal isOpen={true} onClose={handleClose} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByTestId('auth-submit-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'secret123');
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
