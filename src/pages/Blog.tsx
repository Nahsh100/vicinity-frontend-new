import { CalendarIcon, UserIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: 'How to Choose the Right Service Provider',
      excerpt: 'Learn the key factors to consider when selecting a service provider for your needs.',
      author: 'vicinity Team',
      date: 'December 10, 2024',
      category: 'Tips & Guides',
      image: null,
    },
    {
      id: 2,
      title: '5 Benefits of Supporting Local Businesses',
      excerpt: 'Discover why choosing local providers strengthens your community and creates lasting impact.',
      author: 'vicinity Team',
      date: 'December 5, 2024',
      category: 'Community',
      image: null,
    },
    {
      id: 3,
      title: 'Getting Started as a Service Provider',
      excerpt: 'A complete guide to creating your profile and attracting your first customers on vicinity.',
      author: 'vicinity Team',
      date: 'November 28, 2024',
      category: 'For Providers',
      image: null,
    },
  ]

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              vicinity <span className="text-primary-600">Blog</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Tips, insights, and stories from our community of service providers and customers.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Placeholder Image */}
                <div className="h-48 sm:h-56 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <span className="text-primary-600 text-5xl sm:text-6xl font-bold opacity-20">
                    {post.id}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  {/* Category */}
                  <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full mb-3 sm:mb-4 self-start">
                    {post.category}
                  </span>

                  {/* Title */}
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>

                  {/* Read More */}
                  <button className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors text-sm sm:text-base">
                    Read More
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Coming Soon Message */}
          <div className="mt-12 sm:mt-16 text-center">
            <div className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 rounded-full">
              <p className="text-sm sm:text-base text-gray-600">
                More articles coming soon! Check back regularly for new content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
            Get the latest tips, insights, and community stories delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
            />
            <button
              type="submit"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors shadow-lg text-sm sm:text-base whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
