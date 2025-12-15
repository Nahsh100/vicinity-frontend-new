import { Link, useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, SparklesIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'
import { categoriesApi, providersApi, servicesApi } from '@/services/api'
import { Category, Provider, Service } from '@/types'

// Base API URL (e.g. http://localhost:3000/api/v1)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Strip `/api/v1` from the end to get the backend origin for serving static files like `/uploads/...`
const BACKEND_ORIGIN = API_URL.replace(/\/?api\/v1\/?$/, '')

// Default category icons mapping
const defaultCategoryIcons: Record<string, string> = {
  'Home Services': 'home_repair_service',
  'Food & Drink': 'restaurant',
  'Health & Wellness': 'spa',
  'Shopping': 'shopping_bag',
  'Beauty': 'auto_awesome',
  'Entertainment': 'sports_esports',
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [radius, setRadius] = useState('10')
  const navigate = useNavigate()

  // State for API data
  const [categories, setCategories] = useState<Category[]>([])
  const [popularServices, setPopularServices] = useState<Service[]>([])
  const [recommendedProviders, setRecommendedProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch categories
        const categoriesData = await categoriesApi.getAll()
        setCategories(categoriesData.slice(0, 12)) // Limit to 12

        // Try to get user's location for nearby recommendations and popular services
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords

                // Try to fetch nearby services for Popular in Your Area
                try {
                  const popularServicesData = await servicesApi.searchNearby(
                    latitude,
                    longitude,
                    10,
                    10,
                  )
                  setPopularServices(popularServicesData)
                } catch (servicesErr) {
                  console.error('Failed to fetch nearby services:', servicesErr)
                  // Fallback to all services if nearby fails
                  try {
                    const allServices = await servicesApi.getAll()
                    setPopularServices(allServices.slice(0, 10))
                  } catch (fallbackErr) {
                    console.error('Failed to fetch fallback services:', fallbackErr)
                    setPopularServices([])
                  }
                }

                // Try to fetch nearby providers for Recommended For You
                try {
                  const nearbyProviders = await providersApi.searchNearby(
                    latitude,
                    longitude,
                    10,
                    10,
                  )
                  setRecommendedProviders(nearbyProviders)
                } catch (providersErr) {
                  console.error('Failed to fetch nearby providers:', providersErr)
                  // Fallback to regular search if nearby fails
                  try {
                    const fallbackData = await providersApi.search({ limit: 10 })
                    setRecommendedProviders(fallbackData.results)
                  } catch (fallbackErr) {
                    console.error('Failed to fetch fallback providers:', fallbackErr)
                    setRecommendedProviders([])
                  }
                }
              } catch (err) {
                console.error('Failed to fetch nearby data:', err)
                setPopularServices([])
                setRecommendedProviders([])
              }
            },
            async (error) => {
              // Location access denied, use fallback
              console.error('Geolocation denied:', error)

              // Fallback to fetching services without location
              try {
                const allServices = await servicesApi.getAll()
                setPopularServices(allServices.slice(0, 10))
              } catch (err) {
                console.error('Failed to fetch services:', err)
                setPopularServices([])
              }

              try {
                const fallbackData = await providersApi.search({ limit: 10 })
                setRecommendedProviders(fallbackData.results)
              } catch (err) {
                console.error('Failed to fetch providers:', err)
                setRecommendedProviders([])
              }
            }
          )
        } else {
          // Geolocation not supported, use regular search
          console.warn('Geolocation not supported')

          // Fallback to fetching services without location
          try {
            const allServices = await servicesApi.getAll()
            setPopularServices(allServices.slice(0, 10))
          } catch (err) {
            console.error('Failed to fetch services:', err)
            setPopularServices([])
          }

          try {
            const fallbackData = await providersApi.search({ limit: 10 })
            setRecommendedProviders(fallbackData.results)
          } catch (err) {
            console.error('Failed to fetch providers:', err)
            setRecommendedProviders([])
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch home page data:', err)
        setError('Failed to load content. Please try again later.')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()

    if (searchQuery.trim()) {
      params.append('keyword', searchQuery)
    }

    if (radius) {
      params.append('radius', radius)
    }

    const queryString = params.toString()
    navigate(`/search${queryString ? `?${queryString}` : ''}`)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    <div className="bg-white">
      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary-100 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-primary-100 rounded-full opacity-30 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full shadow-sm border border-primary-200 mb-4 sm:mb-6">
              <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Trusted by 10,000+ local businesses</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight px-4 sm:px-0">
              Find & Connect with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">
                Local Experts
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Search for services, products, and organizations in your community.
            </p>

            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-6 sm:mb-8">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 p-4 sm:p-6">
                {/* Main Search Input */}
                <div className="relative flex items-center mb-4 sm:mb-6">
                  <div className="absolute left-3 sm:left-6">
                    <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 pl-10 sm:pl-16 pr-4 py-3 sm:py-4 text-base sm:text-lg text-gray-900 outline-none bg-transparent rounded-lg sm:rounded-xl"
                  />
                </div>

                {/* Radius Slider */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="material-symbols-outlined text-gray-500 text-base sm:text-xl">location_on</span>
                      <label htmlFor="radius" className="text-xs sm:text-sm font-medium text-gray-700">
                        Search within
                      </label>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-primary-600">
                      {radius} km
                    </span>
                  </div>
                  <input
                    type="range"
                    id="radius"
                    min="1"
                    max="100"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1 km</span>
                    <span className="hidden sm:inline">25 km</span>
                    <span>50 km</span>
                    <span className="hidden sm:inline">75 km</span>
                    <span>100 km</span>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white px-6 sm:px-10 py-3 sm:py-4 font-semibold transition-colors rounded-lg sm:rounded-xl shadow-lg text-base sm:text-lg"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-primary-500" />
                <span>Verified Providers</span>
              </div>
              <div className="flex items-center gap-2">
                <UserGroupIcon className="h-5 w-5 text-primary-500" />
                <span>Local Community</span>
              </div>
              <div className="flex items-center gap-2">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <span>Rated & Reviewed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Categories - Enhanced */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div className="text-center flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Explore Categories</h2>
              <p className="text-lg text-gray-600">Browse services by category</p>
            </div>
            <Link to="/categories" className="text-primary-500 hover:text-primary-600 font-semibold hidden md:block">
              View all →
            </Link>
          </div>

          {categories.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No categories available
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/search?categoryId=${category.id}`}
                    className="group flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-white border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 flex-shrink-0 w-40 snap-start"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity blur-xl"></div>
                      <div className="relative flex items-center justify-center w-16 h-16 bg-primary-50 group-hover:bg-primary-100 rounded-2xl transition-all duration-300 group-hover:scale-110">
                        <span className="material-symbols-outlined text-4xl text-primary-500">
                          {category.icon || defaultCategoryIcons[category.name] || 'category'}
                        </span>
                      </div>
                    </div>
                    <p className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Popular in Your Area - Enhanced */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Popular in Your Area</h2>
              <p className="text-lg text-gray-600">Top-rated local services near you</p>
            </div>
            <Link to="/search" className="text-primary-500 hover:text-primary-600 font-semibold hidden md:block">
              View all →
            </Link>
          </div>

          {popularServices.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No popular services found yet.</p>
          ) : (
            <div className="flex gap-6 md:gap-8 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {popularServices.map((service) => {
                const imagePath = service.image
                const imageSrc = imagePath
                  ? imagePath.startsWith('http')
                    ? imagePath
                    : `${BACKEND_ORIGIN}${imagePath}`
                  : null

                const priceLabel =
                  service.priceType === 'FIXED' ? 'Fixed Price'
                  : service.priceType === 'HOURLY' ? 'Per Hour'
                  : service.priceType === 'DAILY' ? 'Per Day'
                  : service.priceType === 'WEEKLY' ? 'Per Week'
                  : service.priceType === 'MONTHLY' ? 'Per Month'
                  : service.priceType === 'NEGOTIABLE' ? 'Negotiable'
                  : service.priceType === 'STARTING_AT' ? 'Starting At'
                  : service.priceType === 'CONTACT_FOR_QUOTE' ? 'Contact for Quote'
                  : null

                return (
                  <Link
                    key={service.id}
                    to={`/service/${service.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex-shrink-0 w-72 sm:w-80 snap-start"
                  >
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden bg-gray-100">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-6xl text-gray-300">design_services</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {service.providerName || service.provider?.name || 'Unknown Provider'}
                      </p>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          {priceLabel && (
                            <span className="text-xs font-semibold text-primary-900 bg-primary-100 px-2.5 py-1 rounded-full">
                              {priceLabel}
                            </span>
                          )}
                          <p className="text-lg font-bold text-primary-600">
                            {service.price
                              ? `K${service.price}`
                              : service.priceType === 'CONTACT_FOR_QUOTE'
                                ? 'Contact for Quote'
                                : 'Price Not Set'}
                          </p>
                        </div>
                        {service.distance !== undefined && (
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            {service.distance.toFixed(1)} km away
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Recommended For You - New */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Recommended For You</h2>
              <p className="text-lg text-gray-600">Providers close to your current location</p>
            </div>
          </div>

          {recommendedProviders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No nearby providers found yet.</p>
          ) : (
            <div className="flex gap-6 md:gap-8 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {recommendedProviders.map((provider) => {
                const imagePath = provider.businessImage || provider.bannerImage || provider.profileImage
                const imageSrc = imagePath
                  ? imagePath.startsWith('http')
                    ? imagePath
                    : `${BACKEND_ORIGIN}${imagePath}`
                  : null

                return (
                  <Link
                    key={provider.id}
                    to={`/provider/${provider.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex-shrink-0 w-72 sm:w-80 snap-start"
                  >
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden bg-gray-100">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={provider.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-6xl text-gray-300">store</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {provider.category?.name || 'Uncategorized'}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.floor(provider.ratingAverage)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300 fill-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {provider.ratingAverage.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">({provider.ratingCount})</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - New */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary-500 to-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Are you a service provider?</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of local businesses connecting with customers in their community
            </p>
            <Link
              to="/sign-up"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-xl hover:shadow-2xl"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
