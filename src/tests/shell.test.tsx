import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

describe('Application Shell & Design System', () => {
  it('renders application branding and empty state properly', () => {
    render(<App />);
    expect(screen.getAllByText('Prompt Library')[0]).toBeInTheDocument();
    expect(screen.getByText('Your prompt library is empty')).toBeInTheDocument();
    expect(screen.getByText('Create Prompt')).toBeInTheDocument();
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
