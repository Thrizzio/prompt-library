export interface Category {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category_id: string | null;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  // Joined or resolved client-side
  category?: Category | null;
}

export type CreatePromptInput = {
  title: string;
  content: string;
  category_id?: string | null;
  tags?: string[];
  is_favorite?: boolean;
};

export type UpdatePromptInput = Partial<CreatePromptInput>;
