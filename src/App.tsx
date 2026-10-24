import { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider, useToast } from './components/common/Toast';
import { AppShell } from './components/layout/AppShell';
import { PromptModal } from './components/prompts/PromptModal';
import { AuthModal } from './components/auth/AuthModal';
import { SearchFilter } from './components/prompts/SearchFilter';
import { PromptList } from './components/prompts/PromptList';
import { EmptyState } from './components/common/EmptyState';
import { useCategories } from './hooks/useCategories';
import { usePrompts } from './hooks/usePrompts';
import { copyToClipboard } from './lib/clipboard';
import { Prompt, CreatePromptInput } from './types/database';
import { PromptFilterState, ViewMode } from './types/prompt';
import { LogIn } from 'lucide-react';

function PromptLibraryMain() {
  const { user, signOut } = useAuth();
  const { success, error: toastError, info } = useToast();

  const { categories, addCategory } = useCategories(user?.id);
  const {
    prompts,
    isLoading: isPromptsLoading,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    duplicatePrompt,
  } = usePrompts(user?.id);

  // Filter state
  const [filters, setFilters] = useState<PromptFilterState>({
    searchQuery: '',
    selectedCategoryId: null,
    favoritesOnly: false,
    selectedTag: null,
  });

  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  const handleFilterChange = (updates: Partial<PromptFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  // Instant client-side search and filtering
  const filteredPrompts = useMemo(() => {
    const query = filters.searchQuery.trim().toLowerCase();

    return prompts.filter((p) => {
      // 1. Search Query (Title, Content, or Tags)
      if (query) {
        const titleMatch = p.title.toLowerCase().includes(query);
        const contentMatch = p.content.toLowerCase().includes(query);
        const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(query));
        if (!titleMatch && !contentMatch && !tagMatch) {
          return false;
        }
      }

      // 2. Category Filter
      if (filters.selectedCategoryId !== null && p.category_id !== filters.selectedCategoryId) {
        return false;
      }

      // 3. Favorites Filter
      if (filters.favoritesOnly && !p.is_favorite) {
        return false;
      }

      // 4. Tag Filter
      if (filters.selectedTag !== null && (!p.tags || !p.tags.includes(filters.selectedTag))) {
        return false;
      }

      return true;
    });
  }, [prompts, filters]);

  // Prompt counts for sidebar
  const promptCounts = useMemo(() => {
    const counts = {
      total: prompts.length,
      favorites: 0,
      byCategory: {} as Record<string, number>,
    };

    prompts.forEach((p) => {
      if (p.is_favorite) counts.favorites += 1;
      if (p.category_id) {
        counts.byCategory[p.category_id] = (counts.byCategory[p.category_id] || 0) + 1;
      }
    });

    return counts;
  }, [prompts]);

  // Aggregate popular tags
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    prompts.forEach((p) => {
      p.tags?.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).slice(0, 15);
  }, [prompts]);

  // Prompt actions
  const handleOpenCreatePrompt = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingPrompt(null);
    setIsPromptModalOpen(true);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsPromptModalOpen(true);
  };

  const handlePromptSubmit = async (data: CreatePromptInput) => {
    if (editingPrompt) {
      await updatePrompt(editingPrompt.id, data);
      success('Prompt updated successfully.');
    } else {
      await createPrompt(data);
      success('Prompt created successfully.');
    }
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      await deletePrompt(id);
      success('Prompt deleted.');
    } catch {
      toastError('Failed to delete prompt.');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavorite(id);
    } catch {
      toastError('Failed to update favorite status.');
    }
  };

  const handleDuplicatePrompt = async (id: string) => {
    try {
      await duplicatePrompt(id);
      success('Prompt duplicated.');
    } catch {
      toastError('Failed to duplicate prompt.');
    }
  };

  const handleCopyPrompt = async (content: string): Promise<boolean> => {
    const ok = await copyToClipboard(content);
    if (ok) {
      success('Copied exact prompt to clipboard.');
    } else {
      toastError('Failed to copy prompt to clipboard.');
    }
    return ok;
  };

  const handleAddCategory = async (name: string) => {
    try {
      await addCategory(name);
      success(`Category "${name}" added.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add category.';
      toastError(msg);
      throw err;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    info('Signed out.');
  };

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.selectedCategoryId !== null ||
    filters.favoritesOnly ||
    filters.selectedTag !== null
  );

  return (
    <AppShell
      userEmail={user?.email}
      categories={categories}
      filters={filters}
      onFilterChange={handleFilterChange}
      onAddCategory={user ? handleAddCategory : undefined}
      promptCounts={promptCounts}
      availableTags={availableTags}
      onOpenNewPrompt={handleOpenCreatePrompt}
      onOpenAuth={() => setIsAuthModalOpen(true)}
      onSignOut={handleSignOut}
    >
      {!user ? (
        <EmptyState
          icon={<LogIn className="w-6 h-6" />}
          title="Sign in to access your personal prompt library"
          description="Your prompts are protected with PostgreSQL Row Level Security. Sign in or create a private account to start saving prompts."
          actionLabel="Sign In / Register"
          onAction={() => setIsAuthModalOpen(true)}
        />
      ) : (
        <>
          <SearchFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={categories}
            totalResults={filteredPrompts.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <PromptList
            prompts={filteredPrompts}
            isLoading={isPromptsLoading}
            viewMode={viewMode}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={() =>
              setFilters({
                searchQuery: '',
                selectedCategoryId: null,
                favoritesOnly: false,
                selectedTag: null,
              })
            }
            onOpenCreate={handleOpenCreatePrompt}
            onEdit={handleEditPrompt}
            onDelete={handleDeletePrompt}
            onToggleFavorite={handleToggleFavorite}
            onDuplicate={handleDuplicatePrompt}
            onCopy={handleCopyPrompt}
          />
        </>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Prompt Create/Edit Modal */}
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => {
          setIsPromptModalOpen(false);
          setEditingPrompt(null);
        }}
        categories={categories}
        initialData={editingPrompt}
        onSubmit={handlePromptSubmit}
      />
    </AppShell>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <PromptLibraryMain />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
