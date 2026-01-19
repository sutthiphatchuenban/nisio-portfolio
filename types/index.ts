export interface Project {
    id: string
    title: string
    description: string
    shortDescription?: string | null
    imageUrl?: string | null
    images: string[]
    projectUrl?: string | null
    githubUrl?: string | null
    technologies: string[]
    categoryId?: string | null
    featured: boolean
    status: string
    viewCount: number
    createdAt: string
    updatedAt: string
    category?: Category | null
}

export interface Category {
    id: string
    name: string
    slug: string
    color?: string | null
}

export interface Skill {
    id: string
    name: string
    category?: string | null
    proficiency: number
    icon?: string | null
    orderIndex: number
}

export interface Contact {
    id: string
    name: string
    email: string
    subject?: string | null
    message: string
    status: string
    createdAt: string
}

export interface BlogPost {
    id: string
    title: string
    slug: string
    excerpt?: string | null
    content: string
    coverImage?: string | null
    images: string[]
    tags: string[]
    published: boolean
    featured: boolean
    viewCount: number
    publishedAt?: string | null
    createdAt: string
    updatedAt: string
}

export interface SiteSettings {
  id: string
  siteName: string
  siteDescription: string
  name: string
  title: string
  bio?: string | null
  avatar?: string | null
  heroImage?: string | null
  email?: string | null
  location?: string | null
  resumeUrl?: string | null
  githubUrl?: string | null
  linkedinUrl?: string | null
  twitterUrl?: string | null
  updatedAt: string
}