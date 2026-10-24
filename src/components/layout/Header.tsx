import { Terminal, Plus, LogOut, LogIn, Menu } from 'lucide-react';
import { Button } from '../common/Button';

export interface HeaderProps {
  userEmail?: string | null;
  onOpenNewPrompt: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onToggleSidebar?: () => void;
}

export function Header({
  userEmail,
  onOpenNewPrompt,
  onOpenAuth,
  onSignOut,
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
                Personal utility
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {userEmail ? (
            <>
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

              <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

              <div className="flex items-center gap-2">
                <span
                  className="text-xs text-slate-500 max-w-[120px] truncate hidden md:inline-block"
                  title={userEmail}
                >
                  {userEmail}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignOut}
                  className="text-slate-500 hover:text-rose-600"
                  aria-label="Sign out"
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<LogIn className="w-4 h-4" />}
              onClick={onOpenAuth}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
