import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserGroupIcon, BuildingOfficeIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useUser } from '@clerk/clerk-react'
import { organizationsApi } from '@/services/api'
import { Organization } from '@/types'

// Base API URL (e.g. http://localhost:3000/api/v1)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Strip `/api/v1` from the end to get the backend origin for serving static files like `/uploads/...`
const BACKEND_ORIGIN = API_URL.replace(/\/?api\/v1\/?$/, '')

export default function Groups() {
  const { isSignedIn } = useUser()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await organizationsApi.getAll()
        setOrganizations(data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch organizations:', err)
        setError('Failed to load organizations.')
        setLoading(false)
      }
    }

    fetchOrganizations()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-primary-200 mb-6">
              <UserGroupIcon className="h-4 w-4 text-primary-500" />
              <span className="text-sm font-medium text-gray-700">Community Organizations</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Discover Local Groups & Organizations
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Connect with community organizations, business groups, and professional networks in your area.
            </p>

            {isSignedIn && (
              <Link
                to="/organization/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5" />
                Create New Organization
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Groups List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Organizations</h2>
            <p className="text-gray-600">Browse organizations and groups in your community</p>
          </div>

          {organizations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org) => (
                // Build full image URL, handling both absolute and relative paths
                // so that thumbnails render correctly
                (() => {
                  const imageUrl = org.image
                    ? org.image.startsWith('http')
                      ? org.image
                      : `${BACKEND_ORIGIN}${org.image}`
                    : null

                  return (
                <Link
                  key={org.id}
                  to={`/organization/${org.id}`}
                  className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300"
                >
                  {/* Icon / Image */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-1.5 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={org.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <BuildingOfficeIcon className="h-8 w-8 text-primary-500" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {new Date(org.createdAt).getFullYear()}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {org.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {org.description || 'Join this organization to connect with local professionals and businesses.'}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserGroupIcon className="h-4 w-4" />
                      <span>View Members</span>
                    </div>
                    <span className="text-primary-500 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      Learn more →
                    </span>
                  </div>
                </Link>
                  )
                })()
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <BuildingOfficeIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No organizations yet</h3>
              <p className="text-gray-600 mb-6">Be the first to create an organization in your community!</p>
              {isSignedIn && (
                <Link
                  to="/organization/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all shadow-lg"
                >
                  <PlusIcon className="h-5 w-5" />
                  Create Organization
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Join a Group?</h2>
            <p className="text-lg text-gray-600">Connect, collaborate, and grow with your community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl mb-4">
                <UserGroupIcon className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Network & Connect</h3>
              <p className="text-gray-600">
                Build relationships with local businesses and professionals in your area
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl mb-4">
                <BuildingOfficeIcon className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Grow Your Business</h3>
              <p className="text-gray-600">
                Access resources, support, and opportunities to expand your reach
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl mb-4">
                <span className="material-symbols-outlined text-4xl text-primary-500">
                  handshake
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Collaborate</h3>
              <p className="text-gray-600">
                Work together on projects and initiatives that benefit the community
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
