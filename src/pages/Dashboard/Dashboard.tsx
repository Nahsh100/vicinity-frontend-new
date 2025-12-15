import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Dashboard() {
  const location = useLocation()

  const navItems = [
    { path: '/dashboard/profile', label: 'Profile' },
    { path: '/dashboard/services', label: 'Services' },
    { path: '/dashboard/projects', label: 'Projects' },
    { path: '/dashboard/organization', label: 'Organization' },
    { path: '/dashboard/analytics', label: 'Analytics' },
    { path: '/dashboard/notifications', label: 'Notifications' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Provider Dashboard</h1>

      {/* Mobile: Horizontal Scrollable Tabs */}
      <div className="lg:hidden mb-6 -mx-4 px-4">
        <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex gap-8">
        {/* Desktop: Vertical Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <nav className="space-y-2 sticky top-20">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
