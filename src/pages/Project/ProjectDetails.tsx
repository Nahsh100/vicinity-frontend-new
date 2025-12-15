import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectsApi } from '@/services/api'
import type { Project } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
const BACKEND_ORIGIN = API_URL.replace(/\/?api\/v1\/?$/, '')

export default function ProjectDetails() {
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return
      try {
        setLoading(true)
        setError(null)
        const data = await projectsApi.getById(id)
        setProject(data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load project', err)
        setError('Failed to load project details.')
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Project not found'}</h1>
        <Link
          to={-1 as any}
          className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
        >
          Go Back
        </Link>
      </div>
    )
  }

  const imageUrl = project.image
    ? project.image.startsWith('http')
      ? project.image
      : `${BACKEND_ORIGIN}${project.image}`
    : null

  const youtubeEmbedUrl = project.youtubeUrl
    ? (() => {
        try {
          const url = new URL(project.youtubeUrl)
          if (url.hostname.includes('youtube.com')) {
            const v = url.searchParams.get('v')
            if (v) return `https://www.youtube.com/embed/${v}`
          }
          if (url.hostname === 'youtu.be') {
            const idFromPath = url.pathname.replace('/', '')
            if (idFromPath) return `https://www.youtube.com/embed/${idFromPath}`
          }
          return null
        } catch {
          return null
        }
      })()
    : null

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{project.title}</h1>
            {project.createdAt && (
              <p className="text-sm text-gray-500">
                Published on {new Date(project.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <Link
            to={-1 as any}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Back
          </Link>
        </div>

        {imageUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden shadow-sm bg-white">
            <img
              src={imageUrl}
              alt={project.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {youtubeEmbedUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden bg-black/5">
            <div className="relative w-full pb-[56.25%]">
              <iframe
                src={youtubeEmbedUrl}
                title={project.title}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {project.description && (
          <div className="card bg-white shadow-sm border border-gray-100">
            <div
              className="prose prose-sm md:prose max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
