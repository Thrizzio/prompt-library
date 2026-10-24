import { Terminal, Plus, ShieldCheck, KeyRound, Lock, Menu } from 'lucide-react';
import { Button } from '../common/Button';

export interface HeaderProps {
  isAdmin: boolean;
  onOpenNewPrompt: () => void;
  onOpenAdminModal: () => void;
  onLockAdmin: () => void;
  onToggleSidebar?: () => void;
}

export function Header({
  isAdmin,
  onOpenNewPrompt,
  onOpenAdminModal,
  onLockAdmin,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5 select-none">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
              <Terminal className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 text-sm sm:text-base leading-tight">
                Prompt Library
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline-block leading-tight">
                Personal Collection & Showcase
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isAdmin ? (
            <>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Owner Mode</span>
              </div>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={onOpenNewPrompt}
                className="shadow-sm"
              >
                <span className="hidden sm:inline">New Prompt</span>
                <span className="sm:hidden">New</span>
              </Button>

              <button
                type="button"
                onClick={onLockAdmin}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Lock Owner Mode"
                aria-label="Lock Owner Mode"
              >
                <Lock className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<KeyRound className="w-3.5 h-3.5 text-slate-500" />}
              onClick={onOpenAdminModal}
              className="text-xs text-slate-600"
            >
              <span className="hidden sm:inline">Owner Unlock</span>
              <span className="sm:hidden">Owner</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
