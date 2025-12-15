import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react'
import { setAuthTokenGetter } from '@/services/api/client'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import SignInPage from '@/pages/Auth/SignIn'
import SignUpPage from '@/pages/Auth/SignUp'
import Search from '@/pages/Search'
import Groups from '@/pages/Groups'
import Favorites from '@/pages/Favorites'
import ProviderProfile from '@/pages/Provider/ProviderProfile'
import ServiceDetails from '@/pages/Service/ServiceDetails'
import ProjectDetails from '@/pages/Project/ProjectDetails'
import Dashboard from '@/pages/Dashboard/Dashboard'
import DashboardProfile from '@/pages/Dashboard/DashboardProfile'
import DashboardServices from '@/pages/Dashboard/DashboardServices'
import DashboardAnalytics from '@/pages/Dashboard/DashboardAnalytics'
import DashboardProjects from '@/pages/Dashboard/DashboardProjects'
import DashboardOrganization from '@/pages/Dashboard/DashboardOrganization'
import DashboardNotifications from '@/pages/Dashboard/DashboardNotifications'
import CreateOrganization from '@/pages/Organization/CreateOrganization'
import OrganizationView from '@/pages/Organization/OrganizationView'
import AboutUs from '@/pages/AboutUs'
import Blog from '@/pages/Blog'
import ContactUs from '@/pages/ContactUs'
import FAQ from '@/pages/FAQ'
import HelpCenter from '@/pages/HelpCenter'
import SendFeedback from '@/pages/SendFeedback'
import TermsOfService from '@/pages/TermsOfService'
import PrivacyPolicy from '@/pages/PrivacyPolicy'
import AllCategories from '@/pages/AllCategories'

// Protected Route component using Clerk
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

function App() {
  const { getToken } = useAuth()

  // Set up the token getter for API client
  useEffect(() => {
    setAuthTokenGetter(() => getToken())
  }, [getToken])

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="sign-in/*" element={<SignInPage />} />
        <Route path="sign-up/*" element={<SignUpPage />} />
        <Route path="search" element={<Search />} />
        <Route path="categories" element={<AllCategories />} />
        <Route path="groups" element={<Groups />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="provider/:id" element={<ProviderProfile />} />
        <Route path="service/:id" element={<ServiceDetails />} />
        <Route path="project/:id" element={<ProjectDetails />} />
        <Route path="organization/:id" element={<OrganizationView />} />

        {/* Footer pages */}
        <Route path="about" element={<AboutUs />} />
        <Route path="blog" element={<Blog />} />
        <Route path="contact" element={<ContactUs />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="help" element={<HelpCenter />} />
        <Route path="feedback" element={<SendFeedback />} />
        <Route path="terms" element={<TermsOfService />} />
        <Route path="privacy" element={<PrivacyPolicy />} />

        {/* Protected routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<DashboardProfile />} />
          <Route path="services" element={<DashboardServices />} />
          <Route path="projects" element={<DashboardProjects />} />
          <Route path="organization" element={<DashboardOrganization />} />
          <Route path="analytics" element={<DashboardAnalytics />} />
          <Route path="notifications" element={<DashboardNotifications />} />
        </Route>

        <Route
          path="organization/create"
          element={
            <ProtectedRoute>
              <CreateOrganization />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<div className="text-center py-20"><h1 className="text-4xl font-bold">404 - Page Not Found</h1></div>} />
      </Route>
    </Routes>
  )
}

export default App
