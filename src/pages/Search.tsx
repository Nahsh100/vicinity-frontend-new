import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapIcon, ListBulletIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import FilterSidebar from '@/components/search/FilterSidebar'
import ProviderCard from '@/components/common/ProviderCard'
import ProviderMap from '@/components/common/ProviderMap'
import LocationBeamAnimation from '@/components/common/LocationBeamAnimation'
import { providersApi } from '@/services/api'
import type { Provider, SearchParams } from '@/types'

export default function Search() {
  const [searchParams] = useSearchParams()
  const [providers, setProviders] = useState<Provider[]>([])
  const [view, setView] = useState<'list' | 'map'>('list')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [radius, setRadius] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Fetch providers from API
  const fetchProviders = async (filters: any = {}, page: number = 1) => {
    try {
      setLoading(true)
      setError(null)

      // Build search params from URL and filters
      const searchPayload: SearchParams = {
        keyword: filters.keyword || searchParams.get('keyword') || undefined,
        categoryId: filters.categoryId || searchParams.get('categoryId') || undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        organizationId: filters.organizationId || searchParams.get('organizationId') || undefined,
        groupId: filters.groupId || searchParams.get('groupId') || undefined,
        radius: filters.radius ? Number(filters.radius) : (searchParams.get('radius') ? Number(searchParams.get('radius')) : 10),
        sortBy: filters.sortBy || 'relevance',
        page,
        limit: 12,
      }

      // Update radius state
      if (searchPayload.radius) {
        setRadius(searchPayload.radius)
      }

      // Try to get user location for nearby search
      if (navigator.geolocation && !searchPayload.lat && !searchPayload.lng) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            searchPayload.lat = position.coords.latitude
            searchPayload.lng = position.coords.longitude

            const response = await providersApi.search(searchPayload)
            setProviders(response.results)
            setCurrentPage(response.pagination.page)
            setTotalPages(response.pagination.totalPages)
            setTotalResults(response.pagination.total)
            setLoading(false)
          },
          async () => {
            // Location access denied, search without location
            const response = await providersApi.search(searchPayload)
            setProviders(response.results)
            setCurrentPage(response.pagination.page)
            setTotalPages(response.pagination.totalPages)
            setTotalResults(response.pagination.total)
            setLoading(false)
          }
        )
      } else {
        const response = await providersApi.search(searchPayload)
        setProviders(response.results)
        setCurrentPage(response.pagination.page)
        setTotalPages(response.pagination.totalPages)
        setTotalResults(response.pagination.total)
        setLoading(false)
      }
    } catch (err) {
      console.error('Failed to fetch providers:', err)
      setError('Failed to load providers. Please try again.')
      setLoading(false)
    }
  }

  // Initial load from URL params
  useEffect(() => {
    fetchProviders({}, 1)
  }, [searchParams])

  const handleFilterChange = (filters: any) => {
    setCurrentPage(1)
    fetchProviders(filters, 1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchProviders({}, page)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Location Beam Animation */}
      <LocationBeamAnimation isSearching={loading} />

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Find Local Services</h1>
          <p className="text-primary-100 text-lg">
            {loading ? 'Searching...' : `${totalResults} provider${totalResults !== 1 ? 's' : ''} found within ${radius} km`}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="w-80 flex-shrink-0 hidden lg:block">
            <FilterSidebar onFilterChange={handleFilterChange} initialRadius={radius.toString()} />
          </aside>

          {/* Results */}
          <main className="flex-1">
            {/* View Toggle and Mobile Filter Button */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Search Results
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {loading ? 'Loading...' : `Showing ${providers.length} of ${totalResults} provider${totalResults !== 1 ? 's' : ''}`}
                </p>
              </div>

              <div className="flex gap-2">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden p-2 sm:px-4 sm:py-2 rounded-lg bg-white text-gray-600 hover:bg-gray-100 flex items-center gap-2 border border-gray-300"
                >
                  <FunnelIcon className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm font-medium">Filters</span>
                </button>

                {/* View Toggle Buttons */}
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded-lg ${
                    view === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`p-2 rounded-lg ${
                    view === 'map'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MapIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Results Grid */}
            {view === 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))
                ) : error ? (
                  <div className="col-span-2 text-center py-12 bg-white rounded-lg">
                    <p className="text-red-600 text-lg mb-4">{error}</p>
                    <button
                      onClick={() => fetchProviders({}, 1)}
                      className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                    >
                      Retry
                    </button>
                  </div>
                ) : providers.length > 0 ? (
                  providers.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 bg-white rounded-lg">
                    <p className="text-gray-600 text-lg">No providers found matching your criteria.</p>
                    <p className="text-gray-500 mt-2">Try adjusting your filters.</p>
                  </div>
                )}
              </div>
            )}

            {/* Map View */}
            {view === 'map' && (
              <div className="bg-white rounded-2xl overflow-hidden" style={{ height: '600px' }}>
                <ProviderMap providers={providers} />
              </div>
            )}

            {/* Pagination */}
            {!loading && providers.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Dialog */}
      <Dialog
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        className="relative z-50 lg:hidden"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Full-screen scrollable container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center">
            <Dialog.Panel className="w-full sm:max-w-md bg-white sm:rounded-t-2xl rounded-t-2xl shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <Dialog.Title className="text-lg font-bold text-gray-900">
                  Filters
                </Dialog.Title>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Filters Content */}
              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                <FilterSidebar
                  onFilterChange={(filters) => {
                    handleFilterChange(filters)
                    setMobileFiltersOpen(false)
                  }}
                  initialRadius={radius.toString()}
                  isMobile={true}
                />
              </div>

              {/* Footer with Apply Button */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
