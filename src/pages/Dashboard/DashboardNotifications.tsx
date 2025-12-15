import { useEffect, useState } from 'react'
import { notificationsApi } from '@/services/api'
import type { Notification } from '@/types'

const PAGE_SIZE = 10

export default function DashboardNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  const loadPage = async (pageToLoad: number) => {
    try {
      setLoading(true)
      const skip = (pageToLoad - 1) * PAGE_SIZE
      const data = await notificationsApi.list(PAGE_SIZE, skip)
      setNotifications(data)
      setHasMore(data.length === PAGE_SIZE)
      setPage(pageToLoad)
    } catch (error) {
      console.error('Failed to load notifications', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPage(1)
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'READ', readAt: new Date().toISOString() } : n)),
      )
    } catch (error) {
      console.error('Failed to mark notification as read', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Notifications</h2>
        <button
          type="button"
          onClick={() => loadPage(page)}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {notifications.length === 0 && !loading && (
        <div className="text-gray-500 text-sm">You have no notifications yet.</div>
      )}

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`border rounded-lg px-4 py-3 ${
              n.status === 'UNREAD' ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-700 mt-1">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {n.status === 'UNREAD' && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(n.id)}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {notifications.length > 0 && (
        <div className="flex items-center justify-between mt-6 text-sm">
          <button
            type="button"
            disabled={page === 1 || loading}
            onClick={() => loadPage(page - 1)}
            className={`px-3 py-1.5 rounded-md border text-sm ${
              page === 1 || loading
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <span className="text-gray-500">Page {page}</span>
          <button
            type="button"
            disabled={!hasMore || loading}
            onClick={() => loadPage(page + 1)}
            className={`px-3 py-1.5 rounded-md border text-sm ${
              !hasMore || loading
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
