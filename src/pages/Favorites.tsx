import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HeartIcon } from '@heroicons/react/24/solid'
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline'
import { useUser } from '@clerk/clerk-react'
import { providersApi } from '@/services/api'
import { Provider } from '@/types'
import ProviderCard from '@/components/common/ProviderCard'

const FAVORITES_KEY = 'vicinity_favorites'

export default function Favorites() {
  const { isSignedIn } = useUser()
  const [favoriteProviders, setFavoriteProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get favorite IDs from localStorage
  const getFavoriteIds = (): string[] => {
    const stored = localStorage.getItem(FAVORITES_KEY)
    return stored ? JSON.parse(stored) : []
  }

  // Remove from favorites
  const removeFromFavorites = (providerId: string) => {
    const favoriteIds = getFavoriteIds()
    const updated = favoriteIds.filter(id => id !== providerId)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
    setFavoriteProviders(prev => prev.filter(p => p.id !== providerId))
  }

  // Clear all favorites
  const clearAllFavorites = () => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([]))
    setFavoriteProviders([])
  }

  // Fetch favorite providers
  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false)
      return
    }

    const fetchFavorites = async () => {
      try {
        setLoading(true)
        setError(null)

        const favoriteIds = getFavoriteIds()

        if (favoriteIds.length === 0) {
          setFavoriteProviders([])
          setLoading(false)
          return
        }

        // Fetch each provider
        const providers = await Promise.all(
          favoriteIds.map(id => providersApi.getById(id).catch(() => null))
        )

        // Filter out any failed fetches (null values)
        const validProviders = providers.filter((p): p is Provider => p !== null)
        setFavoriteProviders(validProviders)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch favorite providers:', err)
        setError('Failed to load favorites.')
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [isSignedIn])

  if (!isSignedIn) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <HeartOutlineIcon className="h-20 w-20 mx-auto text-gray-300 mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">My Favorites</h1>
            <p className="text-xl text-gray-600 mb-8">
              Sign in to save and manage your favorite providers
            </p>
            <Link
              to="/sign-in"
              className="inline-block px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading favorites...</p>
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
              <HeartIcon className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700">Your Saved Providers</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              My Favorites
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Quick access to your saved service providers and businesses
            </p>
          </div>
        </div>
      </section>

      {/* Favorites List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {favoriteProviders.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Saved Providers</h2>
                  <p className="text-gray-600">{favoriteProviders.length} providers saved</p>
                </div>
                <button
                  onClick={clearAllFavorites}
                  className="text-sm text-gray-600 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProviders.map((provider) => (
                  <div key={provider.id} className="relative">
                    <ProviderCard provider={provider} />
                    <button
                      onClick={() => removeFromFavorites(provider.id)}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform z-10"
                      title="Remove from favorites"
                    >
                      <HeartIcon className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <HeartOutlineIcon className="h-20 w-20 mx-auto text-gray-300 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h3>
              <p className="text-gray-600 mb-8">
                Start exploring and save your favorite providers for quick access
              </p>
              <Link
                to="/search"
                className="inline-block px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all shadow-lg"
              >
                Explore Providers
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                💡 Pro Tip: Save for Later
              </h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Click the heart icon on any provider card to save them to your favorites.
                This makes it easy to quickly find and contact providers you're interested in.
              </p>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
              >
                Start exploring providers
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
