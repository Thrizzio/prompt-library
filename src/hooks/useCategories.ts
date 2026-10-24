import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Category } from '../types/database';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'def-1', user_id: '', name: 'Coding', created_at: '' },
  { id: 'def-2', user_id: '', name: 'Writing', created_at: '' },
  { id: 'def-3', user_id: '', name: 'Research', created_at: '' },
  { id: 'def-4', user_id: '', name: 'Productivity', created_at: '' },
  { id: 'def-5', user_id: '', name: 'Learning', created_at: '' },
  { id: 'def-6', user_id: '', name: 'Other', created_at: '' },
];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
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

      if (data && data.length > 0) {
        setCategories(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load categories.';
      setError(msg);
      // Keep DEFAULT_CATEGORIES as resilient fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(
    async (name: string): Promise<Category> => {
      const cleanName = name.trim();
      if (!cleanName) {
        throw new Error('Category name cannot be empty.');
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
    [categories]
  );

  return {
    categories,
    isLoading,
    error,
    addCategory,
    refreshCategories: fetchCategories,
  };
}
