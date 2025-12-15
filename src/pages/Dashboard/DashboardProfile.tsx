import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { CheckCircleIcon, MapPinIcon } from '@heroicons/react/24/solid'
import { MapIcon } from '@heroicons/react/24/outline'
import { providersApi, categoriesApi, organizationsApi } from '@/services/api'
import { Provider, Category, Organization } from '@/types'
import FileDropzone from '@/components/FileDropzone'
import ImageUpload from '@/components/ImageUpload'

export default function DashboardProfile() {
  const { getToken } = useAuth()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Partial<Provider>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isNewProvider, setIsNewProvider] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null)
  const [categoryQuery, setCategoryQuery] = useState('')
  const [organizationQuery, setOrganizationQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch categories and organizations
        const [categoriesData, organizationsData] = await Promise.all([
          categoriesApi.getAll(),
          organizationsApi.getAll(),
        ])

        setCategories(categoriesData)
        setOrganizations(organizationsData)

        // Try to fetch existing provider profile
        try {
          const providerData = await providersApi.getMyProvider()
          setProfile(providerData)
          setIsNewProvider(false)
        } catch (err) {
          // Provider doesn't exist yet
          setIsNewProvider(true)
          setProfile({})
        }

        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load profile data.')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Keep the visible category search input in sync with the selected profile category
  useEffect(() => {
    const currentCategoryId = typeof profile.category === 'object' ? profile.category?.id : profile.category
    if (!currentCategoryId) {
      setCategoryQuery('')
      return
    }

    const currentCategory = categories.find((c) => c.id === currentCategoryId)
    if (currentCategory) {
      setCategoryQuery(currentCategory.name)
    }
  }, [categories, profile.category])

  // Keep the visible organization search input in sync with the selected profile organization
  useEffect(() => {
    const currentOrgId =
      typeof profile.organization === 'object' ? profile.organization?.id : profile.organization

    if (!currentOrgId) {
      setOrganizationQuery('')
      return
    }

    const currentOrg = organizations.find((o) => o.id === currentOrgId)
    if (currentOrg) {
      setOrganizationQuery(currentOrg.name)
    }
  }, [organizations, profile.organization])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      const selectedOrgId =
        typeof profile.organization === 'object' ? profile.organization?.id : profile.organization

      const data = {
        name: profile.name!,
        bio: profile.bio,
        address: profile.address,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        email: profile.email,
        priceRangeMin: profile.priceRangeMin,
        priceRangeMax: profile.priceRangeMax,
        latitude: profile.latitude,
        longitude: profile.longitude,
        categoryId: typeof profile.category === 'object' ? profile.category?.id : profile.category,
      }

      let savedProfile: Provider

      // Check if provider exists by ID presence
      if (!profile.id || isNewProvider) {
        // Create new provider
        savedProfile = await providersApi.create(data)
        setProfile(savedProfile)
        setIsNewProvider(false)
      } else {
        // Update existing provider
        savedProfile = await providersApi.update(profile.id, data)
        setProfile(savedProfile)
      }

      // If an organization has been selected, send a join request instead of
      // directly attaching the provider to the organization. This ensures the
      // organization owner has to approve membership.
      if (selectedOrgId) {
        try {
          await organizationsApi.requestJoin(selectedOrgId)
        } catch (err) {
          console.error('Failed to send organization join request:', err)
        }
      }

      // Upload images if files are selected
      if (profileImageFile && savedProfile.id) {
        const token = await getToken()
        const formData = new FormData()
        formData.append('file', profileImageFile)

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/providers/${savedProfile.id}/upload-profile-image`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        )

        if (response.ok) {
          const result = await response.json()
          setProfile((prev) => ({ ...prev, profileImage: result.profileImage }))
          setProfileImageFile(null)
        }
      }

      if (bannerImageFile && savedProfile.id) {
        const token = await getToken()
        const formData = new FormData()
        formData.append('file', bannerImageFile)

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/providers/${savedProfile.id}/upload-banner-image`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        )

        if (response.ok) {
          const result = await response.json()
          setProfile((prev) => ({ ...prev, bannerImage: result.bannerImage }))
          setBannerImageFile(null)
        }
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setSaving(false)
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError('Failed to save profile. Please try again.')
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setProfile({ ...profile, [field]: value })
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setGettingLocation(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        setProfile((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }))

        setGettingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setError('Failed to get location. Please check your browser permissions.')
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )
  }

  const openGoogleMaps = () => {
    if (profile.latitude && profile.longitude) {
      const url = `https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }

    if (profile.address) {
      const encodedAddress = encodeURIComponent(profile.address)
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }

    setError('Please add coordinates or an address first')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error && !profile.name) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isNewProvider ? 'Create' : 'Edit'} Provider Profile
          </h2>
          <p className="text-gray-600 mt-1">Manage your public provider information</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg">
            <span className="font-medium">{error}</span>
          </div>
        )}
      </div>

      {saved && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="font-medium">Profile saved successfully</span>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-40 mt-16">
          <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg">
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={profile.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <input
                list="category-options"
                required
                value={categoryQuery}
                onChange={(e) => {
                  const value = e.target.value
                  setCategoryQuery(value)

                  const match = categories.find(
                    (c) => c.name.toLowerCase() === value.toLowerCase(),
                  )
                  handleChange('category', match)
                }}
                className="input"
                placeholder="Start typing to search categories..."
              />
              <datalist id="category-options">
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              {profile.id && !isNewProvider ? (
                <ImageUpload
                  label="Profile Image"
                  value={profile.profileImage}
                  onChange={(url) => handleChange('profileImage', url)}
                  onClear={() => handleChange('profileImage', '')}
                  aspectRatio="square"
                  size="small"
                  uploadEndpoint={`/providers/${profile.id}/upload-profile-image`}
                />
              ) : (
                <FileDropzone
                  label="Profile Image"
                  value={profile.profileImage}
                  file={profileImageFile}
                  onFileSelect={setProfileImageFile}
                  onClear={() => {
                    setProfileImageFile(null)
                    handleChange('profileImage', '')
                  }}
                  aspectRatio="square"
                  size="small"
                />
              )}
            </div>

            <div>
              {profile.id && !isNewProvider ? (
                <ImageUpload
                  label="Banner Image"
                  value={profile.bannerImage}
                  onChange={(url) => handleChange('bannerImage', url)}
                  onClear={() => handleChange('bannerImage', '')}
                  aspectRatio="banner"
                  size="medium"
                  uploadEndpoint={`/providers/${profile.id}/upload-banner-image`}
                />
              ) : (
                <FileDropzone
                  label="Banner Image"
                  value={profile.bannerImage}
                  file={bannerImageFile}
                  onFileSelect={setBannerImageFile}
                  onClear={() => {
                    setBannerImageFile(null)
                    handleChange('bannerImage', '')
                  }}
                  aspectRatio="banner"
                  size="medium"
                />
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio / Description *
              </label>
              <textarea
                required
                rows={4}
                value={profile.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                className="input"
                placeholder="Describe your services and experience..."
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="input"
                placeholder="+260 97 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={profile.whatsapp || ''}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="input"
                placeholder="+260 97 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="input"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={profile.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="input"
                placeholder="City, Area"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Location</h3>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="btn btn-secondary flex items-center gap-2"
              >
                <MapPinIcon className="h-5 w-5" />
                {gettingLocation ? 'Getting Location...' : 'Get Current Location'}
              </button>
              <button
                type="button"
                onClick={openGoogleMaps}
                disabled={!(profile.latitude && profile.longitude) && !profile.address}
                className="btn btn-secondary flex items-center gap-2"
              >
                <MapIcon className="h-5 w-5" />
                View on Maps
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={profile.latitude || ''}
                onChange={(e) => handleChange('latitude', parseFloat(e.target.value))}
                className="input"
                placeholder="-15.4167"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={profile.longitude || ''}
                onChange={(e) => handleChange('longitude', parseFloat(e.target.value))}
                className="input"
                placeholder="28.2833"
              />
            </div>

            <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Click "Get Current Location" to automatically fill in your coordinates, or use Google Maps to get exact coordinates manually.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Pricing</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Price (ZMW)
              </label>
              <input
                type="number"
                min="0"
                value={profile.priceRangeMin || ''}
                onChange={(e) => handleChange('priceRangeMin', parseFloat(e.target.value))}
                className="input"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Price (ZMW)
              </label>
              <input
                type="number"
                min="0"
                value={profile.priceRangeMax || ''}
                onChange={(e) => handleChange('priceRangeMax', parseFloat(e.target.value))}
                className="input"
                placeholder="500"
              />
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Organization (Optional)</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization
            </label>
            <input
              list="organization-options"
              value={organizationQuery}
              onChange={(e) => {
                const value = e.target.value
                setOrganizationQuery(value)

                const match = organizations.find(
                  (o) => o.name.toLowerCase() === value.toLowerCase(),
                )
                handleChange('organization', match)
              }}
              className="input"
              placeholder="Start typing to search organizations..."
            />
            <datalist id="organization-options">
              {organizations.map((org) => (
                <option key={org.id} value={org.name}>
                  {org.name}
                </option>
              ))}
            </datalist>
            <p className="mt-1 text-xs text-gray-500">
              Leave blank if you are not part of an organization. Selecting one will send a join request
              to its admin for approval.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button type="button" className="btn btn-secondary" disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary px-8" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
