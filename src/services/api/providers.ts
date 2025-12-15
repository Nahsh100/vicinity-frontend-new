import { apiClient } from './client'
import { Provider, SearchParams, SearchResponse } from '@/types'

export interface CreateProviderDto {
  name: string
  bio?: string
  businessImage?: string
  address?: string
  phone?: string
  whatsapp?: string
  email?: string
  priceRangeMin?: number
  priceRangeMax?: number
  latitude?: number
  longitude?: number
  categoryId?: string
  organizationId?: string
  groupId?: string
}

export interface UpdateProviderDto extends Partial<CreateProviderDto> {}

export const providersApi = {
  // Search providers
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const { data } = await apiClient.get('/search/providers', { params })
    return data
  },

  // Search nearby providers
  searchNearby: async (lat: number, lng: number, radius: number, limit?: number): Promise<Provider[]> => {
    const { data } = await apiClient.get('/search/nearby', {
      params: { lat, lng, radius, limit },
    })
    return data
  },

  // Get single provider by ID
  getById: async (id: string): Promise<Provider> => {
    const { data } = await apiClient.get(`/providers/${id}`)
    return data
  },

  // Get current user's provider profile
  getMyProvider: async (): Promise<Provider> => {
    const { data } = await apiClient.get('/providers/me')
    return data
  },

  // Create provider
  create: async (dto: CreateProviderDto): Promise<Provider> => {
    const { data } = await apiClient.post('/providers', dto)
    return data
  },

  // Update provider
  update: async (id: string, dto: UpdateProviderDto): Promise<Provider> => {
    const { data } = await apiClient.put(`/providers/${id}`, dto)
    return data
  },

  // Delete provider
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/providers/${id}`)
  },

  // Track provider view
  trackView: async (id: string): Promise<void> => {
    await apiClient.post(`/providers/${id}/view`)
  },
}
