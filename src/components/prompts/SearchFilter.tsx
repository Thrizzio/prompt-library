import { Search, X, Star, LayoutGrid, List } from 'lucide-react';
import { PromptFilterState, ViewMode } from '../../types/prompt';
import { Category } from '../../types/database';

export interface SearchFilterProps {
  filters: PromptFilterState;
  onFilterChange: (updates: Partial<PromptFilterState>) => void;
  categories: Category[];
  totalResults: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function SearchFilter({
  filters,
  onFilterChange,
  categories,
  totalResults,
  viewMode,
  onViewModeChange,
}: SearchFilterProps) {
  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.selectedCategoryId !== null ||
    filters.favoritesOnly ||
    filters.selectedTag !== null
  );

  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      selectedCategoryId: null,
      favoritesOnly: false,
      selectedTag: null,
    });
  };

  return (
    <div className="space-y-3 mb-6">
      {/* Primary search bar & View toggle */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            aria-label="Search prompts"
            placeholder="Search prompt titles, content, or tags..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all shadow-sm"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View mode toggle */}
        <div className="hidden sm:flex items-center bg-slate-200/70 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Grid view"
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="List view"
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter status row & Quick category pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Quick favorites filter toggle */}
          <button
            type="button"
            onClick={() => onFilterChange({ favoritesOnly: !filters.favoritesOnly })}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border font-medium transition-colors ${
              filters.favoritesOnly
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                filters.favoritesOnly ? 'fill-current' : 'text-amber-500'
              }`}
            />
            <span>Favorites</span>
          </button>

          {/* Category Dropdown on small screens */}
          <div className="lg:hidden">
            <select
              aria-label="Filter by category"
              value={filters.selectedCategoryId || ''}
              onChange={(e) =>
                onFilterChange({
                  selectedCategoryId: e.target.value || null,
                })
              }
              className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active tag indicator */}
          {filters.selectedTag && (
            <span className="inline-flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded-md font-mono text-[11px]">
              <span>#{filters.selectedTag}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ selectedTag: null })}
                className="hover:text-slate-300"
                aria-label="Remove tag filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="text-slate-500 hover:text-slate-900 underline underline-offset-2 ml-1"
            >
              Reset filters
            </button>
          )}
        </div>

        <div className="text-slate-400">
          <span>{totalResults} {totalResults === 1 ? 'prompt' : 'prompts'}</span>
        </div>
      </div>
    </div>
  );
}
