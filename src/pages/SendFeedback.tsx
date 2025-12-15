import { useState } from 'react'
import { ChatBubbleLeftRightIcon, LightBulbIcon, ExclamationTriangleIcon, HeartIcon } from '@heroicons/react/24/outline'

export default function SendFeedback() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'suggestion',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const feedbackTypes = [
    { value: 'suggestion', label: 'Suggestion', icon: LightBulbIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { value: 'bug', label: 'Bug Report', icon: ExclamationTriangleIcon, color: 'text-red-600', bg: 'bg-red-100' },
    { value: 'feature', label: 'Feature Request', icon: ChatBubbleLeftRightIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
    { value: 'compliment', label: 'Compliment', icon: HeartIcon, color: 'text-pink-600', bg: 'bg-pink-100' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement form submission
    console.log('Feedback submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', type: 'suggestion', subject: '', message: '' })
    }, 3000)
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              We Value Your <span className="text-primary-600">Feedback</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Help us improve vicinity by sharing your thoughts, suggestions, or reporting issues.
            </p>
          </div>
        </div>
      </section>

      {/* Feedback Form */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 lg:p-10">
            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm sm:text-base">
                  Thank you for your feedback! We appreciate your input and will review it carefully.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Feedback Type Selection */}
              <div>
                <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  What type of feedback are you sharing?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {feedbackTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`p-4 sm:p-6 rounded-xl border-2 transition-all text-left ${
                        formData.type === type.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${type.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <type.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${type.color}`} />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="john@example.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    We'll use this to follow up if needed
                  </p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Brief description of your feedback"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Details *
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm sm:text-base"
                  placeholder="Please provide as much detail as possible..."
                />
                <p className="mt-2 text-xs text-gray-500">
                  {formData.type === 'bug' && 'Please include steps to reproduce the issue, what you expected, and what actually happened.'}
                  {formData.type === 'feature' && 'Describe the feature and how it would benefit you and other users.'}
                  {formData.type === 'suggestion' && 'Share your ideas on how we can improve vicinity.'}
                  {formData.type === 'compliment' && 'We love hearing what you enjoy! Let us know what we\'re doing right.'}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors shadow-lg text-base sm:text-lg"
              >
                Submit Feedback
              </button>
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Your feedback helps us make vicinity better for everyone.
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              All feedback is reviewed by our team. We may not be able to respond to every submission, but we read and consider all feedback carefully.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
