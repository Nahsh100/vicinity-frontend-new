import { apiClient } from './client'
import { Review } from '@/types'

export interface CreateReviewDto {
  rating: number
  text?: string
  providerId: string
}

export interface UpdateReviewDto {
  rating?: number
  text?: string
}

export const reviewsApi = {
  // Get all reviews for a provider
  getByProvider: async (providerId: string): Promise<Review[]> => {
    const { data } = await apiClient.get('/reviews', {
      params: { providerId },
    })
    return data
  },

  // Get single review by ID
  getById: async (id: string): Promise<Review> => {
    const { data } = await apiClient.get(`/reviews/${id}`)
    return data
  },

  // Create review
  create: async (dto: CreateReviewDto): Promise<Review> => {
    const { data } = await apiClient.post('/reviews', dto)
    return data
  },

  // Update review
  update: async (id: string, dto: UpdateReviewDto): Promise<Review> => {
    const { data } = await apiClient.put(`/reviews/${id}`, dto)
    return data
  },

  // Delete review
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`)
  },
}
