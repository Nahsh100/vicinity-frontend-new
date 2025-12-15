import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { providersApi, servicesApi } from '@/services/api'
import { Service } from '@/types'
import ImageUpload from '@/components/ImageUpload'
import FileDropzone from '@/components/FileDropzone'

// Base API URL (e.g. http://localhost:3000/api/v1)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Strip `/api/v1` from the end to get the backend origin for serving static files like `/uploads/...`
const BACKEND_ORIGIN = API_URL.replace(/\/?api\/v1\/?$/, '')

export default function DashboardServices() {
  const { getToken } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [providerId, setProviderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '', price: '', priceType: '', categoryId: '', image: '', tags: '', kind: 'SERVICE' })
  const [newServiceImageFile, setNewServiceImageFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get provider profile first
        const provider = await providersApi.getMyProvider()

        // Check if provider exists and has an ID
        if (!provider || !provider.id) {
          setError('Please create a provider profile first to manage services.')
          setLoading(false)
          return
        }

        setProviderId(provider.id)

        // Fetch services
        const servicesData = await servicesApi.getByProvider(provider.id)

        setServices(servicesData)
        setLoading(false)
      } catch (err: any) {
        console.error('Failed to fetch services:', err)
        // Check if it's a 404 error (no provider profile)
        if (err.response?.status === 404) {
          setError('Please create a provider profile first to manage services.')
        } else {
          setError('Failed to load services. Please try again later.')
        }
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!providerId) {
      setError('Provider ID not found. Please create a provider profile first.')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const baseData: any = {
        title: formData.title,
        description: formData.description || undefined,
        price: formData.price || undefined,
        priceType: formData.priceType || undefined,
        // Note: Image is now uploaded separately via ImageUpload component
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : undefined,
        categoryId: formData.categoryId || undefined,
      }

      if (formData.kind === 'PRODUCT' || formData.kind === 'SERVICE') {
        baseData.kind = formData.kind
      }

      if (editingService) {
        // Update existing service (providerId is NOT allowed by backend UpdateServiceDto)
        const updated = await servicesApi.update(editingService.id, baseData)
        setServices(services.map(s => s.id === editingService.id ? updated : s))
      } else {
        // Create new service (providerId is required on create)
        const created = await servicesApi.create({
          ...baseData,
          providerId,
        })

        if (newServiceImageFile) {
          try {
            const token = await getToken()
            const formDataImage = new FormData()
            formDataImage.append('file', newServiceImageFile)

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
            const response = await fetch(`${apiUrl}/services/${created.id}/upload-image`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              body: formDataImage,
            })

            if (response.ok) {
              const updatedWithImage = await response.json()
              setServices([...services, updatedWithImage])
            } else {
              setServices([...services, created])
            }
          } catch (uploadError) {
            console.error('Failed to upload service image:', uploadError)
            setServices([...services, created])
          }
        } else {
          setServices([...services, created])
        }
      }

      setShowModal(false)
      setFormData({ title: '', description: '', price: '', priceType: '', categoryId: '', image: '', tags: '', kind: 'SERVICE' })
      setEditingService(null)
      setNewServiceImageFile(null)
      setSaving(false)
    } catch (err) {
      console.error('Failed to save service:', err)
      setError('Failed to save service. Please try again.')
      setSaving(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      await servicesApi.delete(serviceId)
      setServices(services.filter(s => s.id !== serviceId))
    } catch (err) {
      console.error('Failed to delete service:', err)
      setError('Failed to delete service. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    )
  }

  if (error && !providerId) {
    const isNoProfile = error?.includes('create a provider profile')
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        {isNoProfile ? (
          <Link
            to="/dashboard/profile"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            Create Provider Profile
          </Link>
        ) : (
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Services</h2>
          <p className="text-gray-600 mt-1">Manage your service offerings</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null)
            setFormData({ title: '', description: '', price: '', priceType: '', categoryId: '', image: '', tags: '', kind: 'SERVICE' })
            setNewServiceImageFile(null)
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Service
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-40">
          <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg">
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {services.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No services yet</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary inline-flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Add Your First Service
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <div key={service.id} className="card flex justify-between items-start gap-4">
              {service.image && (
                <img
                  src={
                    service.image.startsWith('http')
                      ? service.image
                      : `${BACKEND_ORIGIN}${service.image}`
                  }
                  alt={service.title}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900">{service.title}</h3>
                <p className="text-gray-600 mt-1">{service.description}</p>
                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {service.tags.map((tag, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-2">
                  {service.priceType && (
                    <span className="text-sm text-gray-600 block">
                      {service.priceType === 'FIXED' && 'Fixed Price:'}
                      {service.priceType === 'HOURLY' && 'Per Hour:'}
                      {service.priceType === 'DAILY' && 'Per Day:'}
                      {service.priceType === 'WEEKLY' && 'Per Week:'}
                      {service.priceType === 'MONTHLY' && 'Per Month:'}
                      {service.priceType === 'NEGOTIABLE' && 'Negotiable'}
                      {service.priceType === 'STARTING_AT' && 'Starting At:'}
                      {service.priceType === 'CONTACT_FOR_QUOTE' && 'Contact for Quote'}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-primary-600 block">
                    {service.price ? `ZMW ${service.price}` : (service.priceType === 'CONTACT_FOR_QUOTE' ? 'Contact Us' : 'Price Not Set')}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setEditingService(service)
                    setFormData({
                      title: service.title,
                      description: service.description || '',
                      price: service.price || '',
                      priceType: service.priceType || '',
                      categoryId: service.categoryId || '',
                      image: service.image || '',
                      tags: service.tags?.join(', ') || '',
                      kind: service.kind || 'SERVICE'
                    })
                    setNewServiceImageFile(null)
                    setShowModal(true)
                  }}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 h-[90vh] max-h-[90vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={() => {
                setShowModal(false)
                setFormData({ title: '', description: '', price: '', priceType: '', categoryId: '', image: '', tags: '', kind: 'SERVICE' })
                setEditingService(null)
                setNewServiceImageFile(null)
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
            <h3 className="text-2xl font-bold mb-6">{editingService ? 'Edit Service / Product' : 'Add New Service or Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">What are you adding? *</label>
                <select
                  value={formData.kind}
                  onChange={(e) => setFormData({ ...formData, kind: e.target.value as 'SERVICE' | 'PRODUCT' })}
                  className="input mb-3"
                >
                  <option value="SERVICE">Service</option>
                  <option value="PRODUCT">Product</option>
                </select>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                />
              </div>
              <div><label className="block text-sm font-medium mb-2">Description</label><textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input" /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price Type</label>
                  <select value={formData.priceType} onChange={(e) => setFormData({...formData, priceType: e.target.value})} className="input">
                    <option value="">Select price type</option>
                    <option value="FIXED">Fixed Price</option>
                    <option value="HOURLY">Per Hour</option>
                    <option value="DAILY">Per Day</option>
                    <option value="WEEKLY">Per Week</option>
                    <option value="MONTHLY">Per Month</option>
                    <option value="NEGOTIABLE">Negotiable</option>
                    <option value="STARTING_AT">Starting At</option>
                    <option value="CONTACT_FOR_QUOTE">Contact for Quote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <input type="text" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="input" placeholder="e.g., 150, 50-100, Negotiable" />
                </div>
              </div>
              {editingService ? (
                <div>
                  <ImageUpload
                    label="Service Image"
                    value={formData.image}
                    onChange={(url) => {
                      setFormData({ ...formData, image: url })
                      if (editingService) {
                        setServices(services.map(s => s.id === editingService.id ? { ...s, image: url } : s))
                      }
                    }}
                    onClear={() => setFormData({ ...formData, image: '' })}
                    aspectRatio="auto"
                    size="medium"
                    uploadEndpoint={`/services/${editingService.id}/upload-image`}
                  />
                </div>
              ) : (
                <div>
                  <FileDropzone
                    label="Service Image"
                    value={formData.image}
                    file={newServiceImageFile}
                    onFileSelect={setNewServiceImageFile}
                    onClear={() => {
                      setNewServiceImageFile(null)
                      setFormData({ ...formData, image: '' })
                    }}
                    aspectRatio="auto"
                    size="medium"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    The image will be uploaded right after the service is created.
                  </p>
                </div>
              )}
              <div><label className="block text-sm font-medium mb-2">Tags <span className="text-sm text-gray-500">(comma-separated)</span></label><input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="input" placeholder="plumbing, emergency, repair" /></div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setFormData({ title: '', description: '', price: '', priceType: '', categoryId: '', image: '', tags: '', kind: 'SERVICE' })
                    setEditingService(null)
                  }}
                  className="btn btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
