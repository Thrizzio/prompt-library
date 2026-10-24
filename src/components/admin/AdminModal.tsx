import React, { useState } from 'react';
import { KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: (passkey: string) => boolean;
}

export function AdminModal({ isOpen, onClose, onUnlock }: AdminModalProps) {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const success = onUnlock(passkey);
    if (success) {
      setPasskey('');
      onClose();
    } else {
      setError('Incorrect passkey. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setPasskey('');
        setError(null);
        onClose();
      }}
      title="Unlock Owner Mode"
      description="Enter your owner passkey to create, edit, duplicate, and delete prompts."
      maxWidth="sm"
    >
      {error && (
        <div
          className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Owner Passkey"
          id="admin-passkey"
          type="password"
          autoFocus
          required
          placeholder="Enter secret passkey"
          value={passkey}
          onChange={(e) => {
            setPasskey(e.target.value);
            if (error) setError(null);
          }}
          leftIcon={<KeyRound className="w-4 h-4" />}
          hint="Configured in your .env as VITE_ADMIN_PASSKEY"
        />

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setPasskey('');
              setError(null);
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            leftIcon={<ShieldCheck className="w-4 h-4" />}
            data-testid="admin-unlock-btn"
          >
            Unlock Mode
          </Button>
        </div>
      </form>
    </Modal>
  );
}
