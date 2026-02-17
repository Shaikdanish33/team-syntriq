/* 
  All TypeScript types used across ACADEX.
  Defines the shape of users, resources, reviews, and requests.
*/

export interface User {
  id: string
  name: string
  email: string
  password?: string
  college: string
  course?: string
  branch: string
  semester: string
  avatarUrl?: string
  points?: number
  createdAt: string
}

export interface Resource {
  id: string
  title: string
  subject: string
  semester: string
  course: string
  branch?: string
  resourceType: string
  year: string
  tags: string[]
  description: string
  privacy: "public" | "private"
  fileName: string
  fileSize: number
  fileUrl?: string
  driveLink?: string
  contributorId: string
  contributorName: string
  contributorCollege: string
  averageRating: number
  totalRatings: number
  downloads: number
  isExamImportant: boolean
  createdAt: string
}

export interface Review {
  id: string
  resourceId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export interface UrgentRequest {
  id: string
  title: string
  subject: string
  semester: string
  description: string
  requesterId: string
  requesterName: string
  status: "open" | "fulfilled"
  fulfilledResourceId?: string
  createdAt: string
}

export interface LeaderboardEntry {
  id: string
  name: string
  college: string
  branch: string
  points: number
}
