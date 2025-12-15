import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface FAQItem {
  question: string
  answer: string
  category: 'general' | 'providers' | 'customers'
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'providers' | 'customers'>('all')

  const faqs: FAQItem[] = [
    {
      category: 'general',
      question: 'What is vicinity?',
      answer: 'vicinity is a platform that connects local service providers with customers in their community. We make it easy to find trusted professionals for all your service needs, from home repairs to personal services.',
    },
    {
      category: 'general',
      question: 'How does vicinity work?',
      answer: 'Simply search for the service you need, browse through verified providers in your area, check their ratings and reviews, and contact them directly. It\'s that simple!',
    },
    {
      category: 'general',
      question: 'Is vicinity free to use?',
      answer: 'Yes! Creating an account and searching for services is completely free. Service providers may have subscription plans for premium features.',
    },
    {
      category: 'customers',
      question: 'How do I find a service provider?',
      answer: 'Use our search feature on the homepage. You can search by service type, location, and other filters to find the perfect provider for your needs.',
    },
    {
      category: 'customers',
      question: 'Are service providers verified?',
      answer: 'Yes, all providers go through a verification process. Look for the verified badge on provider profiles for added peace of mind.',
    },
    {
      category: 'customers',
      question: 'Can I leave reviews?',
      answer: 'Absolutely! After using a service, we encourage you to leave a review to help other customers make informed decisions.',
    },
    {
      category: 'providers',
      question: 'How do I become a service provider on vicinity?',
      answer: 'Sign up for an account, complete your provider profile with your services, pricing, and availability. Once verified, you\'ll start appearing in search results!',
    },
    {
      category: 'providers',
      question: 'What are the benefits of premium membership?',
      answer: 'Premium members get featured placement in search results, priority customer support, advanced analytics, and the ability to showcase unlimited services and projects.',
    },
    {
      category: 'providers',
      question: 'How do I get more customers?',
      answer: 'Complete your profile fully, add quality photos, respond quickly to inquiries, maintain high ratings, and consider upgrading to a premium plan for better visibility.',
    },
    {
      category: 'customers',
      question: 'How do I contact a service provider?',
      answer: 'You can contact providers directly through their profile page using phone, WhatsApp, or email. Premium providers may have additional contact options.',
    },
    {
      category: 'providers',
      question: 'Can I offer multiple services?',
      answer: 'Yes! You can add as many services as you offer. This helps customers find you for different needs.',
    },
    {
      category: 'general',
      question: 'What if I have a problem with a service provider?',
      answer: 'Contact our support team immediately. We take all complaints seriously and will work to resolve the issue.',
    },
  ]

  const filteredFAQs = activeCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === activeCategory)

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Frequently Asked <span className="text-primary-600">Questions</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about using vicinity.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all text-sm sm:text-base ${
                activeCategory === 'all'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Questions
            </button>
            <button
              onClick={() => setActiveCategory('general')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all text-sm sm:text-base ${
                activeCategory === 'general'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveCategory('customers')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all text-sm sm:text-base ${
                activeCategory === 'customers'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              For Customers
            </button>
            <button
              onClick={() => setActiveCategory('providers')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all text-sm sm:text-base ${
                activeCategory === 'providers'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              For Providers
            </button>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-2xl overflow-hidden hover:border-primary-200 transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="font-semibold text-gray-900 pr-4 text-sm sm:text-base lg:text-lg">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-5 sm:px-6 pb-4 sm:pb-5 bg-gray-50">
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still Have Questions */}
          <div className="mt-12 sm:mt-16 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Still have questions?</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <a
              href="/contact"
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors shadow-lg text-sm sm:text-base"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
