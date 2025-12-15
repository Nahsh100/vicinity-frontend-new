import { create } from 'zustand'
import type { Provider, SearchParams, Location } from '@/types'
import { searchApi } from '@/services/api/search'

interface SearchState {
  providers: Provider[]
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  } | null
  filters: SearchParams
  userLocation: Location | null
  searchProviders: (params: SearchParams) => Promise<void>
  setFilters: (filters: Partial<SearchParams>) => void
  clearFilters: () => void
  setUserLocation: (location: Location) => void
  getNearbyProviders: (lat: number, lng: number, radius?: number) => Promise<void>
}

export const useSearchStore = create<SearchState>((set, _get) => ({
  providers: [],
  isLoading: false,
  error: null,
  pagination: null,
  filters: {},
  userLocation: null,

  searchProviders: async (params: SearchParams) => {
    set({ isLoading: true, error: null })
    try {
      const data = await searchApi.searchProviders(params)
      set({
        providers: data.results,
        pagination: data.pagination,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Search failed',
        isLoading: false,
      })
    }
  },

  setFilters: (filters: Partial<SearchParams>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
  },

  clearFilters: () => {
    set({ filters: {} })
  },

  setUserLocation: (location: Location) => {
    set({ userLocation: location })
  },

  getNearbyProviders: async (lat: number, lng: number, radius?: number) => {
    set({ isLoading: true, error: null })
    try {
      const providers = await searchApi.getNearbyProviders(lat, lng, radius)
      set({
        providers,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to get nearby providers',
        isLoading: false,
      })
    }
  },
}))
