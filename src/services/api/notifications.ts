import { apiClient } from './client'
import type { Notification } from '@/types'

export interface NotificationDto {
  id: string
  type: string
  audience: string
  channel: string
  title: string
  body: string
  status: 'UNREAD' | 'READ'
  createdAt: string
  readAt?: string | null
  data?: any
}

export const notificationsApi = {
  list: async (take = 50, skip = 0): Promise<Notification[]> => {
    const { data } = await apiClient.get<NotificationDto[]>('/notifications', {
      params: { take, skip },
    })
    // The backend already constrains status to the notification enum, so this cast
    // simply aligns the DTO type with the shared Notification interface.
    return data as Notification[]
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`)
  },
}
