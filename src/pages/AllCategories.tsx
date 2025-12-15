import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { categoriesApi } from '@/services/api'
import { Category } from '@/types'

// Default category icons mapping
const defaultCategoryIcons: Record<string, string> = {
  'Home Services': 'home_repair_service',
  'Food & Drink': 'restaurant',
  'Health & Wellness': 'spa',
  'Shopping': 'shopping_bag',
  'Beauty': 'auto_awesome',
  'Entertainment': 'sports_esports',
}

export default function AllCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const categoriesData = await categoriesApi.getAll()
        setCategories(categoriesData)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        setError('Failed to load categories. Please try again later.')
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
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
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              All <span className="text-primary-600">Categories</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Browse all available service categories to find exactly what you're looking for
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">category</span>
              <p className="text-lg">No categories available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/search?categoryId=${category.id}`}
                  className="group flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-white border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity blur-xl"></div>
                    <div className="relative flex items-center justify-center w-16 h-16 bg-primary-50 group-hover:bg-primary-100 rounded-2xl transition-all duration-300 group-hover:scale-110">
                      <span className="material-symbols-outlined text-4xl text-primary-500">
                        {category.icon || defaultCategoryIcons[category.name] || 'category'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Try searching for specific services or browse all available providers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="inline-block bg-primary-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl"
              >
                Search Services
              </Link>
              <Link
                to="/"
                className="inline-block bg-white text-primary-600 border-2 border-primary-500 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
