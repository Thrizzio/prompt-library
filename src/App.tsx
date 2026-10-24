import { useState, useMemo } from 'react';
import { ToastProvider, useToast } from './components/common/Toast';
import { AppShell } from './components/layout/AppShell';
import { PromptModal } from './components/prompts/PromptModal';
import { AdminModal } from './components/admin/AdminModal';
import { SearchFilter } from './components/prompts/SearchFilter';
import { PromptList } from './components/prompts/PromptList';
import { useAdmin } from './hooks/useAdmin';
import { useCategories } from './hooks/useCategories';
import { usePrompts } from './hooks/usePrompts';
import { copyToClipboard } from './lib/clipboard';
import { Prompt, CreatePromptInput } from './types/database';
import { PromptFilterState, ViewMode } from './types/prompt';

function PromptLibraryMain() {
  const { isAdmin, unlockAdmin, lockAdmin } = useAdmin();
  const { success, error: toastError, info } = useToast();

  const { categories, addCategory } = useCategories();
  const {
    prompts,
    isLoading: isPromptsLoading,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    duplicatePrompt,
  } = usePrompts();

  // Filter state
  const [filters, setFilters] = useState<PromptFilterState>({
    searchQuery: '',
    selectedCategoryId: null,
    favoritesOnly: false,
    selectedTag: null,
  });

  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modals state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
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

  const handleUnlockAdmin = (passkey: string) => {
    const successResult = unlockAdmin(passkey);
    if (successResult) {
      success('Owner mode unlocked! You can now add and edit prompts.');
    }
    return successResult;
  };

  const handleLockAdmin = () => {
    lockAdmin();
    info('Owner mode locked.');
  };

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.selectedCategoryId !== null ||
    filters.favoritesOnly ||
    filters.selectedTag !== null
  );

  return (
    <AppShell
      isAdmin={isAdmin}
      categories={categories}
      filters={filters}
      onFilterChange={handleFilterChange}
      onAddCategory={isAdmin ? handleAddCategory : undefined}
      promptCounts={promptCounts}
      availableTags={availableTags}
      onOpenNewPrompt={handleOpenCreatePrompt}
      onOpenAdminModal={() => setIsAdminModalOpen(true)}
      onLockAdmin={handleLockAdmin}
    >
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
        isAdmin={isAdmin}
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

      {/* Admin Unlock Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onUnlock={handleUnlockAdmin}
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
    <ToastProvider>
      <PromptLibraryMain />
    </ToastProvider>
  );
}

export default App;
