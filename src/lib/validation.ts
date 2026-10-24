export interface PromptValidationResult {
  isValid: boolean;
  errors: {
    title?: string;
    content?: string;
    tags?: string;
  };
}

export const PROMPT_LIMITS = {
  MAX_TITLE_LENGTH: 150,
  MAX_CONTENT_LENGTH: 50000,
  MAX_TAGS_COUNT: 10,
  MAX_TAG_LENGTH: 30,
};

export function validatePromptInput(input: {
  title?: string;
  content?: string;
  tags?: string[];
}): PromptValidationResult {
  const errors: PromptValidationResult['errors'] = {};

  // 1. Validate Title
  const trimmedTitle = input.title?.trim() ?? '';
  if (!trimmedTitle) {
    errors.title = 'A title is required.';
  } else if (trimmedTitle.length > PROMPT_LIMITS.MAX_TITLE_LENGTH) {
    errors.title = `Title cannot exceed ${PROMPT_LIMITS.MAX_TITLE_LENGTH} characters.`;
  }

  // 2. Validate Content (Do not trim whitespace from content - preserve exact spaces & newlines)
  const rawContent = input.content ?? '';
  if (!rawContent.trim()) {
    errors.content = 'Prompt content is required.';
  } else if (rawContent.length > PROMPT_LIMITS.MAX_CONTENT_LENGTH) {
    errors.content = `Prompt content cannot exceed ${PROMPT_LIMITS.MAX_CONTENT_LENGTH.toLocaleString()} characters.`;
  }

  // 3. Validate Tags
  if (input.tags && input.tags.length > 0) {
    if (input.tags.length > PROMPT_LIMITS.MAX_TAGS_COUNT) {
      errors.tags = `A maximum of ${PROMPT_LIMITS.MAX_TAGS_COUNT} tags is allowed.`;
    } else {
      const invalidTag = input.tags.find((t) => t.trim().length > PROMPT_LIMITS.MAX_TAG_LENGTH);
      if (invalidTag) {
        errors.tags = `Individual tags cannot exceed ${PROMPT_LIMITS.MAX_TAG_LENGTH} characters.`;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function cleanTags(tagsString: string): string[] {
  if (!tagsString || !tagsString.trim()) return [];
  return tagsString
    .split(/[,;\s]+/)
    .map((t) => t.replace(/^#/, '').trim())
    .filter((t) => t.length > 0)
    .slice(0, PROMPT_LIMITS.MAX_TAGS_COUNT);
}
