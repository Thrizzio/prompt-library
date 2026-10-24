export interface PromptFilterState {
  searchQuery: string;
  selectedCategoryId: string | null; // null means 'all', or specific UUID
  favoritesOnly: boolean;
  selectedTag: string | null;
}

export type ViewMode = 'grid' | 'list';
