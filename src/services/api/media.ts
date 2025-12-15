import { apiClient } from './client'
import { Media } from '@/types'

export interface UploadMediaDto {
  file: File
  type: 'IMAGE' | 'VIDEO'
  providerId: string
}

export const mediaApi = {
  // Get all media for a provider
  getByProvider: async (providerId: string): Promise<Media[]> => {
    const { data } = await apiClient.get('/media', {
      params: { providerId },
    })
    return data
  },

  // Upload media
  upload: async (dto: UploadMediaDto): Promise<Media> => {
    const formData = new FormData()
    formData.append('file', dto.file)
    formData.append('type', dto.type)
    formData.append('providerId', dto.providerId)

    const { data } = await apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  // Delete media
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/media/${id}`)
  },
}
