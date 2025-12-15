import { useState, useEffect } from 'react'
import { FunnelIcon } from '@heroicons/react/24/outline'
import { categoriesApi, organizationsApi } from '@/services/api'
import { Category, Organization } from '@/types'

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void
  initialRadius?: string
  isMobile?: boolean
}

export default function FilterSidebar({ onFilterChange, initialRadius = '10', isMobile = false }: FilterSidebarProps) {
  const [filters, setFilters] = useState({
    keyword: '',
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    radius: initialRadius,
    organizationId: '',
    sortBy: 'relevance',
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch categories and organizations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, organizationsData] = await Promise.all([
          categoriesApi.getAll(),
          organizationsApi.getAll(),
        ])
        setCategories(categoriesData)
        setOrganizations(organizationsData)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch filter data:', err)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (initialRadius) {
      setFilters(prev => ({ ...prev, radius: initialRadius }))
    }
  }, [initialRadius])

  const handleChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const cleared = {
      keyword: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      radius: '10',
      organizationId: '',
      sortBy: 'relevance',
    }
    setFilters(cleared)
    onFilterChange(cleared)
  }

  return (
    <div className={isMobile ? '' : 'card sticky top-4'}>
      {!isMobile && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Keyword Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Keyword
          </label>
          <input
            type="text"
            placeholder="e.g., plumber, hairdresser..."
            value={filters.keyword}
            onChange={(e) => handleChange('keyword', e.target.value)}
            className="input"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.categoryId}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            className="input"
            disabled={loading}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon ? `${cat.icon} ` : ''}{cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range (ZMW)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="input"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="input"
            />
          </div>
        </div>

        {/* Radius */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Distance: {filters.radius} km
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={filters.radius}
            onChange={(e) => handleChange('radius', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 km</span>
            <span>100 km</span>
          </div>
        </div>

        {/* Organization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization
          </label>
          <select
            value={filters.organizationId}
            onChange={(e) => handleChange('organizationId', e.target.value)}
            className="input"
            disabled={loading}
          >
            <option value="">All Organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="input"
          >
            <option value="relevance">Relevance</option>
            <option value="distance">Distance</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>
    </div>
  )
}
