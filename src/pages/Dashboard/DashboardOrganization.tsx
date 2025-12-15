import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { providersApi, organizationsApi } from '@/services/api'
import type { Organization, Provider } from '@/types'

export default function DashboardOrganization() {
  const [provider, setProvider] = useState<Provider | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leavingOrgId, setLeavingOrgId] = useState<string | null>(null)
  const [leaveMessage, setLeaveMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const myProvider = await providersApi.getMyProvider().catch(() => null)
        setProvider(myProvider)

        if (myProvider?.organizationMemberships && myProvider.organizationMemberships.length > 0) {
          // Fetch full details for each organization
          const orgPromises = myProvider.organizationMemberships.map(membership =>
            organizationsApi.getById(membership.organization.id).catch(() => null)
          )
          const orgs = await Promise.all(orgPromises)
          setOrganizations(orgs.filter((org): org is Organization => org !== null))
        } else {
          setOrganizations([])
        }

        setLoading(false)
      } catch (err) {
        console.error('Failed to load organization info:', err)
        setError('Failed to load organization information.')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLeave = async (organizationId: string) => {
    try {
      setLeavingOrgId(organizationId)
      setLeaveMessage(null)
      setError(null)

      await organizationsApi.leave(organizationId)
      setOrganizations(orgs => orgs.filter(org => org.id !== organizationId))
      setLeaveMessage('You have left the organization.')
    } catch (err) {
      console.error('Failed to leave organization:', err)
      setError('Failed to leave organization. Please try again.')
    } finally {
      setLeavingOrgId(null)
    }
  }

  const getMembershipRole = (orgId: string) => {
    const membership = provider?.organizationMemberships?.find(m => m.organization.id === orgId)
    return membership?.role || 'MEMBER'
  }

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your organization...</p>
        </div>
      </div>
    )
  }

  if (error && organizations.length === 0) {
    return (
      <div className="py-20 text-center">
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Organizations</h2>
          <p className="text-gray-600 mt-1">View and manage all organizations you belong to.</p>
        </div>
        <Link
          to="/organization/create"
          className="px-4 py-2.5 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700"
        >
          Create Organization
        </Link>
      </div>

      {leaveMessage && (
        <div className="bg-green-50 text-green-800 px-4 py-3 rounded-lg text-sm">
          {leaveMessage}
        </div>
      )}

      {error && organizations.length > 0 && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {organizations.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-700 text-lg mb-2">
            {provider
              ? 'You are not currently a member of any organization.'
              : 'Create your provider profile first, then you can join an organization.'}
          </p>
          <p className="text-gray-500 mb-6">
            Join an existing organization from its page, or create a new one.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/groups"
              className="px-5 py-2.5 rounded-lg bg-primary-50 text-primary-700 font-semibold hover:bg-primary-100"
            >
              Browse Organizations
            </Link>
            <Link
              to="/organization/create"
              className="px-5 py-2.5 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700"
            >
              Create Organization
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {organizations.map((organization) => (
            <div key={organization.id} className="card space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{organization.name}</h3>
                  {organization.description && (
                    <p className="text-gray-600 max-w-2xl">{organization.description}</p>
                  )}
                </div>
                <Link
                  to={`/organization/${organization.id}`}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap"
                >
                  View page
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Role:</span>{' '}
                    <span className="capitalize">{getMembershipRole(organization.id).toLowerCase()}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleLeave(organization.id)}
                  disabled={leavingOrgId === organization.id}
                  className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-60"
                >
                  {leavingOrgId === organization.id ? 'Leaving...' : 'Leave organization'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
