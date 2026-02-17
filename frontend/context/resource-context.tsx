"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { LeaderboardEntry, Resource, Review, UrgentRequest } from "@/lib/types"
import { leaderboardApi, requestApi, resourceApi, reviewApi } from "@/lib/api"

interface ResourceContextType {
  resources: Resource[]
  reviews: Review[]
  requests: UrgentRequest[]
  leaderboard: LeaderboardEntry[]
  loading: boolean
  refreshResources: (filters?: Record<string, string>) => Promise<void>
  refreshLeaderboard: () => Promise<void>
  addResource: (resource: Omit<Resource, "id" | "averageRating" | "totalRatings" | "downloads" | "createdAt">) => Promise<{ resource: Resource; pointsAwarded: number }>
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>
  deleteResource: (id: string) => Promise<void>
  loadReviewsForResource: (resourceId: string) => Promise<void>
  addReview: (review: Omit<Review, "id" | "createdAt">) => Promise<void>
  updateReview: (id: string, updates: Partial<Review>) => Promise<void>
  deleteReview: (id: string) => Promise<void>
  getReviewsForResource: (resourceId: string) => Review[]
  getUserReviewForResource: (resourceId: string, userId: string) => Review | undefined
  refreshRequests: () => Promise<void>
  addRequest: (request: Omit<UrgentRequest, "id" | "status" | "createdAt">) => Promise<void>
  fulfillRequest: (requestId: string, resourceId: string) => Promise<void>
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined)

function mapResource(row: any): Resource {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    semester: row.semester,
    course: row.course,
    branch: row.branch,
    resourceType: row.resourceType ?? row.type ?? "Others",
    year: row.year,
    tags: row.tags ?? [],
    description: row.description ?? "",
    privacy: row.privacy,
    fileName: row.fileName ?? row.fileUrl ?? "",
    fileSize: Number(row.fileSize ?? 0),
    fileUrl: row.fileUrl ?? undefined,
    driveLink: row.driveLink ?? undefined,
    contributorId: row.contributorId,
    contributorName: row.contributorName,
    contributorCollege: row.contributorCollege,
    averageRating: Number(row.averageRating ?? 0),
    totalRatings: Number(row.totalRatings ?? 0),
    downloads: Number(row.downloads ?? 0),
    isExamImportant: Boolean(row.isExamImportant),
    createdAt: row.createdAt,
  }
}

function mapReview(row: any): Review {
  return {
    id: row.id,
    resourceId: row.resourceId,
    userId: row.userId,
    userName: row.userName,
    rating: row.rating,
    comment: row.comment ?? "",
    createdAt: row.createdAt,
  }
}

function mapRequest(row: any): UrgentRequest {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    semester: row.semester,
    description: row.description ?? "",
    requesterId: row.requesterId,
    requesterName: row.requesterName,
    status: row.status,
    fulfilledResourceId: row.fulfilledResourceId ?? undefined,
    createdAt: row.createdAt,
  }
}

export function ResourceProvider({ children }: { children: React.ReactNode }) {
  const [resources, setResources] = useState<Resource[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [requests, setRequests] = useState<UrgentRequest[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const refreshResources = useCallback(async (filters?: Record<string, string>) => {
    const data = await resourceApi.list(filters)
    setResources(data.resources.map(mapResource))
  }, [])

  const refreshRequests = useCallback(async () => {
    const data = await requestApi.list()
    setRequests(data.requests.map(mapRequest))
  }, [])

  const refreshLeaderboard = useCallback(async () => {
    const data = await leaderboardApi.list()
    setLeaderboard(data.leaderboard)
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await Promise.all([refreshResources(), refreshRequests(), refreshLeaderboard()])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [refreshResources, refreshRequests, refreshLeaderboard])

  const addResource = useCallback(
    async (resource: Omit<Resource, "id" | "averageRating" | "totalRatings" | "downloads" | "createdAt">) => {
      const data = await resourceApi.create({
        title: resource.title,
        subject: resource.subject,
        semester: resource.semester,
        course: resource.course,
        branch: resource.branch,
        type: resource.resourceType,
        year: resource.year,
        tags: resource.tags,
        description: resource.description,
        privacy: resource.privacy,
        fileUrl: resource.fileUrl,
        driveLink: resource.driveLink,
        isExamImportant: resource.isExamImportant,
      })
      const mapped = mapResource(data.resource)
      setResources((prev) => [mapped, ...prev])
      await refreshLeaderboard()
      return { resource: mapped, pointsAwarded: data.pointsAwarded }
    },
    [refreshLeaderboard],
  )

  const updateResource = useCallback(async (id: string, updates: Partial<Resource>) => {
    const data = await resourceApi.update(id, {
      ...(updates.title !== undefined ? { title: updates.title } : {}),
      ...(updates.subject !== undefined ? { subject: updates.subject } : {}),
      ...(updates.semester !== undefined ? { semester: updates.semester } : {}),
      ...(updates.course !== undefined ? { course: updates.course } : {}),
      ...(updates.branch !== undefined ? { branch: updates.branch } : {}),
      ...(updates.resourceType !== undefined ? { type: updates.resourceType } : {}),
      ...(updates.year !== undefined ? { year: updates.year } : {}),
      ...(updates.tags !== undefined ? { tags: updates.tags } : {}),
      ...(updates.description !== undefined ? { description: updates.description } : {}),
      ...(updates.privacy !== undefined ? { privacy: updates.privacy } : {}),
      ...(updates.fileUrl !== undefined ? { fileUrl: updates.fileUrl } : {}),
      ...(updates.driveLink !== undefined ? { driveLink: updates.driveLink } : {}),
      ...(updates.isExamImportant !== undefined
        ? { isExamImportant: updates.isExamImportant }
        : {}),
    })
    const mapped = mapResource(data.resource)
    setResources((prev) => prev.map((r) => (r.id === id ? mapped : r)))
    await refreshLeaderboard()
  }, [refreshLeaderboard])

  const deleteResource = useCallback(async (id: string) => {
    await resourceApi.remove(id)
    setResources((prev) => prev.filter((r) => r.id !== id))
    setReviews((prev) => prev.filter((r) => r.resourceId !== id))
    await refreshLeaderboard()
  }, [refreshLeaderboard])

  const loadReviewsForResource = useCallback(async (resourceId: string) => {
    const data = await reviewApi.listByResource(resourceId)
    const mapped = data.reviews.map(mapReview)
    setReviews((prev) => {
      const withoutResource = prev.filter((r) => r.resourceId !== resourceId)
      return [...withoutResource, ...mapped]
    })
  }, [])

  const addReview = useCallback(async (review: Omit<Review, "id" | "createdAt">) => {
    const data = await reviewApi.create({
      resourceId: review.resourceId,
      rating: review.rating,
      comment: review.comment,
    })
    setReviews((prev) => [mapReview(data.review), ...prev])
    await Promise.all([refreshResources(), loadReviewsForResource(review.resourceId)])
  }, [loadReviewsForResource, refreshResources])

  const updateReview = useCallback(async (id: string, updates: Partial<Review>) => {
    const data = await reviewApi.update(id, {
      ...(updates.rating !== undefined ? { rating: updates.rating } : {}),
      ...(updates.comment !== undefined ? { comment: updates.comment } : {}),
    })
    const mapped = mapReview(data.review)
    setReviews((prev) => prev.map((r) => (r.id === id ? mapped : r)))
    await Promise.all([refreshResources(), loadReviewsForResource(mapped.resourceId)])
  }, [loadReviewsForResource, refreshResources])

  const deleteReview = useCallback(async (id: string) => {
    const target = reviews.find((r) => r.id === id)
    await reviewApi.remove(id)
    setReviews((prev) => prev.filter((r) => r.id !== id))
    if (target) {
      await Promise.all([refreshResources(), loadReviewsForResource(target.resourceId)])
    }
  }, [reviews, loadReviewsForResource, refreshResources])

  const getReviewsForResource = useCallback(
    (resourceId: string) => reviews.filter((r) => r.resourceId === resourceId),
    [reviews],
  )

  const getUserReviewForResource = useCallback(
    (resourceId: string, userId: string) =>
      reviews.find((r) => r.resourceId === resourceId && r.userId === userId),
    [reviews],
  )

  const addRequest = useCallback(async (request: Omit<UrgentRequest, "id" | "status" | "createdAt">) => {
    await requestApi.create({
      title: request.title,
      subject: request.subject,
      semester: request.semester,
      description: request.description,
    })
    await refreshRequests()
  }, [refreshRequests])

  const fulfillRequest = useCallback(async (requestId: string, resourceId: string) => {
    await requestApi.fulfill(requestId, resourceId)
    await refreshRequests()
  }, [refreshRequests])

  const value = useMemo(
    () => ({
      resources,
      reviews,
      requests,
      leaderboard,
      loading,
      refreshResources,
      refreshLeaderboard,
      addResource,
      updateResource,
      deleteResource,
      loadReviewsForResource,
      addReview,
      updateReview,
      deleteReview,
      getReviewsForResource,
      getUserReviewForResource,
      refreshRequests,
      addRequest,
      fulfillRequest,
    }),
    [
      resources,
      reviews,
      requests,
      leaderboard,
      loading,
      refreshResources,
      refreshLeaderboard,
      addResource,
      updateResource,
      deleteResource,
      loadReviewsForResource,
      addReview,
      updateReview,
      deleteReview,
      getReviewsForResource,
      getUserReviewForResource,
      refreshRequests,
      addRequest,
      fulfillRequest,
    ],
  )

  return <ResourceContext.Provider value={value}>{children}</ResourceContext.Provider>
}

export function useResources() {
  const context = useContext(ResourceContext)
  if (!context) throw new Error("useResources must be used within ResourceProvider")
  return context
}
