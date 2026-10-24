import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(cleanEmail, password);
        if (error) {
          setErrorMessage(error.message || 'Failed to sign in. Please check your credentials.');
        } else {
          onClose();
        }
      } else {
        const { error, user } = await signUp(cleanEmail, password);
        if (error) {
          setErrorMessage(error.message || 'Failed to create account.');
        } else if (user && user.identities && user.identities.length === 0) {
          setErrorMessage('An account with this email already exists.');
        } else {
          setSuccessNotice(
            'Account created! If email confirmation is enabled on your project, please check your inbox.'
          );
          setTimeout(() => {
            onClose();
          }, 2500);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessNotice(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'signin' ? 'Welcome back' : 'Create an account'}
      description={
        mode === 'signin'
          ? 'Sign in to access your personal prompts and categories.'
          : 'Your library is isolated to your private account via Row Level Security.'
      }
      maxWidth="md"
    >
      <div className="flex border-b border-slate-200 mb-5">
        <button
          type="button"
          onClick={() => switchMode('signin')}
          className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
            mode === 'signin'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
            mode === 'signup'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Create Account
        </button>
      </div>

      {errorMessage && (
        <div
          className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successNotice && (
        <div
          className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800"
          role="status"
        >
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>{successNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          hint={mode === 'signup' ? 'Minimum 6 characters' : undefined}
          disabled={isLoading}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full"
            data-testid="auth-submit-button"
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
