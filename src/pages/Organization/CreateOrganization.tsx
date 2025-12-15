import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { organizationsApi } from '@/services/api'
import ImageUpload from '@/components/ImageUpload'

export default function CreateOrganization() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', description: '', image: '' })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        image: formData.image.trim() || undefined,
      }

      const organization = await organizationsApi.create(payload)

      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        navigate(`/organization/${organization.id}`)
      }, 1500)
    } catch (err) {
      console.error('Failed to create organization:', err)
      setError('Failed to create organization. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {saved && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="font-medium">Organization created successfully</span>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Organization</h1>
        <p className="text-gray-600 mt-2">Set up your organization to manage providers and groups</p>
        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="input"
            placeholder="e.g., Faith Community Church, Zambia Artisans Guild"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input"
            placeholder="Describe your organization's purpose and mission..."
          />
        </div>

        <div>
          <ImageUpload
            label="Organization image (optional)"
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
            onClear={() => setFormData({ ...formData, image: '' })}
            aspectRatio="banner"
            size="medium"
            maxSizeMB={5}
            uploadEndpoint="/organizations/upload-image"
          />
          <p className="mt-1 text-xs text-gray-500">
            This image will be shown on organization cards and on the organization page.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">What you can do with Organizations:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Create groups within your organization</li>
                <li>Add providers as members</li>
                <li>Allow users to search within your organization</li>
                <li>Build community and trust</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary px-8" disabled={saving}>
            {saving ? 'Creating...' : 'Create Organization'}
          </button>
        </div>
      </form>
    </div>
  )
}
