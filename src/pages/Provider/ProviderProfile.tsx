import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import {
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckBadgeIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/solid'
import { ChatBubbleLeftRightIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline'
import { providersApi, servicesApi, reviewsApi, projectsApi } from '@/services/api'
import { Provider, Service, Review, Project } from '@/types'
import ProviderMap from '@/components/common/ProviderMap'

// Base API URL (e.g. http://localhost:3000/api/v1)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Strip `/api/v1` from the end to get the backend origin for serving static files like `/uploads/...`
const BACKEND_ORIGIN = API_URL.replace(/\/?api\/v1\/?$/, '')

export default function ProviderProfile() {
  const { id } = useParams()
  const { user } = useUser()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState<number | null>(null)
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        // Fetch provider data, services, projects, and reviews in parallel
        const [providerData, servicesData, projectsData, reviewsData] = await Promise.all([
          providersApi.getById(id),
          servicesApi.getByProvider(id),
          projectsApi.getByProvider(id),
          reviewsApi.getByProvider(id),
        ])

        setProvider(providerData)
        setServices(servicesData)
        setProjects(projectsData)
        setReviews(reviewsData)

        // Track view
        await providersApi.trackView(id)

        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch provider data:', err)
        setError('Failed to load provider information.')
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  useEffect(() => {
    if (!user) {
      setReviewRating(null)
      setReviewText('')
      return
    }

    const existing = reviews.find((r) => r.user.id === user.id)
    if (existing) {
      setReviewRating(existing.rating)
      setReviewText(existing.text || '')
    } else {
      setReviewRating(null)
      setReviewText('')
    }
  }, [user, reviews])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!provider?.id) return

    if (!user) {
      setReviewError('Please sign in to leave a review.')
      return
    }

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      setReviewError('Please select a rating between 1 and 5 stars.')
      return
    }

    const trimmedText = reviewText.trim()
    if (trimmedText.length > 2000) {
      setReviewError('Review text is too long. Please keep it under 2000 characters.')
      return
    }

    setReviewSubmitting(true)
    setReviewError(null)

    const existing = user ? reviews.find((r) => r.user.id === user.id) : undefined

    try {
      if (existing) {
        const updated = await reviewsApi.update(existing.id, {
          rating: reviewRating,
          text: trimmedText || undefined,
        })
        setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      } else {
        const created = await reviewsApi.create({
          rating: reviewRating,
          text: trimmedText || undefined,
          providerId: provider.id,
        })
        setReviews((prev) => [created, ...prev])
      }
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 409) {
        setReviewError('You have already reviewed this provider. Please refresh the page.')
      } else if (status === 403) {
        setReviewError('You are not allowed to review this provider.')
      } else {
        setReviewError('Failed to submit review. Please try again.')
      }
    } finally {
      setReviewSubmitting(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!user) return
    const existing = reviews.find((r) => r.user.id === user.id)
    if (!existing) return

    try {
      setReviewSubmitting(true)
      setReviewError(null)
      await reviewsApi.delete(existing.id)
      setReviews((prev) => prev.filter((r) => r.id !== existing.id))
      setReviewRating(null)
      setReviewText('')
    } catch (err) {
      setReviewError('Failed to delete review. Please try again.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading provider...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !provider) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {error || 'Provider not found'}
        </h1>
        {error && (
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

  const bannerImagePath = provider.bannerImage || provider.businessImage
  const profileImagePath = provider.profileImage

  const bannerImageUrl = bannerImagePath
    ? bannerImagePath.startsWith('http')
      ? bannerImagePath
      : `${BACKEND_ORIGIN}${bannerImagePath}`
    : null

  const profileImageUrl = profileImagePath
    ? profileImagePath.startsWith('http')
      ? profileImagePath
      : `${BACKEND_ORIGIN}${profileImagePath}`
    : null

  const getWhatsAppLink = (rawNumber: string) => {
    const phoneDigits = rawNumber.replace(/[^0-9]/g, '')

    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || ''
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)

      // On mobile, prefer deep link to the WhatsApp app
      if (isMobile) {
        return `whatsapp://send?phone=${phoneDigits}`
      }

      // On desktop, open WhatsApp Web / desktop app
      return `https://wa.me/${phoneDigits}`
    }

    return `https://wa.me/${phoneDigits}`
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Banner + Profile Hero */}
      <section className="relative">
        <div className="h-64 md:h-80 w-full overflow-hidden bg-gradient-to-r from-primary-600 to-primary-400">
          {bannerImageUrl && (
            <img
              src={bannerImageUrl}
              alt={provider.name}
              className="w-full h-full object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />

          {/* Top badges */}
          <div className="absolute top-6 right-6 flex flex-wrap gap-3">
            {provider.isFeatured && (
              <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs md:text-sm font-bold rounded-full shadow-xl">
                FEATURED
              </span>
            )}
            {provider.subscriptionPlan === 'PREMIUM' && (
              <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs md:text-sm font-semibold rounded-full shadow-xl">
                ⭐ PREMIUM
              </span>
            )}
          </div>

          {/* Provider core info */}
          <div className="absolute inset-x-0 bottom-0 pb-6">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-end gap-6">
              {/* Avatar */}
              <div className="-mb-12 md:-mb-16">
                <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl md:rounded-[1.5rem] border-4 border-white shadow-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={provider.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-5xl text-gray-300">storefront</span>
                  )}
                </div>
              </div>

              {/* Text info */}
              <div className="text-white mb-4 md:mb-8 flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-lg">
                    {provider.name}
                  </h1>
                  {provider.isVerified && (
                    <CheckBadgeIcon className="h-8 w-8 md:h-9 md:w-9 text-blue-400 drop-shadow-lg" title="Verified Provider" />
                  )}
                </div>

                {provider.category && (
                  <div className="inline-flex items-center gap-2 text-sm md:text-base px-3 py-1 rounded-full bg-white/10 backdrop-blur-md mb-4">
                    {provider.category.icon && (
                      <span className="material-symbols-outlined text-xl md:text-2xl">{provider.category.icon}</span>
                    )}
                    <span className="font-medium">{provider.category.name}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
                  <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <StarIcon className="h-4 w-4 md:h-5 md:w-5 text-yellow-300" />
                    <span className="font-semibold text-base md:text-lg">{provider.ratingAverage.toFixed(1)}</span>
                    <span className="text-white/80">({provider.ratingCount} reviews)</span>
                  </div>

                  {provider.distance && (
                    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{provider.distance.toFixed(1)} km away</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pt-16 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="card shadow-sm hover:shadow-md transition-shadow border border-gray-100 bg-white/80 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">About</h2>
                  <p className="mt-1 text-sm text-gray-500">Overview of this provider and what they offer</p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed text-base">{provider.bio}</p>

              {provider.organization && (
                <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <BuildingOfficeIcon className="h-5 w-5" />
                    <span className="font-medium">Member of</span>
                    <span className="text-primary-600 font-semibold">{provider.organization.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Projects / Portfolio */}
            <div className="card shadow-sm hover:shadow-md transition-shadow border border-gray-100 bg-white/80 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
                  <p className="mt-1 text-sm text-gray-500">Examples of this provider's past work</p>
                </div>
                {projects.length > 0 && (
                  <span className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {projects.length} project{projects.length === 1 ? '' : 's'}
                  </span>
                )}
              </div>

              {projects.length > 0 ? (
                <div className="grid gap-4">
                  {projects.map((project) => {
                    const imageUrl = project.image
                      ? project.image.startsWith('http')
                        ? project.image
                        : `${BACKEND_ORIGIN}${project.image}`
                      : null

                    const youtubeEmbedUrl = project.youtubeUrl
                      ? (() => {
                          try {
                            const url = new URL(project.youtubeUrl)
                            if (url.hostname.includes('youtube.com')) {
                              const v = url.searchParams.get('v')
                              if (v) return `https://www.youtube.com/embed/${v}`
                            }
                            if (url.hostname === 'youtu.be') {
                              const idFromPath = url.pathname.replace('/', '')
                              if (idFromPath) return `https://www.youtube.com/embed/${idFromPath}`
                            }
                            return null
                          } catch {
                            return null
                          }
                        })()
                      : null

                    return (
                      <Link
                        key={project.id}
                        to={`/project/${project.id}`}
                        className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        {imageUrl && (
                          <div className="w-full md:w-48 flex-shrink-0">
                            <img
                              src={imageUrl}
                              alt={project.title}
                              className="w-full h-32 md:h-32 object-cover rounded-xl"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                            {project.title}
                          </h3>
                          {project.description && (
                            <div
                              className="prose prose-sm max-w-none text-gray-700"
                              dangerouslySetInnerHTML={{ __html: project.description }}
                            />
                          )}
                          {youtubeEmbedUrl && (
                            <div className="mt-3">
                              <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden bg-black/5">
                                <iframe
                                  src={youtubeEmbedUrl}
                                  title={project.title}
                                  className="absolute inset-0 w-full h-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No projects added yet.
                </div>
              )}
            </div>

            {/* Services */}
            <div className="card shadow-sm hover:shadow-md transition-shadow border border-gray-100 bg-white/80 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Services Offered</h2>
                  <p className="mt-1 text-sm text-gray-500">What you can book from this provider</p>
                </div>
                {services.length > 0 && (
                  <span className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {services.length} service{services.length === 1 ? '' : 's'} listed
                  </span>
                )}
              </div>
              <div className="grid gap-4">
                {services.length > 0 ? (
                  services.map((service) => {
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
                        className="flex justify-between items-start p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-100 transition-all cursor-pointer"
                      >
                        <div className="flex-1 pr-4">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">{service.title}</h3>
                          <p className="text-gray-600 text-sm mt-0.5 line-clamp-3">{service.description}</p>
                        </div>
                        <div className="ml-2 text-right min-w-[140px]">
                          {priceLabel && (
                            <div className="inline-flex items-center justify-end mb-1">
                              <span className="text-xs font-semibold text-primary-900 bg-primary-100 px-2.5 py-1 rounded-full">
                                {priceLabel}
                              </span>
                            </div>
                          )}
                          <p className="text-xl md:text-2xl font-bold text-primary-600">
                            {service.price ? `ZMW ${service.price}` : (service.priceType === 'CONTACT_FOR_QUOTE' ? 'Contact for Quote' : 'Price Not Set')}
                          </p>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <div className="py-8 text-center text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No services listed yet.
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="card shadow-sm hover:shadow-md transition-shadow border border-gray-100 bg-white/80 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                  <p className="mt-1 text-sm text-gray-500">What other customers are saying</p>
                </div>
                <span className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {reviews.length} review{reviews.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="space-y-6">
                {/* Review form */}
                <div className="border border-gray-100 rounded-xl bg-gray-50/80 p-4">
                  {user ? (
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Your review</p>
                          <p className="text-xs text-gray-500">Rate your experience with this provider</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none"
                            >
                              <StarIcon
                                className={`h-6 w-6 ${
                                  reviewRating && star <= reviewRating
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                        placeholder="Share details about your experience (optional)"
                      />

                      {reviewError && (
                        <p className="text-xs text-red-600">{reviewError}</p>
                      )}

                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="inline-flex items-center justify-center rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-60"
                        >
                          {reviews.find((r) => user && r.user.id === user.id)
                            ? reviewSubmitting
                              ? 'Updating review...'
                              : 'Update review'
                            : reviewSubmitting
                              ? 'Submitting review...'
                              : 'Submit review'}
                        </button>

                        {reviews.find((r) => user && r.user.id === user.id) && (
                          <button
                            type="button"
                            onClick={handleDeleteReview}
                            disabled={reviewSubmitting}
                            className="text-xs text-gray-500 hover:text-red-600"
                          >
                            Delete review
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <p className="text-sm text-gray-600">
                      <Link to="/sign-in" className="text-primary-600 font-semibold hover:text-primary-700">
                        Sign in
                      </Link>{' '}
                      to leave a review for this provider.
                    </p>
                  )}
                </div>

                {/* Review list */}
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{review.user.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.text && (
                        <p className="text-gray-700 text-sm leading-relaxed mt-1">{review.text}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No reviews yet. Be the first to review!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="relative rounded-3xl bg-white shadow-md border border-gray-100">
              <div className="absolute inset-y-4 left-0 w-1 rounded-full bg-primary-500" />
              <div className="relative px-6 py-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Details</h3>

                <div className="space-y-3">
                  {provider.phone && (
                    <a
                      href={`tel:${provider.phone}`}
                      className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                          <PhoneIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Phone Number</p>
                          <p className="text-sm font-semibold text-gray-900">{provider.phone}</p>
                        </div>
                      </div>
                      <ArrowUpRightIcon className="h-4 w-4 text-gray-400" />
                    </a>
                  )}

                  {provider.whatsapp && (
                    <a
                      href={getWhatsAppLink(provider.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                          <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">WhatsApp</p>
                          <p className="text-sm font-semibold text-gray-900">{provider.whatsapp}</p>
                        </div>
                      </div>
                      <ArrowUpRightIcon className="h-4 w-4 text-gray-400" />
                    </a>
                  )}

                  {provider.email && (
                    <a
                      href={`mailto:${provider.email}`}
                      className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                          <EnvelopeIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Email Address</p>
                          <p className="text-sm font-semibold text-gray-900 break-all">{provider.email}</p>
                        </div>
                      </div>
                      <ArrowUpRightIcon className="h-4 w-4 text-gray-400" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Price Range */}
            {provider.priceRangeMin && provider.priceRangeMax && (
              <div className="card border border-gray-100 shadow-sm bg-white/90">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Price Range</h3>
                <p className="text-sm text-gray-500 mb-3">Typical service cost</p>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">
                    ZMW {provider.priceRangeMin} - {provider.priceRangeMax}
                  </p>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="card border border-gray-100 shadow-sm bg-white/90">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Location</h3>
              <div className="flex items-start gap-3 mb-3">
                <MapPinIcon className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700">{provider.address}</p>
              </div>

              {provider.latitude !== undefined && provider.longitude !== undefined ? (
                <div className="mt-3 h-64">
                  <ProviderMap
                    providers={[provider]}
                    center={{ latitude: provider.latitude, longitude: provider.longitude }}
                  />
                </div>
              ) : (
                <div className="mt-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-dashed border-gray-200 text-center">
                  <p className="text-gray-500 text-sm">Map preview</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Location coordinates not set for this provider.
                  </p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="card bg-gray-50/80 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Services</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white text-gray-900 font-semibold">
                    {provider._count?.services || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reviews</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white text-gray-900 font-semibold">
                    {provider._count?.reviews || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Photos</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white text-gray-900 font-semibold">
                    {provider._count?.media || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
