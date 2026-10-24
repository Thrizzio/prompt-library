import React, { useState } from 'react';
import {
  Folder,
  Star,
  Layers,
  Plus,
  Tag,
  X,
  Check,
} from 'lucide-react';
import { Category } from '../../types/database';
import { PromptFilterState } from '../../types/prompt';

export interface SidebarProps {
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
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  categories,
  filters,
  onFilterChange,
  onAddCategory,
  promptCounts = { total: 0, favorites: 0, byCategory: {} },
  availableTags = [],
  isOpen = false,
  onClose,
}: SidebarProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed || !onAddCategory) return;

    try {
      setIsSavingCategory(true);
      await onAddCategory(trimmed);
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch {
      // Error handled by parent toast
    } finally {
      setIsSavingCategory(false);
    }
  };

  const content = (
    <div className="flex flex-col h-full py-5 px-3 select-none">
      {/* Mobile close button */}
      <div className="flex items-center justify-between px-2 mb-4 lg:hidden">
        <span className="text-sm font-semibold text-slate-800">Navigation</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main navigation filters */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => {
            onFilterChange({ selectedCategoryId: null, favoritesOnly: false, selectedTag: null });
            if (onClose) onClose();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            filters.selectedCategoryId === null && !filters.favoritesOnly && filters.selectedTag === null
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4" />
            <span>All Prompts</span>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              filters.selectedCategoryId === null && !filters.favoritesOnly && filters.selectedTag === null
                ? 'bg-slate-800 text-slate-300'
                : 'bg-slate-200/70 text-slate-600'
            }`}
          >
            {promptCounts.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            onFilterChange({ favoritesOnly: !filters.favoritesOnly, selectedTag: null });
            if (onClose) onClose();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            filters.favoritesOnly
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Star className={`w-4 h-4 ${filters.favoritesOnly ? 'fill-current' : 'text-amber-500'}`} />
            <span>Favorites</span>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              filters.favoritesOnly
                ? 'bg-amber-600 text-amber-100'
                : 'bg-slate-200/70 text-slate-600'
            }`}
          >
            {promptCounts.favorites}
          </span>
        </button>
      </div>

      <hr className="my-5 border-slate-200/80" />

      {/* Categories section */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Categories
          </span>
          {onAddCategory && !isAddingCategory && (
            <button
              type="button"
              onClick={() => setIsAddingCategory(true)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
              title="Add category"
              aria-label="Add category"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isAddingCategory && (
          <form onSubmit={handleCreateCategory} className="px-2 mb-2">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                maxLength={40}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="submit"
                disabled={!newCategoryName.trim() || isSavingCategory}
                className="p-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
                aria-label="Save category"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                aria-label="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        <div className="space-y-0.5">
          {categories.map((cat) => {
            const isSelected = filters.selectedCategoryId === cat.id && !filters.favoritesOnly;
            const count = promptCounts.byCategory[cat.id] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onFilterChange({
                    selectedCategoryId: isSelected ? null : cat.id,
                    favoritesOnly: false,
                  });
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white font-medium shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="truncate">{cat.name}</span>
                </div>
                {count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      isSelected ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tags filter if available */}
        {availableTags.length > 0 && (
          <div className="mt-6">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Popular Tags
            </span>
            <div className="flex flex-wrap gap-1 px-2">
              {availableTags.map((tag) => {
                const isSelected = filters.selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      onFilterChange({
                        selectedTag: isSelected ? null : tag,
                      });
                      if (onClose) onClose();
                    }}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Tag className="w-2.5 h-2.5 opacity-70" />
                    <span>#{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
