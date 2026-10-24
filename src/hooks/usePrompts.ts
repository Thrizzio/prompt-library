import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Prompt, CreatePromptInput, UpdatePromptInput } from '../types/database';

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchErr } = await supabase
        .from('prompts')
        .select(`
          id,
          user_id,
          title,
          content,
          category_id,
          tags,
          is_favorite,
          created_at,
          updated_at,
          category:categories(id, user_id, name, created_at)
        `)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchErr) {
        throw fetchErr;
      }

      // Map Supabase nested relation (single category or null)
      const mappedPrompts: Prompt[] = (data || []).map((item) => ({
        ...item,
        category: Array.isArray(item.category)
          ? item.category[0] ?? null
          : (item.category as Prompt['category']) ?? null,
      }));

      setPrompts(mappedPrompts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load prompts.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const createPrompt = useCallback(
    async (input: CreatePromptInput): Promise<Prompt> => {
      const { data, error: insertErr } = await supabase
        .from('prompts')
        .insert({
          title: input.title.trim(),
          content: input.content, // exact whitespace preserved
          category_id: input.category_id || null,
          tags: input.tags || [],
          is_favorite: input.is_favorite ?? false,
        })
        .select(`
          id,
          user_id,
          title,
          content,
          category_id,
          tags,
          is_favorite,
          created_at,
          updated_at,
          category:categories(id, user_id, name, created_at)
        `)
        .single();

      if (insertErr) {
        throw insertErr;
      }

      const created: Prompt = {
        ...data,
        category: Array.isArray(data.category)
          ? data.category[0] ?? null
          : (data.category as Prompt['category']) ?? null,
      };

      setPrompts((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const updatePrompt = useCallback(
    async (id: string, input: UpdatePromptInput): Promise<Prompt> => {
      const updates: Record<string, unknown> = {};
      if (input.title !== undefined) updates.title = input.title.trim();
      if (input.content !== undefined) updates.content = input.content;
      if (input.category_id !== undefined) updates.category_id = input.category_id || null;
      if (input.tags !== undefined) updates.tags = input.tags;
      if (input.is_favorite !== undefined) updates.is_favorite = input.is_favorite;

      const { data, error: updateErr } = await supabase
        .from('prompts')
        .update(updates)
        .eq('id', id)
        .select(`
          id,
          user_id,
          title,
          content,
          category_id,
          tags,
          is_favorite,
          created_at,
          updated_at,
          category:categories(id, user_id, name, created_at)
        `)
        .single();

      if (updateErr) {
        throw updateErr;
      }

      const updated: Prompt = {
        ...data,
        category: Array.isArray(data.category)
          ? data.category[0] ?? null
          : (data.category as Prompt['category']) ?? null,
      };

      setPrompts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    },
    []
  );

  const deletePrompt = useCallback(
    async (id: string): Promise<void> => {
      const { error: deleteErr } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (deleteErr) {
        throw deleteErr;
      }

      setPrompts((prev) => prev.filter((p) => p.id !== id));
    },
    []
  );

  const toggleFavorite = useCallback(
    async (id: string): Promise<void> => {
      const current = prompts.find((p) => p.id === id);
      if (!current) return;

      const nextFavorite = !current.is_favorite;

      // Optimistic update
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_favorite: nextFavorite } : p))
      );

      try {
        const { error: updateErr } = await supabase
          .from('prompts')
          .update({ is_favorite: nextFavorite })
          .eq('id', id);

        if (updateErr) throw updateErr;
      } catch (err) {
        // Revert on error
        setPrompts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_favorite: current.is_favorite } : p))
        );
        throw err;
      }
    },
    [prompts]
  );

  const duplicatePrompt = useCallback(
    async (id: string): Promise<Prompt> => {
      const target = prompts.find((p) => p.id === id);
      if (!target) {
        throw new Error('Target prompt not found.');
      }

      return createPrompt({
        title: `${target.title} (Copy)`,
        content: target.content,
        category_id: target.category_id,
        tags: [...target.tags],
        is_favorite: false,
      });
    },
    [prompts, createPrompt]
  );

  return {
    prompts,
    isLoading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    duplicatePrompt,
    refreshPrompts: fetchPrompts,
  };
}
