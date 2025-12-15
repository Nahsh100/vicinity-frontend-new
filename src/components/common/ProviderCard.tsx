import { Link } from 'react-router-dom'
import { StarIcon, MapPinIcon, PhoneIcon, CheckBadgeIcon } from '@heroicons/react/24/solid'
import type { Provider } from '@/types'

// Base API URL (e.g. http://localhost:3000/api/v1)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Strip `/api/v1` from the end to get the backend origin for serving static files like `/uploads/...`
const BACKEND_ORIGIN = API_URL.replace(/\/?api\/v1\/?$/, '')

interface ProviderCardProps {
  provider: Provider
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const imagePath = provider.businessImage || provider.bannerImage || provider.profileImage

  return (
    <Link to={`/provider/${provider.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 hover:border-primary-200">
        {/* Business Image (fallback: bannerImage -> profileImage) */}
        {imagePath && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={
                imagePath.startsWith('http')
                  ? imagePath
                  : `${BACKEND_ORIGIN}${imagePath}`
              }
              alt={provider.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {provider.isFeatured && (
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold rounded-full shadow-lg">
                  FEATURED
                </span>
              </div>
            )}
            {provider.subscriptionPlan === 'PREMIUM' && (
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full shadow-lg">
                  ⭐ PREMIUM
                </span>
              </div>
            )}
          </div>
        )}

        {/* Card Content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {provider.name}
                </h3>
                {provider.isVerified && (
                  <CheckBadgeIcon className="h-5 w-5 text-blue-500" title="Verified Provider" />
                )}
              </div>
              {provider.category && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span>{provider.category.icon}</span>
                  <span>{provider.category.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {provider.bio && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {provider.bio}
            </p>
          )}

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-sm">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <StarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
              <span className="font-semibold text-gray-900">{provider.ratingAverage.toFixed(1)}</span>
              <span className="text-gray-500">({provider.ratingCount})</span>
            </div>

            {/* Distance */}
            {provider.distance && (
              <div className="flex items-center gap-1 text-gray-600">
                <MapPinIcon className="h-4 w-4" />
                <span>{provider.distance.toFixed(1)} km</span>
              </div>
            )}

            {/* Services Count */}
            {provider._count?.services && (
              <div className="text-gray-600">
                {provider._count.services} services
              </div>
            )}
          </div>

          {/* Price Range */}
          {provider.priceRangeMin && provider.priceRangeMax && (
            <div className="mb-4">
              <span className="text-sm text-gray-500">Price range:</span>
              <div className="text-lg font-bold text-primary-600">
                ZMW {provider.priceRangeMin} - {provider.priceRangeMax}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 min-w-0 flex-1">
              <MapPinIcon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{provider.address}</span>
            </div>

            {provider.phone && (
              <div className="flex items-center gap-1 text-primary-600 font-medium text-xs sm:text-sm flex-shrink-0">
                <PhoneIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Contact</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
