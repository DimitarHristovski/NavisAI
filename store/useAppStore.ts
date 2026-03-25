import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Coordinates,
  Favorite,
  Filters,
  LocationPermissionState,
  RadiusKm,
  AppCategory,
  SortOption,
  DiscoveryMode,
  Vibe,
} from "@/types";

interface AppState {
  userCoordinates: Coordinates | null;
  locationPermission: LocationPermissionState;
  selectedCityFallback: string;
  filters: Filters;
  discoveryMode: DiscoveryMode;
  favorites: Favorite[];

  setCoordinates: (coords: Coordinates | null) => void;
  setLocationPermission: (state: LocationPermissionState) => void;
  setSelectedCityFallback: (city: string) => void;
  setRadiusKm: (radius: RadiusKm) => void;
  setCategory: (category: AppCategory) => void;
  setSort: (sort: SortOption) => void;
  setVibe: (vibe: Vibe | "all") => void;
  setDiscoveryMode: (mode: DiscoveryMode) => void;
  addFavorite: (id: string, type: Favorite["type"]) => void;
  removeFavorite: (id: string, type: Favorite["type"]) => void;
  isFavorite: (id: string, type: Favorite["type"]) => boolean;
}

const defaultFilters: Filters = {
  radiusKm: 5,
  category: "all",
  sort: "best_match",
  vibe: "all",
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userCoordinates: null,
      locationPermission: "idle",
      selectedCityFallback: "Berlin",
      filters: defaultFilters,
      discoveryMode: "popular_nearby",
      favorites: [],

      setCoordinates: (coords) => set({ userCoordinates: coords }),
      setLocationPermission: (state) => set({ locationPermission: state }),
      setSelectedCityFallback: (city) => set({ selectedCityFallback: city }),
      setRadiusKm: (radius) => set((state) => ({ filters: { ...state.filters, radiusKm: radius } })),
      setCategory: (category) => set((state) => ({ filters: { ...state.filters, category } })),
      setSort: (sort) => set((state) => ({ filters: { ...state.filters, sort } })),
      setVibe: (vibe) => set((state) => ({ filters: { ...state.filters, vibe } })),
      setDiscoveryMode: (mode) => set({ discoveryMode: mode }),

      addFavorite: (id, type) => {
        const key = `${type}-${id}`;
        if (!get().favorites.some((f) => f.id === key)) {
          set((state) => ({
            favorites: [...state.favorites, { id: key, type, addedAt: Date.now() }],
          }));
        }
      },

      removeFavorite: (id, type) => {
        const key = `${type}-${id}`;
        set((state) => ({ favorites: state.favorites.filter((f) => f.id !== key) }));
      },

      isFavorite: (id, type) => {
        const key = `${type}-${id}`;
        return get().favorites.some((f) => f.id === key);
      },
    }),
    {
      name: "navisai-store",
      partialize: (state) => ({
        favorites: state.favorites,
        filters: state.filters,
        selectedCityFallback: state.selectedCityFallback,
      }),
    }
  )
);
