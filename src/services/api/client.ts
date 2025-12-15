import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Store the token getter function
let getTokenFunction: (() => Promise<string | null>) | null = null

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Function to set the token getter (called from App component with Clerk's getToken)
export const setAuthTokenGetter = (getter: () => Promise<string | null>) => {
  getTokenFunction = getter
}

// Request interceptor to add Clerk session token
apiClient.interceptors.request.use(
  async (config) => {
    if (getTokenFunction) {
      const token = await getTokenFunction()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If error is 401, redirect to sign-in (Clerk handles token refresh automatically)
    if (error.response?.status === 401) {
      window.location.href = '/sign-in'
    }

    return Promise.reject(error)
  }
)

export default apiClient
