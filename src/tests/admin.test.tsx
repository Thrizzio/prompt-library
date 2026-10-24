import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminModal } from '../components/admin/AdminModal';

describe('Admin Passkey & Owner Mode', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders modal with passkey input', () => {
    render(<AdminModal isOpen={true} onClose={vi.fn()} onUnlock={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Unlock Owner Mode' })).toBeInTheDocument();
    expect(screen.getByLabelText(/owner passkey/i)).toBeInTheDocument();
  });

  it('displays error on incorrect passkey', () => {
    const handleUnlock = vi.fn().mockReturnValue(false);
    render(<AdminModal isOpen={true} onClose={vi.fn()} onUnlock={handleUnlock} />);

    const input = screen.getByLabelText(/owner passkey/i);
    const submitBtn = screen.getByTestId('admin-unlock-btn');

    fireEvent.change(input, { target: { value: 'wrong-pass' } });
    fireEvent.click(submitBtn);

    expect(handleUnlock).toHaveBeenCalledWith('wrong-pass');
    expect(screen.getByText('Incorrect passkey. Please try again.')).toBeInTheDocument();
  });

  it('calls onUnlock and closes on correct passkey', () => {
    const handleUnlock = vi.fn().mockReturnValue(true);
    const handleClose = vi.fn();
    render(<AdminModal isOpen={true} onClose={handleClose} onUnlock={handleUnlock} />);

    const input = screen.getByLabelText(/owner passkey/i);
    const submitBtn = screen.getByTestId('admin-unlock-btn');

    fireEvent.change(input, { target: { value: 'admin123' } });
    fireEvent.click(submitBtn);

    expect(handleUnlock).toHaveBeenCalledWith('admin123');
    expect(handleClose).toHaveBeenCalled();
  });
});
