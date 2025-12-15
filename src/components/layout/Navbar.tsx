import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import logo from '@/assets/images/logo.png'
import NotificationsBell from './NotificationsBell'

export default function Navbar() {
  const { user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <img
                src={logo}
                alt="vicinity"
                className="h-8 w-8 sm:h-10 sm:w-10 md:h-36 md:w-36 group-hover:scale-110 transition-transform object-contain"
              />
              {/* <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">vicinity</span> */}
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-10 md:flex md:space-x-1">
              <Link
                to="/search"
                className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-all"
              >
                Explore
              </Link>
              <Link
                to="/favorites"
                className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-all"
              >
                My Favorites
              </Link>
              <Link
                to="/groups"
                className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-all"
              >
                Groups
              </Link>
            </div>
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <SignedIn>
              <NotificationsBell />
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
              >
                <span className="font-medium">{user?.firstName || user?.fullName}</span>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-9 w-9 sm:h-10 sm:w-10',
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <Link
                to="/sign-in"
                className="hidden sm:inline-block px-4 md:px-5 py-2 md:py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all hover:border-gray-400"
              >
                Log In
              </Link>
              <Link
                to="/sign-up"
                className="px-3 sm:px-4 md:px-5 py-2 md:py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                Sign Up
              </Link>
            </SignedOut>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all"
              >
                Explore
              </Link>
              <Link
                to="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all"
              >
                My Favorites
              </Link>
              <Link
                to="/groups"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all"
              >
                Groups
              </Link>
              <SignedIn>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all sm:hidden"
                >
                  Dashboard
                </Link>
              </SignedIn>
              <SignedOut>
                <Link
                  to="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all sm:hidden"
                >
                  Log In
                </Link>
              </SignedOut>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
