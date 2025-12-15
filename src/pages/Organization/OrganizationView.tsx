import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BuildingOfficeIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useUser } from '@clerk/clerk-react'
import { organizationsApi, providersApi } from '@/services/api'
import { Organization, Provider } from '@/types'
import ProviderCard from '@/components/common/ProviderCard'
import ImageUpload from '@/components/ImageUpload'

// Base API URL (e.g. http://localhost:3000/api/v1)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Strip `/api/v1` from the end to get the backend origin for serving static files like `/uploads/...`
const BACKEND_ORIGIN = API_URL.replace(/\/?api\/v1\/?$/, '')

export default function OrganizationView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isSignedIn } = useUser()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [joinRequests, setJoinRequests] = useState<any[]>([])
  const [membershipStatus, setMembershipStatus] = useState<'none' | 'member' | 'pending'>('none')
  const [joinToast, setJoinToast] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )
  const [isEditing, setIsEditing] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    image: '',
  })
  const [isImageOpen, setIsImageOpen] = useState(false)
  const [providerSearch, setProviderSearch] = useState('')
  const [searchingProviders, setSearchingProviders] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchedProviders, setSearchedProviders] = useState<Provider[] | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        const [orgData, providersData] = await Promise.all([
          organizationsApi.getById(id),
          organizationsApi.getProviders(id),
        ])

        setOrganization(orgData)
        setProviders(providersData)

        if (user) {
          const isOrgOwner = orgData.createdBy?.clerkUserId === user.id
          setIsOwner(isOrgOwner)

          try {
            const myProvider = await providersApi.getMyProvider()
            if (
              myProvider &&
              myProvider.organization &&
              myProvider.organization.id === orgData.id
            ) {
              setIsMember(true)
              setMembershipStatus('member')
            }
          } catch {
            // ignore if user has no provider profile
          }

          if (isOrgOwner) {
            try {
              const requests = await organizationsApi.getJoinRequests(id)
              setJoinRequests(requests)
            } catch (err) {
              console.error('Failed to load join requests:', err)
            }
          }
        }
        if (orgData) {
          setEditForm({
            name: orgData.name || '',
            description: orgData.description || '',
            image: orgData.image || '',
          })
        }

        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch organization data:', err)
        setError('Failed to load organization information.')
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  useEffect(() => {
    const runSearch = async () => {
      if (!organization || !providerSearch.trim()) {
        setSearchedProviders(null)
        setSearchError(null)
        setSearchingProviders(false)
        return
      }

      try {
        setSearchingProviders(true)
        setSearchError(null)

        const response = await providersApi.search({
          keyword: providerSearch.trim(),
          organizationId: organization.id,
          sortBy: 'relevance',
          page: 1,
          limit: 50,
        } as any)

        setSearchedProviders(response.results)
      } catch (err) {
        console.error('Failed to search providers in organization:', err)
        setSearchError('Failed to search providers in this organization.')
        setSearchedProviders(null)
      } finally {
        setSearchingProviders(false)
      }
    }

    runSearch()
  }, [organization, providerSearch])

  const handleRequestJoin = async () => {
    if (!id) return
    setJoinLoading(true)
    setJoinError(null)
    setJoinToast(null)
    try {
      await organizationsApi.requestJoin(id)
      setMembershipStatus('pending')
      setJoinToast({
        type: 'success',
        message: 'Join request sent. The organization admin will need to approve it.',
      })
    } catch (err: any) {
      const message: string | undefined = err?.response?.data?.message
      const fallback = 'Failed to send join request. Please try again.'
      const finalMessage = typeof message === 'string' ? message : fallback

      if (typeof message === 'string') {
        const lower = message.toLowerCase()
        if (lower.includes('pending join request')) {
          setMembershipStatus('pending')
        }
        if (lower.includes('already a member') || lower.includes('already approved')) {
          setMembershipStatus('member')
          setIsMember(true)
        }
      }

      setJoinError(finalMessage)
      setJoinToast({ type: 'error', message: finalMessage })
    } finally {
      setJoinLoading(false)
      if (!joinToast) {
        // auto-clear toast after a short delay
        setTimeout(() => {
          setJoinToast(null)
        }, 3500)
      }
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    if (!id) return
    try {
      await organizationsApi.approveJoinRequest(id, requestId)
      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId))
      const members = await organizationsApi.getProviders(id)
      setProviders(members)
    } catch (err) {
      console.error('Failed to approve join request:', err)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    if (!id) return
    try {
      await organizationsApi.rejectJoinRequest(id, requestId)
      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId))
    } catch (err) {
      console.error('Failed to reject join request:', err)
    }
  }

  const handleRemoveMember = async (providerId: string) => {
    if (!id) return
    try {
      await organizationsApi.removeMember(id, providerId)
      setProviders((prev) => prev.filter((p) => p.id !== providerId))
    } catch (err) {
      console.error('Failed to remove member:', err)
    }
  }

  const handleMakeAdmin = async (providerId: string) => {
    if (!id) return
    try {
      await organizationsApi.makeAdmin(id, providerId)
      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerId ? { ...p, organizationRole: 'ADMIN' } : p,
        ),
      )
    } catch (err) {
      console.error('Failed to make member admin:', err)
    }
  }

  const handleRemoveAdmin = async (providerId: string) => {
    if (!id) return
    try {
      await organizationsApi.removeAdmin(id, providerId)
      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerId ? { ...p, organizationRole: undefined } : p,
        ),
      )
    } catch (err) {
      console.error('Failed to remove admin rights:', err)
    }
  }

  const handleStartEdit = () => {
    if (!organization) return
    setEditForm({
      name: organization.name || '',
      description: organization.description || '',
      image: organization.image || '',
    })
    setEditError(null)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditError(null)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !organization) return

    try {
      setEditSaving(true)
      setEditError(null)

      const payload = {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        image: editForm.image.trim() || undefined,
      }

      const updated = await organizationsApi.update(id, payload)
      setOrganization(updated)
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to update organization:', err)
      setEditError('Failed to update organization. Please try again.')
    } finally {
      setEditSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization...</p>
        </div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {error || 'Organization not found'}
        </h1>
        {error && (
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  const organizationImageUrl = organization.image
    ? organization.image.startsWith('http')
      ? organization.image
      : `${BACKEND_ORIGIN}${organization.image}`
    : null

  const providerListToShow = providerSearch.trim() && searchedProviders !== null
    ? searchedProviders
    : providers

  return (
    <div className="bg-gray-50 min-h-screen">
      {isImageOpen && organizationImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setIsImageOpen(false)}
       >
          <div className="relative max-w-3xl max-h-[90vh] w-full px-4" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsImageOpen(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-medium"
            >
              Close
            </button>
            <img
              src={organizationImageUrl}
              alt={organization.name}
              className="w-full h-full object-contain rounded-lg shadow-2xl bg-black"
            />
          </div>
        </div>
      )}
      {joinToast && (
        <div className="fixed top-4 right-4 z-40">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
              joinToast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            <span>{joinToast.message}</span>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-start md:items-center gap-4 mb-4">
              {organizationImageUrl ? (
                <button
                  type="button"
                  onClick={() => setIsImageOpen(true)}
                  className="h-14 w-14 rounded-2xl overflow-hidden bg-primary-500/20 border border-white/20 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/60"
                >
                  <img
                    src={organizationImageUrl}
                    alt={organization.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ) : (
                <BuildingOfficeIcon className="h-12 w-12" />
              )}

              <div className="flex-1 min-w-0">
                {isOwner && isEditing ? (
                  <form onSubmit={handleSaveEdit} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-lg font-semibold text-white placeholder:text-primary-100 focus:outline-none focus:ring-2 focus:ring-white/60"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Organization name"
                        required
                      />
                    </div>

                    <div>
                      <textarea
                        className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-primary-50 placeholder:text-primary-100 focus:outline-none focus:ring-2 focus:ring-white/60 resize-none"
                        rows={3}
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Short description of your organization"
                      />
                    </div>

                    <div className="pt-1">
                      <ImageUpload
                        label="Organization image"
                        value={editForm.image}
                        onChange={(url) =>
                          setEditForm((prev) => ({ ...prev, image: url }))
                        }
                        onClear={() =>
                          setEditForm((prev) => ({ ...prev, image: '' }))
                        }
                        aspectRatio="banner"
                        size="small"
                        maxSizeMB={5}
                        uploadEndpoint="/organizations/upload-image"
                      />
                    </div>

                    {editError && (
                      <p className="text-xs text-red-100">{editError}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={editSaving}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary-700 shadow-sm hover:bg-primary-50 disabled:opacity-60"
                      >
                        {editSaving ? 'Saving...' : 'Save changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={editSaving}
                        className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-transparent px-4 py-2 text-xs font-semibold text-white/90 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-4xl font-bold break-words">
                        {organization.name}
                      </h1>
                      {isOwner && (
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          className="inline-flex items-center rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 hover:bg-white/20"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {organization.description && (
                      <p className="text-primary-100 text-lg max-w-3xl">
                        {organization.description}
                      </p>
                    )}
                  </>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-6 text-primary-100">
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-5 w-5" />
                    <span>{providers.length} Providers</span>
                  </div>

                  {isSignedIn && !isOwner && membershipStatus === 'pending' && (
                    <span className="inline-flex items-center rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-100 border border-amber-300/40">
                      Request pending approval
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isSignedIn && !isOwner && (
            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end gap-2">
              <button
                type="button"
                onClick={handleRequestJoin}
                disabled={joinLoading || isMember || membershipStatus === 'pending'}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-700 rounded-full text-sm font-semibold shadow-sm hover:bg-primary-50 disabled:opacity-60"
              >
                {isMember || membershipStatus === 'member'
                  ? 'You are a member'
                  : membershipStatus === 'pending'
                  ? 'Request pending'
                  : joinLoading
                  ? 'Sending request...'
                  : 'Request to Join'}
              </button>
              {joinError && (
                <p className="text-xs text-primary-100 max-w-xs text-right md:text-right">
                  {joinError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Providers in this Organization</h2>
            <div className="w-full md:w-80">
              <input
                type="text"
                value={providerSearch}
                onChange={(e) => setProviderSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search services or providers in this organization..."
              />
            </div>
          </div>

          {searchError && (
            <p className="text-xs text-red-600 mb-2">{searchError}</p>
          )}

          {searchingProviders && (
            <p className="text-xs text-gray-500 mb-2">Searching within this organization...</p>
          )}

          {providerListToShow.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providerListToShow.map((provider) => (
                <div key={provider.id} className="relative group">
                  <ProviderCard provider={provider} />
                  {isOwner && (
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      {provider.organizationRole && (
                        <span className="inline-flex items-center rounded-full bg-primary-600/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                          {provider.organizationRole === 'OWNER'
                            ? 'Owner'
                            : provider.organizationRole === 'ADMIN'
                            ? 'Admin'
                            : 'Member'}
                        </span>
                      )}
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(provider.id)}
                          className="inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-red-600 shadow-sm hover:bg-red-50"
                        >
                          Remove
                        </button>
                        {provider.organizationRole === 'ADMIN' ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveAdmin(provider.id)}
                            className="inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                          >
                            Remove admin
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMakeAdmin(provider.id)}
                            className="inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-primary-700 shadow-sm hover:bg-primary-50"
                          >
                            Make admin
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg">
                {providers.length === 0
                  ? 'No providers in this organization yet.'
                  : providerSearch.trim()
                    ? 'No providers or services match your search in this organization.'
                    : 'No providers in this organization yet.'}
              </p>
            </div>
          )}
        </div>

        {isOwner && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Pending Join Requests</h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {joinRequests.length} request{joinRequests.length === 1 ? '' : 's'}
              </span>
            </div>

            {joinRequests.length > 0 ? (
              <div className="space-y-3">
                {joinRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-gray-50"
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => navigate(`/provider/${req.provider.id}`)}
                        className="font-semibold text-gray-900 hover:text-primary-600 transition-colors text-left"
                      >
                        {req.provider.name}
                      </button>
                      {req.provider.category && (
                        <p className="text-xs text-gray-500">
                          {req.provider.category.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRejectRequest(req.id)}
                        className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveRequest(req.id)}
                        className="text-xs px-3 py-1 rounded-full bg-primary-600 text-white hover:bg-primary-700"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No pending join requests.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
