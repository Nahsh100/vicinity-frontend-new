import { apiClient } from './client'
import type { Project } from '@/types'

export interface CreateProjectDto {
  title: string
  description?: string
  image?: string
  youtubeUrl?: string
  providerId: string
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

export const projectsApi = {
  // Get projects for a provider
  getByProvider: async (providerId: string): Promise<Project[]> => {
    const { data } = await apiClient.get('/projects', { params: { providerId } })
    return data
  },

  // Get single project
  getById: async (id: string): Promise<Project> => {
    const { data } = await apiClient.get(`/projects/${id}`)
    return data
  },

  // Create project
  create: async (dto: CreateProjectDto): Promise<Project> => {
    const { data } = await apiClient.post('/projects', dto)
    return data
  },

  // Update project
  update: async (id: string, dto: UpdateProjectDto): Promise<Project> => {
    const { data } = await apiClient.put(`/projects/${id}`, dto)
    return data
  },

  // Delete project
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`)
  },
}
