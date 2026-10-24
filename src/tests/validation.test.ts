import { describe, it, expect } from 'vitest';
import { validatePromptInput, cleanTags, PROMPT_LIMITS } from '../lib/validation';

describe('Prompt Input Validation', () => {
  it('rejects empty title', () => {
    const res = validatePromptInput({ title: '   ', content: 'Valid prompt content' });
    expect(res.isValid).toBe(false);
    expect(res.errors.title).toBe('A title is required.');
  });

  it('rejects title exceeding max length', () => {
    const longTitle = 'a'.repeat(PROMPT_LIMITS.MAX_TITLE_LENGTH + 1);
    const res = validatePromptInput({ title: longTitle, content: 'Valid content' });
    expect(res.isValid).toBe(false);
    expect(res.errors.title).toContain('cannot exceed');
  });

  it('rejects empty content', () => {
    const res = validatePromptInput({ title: 'Valid Title', content: '   ' });
    expect(res.isValid).toBe(false);
    expect(res.errors.content).toBe('Prompt content is required.');
  });

  it('accepts content with leading or trailing whitespace without modification', () => {
    const codeSnippet = '  SELECT * FROM prompts;\n\n  WHERE true;  ';
    const res = validatePromptInput({ title: 'SQL Query', content: codeSnippet });
    expect(res.isValid).toBe(true);
    expect(res.errors.content).toBeUndefined();
  });

  it('rejects tags exceeding limits', () => {
    const tooManyTags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    const res = validatePromptInput({
      title: 'Title',
      content: 'Content',
      tags: tooManyTags,
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.tags).toContain('maximum of 10 tags');

    const longTag = ['a'.repeat(PROMPT_LIMITS.MAX_TAG_LENGTH + 1)];
    const resLong = validatePromptInput({
      title: 'Title',
      content: 'Content',
      tags: longTag,
    });
    expect(resLong.isValid).toBe(false);
    expect(resLong.errors.tags).toContain('cannot exceed 30 characters');
  });

  it('parses comma and whitespace separated tags cleanly', () => {
    const parsed = cleanTags('react, typescript,  #frontend , vite');
    expect(parsed).toEqual(['react', 'typescript', 'frontend', 'vite']);
  });
});
