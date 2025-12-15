import { apiClient } from './client'
import { Category } from '@/types'

export interface CreateCategoryDto {
  name: string
  icon?: string
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export const categoriesApi = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    const { data } = await apiClient.get('/categories')
    return data
  },

  // Get single category by ID
  getById: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get(`/categories/${id}`)
    return data
  },

  // Create category (admin only)
  create: async (dto: CreateCategoryDto): Promise<Category> => {
    const { data } = await apiClient.post('/categories', dto)
    return data
  },

  // Update category (admin only)
  update: async (id: string, dto: UpdateCategoryDto): Promise<Category> => {
    const { data } = await apiClient.put(`/categories/${id}`, dto)
    return data
  },

  // Delete category (admin only)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },
}
