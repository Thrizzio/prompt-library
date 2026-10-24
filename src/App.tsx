import { useState } from 'react';
import { ToastProvider } from './components/common/Toast';
import { AppShell } from './components/layout/AppShell';
import { Category } from './types/database';
import { PromptFilterState } from './types/prompt';
import { EmptyState } from './components/common/EmptyState';
import { Terminal } from 'lucide-react';

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', user_id: 'test', name: 'Coding', created_at: '' },
  { id: '2', user_id: 'test', name: 'Writing', created_at: '' },
  { id: '3', user_id: 'test', name: 'Research', created_at: '' },
  { id: '4', user_id: 'test', name: 'Productivity', created_at: '' },
];

export function App() {
  const [filters, setFilters] = useState<PromptFilterState>({
    searchQuery: '',
    selectedCategoryId: null,
    favoritesOnly: false,
    selectedTag: null,
  });

  const handleFilterChange = (updates: Partial<PromptFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  return (
    <ToastProvider>
      <AppShell
        userEmail={null}
        categories={INITIAL_CATEGORIES}
        filters={filters}
        onFilterChange={handleFilterChange}
        promptCounts={{ total: 0, favorites: 0, byCategory: {} }}
        onOpenNewPrompt={() => {}}
        onOpenAuth={() => {}}
        onSignOut={() => {}}
      >
        <EmptyState
          icon={<Terminal className="w-6 h-6" />}
          title="Your prompt library is empty"
          description="Create your first reusable prompt to start organizing your AI workflows."
          actionLabel="Create Prompt"
          onAction={() => {}}
        />
      </AppShell>
    </ToastProvider>
  );
}

export default App;
