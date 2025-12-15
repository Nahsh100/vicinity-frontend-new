import { useEffect, useState } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { notificationsApi } from '@/services/api'
import type { Notification } from '@/types'

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationsApi.list(20, 0)
      setNotifications(data)
    } catch (error) {
      console.error('Failed to load notifications', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleToggle = () => {
    setOpen((prev) => !prev)
  }

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
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative inline-flex items-center justify-center h-10 w-10 rounded-full text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <span className="font-semibold text-gray-800 text-sm">Notifications</span>
            <button
              type="button"
              onClick={loadNotifications}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          {notifications.length === 0 && !loading && (
            <div className="px-4 py-3 text-sm text-gray-500">No notifications yet.</div>
          )}
          {loading && notifications.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
          )}
          <ul className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <li key={n.id} className={`px-4 py-3 text-sm ${n.status === 'UNREAD' ? 'bg-primary-50' : 'bg-white'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                    <p className="text-gray-600 text-xs mt-1">{n.body}</p>
                    <p className="text-gray-400 text-[11px] mt-1">
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
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
