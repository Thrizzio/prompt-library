import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Category } from '../../types/database';
import { PromptFilterState } from '../../types/prompt';

export interface AppShellProps {
  userEmail?: string | null;
  categories: Category[];
  filters: PromptFilterState;
  onFilterChange: (filters: Partial<PromptFilterState>) => void;
  onAddCategory?: (name: string) => Promise<void>;
  promptCounts?: {
    total: number;
    favorites: number;
    byCategory: Record<string, number>;
  };
  availableTags?: string[];
  onOpenNewPrompt: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  children: React.ReactNode;
}

export function AppShell({
  userEmail,
  categories,
  filters,
  onFilterChange,
  onAddCategory,
  promptCounts,
  availableTags,
  onOpenNewPrompt,
  onOpenAuth,
  onSignOut,
  children,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        userEmail={userEmail}
        onOpenNewPrompt={onOpenNewPrompt}
        onOpenAuth={onOpenAuth}
        onSignOut={onSignOut}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          categories={categories}
          filters={filters}
          onFilterChange={onFilterChange}
          onAddCategory={onAddCategory}
          promptCounts={promptCounts}
          availableTags={availableTags}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
