import { UsersIcon, MapPinIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function AboutUs() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              About <span className="text-primary-600">vicinity</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Connecting local communities with trusted service providers, one connection at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Our Mission</h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              We believe in the power of local communities. Our mission is to make it easy for people to find and connect with quality service providers in their neighborhood, fostering trust and building stronger communities.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center p-6 sm:p-8">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 rounded-2xl mb-4 sm:mb-6">
                <UsersIcon className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Community First</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Building strong local connections that benefit everyone in the community.
              </p>
            </div>

            <div className="text-center p-6 sm:p-8">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 rounded-2xl mb-4 sm:mb-6">
                <HeartIcon className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Trust & Quality</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Every provider is verified to ensure you get reliable, quality service.
              </p>
            </div>

            <div className="text-center p-6 sm:p-8">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 rounded-2xl mb-4 sm:mb-6">
                <MapPinIcon className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Local Focus</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Supporting local businesses and helping your neighborhood thrive.
              </p>
            </div>

            <div className="text-center p-6 sm:p-8">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 rounded-2xl mb-4 sm:mb-6">
                <SparklesIcon className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Easy to Use</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Simple, intuitive platform that makes finding services effortless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-gray-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Our Story</h2>
            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
              <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                vicinity was born from a simple observation: finding reliable local services shouldn't be difficult. We noticed that while big national platforms existed, they often overlooked the unique needs of local communities.
              </p>
              <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                We started with a vision to create a platform that celebrates local expertise and makes it easy for people to discover trusted professionals in their neighborhood. From plumbers and electricians to tutors and event planners, we believe every community has talented individuals ready to serve.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we're proud to connect thousands of service providers with customers who value quality, trust, and the power of supporting local businesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            Join Our Community
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Whether you're looking for services or providing them, vicinity is here to help you connect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/search"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors shadow-lg text-base sm:text-lg"
            >
              Find Services
            </a>
            <a
              href="/sign-up"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 hover:border-primary-600 text-gray-700 hover:text-primary-600 rounded-lg font-semibold transition-colors text-base sm:text-lg"
            >
              Become a Provider
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
