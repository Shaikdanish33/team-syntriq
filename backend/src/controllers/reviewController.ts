import type { Request, Response } from "express"
import { z } from "zod"
import { supabaseAdminClient } from "../config/supabaseClient.js"
import { isWithin24Hours } from "../utils/timeHelpers.js"

const reviewSchema = z.object({
  resourceId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).default(""),
})

const reviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
})

async function refreshResourceRating(resourceId: string) {
  const { data: reviews } = await supabaseAdminClient
    .from("reviews")
    .select("rating")
    .eq("resource_id", resourceId)

  const totalRatings = reviews?.length ?? 0
  const averageRating =
    totalRatings > 0
      ? Number((reviews!.reduce((sum, item) => sum + item.rating, 0) / totalRatings).toFixed(1))
      : 0

  await supabaseAdminClient
    .from("resources")
    .update({ average_rating: averageRating, total_ratings: totalRatings })
    .eq("id", resourceId)
}

// Creates one review per user per resource.
export async function createReview(req: Request, res: Response) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" })

    const parsed = reviewSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid review data", details: parsed.error.flatten() })
    }

    const payload = parsed.data
    const { data: existing } = await supabaseAdminClient
      .from("reviews")
      .select("id")
      .eq("resource_id", payload.resourceId)
      .eq("user_id", req.user.id)
      .maybeSingle()

    if (existing) {
      return res.status(409).json({ error: "You can submit only one review per resource" })
    }

    const { data, error } = await supabaseAdminClient
      .from("reviews")
      .insert({
        resource_id: payload.resourceId,
        user_id: req.user.id,
        rating: payload.rating,
        comment: payload.comment,
      })
      .select("*, profiles:user_id (id, name)")
      .single()

    if (error || !data) return res.status(500).json({ error: error?.message ?? "Failed to create review" })

    await refreshResourceRating(payload.resourceId)
    return res.status(201).json({
      review: {
        id: data.id,
        resourceId: data.resource_id,
        userId: data.user_id,
        userName: data.profiles?.name ?? "Unknown",
        rating: data.rating,
        comment: data.comment,
        createdAt: data.created_at,
      },
    })
  } catch {
    return res.status(500).json({ error: "Unexpected review create error" })
  }
}

// Updates own review only within 24 hours.
export async function updateReview(req: Request, res: Response) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" })

    const parsed = reviewUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid review update", details: parsed.error.flatten() })
    }

    const { data: existing, error: existingError } = await supabaseAdminClient
      .from("reviews")
      .select("id, resource_id, user_id, created_at")
      .eq("id", req.params.id)
      .single()
    if (existingError || !existing) return res.status(404).json({ error: "Review not found" })
    if (existing.user_id !== req.user.id) return res.status(403).json({ error: "You can only edit your own review" })
    if (!isWithin24Hours(existing.created_at)) return res.status(403).json({ error: "Review edit lock is 24 hours" })

    const { data, error } = await supabaseAdminClient
      .from("reviews")
      .update({
        ...(parsed.data.rating !== undefined ? { rating: parsed.data.rating } : {}),
        ...(parsed.data.comment !== undefined ? { comment: parsed.data.comment } : {}),
      })
      .eq("id", req.params.id)
      .select("*, profiles:user_id (id, name)")
      .single()

    if (error || !data) return res.status(500).json({ error: error?.message ?? "Failed to update review" })

    await refreshResourceRating(existing.resource_id)
    return res.status(200).json({
      review: {
        id: data.id,
        resourceId: data.resource_id,
        userId: data.user_id,
        userName: data.profiles?.name ?? "Unknown",
        rating: data.rating,
        comment: data.comment,
        createdAt: data.created_at,
      },
    })
  } catch {
    return res.status(500).json({ error: "Unexpected review update error" })
  }
}

// Deletes own review only within 24 hours.
export async function deleteReview(req: Request, res: Response) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" })

    const { data: existing, error: existingError } = await supabaseAdminClient
      .from("reviews")
      .select("id, resource_id, user_id, created_at")
      .eq("id", req.params.id)
      .single()

    if (existingError || !existing) return res.status(404).json({ error: "Review not found" })
    if (existing.user_id !== req.user.id) return res.status(403).json({ error: "You can only delete your own review" })
    if (!isWithin24Hours(existing.created_at)) return res.status(403).json({ error: "Review delete lock is 24 hours" })

    const { error } = await supabaseAdminClient.from("reviews").delete().eq("id", req.params.id)
    if (error) return res.status(500).json({ error: error.message })

    await refreshResourceRating(existing.resource_id)
    return res.status(200).json({ message: "Review deleted" })
  } catch {
    return res.status(500).json({ error: "Unexpected review delete error" })
  }
}

// Returns all reviews for one resource.
export async function getReviewsForResource(req: Request, res: Response) {
  const { resourceId } = req.query
  if (!resourceId || typeof resourceId !== "string") {
    return res.status(400).json({ error: "resourceId query parameter is required" })
  }

  const { data, error } = await supabaseAdminClient
    .from("reviews")
    .select("*, profiles:user_id (id, name)")
    .eq("resource_id", resourceId)
    .order("created_at", { ascending: false })
  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({
    reviews: (data ?? []).map((row) => ({
      id: row.id,
      resourceId: row.resource_id,
      userId: row.user_id,
      userName: row.profiles?.name ?? "Unknown",
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
    })),
  })
}
