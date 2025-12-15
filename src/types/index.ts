// User & Auth Types
export interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'PROVIDER' | 'ADMIN'
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// Provider Types
export interface Provider {
  id: string
  name: string
  bio?: string
  profileImage?: string
  bannerImage?: string
  businessImage?: string
  address?: string
  phone?: string
  whatsapp?: string
  email?: string
  priceRangeMin?: number
  priceRangeMax?: number
  latitude?: number
  longitude?: number
  ratingAverage: number
  ratingCount: number
  subscriptionPlan: 'FREE' | 'PREMIUM' | 'FEATURED'
  isFeatured: boolean
  isVerified: boolean
  organizationRole?: 'OWNER' | 'ADMIN' | 'MEMBER' // For backwards compatibility in org member lists
  category?: Category
  organizationMemberships?: OrganizationMembership[]
  organization?: Organization // Deprecated: for backwards compatibility
  group?: Group
  distance?: number
  _count?: {
    services: number
    reviews: number
    media: number
  }
}

// Category Types
export interface Category {
  id: string
  name: string
  icon?: string
}

// Organization Types
export interface Organization {
  id: string
  name: string
  description?: string
  createdAt: string
  image?: string
  createdBy?: {
    id: string
    clerkUserId?: string
    name: string
    email: string
  }
  _count?: {
    members: number
    groups?: number
  }
}

// Organization Membership Types
export interface OrganizationMembership {
  id: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  joinedAt: string
  organization: {
    id: string
    name: string
  }
}

// Group Types
export interface Group {
  id: string
  name: string
  description?: string
  organizationId: string
}

// Price Type enum
export type PriceType = 'FIXED' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NEGOTIABLE' | 'STARTING_AT' | 'CONTACT_FOR_QUOTE'

// Service Types
export interface Service {
  id: string
  title: string
  description?: string
  price?: string
  priceType?: PriceType
  image?: string
  tags?: string[]
  providerId: string
  providerName?: string
  categoryId?: string
  category?: Category
  provider?: {
    id?: string
    name?: string
    ratingAverage?: number
    ratingCount?: number
  }
  latitude?: number
  longitude?: number
  distance?: number
  kind?: 'SERVICE' | 'PRODUCT'
}

// Review Types
export interface Review {
  id: string
  rating: number
  text?: string
  providerId: string
  userId: string
  user: {
    id: string
    name: string
  }
  createdAt: string
}

// Project Types
export interface Project {
  id: string
  title: string
  description?: string
  image?: string
  youtubeUrl?: string
  providerId: string
  createdAt: string
  updatedAt: string
}

// Media Types
export interface Media {
  id: string
  url: string
  type: 'IMAGE' | 'VIDEO'
  providerId: string
  createdAt: string
}

// Search Types
export interface SearchParams {
  keyword?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  organizationId?: string
  groupId?: string
  lat?: number
  lng?: number
  radius?: number
  sortBy?: 'relevance' | 'distance' | 'rating'
  page?: number
  limit?: number
}

export interface SearchResponse {
  results: Provider[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// Location Types
export interface Location {
  latitude: number
  longitude: number
}

// Notification Types
export interface Notification {
  id: string
  type: string
  audience: string
  channel: string
  title: string
  body: string
  status: 'UNREAD' | 'READ'
  createdAt: string
  readAt?: string | null
  data?: any
}
