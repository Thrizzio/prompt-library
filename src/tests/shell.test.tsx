import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { App } from '../App';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

describe('Application Shell & Public Showcase', () => {
  it('renders application branding, search, and public prompt library view immediately', async () => {
    render(<App />);
    expect(screen.getAllByText('Prompt Library')[0]).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search prompt titles, content, or tags/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /owner unlock/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('All Prompts')).toBeInTheDocument();
    });
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
