import { Prompt } from '../../types/database';
import { ViewMode } from '../../types/prompt';
import { PromptCard } from './PromptCard';
import { EmptyState } from '../common/EmptyState';
import { Terminal, SearchX } from 'lucide-react';

export interface PromptListProps {
  prompts: Prompt[];
  isLoading: boolean;
  viewMode: ViewMode;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onOpenCreate: () => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopy: (content: string) => Promise<boolean>;
}

export function PromptList({
  prompts,
  isLoading,
  viewMode,
  hasActiveFilters,
  onResetFilters,
  onOpenCreate,
  onEdit,
  onDelete,
  onToggleFavorite,
  onDuplicate,
  onCopy,
}: PromptListProps) {
  if (isLoading) {
    return (
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
            : 'space-y-3'
        }
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs animate-pulse space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="h-5 bg-slate-200 rounded w-2/3" />
              <div className="h-5 bg-slate-200 rounded w-5" />
            </div>
            <div className="h-3 bg-slate-200 rounded w-1/3" />
            <div className="h-20 bg-slate-100 rounded-lg" />
            <div className="flex justify-between pt-2">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-7 bg-slate-200 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    if (hasActiveFilters) {
      return (
        <EmptyState
          icon={<SearchX className="w-6 h-6" />}
          title="No matching prompts found"
          description="Try adjusting your search terms or removing active category/favorite filters."
          actionLabel="Reset Filters"
          onAction={onResetFilters}
        />
      );
    }

    return (
      <EmptyState
        icon={<Terminal className="w-6 h-6" />}
        title="Your prompt library is empty"
        description="Create your first reusable prompt to start organizing your AI workflows."
        actionLabel="Create Prompt"
        onAction={onOpenCreate}
      />
    );
  }

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
          : 'space-y-3'
      }
    >
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onDuplicate={onDuplicate}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
}
