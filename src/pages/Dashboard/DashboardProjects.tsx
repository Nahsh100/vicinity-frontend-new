import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { providersApi, projectsApi } from '@/services/api'
import type { Project } from '@/types'
import ImageUpload from '@/components/ImageUpload'
import FileDropzone from '@/components/FileDropzone'

// Base API URL (e.g. http://localhost:3000/api/v1)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Strip `/api/v1` to get backend origin for static files
const BACKEND_ORIGIN = API_URL.replace(/\/?api\/v1\/?$/, '')

const FREE_PLAN_MAX_PROJECTS = 5

export default function DashboardProjects() {
  const { getToken } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [providerId, setProviderId] = useState<string | null>(null)
  const [subscriptionPlan, setSubscriptionPlan] = useState<'FREE' | 'PREMIUM' | 'FEATURED' | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    youtubeUrl: '',
  })
  const [newImageFile, setNewImageFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const provider = await providersApi.getMyProvider()

        if (!provider || !provider.id) {
          setError('Please create a provider profile first to manage projects.')
          setLoading(false)
          return
        }

        setProviderId(provider.id)
        setSubscriptionPlan(provider.subscriptionPlan)

        const projectsData = await projectsApi.getByProvider(provider.id)
        setProjects(projectsData)
        setLoading(false)
      } catch (err: any) {
        console.error('Failed to fetch projects:', err)
        if (err.response?.status === 404) {
          setError('Please create a provider profile first to manage projects.')
        } else {
          setError('Failed to load projects. Please try again later.')
        }
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const resetForm = () => {
    setFormData({ title: '', description: '', image: '', youtubeUrl: '' })
    setEditingProject(null)
    setNewImageFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!providerId) {
      setError('Provider ID not found. Please create a provider profile first.')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const baseData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        image: formData.image || undefined,
        youtubeUrl: formData.youtubeUrl.trim() || undefined,
      }

      if (editingProject) {
        const updated = await projectsApi.update(editingProject.id, baseData)
        setProjects(projects.map((p) => (p.id === editingProject.id ? updated : p)))
      } else {
        if (subscriptionPlan === 'FREE' && projects.length >= FREE_PLAN_MAX_PROJECTS) {
          setError(`Free plan allows up to ${FREE_PLAN_MAX_PROJECTS} projects. Upgrade your plan to add more.`)
          setSaving(false)
          return
        }

        const created = await projectsApi.create({
          ...baseData,
          providerId,
        })

        if (newImageFile) {
          try {
            const token = await getToken()
            const formDataImage = new FormData()
            formDataImage.append('file', newImageFile)

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
            const response = await fetch(`${apiUrl}/projects/${created.id}/upload-image`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              body: formDataImage,
            })

            if (response.ok) {
              const updatedWithImage = await response.json()
              setProjects([...projects, updatedWithImage])
            } else {
              setProjects([...projects, created])
            }
          } catch (uploadError) {
            console.error('Failed to upload project image:', uploadError)
            setProjects([...projects, created])
          }
        } else {
          setProjects([...projects, created])
        }
      }

      setShowModal(false)
      resetForm()
      setSaving(false)
    } catch (err: any) {
      console.error('Failed to save project:', err)
      const message: string | undefined = err?.response?.data?.message
      setError(message || 'Failed to save project. Please try again.')
      setSaving(false)
    }
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      await projectsApi.delete(projectId)
      setProjects(projects.filter((p) => p.id !== projectId))
    } catch (err) {
      console.error('Failed to delete project:', err)
      setError('Failed to delete project. Please try again.')
    }
  }

  const canAddMoreProjects =
    subscriptionPlan !== 'FREE' || projects.length < FREE_PLAN_MAX_PROJECTS

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading projects...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600 mt-1">Showcase your best work with project cards</p>
          {subscriptionPlan === 'FREE' && (
            <p className="mt-2 text-xs text-gray-500">
              Free plan allows up to {FREE_PLAN_MAX_PROJECTS} projects.
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setEditingProject(null)
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center gap-2"
          disabled={!canAddMoreProjects}
        >
          <PlusIcon className="h-5 w-5" />
          Add Project
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No projects yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary inline-flex items-center gap-2"
            disabled={!canAddMoreProjects}
          >
            <PlusIcon className="h-5 w-5" />
            Add Your First Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div key={project.id} className="card flex justify-between items-start gap-4">
              {project.image && (
                <img
                  src={
                    project.image.startsWith('http')
                      ? project.image
                      : `${BACKEND_ORIGIN}${project.image}`
                  }
                  alt={project.title}
                  className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{project.title}</h3>
                {project.description && (
                  <div
                    className="prose prose-sm max-w-none text-gray-700 line-clamp-4"
                    dangerouslySetInnerHTML={{ __html: project.description }}
                  />
                )}
                {project.youtubeUrl && (
                  <p className="mt-2 text-xs text-primary-600 break-all">
                    Video: {project.youtubeUrl}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setEditingProject(project)
                    setFormData({
                      title: project.title,
                      description: project.description || '',
                      image: project.image || '',
                      youtubeUrl: project.youtubeUrl || '',
                    })
                    setNewImageFile(null)
                    setShowModal(true)
                  }}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
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
                resetForm()
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
            <h3 className="text-2xl font-bold mb-6">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (rich text supported)</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="You can paste HTML/markdown or basic formatting; it will be rendered as rich text."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">YouTube URL (optional)</label>
                <input
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  className="input"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              {editingProject ? (
                <div>
                  <ImageUpload
                    label="Project Image"
                    value={formData.image}
                    onChange={(url) => {
                      setFormData({ ...formData, image: url })
                      if (editingProject) {
                        setProjects(projects.map((p) => (p.id === editingProject.id ? { ...p, image: url } : p)))
                      }
                    }}
                    onClear={() => setFormData({ ...formData, image: '' })}
                    aspectRatio="auto"
                    size="medium"
                    uploadEndpoint={`/projects/${editingProject.id}/upload-image`}
                  />
                </div>
              ) : (
                <div>
                  <FileDropzone
                    label="Project Image"
                    value={formData.image}
                    file={newImageFile}
                    onFileSelect={setNewImageFile}
                    onClear={() => {
                      setNewImageFile(null)
                      setFormData({ ...formData, image: '' })
                    }}
                    aspectRatio="auto"
                    size="medium"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    The image will be uploaded right after the project is created.
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="btn btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
