import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { App } from '../App';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

describe('Application Shell & Design System', () => {
  it('renders application branding and unauthenticated state properly', async () => {
    render(<App />);
    expect(screen.getAllByText('Prompt Library')[0]).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByText('Sign in to access your personal prompt library')
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /sign in \/ register/i })).toBeInTheDocument();
  });

  it('renders Button with variants and accessible attributes', () => {
    render(
      <Button variant="danger" size="lg" aria-label="Delete Action">
        Delete
      </Button>
    );
    const button = screen.getByRole('button', { name: /delete action/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-rose-600');
  });

  it('renders Badge with custom variants', () => {
    render(<Badge variant="brand">Coding</Badge>);
    expect(screen.getByText('Coding')).toBeInTheDocument();
    expect(screen.getByText('Coding')).toHaveClass('bg-emerald-50');
  });
});
