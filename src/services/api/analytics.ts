import { apiClient } from './client'

export interface AnalyticsSummary {
  totalViews: number
  totalReviews: number
  averageRating: number
  totalServices: number
}

export interface AnalyticsData {
  date: string
  views: number
  reviews?: number
  rating?: number
}

export const analyticsApi = {
  // Get provider analytics summary
  getSummary: async (providerId: string): Promise<AnalyticsSummary> => {
    const { data } = await apiClient.get(`/analytics/provider/${providerId}/summary`)

    // Backend summary shape:
    // {
    //   rating: { average, count },
    //   counts: { services, reviews, media },
    //   analytics: { allTime: { views, clicks }, thisMonth: { ... } },
    //   ...
    // }
    const summary: AnalyticsSummary = {
      totalViews: data?.analytics?.allTime?.views ?? 0,
      totalReviews: data?.counts?.reviews ?? 0,
      averageRating: data?.rating?.average ?? 0,
      totalServices: data?.counts?.services ?? 0,
    }

    return summary
  },

  // Get detailed analytics data (daily breakdown)
  getAnalytics: async (
    providerId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsData[]> => {
    const { data } = await apiClient.get(`/analytics/provider/${providerId}`, {
      params: { startDate, endDate },
    })

    // Backend returns an object with a `daily` array; fall back to empty array if missing
    return (data?.daily as AnalyticsData[]) || []
  },
}
