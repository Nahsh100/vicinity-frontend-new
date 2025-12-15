import { apiClient } from './client'
import { Service } from '@/types'

export interface CreateServiceDto {
  title: string
  description?: string
  price?: number
  providerId: string
  categoryId?: string
  kind?: 'SERVICE' | 'PRODUCT'
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

export const servicesApi = {
  // Get all services (with optional filters)
  getAll: async (providerId?: string, categoryId?: string): Promise<Service[]> => {
    const { data } = await apiClient.get('/services', {
      params: { providerId, categoryId },
    })
    return data
  },

  // Get single service by ID
  getById: async (id: string): Promise<Service> => {
    const { data } = await apiClient.get(`/services/${id}`)
    return data
  },

  // Get services by provider
  getByProvider: async (providerId: string): Promise<Service[]> => {
    const { data } = await apiClient.get('/services', {
      params: { providerId },
    })
    return data
  },

  // Get nearby services based on user location
  searchNearby: async (
    lat: number,
    lng: number,
    radius: number,
    limit?: number,
  ): Promise<Service[]> => {
    const { data } = await apiClient.get('/search/services/nearby', {
      params: { lat, lng, radius, limit },
    })
    return data
  },

  // Create service
  create: async (dto: CreateServiceDto): Promise<Service> => {
    const { data } = await apiClient.post('/services', dto)
    return data
  },

  // Update service
  update: async (id: string, dto: UpdateServiceDto): Promise<Service> => {
    const { data } = await apiClient.put(`/services/${id}`, dto)
    return data
  },

  // Delete service
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/services/${id}`)
  },
}
