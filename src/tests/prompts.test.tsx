import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PromptModal } from '../components/prompts/PromptModal';
import { PromptCard } from '../components/prompts/PromptCard';
import { PromptList } from '../components/prompts/PromptList';
import { SearchFilter } from '../components/prompts/SearchFilter';
import { Prompt, Category } from '../types/database';

const mockCategories: Category[] = [
  { id: 'cat-1', user_id: 'user-1', name: 'Coding', created_at: '' },
  { id: 'cat-2', user_id: 'user-1', name: 'Writing', created_at: '' },
];

const mockPrompts: Prompt[] = [
  {
    id: 'p-1',
    user_id: 'user-1',
    title: 'Code Reviewer Assistant',
    content: 'Review the following typescript pull request...',
    category_id: 'cat-1',
    tags: ['typescript', 'clean-code'],
    is_favorite: true,
    created_at: '2026-10-24T10:00:00Z',
    updated_at: '2026-10-24T10:00:00Z',
    category: mockCategories[0],
  },
  {
    id: 'p-2',
    user_id: 'user-1',
    title: 'Blog Post Outline Generator',
    content: 'Generate a structured markdown outline for a blog post...',
    category_id: 'cat-2',
    tags: ['marketing', 'blog'],
    is_favorite: false,
    created_at: '2026-10-24T11:00:00Z',
    updated_at: '2026-10-24T11:00:00Z',
    category: mockCategories[1],
  },
];

describe('Prompt Management Components', () => {
  describe('PromptModal', () => {
    it('validates required fields on create submission', async () => {
      const handleSubmit = vi.fn();
      render(
        <PromptModal
          isOpen={true}
          onClose={vi.fn()}
          categories={mockCategories}
          onSubmit={handleSubmit}
        />
      );

      const form = screen.getByRole('dialog').querySelector('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('A title is required.')).toBeInTheDocument();
        expect(screen.getByText('Prompt content is required.')).toBeInTheDocument();
      });
      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('submits valid prompt data with preserved whitespace', async () => {
      const handleSubmit = vi.fn().mockResolvedValue(undefined);
      const handleClose = vi.fn();
      render(
        <PromptModal
          isOpen={true}
          onClose={handleClose}
          categories={mockCategories}
          onSubmit={handleSubmit}
        />
      );

      const titleInput = screen.getByLabelText(/prompt title/i);
      const contentTextarea = screen.getByLabelText(/prompt content/i);
      const categorySelect = screen.getByLabelText(/category/i);
      const tagsInput = screen.getByLabelText(/tags/i);
      const favoriteCheckbox = screen.getByRole('checkbox', { name: /mark as favorite/i });
      const submitBtn = screen.getByTestId('prompt-submit-btn');

      const exactContentWithWhitespace = '  line 1\n    line 2 indented\n';

      fireEvent.change(titleInput, { target: { value: 'New Test Prompt' } });
      fireEvent.change(contentTextarea, { target: { value: exactContentWithWhitespace } });
      fireEvent.change(categorySelect, { target: { value: 'cat-1' } });
      fireEvent.change(tagsInput, { target: { value: 'react, testing' } });
      fireEvent.click(favoriteCheckbox);

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          title: 'New Test Prompt',
          content: exactContentWithWhitespace, // Exactly preserved
          category_id: 'cat-1',
          tags: ['react', 'testing'],
          is_favorite: true,
        });
        expect(handleClose).toHaveBeenCalled();
      });
    });

    it('populates fields in edit mode', () => {
      render(
        <PromptModal
          isOpen={true}
          onClose={vi.fn()}
          categories={mockCategories}
          initialData={mockPrompts[0]}
          onSubmit={vi.fn()}
        />
      );

      expect(screen.getByRole('heading', { name: 'Edit Prompt' })).toBeInTheDocument();
      expect(screen.getByDisplayValue('Code Reviewer Assistant')).toBeInTheDocument();
      expect(screen.getByDisplayValue(/Review the following typescript/)).toBeInTheDocument();
      expect(screen.getByDisplayValue('typescript, clean-code')).toBeInTheDocument();
    });
  });

  describe('PromptCard', () => {
    it('renders prompt details and handles clipboard copy', async () => {
      const handleCopy = vi.fn().mockResolvedValue(true);
      const handleFavorite = vi.fn();

      render(
        <PromptCard
          prompt={mockPrompts[0]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleFavorite={handleFavorite}
          onDuplicate={vi.fn()}
          onCopy={handleCopy}
        />
      );

      expect(screen.getByText('Code Reviewer Assistant')).toBeInTheDocument();
      expect(screen.getByText('Coding')).toBeInTheDocument();
      expect(screen.getByText('#typescript')).toBeInTheDocument();

      const copyBtn = screen.getByRole('button', { name: /copy prompt: code reviewer assistant/i });
      fireEvent.click(copyBtn);

      await waitFor(() => {
        expect(handleCopy).toHaveBeenCalledWith(mockPrompts[0].content);
        expect(screen.getByText('Copied')).toBeInTheDocument();
      });

      const starBtn = screen.getByRole('button', { name: /remove code reviewer assistant from favorites/i });
      fireEvent.click(starBtn);
      expect(handleFavorite).toHaveBeenCalledWith('p-1');
    });

    it('requires confirmation before calling onDelete', () => {
      const handleDelete = vi.fn();
      render(
        <PromptCard
          prompt={mockPrompts[0]}
          isAdmin={true}
          onEdit={vi.fn()}
          onDelete={handleDelete}
          onToggleFavorite={vi.fn()}
          onDuplicate={vi.fn()}
          onCopy={vi.fn()}
        />
      );

      const deleteIconBtn = screen.getByRole('button', { name: /delete code reviewer assistant/i });
      fireEvent.click(deleteIconBtn);

      expect(screen.getByText('Delete?')).toBeInTheDocument();
      expect(handleDelete).not.toHaveBeenCalled();

      const confirmBtn = screen.getByRole('button', { name: 'Yes' });
      fireEvent.click(confirmBtn);

      expect(handleDelete).toHaveBeenCalledWith('p-1');
    });
  });

  describe('SearchFilter', () => {
    it('handles search input and filter toggles', () => {
      const handleFilterChange = vi.fn();
      render(
        <SearchFilter
          filters={{
            searchQuery: '',
            selectedCategoryId: null,
            favoritesOnly: false,
            selectedTag: null,
          }}
          onFilterChange={handleFilterChange}
          categories={mockCategories}
          totalResults={2}
          viewMode="grid"
          onViewModeChange={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search prompt titles/i);
      fireEvent.change(searchInput, { target: { value: 'review' } });
      expect(handleFilterChange).toHaveBeenCalledWith({ searchQuery: 'review' });

      const favButton = screen.getByRole('button', { name: /favorites/i });
      fireEvent.click(favButton);
      expect(handleFilterChange).toHaveBeenCalledWith({ favoritesOnly: true });
    });
  });

  describe('PromptList', () => {
    it('renders empty search state when filters match zero items', () => {
      const handleReset = vi.fn();
      render(
        <PromptList
          prompts={[]}
          isLoading={false}
          viewMode="grid"
          hasActiveFilters={true}
          onResetFilters={handleReset}
          onOpenCreate={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleFavorite={vi.fn()}
          onDuplicate={vi.fn()}
          onCopy={vi.fn()}
        />
      );

      expect(screen.getByText('No matching prompts found')).toBeInTheDocument();
      const resetBtn = screen.getByRole('button', { name: 'Reset Filters' });
      fireEvent.click(resetBtn);
      expect(handleReset).toHaveBeenCalled();
    });
  });
});
