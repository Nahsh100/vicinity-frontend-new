import apiClient from './client'
import type { SearchParams, SearchResponse, Provider } from '@/types'

export const searchApi = {
  searchProviders: async (params: SearchParams): Promise<SearchResponse> => {
    const response = await apiClient.get<SearchResponse>('/search/providers', {
      params,
    })
    return response.data
  },

  getNearbyProviders: async (
    lat: number,
    lng: number,
    radius?: number
  ): Promise<Provider[]> => {
    const response = await apiClient.get<Provider[]>('/search/nearby', {
      params: { lat, lng, radius },
    })
    return response.data
  },
}
