import { apiClient } from './client'
import { Group, Provider } from '@/types'

export interface CreateGroupDto {
  name: string
  description?: string
  organizationId: string
}

export interface UpdateGroupDto extends Partial<Omit<CreateGroupDto, 'organizationId'>> {}

export const groupsApi = {
  // Get all groups (optionally filtered by organization)
  getAll: async (organizationId?: string): Promise<Group[]> => {
    const { data } = await apiClient.get('/groups', {
      params: { organizationId },
    })
    return data
  },

  // Get single group by ID
  getById: async (id: string): Promise<Group> => {
    const { data } = await apiClient.get(`/groups/${id}`)
    return data
  },

  // Get providers in group
  getProviders: async (id: string): Promise<Provider[]> => {
    const { data } = await apiClient.get(`/groups/${id}/providers`)
    return data
  },

  // Create group
  create: async (dto: CreateGroupDto): Promise<Group> => {
    const { data } = await apiClient.post('/groups', dto)
    return data
  },

  // Update group
  update: async (id: string, dto: UpdateGroupDto): Promise<Group> => {
    const { data } = await apiClient.put(`/groups/${id}`, dto)
    return data
  },

  // Delete group
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/groups/${id}`)
  },
}
