import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { servicesApi } from '@/services/api'
import type { Service } from '@/types'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

// Base API URL (e.g. http://localhost:3000/api/v1)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Strip `/api/v1` from the end to get the backend origin for serving static files like `/uploads/...`
const BACKEND_ORIGIN = API_URL.replace(/\/?api\/v1\/?$/, '')

export default function ServiceDetails() {
  const { id } = useParams()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)
        const data = await servicesApi.getById(id)
        setService(data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch service:', err)
        setError('Failed to load service details.')
        setLoading(false)
      }
    }

    fetchService()
  }, [id])

  const imageSrc = service?.image
    ? service.image.startsWith('http')
      ? service.image
      : `${BACKEND_ORIGIN}${service.image}`
    : null

  const priceLabel = service?.priceType === 'FIXED' ? 'Fixed Price'
    : service?.priceType === 'HOURLY' ? 'Per Hour'
    : service?.priceType === 'DAILY' ? 'Per Day'
    : service?.priceType === 'WEEKLY' ? 'Per Week'
    : service?.priceType === 'MONTHLY' ? 'Per Month'
    : service?.priceType === 'NEGOTIABLE' ? 'Negotiable'
    : service?.priceType === 'STARTING_AT' ? 'Starting At'
    : service?.priceType === 'CONTACT_FOR_QUOTE' ? 'Contact for Quote'
    : null

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service...</p>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to home
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {error || 'Service not found'}
        </h1>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Top nav / back */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700">
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to home
          </Link>

          {service.category && (
            <div className="hidden md:flex items-center text-xs text-gray-500 gap-1">
              <span>Home</span>
              <span>/</span>
              <span>{service.category.name}</span>
            </div>
          )}
        </div>

        {/* Hero section */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{service.title}</h1>

          {(service.provider || service.providerName || service.category) && (
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {service.provider || service.providerName ? (
                <span>
                  By{' '}
                  {service.provider ? (
                    <Link
                      to={service.provider.id ? `/provider/${service.provider.id}` : '#'}
                      className="font-semibold text-primary-600 hover:text-primary-700"
                    >
                      {service.provider.name || 'View provider'}
                    </Link>
                  ) : (
                    <span className="font-semibold text-gray-900">{service.providerName}</span>
                  )}
                </span>
              ) : null}

              {service.category && (
                <span className="inline-flex items-center gap-1 text-xs md:text-sm text-gray-500">
                  {service.category.icon && (
                    <span className="material-symbols-outlined text-base align-middle">{service.category.icon}</span>
                  )}
                  <span>{service.category.name}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Main content layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8 items-start">
          {/* Left column: media + details */}
          <div className="space-y-6">
            {/* Media */}
            <div className="rounded-3xl overflow-hidden bg-gray-100 shadow-sm">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={service.title}
                  className="w-full h-80 md:h-96 object-cover"
                />
              ) : (
                <div className="w-full h-80 md:h-96 flex items-center justify-center">
                  <span className="material-symbols-outlined text-7xl text-gray-300">design_services</span>
                </div>
              )}
            </div>

            {/* About this service */}
            <div className="rounded-3xl bg-white shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About this service</h2>
              {service.description ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{service.description}</p>
              ) : (
                <p className="text-gray-500 text-sm">
                  The provider has not added a detailed description for this service yet.
                </p>
              )}

              {service.tags && service.tags.length > 0 && (
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Service tags</p>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Provider summary card */}
            {(service.provider || service.providerName) && (
              <div className="rounded-3xl bg-white shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Service by
                  </p>
                  {service.provider ? (
                    <Link
                      to={service.provider.id ? `/provider/${service.provider.id}` : '#'}
                      className="text-base md:text-lg font-semibold text-gray-900 hover:text-primary-600"
                    >
                      {service.provider.name || 'View provider'}
                    </Link>
                  ) : (
                    <p className="text-base md:text-lg font-semibold text-gray-900">{service.providerName}</p>
                  )}
                </div>

                {service.provider?.id && (
                  <Link
                    to={`/provider/${service.provider.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View provider profile
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right column: price / actions */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-3xl bg-white shadow-md border border-gray-100 p-6 space-y-5">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Starting from
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-primary-600">
                      {service.price
                        ? `K${service.price}`
                        : service.priceType === 'CONTACT_FOR_QUOTE'
                          ? 'Contact for Quote'
                          : 'Price Not Set'}
                    </span>
                  </div>
                </div>

                {priceLabel && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 text-xs font-semibold text-primary-700 border border-primary-100">
                    {priceLabel}
                  </span>
                )}
              </div>

              {service.provider?.id && (
                <Link
                  to={`/provider/${service.provider.id}`}
                  className="block w-full text-center rounded-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 text-sm shadow-sm"
                >
                  Contact Provider
                </Link>
              )}

              {!service.provider?.id && (
                <p className="text-xs text-gray-500">
                  Contact details are available on the provider profile for this service.
                </p>
              )}

              <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                <p>Pricing and availability are managed directly by the provider.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
