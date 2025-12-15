import { apiClient } from './client'
import { Organization, Provider, Group } from '@/types'

export interface CreateOrganizationDto {
  name: string
  description?: string
  image?: string
}

export interface UpdateOrganizationDto extends Partial<CreateOrganizationDto> {}

export const organizationsApi = {
  // Get all organizations
  getAll: async (): Promise<Organization[]> => {
    const { data } = await apiClient.get('/organizations')
    return data
  },

  // Get single organization by ID
  getById: async (id: string): Promise<Organization> => {
    const { data } = await apiClient.get(`/organizations/${id}`)
    return data
  },

  // Get providers in organization
  getProviders: async (id: string): Promise<Provider[]> => {
    const { data } = await apiClient.get(`/organizations/${id}/providers`)
    return data
  },

  // Get groups in organization
  getGroups: async (id: string): Promise<Group[]> => {
    const { data } = await apiClient.get(`/organizations/${id}/groups`)
    return data
  },

  // Create organization
  create: async (dto: CreateOrganizationDto): Promise<Organization> => {
    const { data } = await apiClient.post('/organizations', dto)
    return data
  },

  // Update organization
  update: async (id: string, dto: UpdateOrganizationDto): Promise<Organization> => {
    const { data } = await apiClient.put(`/organizations/${id}`, dto)
    return data
  },

  // Delete organization
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/organizations/${id}`)
  },

  // Request to join organization as current user's provider
  requestJoin: async (id: string): Promise<void> => {
    await apiClient.post(`/organizations/${id}/join`)
  },

  // Get providers who are members of an organization
  getMembers: async (id: string): Promise<Provider[]> => {
    const { data } = await apiClient.get(`/organizations/${id}/members`)
    return data
  },

  // Join requests (owner-only)
  getJoinRequests: async (id: string): Promise<any[]> => {
    const { data } = await apiClient.get(`/organizations/${id}/join-requests`)
    return data
  },

  approveJoinRequest: async (id: string, requestId: string): Promise<void> => {
    await apiClient.post(`/organizations/${id}/join-requests/${requestId}/approve`)
  },

  rejectJoinRequest: async (id: string, requestId: string): Promise<void> => {
    await apiClient.post(`/organizations/${id}/join-requests/${requestId}/reject`)
  },

  removeMember: async (id: string, providerId: string): Promise<void> => {
    await apiClient.delete(`/organizations/${id}/members/${providerId}`)
  },

  makeAdmin: async (id: string, providerId: string): Promise<void> => {
    await apiClient.post(`/organizations/${id}/members/${providerId}/make-admin`)
  },

  removeAdmin: async (id: string, providerId: string): Promise<void> => {
    await apiClient.post(`/organizations/${id}/members/${providerId}/remove-admin`)
  },

  // Leave organization as current provider
  leave: async (id: string): Promise<void> => {
    await apiClient.delete(`/organizations/${id}/leave`)
  },
}
