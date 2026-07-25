import { create } from 'zustand';
import { UrlItem } from '../types';

interface UrlFilterState {
  search: string;
  selectedTag: string;
  selectedFolder: string;
  isFavoriteFilter: boolean;
  sortBy: 'createdAt' | 'clickCount' | 'title';
  sortOrder: 'asc' | 'desc';
  selectedUrlIds: string[];
  setSearch: (search: string) => void;
  setSelectedTag: (tag: string) => void;
  setSelectedFolder: (folder: string) => void;
  toggleFavoriteFilter: () => void;
  setSort: (sortBy: 'createdAt' | 'clickCount' | 'title', sortOrder: 'asc' | 'desc') => void;
  toggleSelectUrl: (id: string) => void;
  selectAllUrls: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useUrlStore = create<UrlFilterState>((set) => ({
  search: '',
  selectedTag: '',
  selectedFolder: '',
  isFavoriteFilter: false,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  selectedUrlIds: [],

  setSearch: (search) => set({ search }),
  setSelectedTag: (selectedTag) => set({ selectedTag }),
  setSelectedFolder: (selectedFolder) => set({ selectedFolder }),
  toggleFavoriteFilter: () => set((state) => ({ isFavoriteFilter: !state.isFavoriteFilter })),
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
  toggleSelectUrl: (id) =>
    set((state) => ({
      selectedUrlIds: state.selectedUrlIds.includes(id)
        ? state.selectedUrlIds.filter((item) => item !== id)
        : [...state.selectedUrlIds, id],
    })),
  selectAllUrls: (ids) => set({ selectedUrlIds: ids }),
  clearSelection: () => set({ selectedUrlIds: [] }),
}));
