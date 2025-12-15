import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { EyeIcon, CursorArrowRaysIcon, StarIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { providersApi, analyticsApi } from '@/services/api'

export default function DashboardAnalytics() {
  const [summary, setSummary] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any[]>([])
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get provider profile first
        const providerData = await providersApi.getMyProvider()

        // Check if provider exists and has an ID
        if (!providerData || !providerData.id) {
          setError('Please create a provider profile first to view analytics.')
          setLoading(false)
          return
        }

        setProvider(providerData)

        // Fetch analytics summary and detailed data
        const [summaryData, analyticsData] = await Promise.all([
          analyticsApi.getSummary(providerData.id),
          analyticsApi.getAnalytics(providerData.id),
        ])

        setSummary(summaryData)
        setAnalytics(analyticsData.slice(0, 7)) // Last 7 days
        setLoading(false)
      } catch (err: any) {
        console.error('Failed to fetch analytics:', err)
        // Check if it's a 404 error (no provider profile)
        if (err.response?.status === 404) {
          setError('Please create a provider profile first to view analytics.')
        } else {
          setError('Failed to load analytics. Please try again later.')
        }
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !summary) {
    const isNoProfile = error?.includes('create a provider profile')
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-lg mb-4">{error || 'No analytics data available'}</p>
        {isNoProfile ? (
          <Link
            to="/dashboard/profile"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            Create Provider Profile
          </Link>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-600 mt-1">Track your performance and engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Views</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{summary.totalViews?.toLocaleString() || 0}</p>
              <p className="text-sm text-blue-600 mt-1">All time</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <EyeIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Total Services</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{summary.totalServices?.toLocaleString() || 0}</p>
              <p className="text-sm text-green-600 mt-1">Listed services</p>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <CursorArrowRaysIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Avg. Rating</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">
                {summary.averageRating?.toFixed(1) || '0.0'}
              </p>
              <p className="text-sm text-yellow-600 mt-1">{summary.totalReviews || 0} reviews</p>
            </div>
            <div className="p-3 bg-yellow-500 rounded-lg">
              <StarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Profile Views</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{provider?._count?.media || 0}</p>
              <p className="text-sm text-purple-600 mt-1">Media files</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-lg">
              <PhotoIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity (Last 7 Days)</h3>
        {analytics.length > 0 ? (
          <div className="space-y-4">
            {analytics.map((day, index) => {
              const maxViews = Math.max(...analytics.map(d => d.views || 0), 1)
              const maxReviews = Math.max(...analytics.map(d => d.reviews || 0), 1)
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex gap-4">
                      <span className="text-blue-600">{day.views || 0} views</span>
                      <span className="text-yellow-600">{day.reviews || 0} reviews</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(((day.views || 0) / maxViews) * 100, 5)}%` }}
                      >
                        {day.views > 0 && <span className="text-xs text-white font-medium">{day.views}</span>}
                      </div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(((day.reviews || 0) / maxReviews) * 100, 5)}%` }}
                      >
                        {day.reviews > 0 && <span className="text-xs text-white font-medium">{day.reviews}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent activity data available</p>
        )}
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Services</span>
              <span className="font-bold text-primary-600">{summary.totalServices || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Total Reviews</span>
              <span className="font-bold text-primary-600">{summary.totalReviews || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Average Rating</span>
              <span className="font-bold text-primary-600">{summary.averageRating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Subscription</span>
              <span className="font-bold text-green-600">{provider?.subscriptionPlan || 'FREE'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Verified</span>
              <span className="font-bold text-green-600">{provider?.isVerified ? '✓ Yes' : '✗ No'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Featured</span>
              <span className="font-bold text-green-600">{provider?.isFeatured ? '✓ Yes' : '✗ No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
