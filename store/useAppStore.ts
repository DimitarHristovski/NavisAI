import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Favorite, SearchFilters, Category, Itinerary } from '@/types';

interface AppState {
  favorites: Favorite[];
  searchFilters: SearchFilters;
  userLocation: { lat: number; lng: number } | null;
  itinerary: Itinerary | null;
  
  addFavorite: (id: string, type: Category) => void;
  removeFavorite: (id: string, type: Category) => void;
  isFavorite: (id: string, type: Category) => boolean;
  setSearchFilters: (filters: SearchFilters) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  setItinerary: (itinerary: Itinerary | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      favorites: [],
      searchFilters: {},
      userLocation: null,
      itinerary: null,

      addFavorite: (id: string, type: Category) => {
        const favoriteId = `${type}-${id}`;
        if (!get().isFavorite(id, type)) {
          set((state) => ({
            favorites: [
              ...state.favorites,
              { id: favoriteId, type, addedAt: Date.now() },
            ],
          }));
        }
      },

      removeFavorite: (id: string, type: Category) => {
        const favoriteId = `${type}-${id}`;
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== favoriteId),
        }));
      },

      isFavorite: (id: string, type: Category) => {
        const favoriteId = `${type}-${id}`;
        return get().favorites.some((f) => f.id === favoriteId);
      },

      setSearchFilters: (filters: SearchFilters) => {
        set({ searchFilters: filters });
      },

      setUserLocation: (location: { lat: number; lng: number } | null) => {
        set({ userLocation: location });
      },

      setItinerary: (itinerary: Itinerary | null) => {
        set({ itinerary });
      },
    }),
    {
      name: 'navis-ai-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        searchFilters: state.searchFilters,
        userLocation: state.userLocation,
        itinerary: state.itinerary,
      }),
    }
  )
);
