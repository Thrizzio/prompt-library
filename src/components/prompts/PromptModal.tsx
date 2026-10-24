import React, { useState, useEffect } from 'react';
import { Star, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Category, Prompt, CreatePromptInput } from '../../types/database';
import { validatePromptInput, cleanTags, PROMPT_LIMITS } from '../../lib/validation';

export interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialData?: Prompt | null;
  onSubmit: (data: CreatePromptInput) => Promise<void>;
}

export function PromptModal({
  isOpen,
  onClose,
  categories,
  initialData,
  onSubmit,
}: PromptModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string; tags?: string; form?: string }>({});

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setCategoryId(initialData.category_id || '');
      setTagsInput(initialData.tags ? initialData.tags.join(', ') : '');
      setIsFavorite(initialData.is_favorite);
    } else {
      setTitle('');
      setContent('');
      setCategoryId('');
      setTagsInput('');
      setIsFavorite(false);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsedTags = cleanTags(tagsInput);
    const validation = validatePromptInput({
      title,
      content,
      tags: parsedTags,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        content, // Preserves exact whitespace
        category_id: categoryId || null,
        tags: parsedTags,
        is_favorite: isFavorite,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save prompt.';
      setErrors((prev) => ({ ...prev, form: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      title={isEditing ? 'Edit Prompt' : 'Create New Prompt'}
      description="Store, categorize, and organize your reusable AI instruction."
      maxWidth="xl"
    >
      {errors.form && (
        <div
          className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <Input
            label="Prompt Title"
            id="prompt-title"
            required
            placeholder="e.g., Code Refactoring Reviewer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            maxLength={PROMPT_LIMITS.MAX_TITLE_LENGTH}
            disabled={isSubmitting}
            autoFocus
          />
          <div className="flex justify-end mt-1">
            <span className="text-[10px] text-slate-400">
              {title.length}/{PROMPT_LIMITS.MAX_TITLE_LENGTH}
            </span>
          </div>
        </div>

        {/* Prompt Content */}
        <div>
          <label
            htmlFor="prompt-content"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Prompt Content (Raw text preserved)
          </label>
          <textarea
            id="prompt-content"
            required
            rows={8}
            placeholder="Type or paste the complete prompt text here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            className={`w-full rounded-lg border bg-white p-3.5 text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors resize-y leading-relaxed ${
              errors.content
                ? 'border-rose-400 focus:ring-rose-500'
                : 'border-slate-300 hover:border-slate-400'
            }`}
            style={{ whiteSpace: 'pre-wrap' }}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.content ? (
              <p className="text-xs text-rose-600 font-medium" role="alert">
                {errors.content}
              </p>
            ) : (
              <span className="text-[11px] text-slate-400">
                Whitespace and formatting are strictly preserved.
              </span>
            )}
            <span className="text-[10px] text-slate-400">
              {content.length.toLocaleString()}/{PROMPT_LIMITS.MAX_CONTENT_LENGTH.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Category & Tags grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="prompt-category"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
            >
              Category
            </label>
            <select
              id="prompt-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[42px] sm:min-h-[40px]"
            >
              <option value="">(None)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Tags (Comma separated)"
              id="prompt-tags"
              placeholder="e.g., refactor, clean-code, architecture"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              error={errors.tags}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Favorite Checkbox */}
        <div className="pt-1 flex items-center">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              disabled={isSubmitting}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
            <div className="flex items-center gap-1.5 text-sm text-slate-700">
              <Star
                className={`w-3.5 h-3.5 ${
                  isFavorite ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
                }`}
              />
              <span>Mark as favorite</span>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            data-testid="prompt-submit-btn"
          >
            {isEditing ? 'Save Changes' : 'Create Prompt'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
