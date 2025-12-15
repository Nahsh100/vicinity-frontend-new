import { useState, useCallback } from 'react'
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl'
import { MapPinIcon, StarIcon, PhoneIcon } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'
import type { Provider } from '@/types'
import 'mapbox-gl/dist/mapbox-gl.css'

interface ProviderMapProps {
  providers: Provider[]
  center?: {
    latitude: number
    longitude: number
  }
}

export default function ProviderMap({ providers, center }: ProviderMapProps) {
  const navigate = useNavigate()
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [viewState, setViewState] = useState({
    longitude: center?.longitude || 28.2833,
    latitude: center?.latitude || -15.4167,
    zoom: 12,
  })

  const handleMarkerClick = useCallback((provider: Provider) => {
    setSelectedProvider(provider)
  }, [])

  const handlePopupClose = useCallback(() => {
    setSelectedProvider(null)
  }, [])

  const handleProviderClick = useCallback((providerId: string) => {
    navigate(`/provider/${providerId}`)
  }, [navigate])

  // Filter providers that have valid coordinates
  const validProviders = providers.filter(
    (p) => p.latitude !== undefined && p.longitude !== undefined
  )

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN || ''}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
        />

        {/* Provider Markers */}
        {validProviders.map((provider) => (
          <Marker
            key={provider.id}
            longitude={provider.longitude!}
            latitude={provider.latitude!}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              handleMarkerClick(provider)
            }}
          >
            <div className="relative cursor-pointer group">
              {/* Marker Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-110 ${
                  provider.subscriptionPlan === 'PREMIUM'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : provider.isFeatured
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                    : 'bg-primary-600'
                }`}
              >
                <MapPinIcon className="h-6 w-6 text-white" />
              </div>

              {/* Premium Badge */}
              {provider.subscriptionPlan === 'PREMIUM' && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white">
                  <span className="text-xs">⭐</span>
                </div>
              )}
            </div>
          </Marker>
        ))}

        {/* Popup */}
        {selectedProvider && selectedProvider.latitude && selectedProvider.longitude && (
          <Popup
            longitude={selectedProvider.longitude}
            latitude={selectedProvider.latitude}
            anchor="bottom"
            onClose={handlePopupClose}
            closeButton={true}
            closeOnClick={false}
            offset={25}
            className="provider-popup"
          >
            <div
              className="cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-1"
              onClick={() => handleProviderClick(selectedProvider.id)}
            >
              {/* Business Image */}
              {selectedProvider.businessImage && (
                <div className="w-full h-32 mb-3 rounded-lg overflow-hidden">
                  <img
                    src={selectedProvider.businessImage}
                    alt={selectedProvider.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Provider Info */}
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 text-lg">
                  {selectedProvider.name}
                </h3>

                {selectedProvider.category && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span>{selectedProvider.category.icon}</span>
                    <span>{selectedProvider.category.name}</span>
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center gap-1 text-sm">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="font-semibold text-gray-900">
                    {selectedProvider.ratingAverage.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({selectedProvider.ratingCount})
                  </span>
                </div>

                {/* Distance */}
              {typeof selectedProvider.distance === 'number' && !Number.isNaN(selectedProvider.distance) && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{selectedProvider.distance.toFixed(1)} km away</span>
                </div>
              )}

                {/* Price Range */}
                {selectedProvider.priceRangeMin && selectedProvider.priceRangeMax && (
                  <div className="text-sm">
                    <span className="text-gray-500">Price range: </span>
                    <span className="font-bold text-primary-600">
                      ZMW {selectedProvider.priceRangeMin} - {selectedProvider.priceRangeMax}
                    </span>
                  </div>
                )}

                {/* Contact */}
                {selectedProvider.phone && (
                  <div className="flex items-center gap-1 text-sm text-primary-600 font-medium">
                    <PhoneIcon className="h-4 w-4" />
                    <span>Contact Available</span>
                  </div>
                )}

                {/* Click to View */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-primary-600 font-semibold text-center">
                    Click to view full profile →
                  </p>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm">
        <h4 className="font-bold text-gray-900 mb-2">Map Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <MapPinIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-700">Premium Provider</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center">
              <MapPinIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-700">Featured Provider</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
              <MapPinIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-700">Standard Provider</span>
          </div>
        </div>
      </div>

      <style>{`
        .provider-popup .mapboxgl-popup-content {
          padding: 12px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          min-width: 280px;
          max-width: 320px;
        }

        .provider-popup .mapboxgl-popup-close-button {
          font-size: 24px;
          padding: 4px 8px;
          color: #6b7280;
          right: 8px;
          top: 8px;
        }

        .provider-popup .mapboxgl-popup-close-button:hover {
          background-color: #f3f4f6;
          color: #111827;
        }

        .provider-popup .mapboxgl-popup-tip {
          border-top-color: white;
        }
      `}</style>
    </div>
  )
}
