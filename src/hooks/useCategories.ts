import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Category } from '../types/database';

export function useCategories(userId?: string | null) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!userId) {
      setCategories([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchErr } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (fetchErr) {
        throw fetchErr;
      }

      setCategories(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load categories.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(
    async (name: string): Promise<Category> => {
      const cleanName = name.trim();
      if (!cleanName) {
        throw new Error('Category name cannot be empty.');
      }

      if (!userId) {
        throw new Error('You must be signed in to add categories.');
      }

      const existing = categories.find(
        (c) => c.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (existing) {
        throw new Error(`Category "${cleanName}" already exists.`);
      }

      const { data, error: insertErr } = await supabase
        .from('categories')
        .insert({
          user_id: userId,
          name: cleanName,
        })
        .select()
        .single();

      if (insertErr) {
        throw insertErr;
      }

      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    },
    [userId, categories]
  );

  return {
    categories,
    isLoading,
    error,
    addCategory,
    refreshCategories: fetchCategories,
  };
}
