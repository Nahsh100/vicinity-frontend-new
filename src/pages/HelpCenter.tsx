import { MagnifyingGlassIcon, UserGroupIcon, BriefcaseIcon, ChatBubbleLeftRightIcon, BookOpenIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

export default function HelpCenter() {
  const helpCategories = [
    {
      icon: UserGroupIcon,
      title: 'Getting Started',
      description: 'Learn the basics of using vicinity',
      articles: [
        'How to create an account',
        'Setting up your profile',
        'Searching for services',
        'Understanding ratings and reviews',
      ],
    },
    {
      icon: BriefcaseIcon,
      title: 'For Service Providers',
      description: 'Guides for providers',
      articles: [
        'Creating your provider profile',
        'Adding services and pricing',
        'Managing bookings',
        'Premium membership benefits',
      ],
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Communication',
      description: 'Connect with providers',
      articles: [
        'How to contact providers',
        'Using WhatsApp integration',
        'Messaging best practices',
        'Response time expectations',
      ],
    },
    {
      icon: CreditCardIcon,
      title: 'Payments & Billing',
      description: 'Payment information',
      articles: [
        'How payments work',
        'Premium subscription plans',
        'Refund policy',
        'Payment methods accepted',
      ],
    },
    {
      icon: BookOpenIcon,
      title: 'Account Management',
      description: 'Manage your account',
      articles: [
        'Updating profile information',
        'Privacy settings',
        'Notification preferences',
        'Deleting your account',
      ],
    },
  ]

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              How can we <span className="text-primary-600">help</span> you?
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-10">
              Search our knowledge base or browse by category below.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-lg text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {helpCategories.map((category, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:border-primary-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4 sm:mb-6">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                    <category.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                      {category.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 sm:space-y-3">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex}>
                      <a
                        href="#"
                        className="text-sm sm:text-base text-gray-700 hover:text-primary-600 transition-colors flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-primary-600 rounded-full flex-shrink-0" />
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-gray-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">
            Popular Resources
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link
              to="/faq"
              className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all text-center group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl sm:text-3xl">❓</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">FAQ</h3>
              <p className="text-xs sm:text-sm text-gray-600">Common questions answered</p>
            </Link>

            <Link
              to="/contact"
              className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all text-center group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl sm:text-3xl">💬</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Contact Us</h3>
              <p className="text-xs sm:text-sm text-gray-600">Get in touch with support</p>
            </Link>

            <Link
              to="/feedback"
              className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all text-center group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl sm:text-3xl">💡</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Feedback</h3>
              <p className="text-xs sm:text-sm text-gray-600">Share your suggestions</p>
            </Link>

            <Link
              to="/about"
              className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all text-center group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl sm:text-3xl">ℹ️</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">About Us</h3>
              <p className="text-xs sm:text-sm text-gray-600">Learn about vicinity</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            Still need help?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
            Our support team is available to assist you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors shadow-lg text-sm sm:text-base"
            >
              Contact Support
            </Link>
            <Link
              to="/feedback"
              className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 hover:border-primary-600 text-gray-700 hover:text-primary-600 rounded-lg font-semibold transition-colors text-sm sm:text-base"
            >
              Send Feedback
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
