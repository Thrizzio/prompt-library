import { describe, it, expect } from 'vitest';
import { validateSupabaseConfig } from '../lib/supabase';

describe('Supabase Environment Configuration', () => {
  it('identifies missing URL', () => {
    const res = validateSupabaseConfig('', 'some-key');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('VITE_SUPABASE_URL is missing');
  });

  it('identifies invalid URL format', () => {
    const res = validateSupabaseConfig('not-a-url', 'some-key');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('not a valid URL');
  });

  it('identifies missing Anon Key', () => {
    const res = validateSupabaseConfig('https://example.supabase.co', '');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('VITE_SUPABASE_ANON_KEY is missing');
  });

  it('accepts valid configuration', () => {
    const res = validateSupabaseConfig('https://example.supabase.co', 'valid-anon-key');
    expect(res.isValid).toBe(true);
    expect(res.error).toBeUndefined();
  });
});
