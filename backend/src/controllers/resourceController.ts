import type { Request, Response } from "express"
import { z } from "zod"
import { supabaseAdminClient } from "../config/supabaseClient.js"
import { isWithin24Hours } from "../utils/timeHelpers.js"

const resourceInputSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  semester: z.string().min(1),
  course: z.string().min(1),
  branch: z.string().optional().default("General"),
  type: z.string().min(1),
  year: z.string().min(1),
  tags: z.array(z.string()).default([]),
  description: z.string().default(""),
  privacy: z.enum(["public", "private"]),
  fileUrl: z.string().min(1).optional().nullable(),
  driveLink: z.string().url().optional().nullable(),
  isExamImportant: z.boolean().optional().default(false),
})

const resourceUpdateSchema = resourceInputSchema.partial()
const requestInputSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  semester: z.string().min(1),
  description: z.string().default(""),
})

function mapResource(row: any) {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    semester: row.semester,
    course: row.course,
    branch: row.branch,
    resourceType: row.type,
    year: row.year,
    tags: row.tags ?? [],
    description: row.description,
    privacy: row.privacy,
    fileName: row.file_url ?? "",
    fileSize: 0,
    fileUrl: row.file_url,
    driveLink: row.drive_link,
    contributorId: row.uploader_id,
    contributorName: row.profiles?.name ?? "Unknown",
    contributorCollege: row.college,
    averageRating: Number(row.average_rating ?? 0),
    totalRatings: Number(row.total_ratings ?? 0),
    downloads: Number(row.downloads ?? 0),
    isExamImportant: Boolean(row.is_exam_important),
    createdAt: row.created_at,
  }
}

// Creates a resource for the current user.
export async function createResource(req: Request, res: Response) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" })

    const parsed = resourceInputSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid resource data", details: parsed.error.flatten() })
    }

    const { data: profile, error: profileError } = await supabaseAdminClient
      .from("profiles")
      .select("college")
      .eq("id", req.user.id)
      .single()
    if (profileError || !profile) return res.status(404).json({ error: "User profile not found" })

    const p = parsed.data
    const { data, error } = await supabaseAdminClient
      .from("resources")
      .insert({
        uploader_id: req.user.id,
        title: p.title,
        subject: p.subject,
        semester: p.semester,
        course: p.course,
        branch: p.branch,
        type: p.type,
        year: p.year,
        tags: p.tags,
        description: p.description,
        privacy: p.privacy,
        file_url: p.fileUrl ?? null,
        drive_link: p.driveLink ?? null,
        college: profile.college,
        is_exam_important: p.isExamImportant,
      })
      .select("*, profiles:uploader_id (id, name, college)")
      .single()

    if (error || !data) return res.status(500).json({ error: error?.message ?? "Failed to create resource" })
    return res.status(201).json({ resource: mapResource(data), pointsAwarded: p.privacy === "public" ? 10 : 5 })
  } catch {
    return res.status(500).json({ error: "Unexpected resource create error" })
  }
}

// Returns resources with server-side filtering, search, and privacy checks.
export async function getResources(req: Request, res: Response) {
  try {
    const userId = req.user?.id
    let userCollege: string | null = null

    if (userId) {
      const { data: profile } = await supabaseAdminClient
        .from("profiles")
        .select("college")
        .eq("id", userId)
        .single()
      userCollege = profile?.college ?? null
    }

    let query = supabaseAdminClient
      .from("resources")
      .select("*, profiles:uploader_id (id, name, college)")
      .order("created_at", { ascending: false })

    const { course, branch, semester, type, year, privacy, search } = req.query
    if (course) query = query.eq("course", String(course))
    if (branch) query = query.eq("branch", String(branch))
    if (semester) query = query.eq("semester", String(semester))
    if (type) query = query.eq("type", String(type))
    if (year) query = query.eq("year", String(year))
    if (privacy) query = query.eq("privacy", String(privacy))
    if (search) {
      const t = String(search)
      query = query.or(`title.ilike.%${t}%,subject.ilike.%${t}%,description.ilike.%${t}%`)
    }

    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })

    const visible = (data ?? []).filter((row) => {
      if (row.privacy === "public") return true
      if (!userId || !userCollege) return false
      return row.uploader_id === userId || row.college === userCollege
    })

    return res.status(200).json({ resources: visible.map(mapResource) })
  } catch {
    return res.status(500).json({ error: "Unexpected resource fetch error" })
  }
}

// Returns one resource if privacy rules allow access.
export async function getResourceById(req: Request, res: Response) {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const { data: resource, error } = await supabaseAdminClient
      .from("resources")
      .select("*, profiles:uploader_id (id, name, college)")
      .eq("id", id)
      .single()
    if (error || !resource) return res.status(404).json({ error: "Resource not found" })

    if (resource.privacy === "private") {
      if (!userId) return res.status(403).json({ error: "Private resource access denied" })
      const { data: profile } = await supabaseAdminClient
        .from("profiles")
        .select("college")
        .eq("id", userId)
        .single()
      const allowed = resource.uploader_id === userId || profile?.college === resource.college
      if (!allowed) return res.status(403).json({ error: "Private resource access denied" })
    }

    return res.status(200).json({ resource: mapResource(resource) })
  } catch {
    return res.status(500).json({ error: "Unexpected resource fetch error" })
  }
}

// Updates a resource owned by current user within 24 hours.
export async function updateResource(req: Request, res: Response) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" })

    const parsed = resourceUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid resource update", details: parsed.error.flatten() })
    }

    const { data: existing, error: existingError } = await supabaseAdminClient
      .from("resources")
      .select("id, uploader_id, created_at")
      .eq("id", req.params.id)
      .single()
    if (existingError || !existing) return res.status(404).json({ error: "Resource not found" })
    if (existing.uploader_id !== req.user.id) return res.status(403).json({ error: "You can only edit your own resource" })
    if (!isWithin24Hours(existing.created_at)) return res.status(403).json({ error: "Resource edit lock is 24 hours" })

    const p = parsed.data
    const { data: updated, error } = await supabaseAdminClient
      .from("resources")
      .update({
        ...(p.title !== undefined ? { title: p.title } : {}),
        ...(p.subject !== undefined ? { subject: p.subject } : {}),
        ...(p.semester !== undefined ? { semester: p.semester } : {}),
        ...(p.course !== undefined ? { course: p.course } : {}),
        ...(p.branch !== undefined ? { branch: p.branch } : {}),
        ...(p.type !== undefined ? { type: p.type } : {}),
        ...(p.year !== undefined ? { year: p.year } : {}),
        ...(p.tags !== undefined ? { tags: p.tags } : {}),
        ...(p.description !== undefined ? { description: p.description } : {}),
        ...(p.privacy !== undefined ? { privacy: p.privacy } : {}),
        ...(p.fileUrl !== undefined ? { file_url: p.fileUrl } : {}),
        ...(p.driveLink !== undefined ? { drive_link: p.driveLink } : {}),
        ...(p.isExamImportant !== undefined ? { is_exam_important: p.isExamImportant } : {}),
      })
      .eq("id", req.params.id)
      .select("*, profiles:uploader_id (id, name, college)")
      .single()

    if (error || !updated) return res.status(500).json({ error: error?.message ?? "Failed to update resource" })
    return res.status(200).json({ resource: mapResource(updated) })
  } catch {
    return res.status(500).json({ error: "Unexpected resource update error" })
  }
}

// Deletes a resource owned by current user within 24 hours.
export async function deleteResource(req: Request, res: Response) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" })
    const { data: existing, error: existingError } = await supabaseAdminClient
      .from("resources")
      .select("id, uploader_id, created_at")
      .eq("id", req.params.id)
      .single()
    if (existingError || !existing) return res.status(404).json({ error: "Resource not found" })
    if (existing.uploader_id !== req.user.id) return res.status(403).json({ error: "You can only delete your own resource" })
    if (!isWithin24Hours(existing.created_at)) return res.status(403).json({ error: "Resource delete lock is 24 hours" })

    const { error } = await supabaseAdminClient.from("resources").delete().eq("id", req.params.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ message: "Resource deleted" })
  } catch {
    return res.status(500).json({ error: "Unexpected resource delete error" })
  }
}

// Returns open and fulfilled requests used by the frontend requests page.
export async function getRequests(_req: Request, res: Response) {
  const { data, error } = await supabaseAdminClient
    .from("resource_requests")
    .select("*, profiles:requester_id (id, name)")
    .order("created_at", { ascending: false })
  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({
    requests: (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      subject: row.subject,
      semester: row.semester,
      description: row.description,
      requesterId: row.requester_id,
      requesterName: row.profiles?.name ?? "Unknown",
      status: row.status,
      fulfilledResourceId: row.fulfilled_resource_id,
      createdAt: row.created_at,
    })),
  })
}

// Creates a new resource request for current user.
export async function createRequest(req: Request, res: Response) {
  if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" })
  const parsed = requestInputSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request data", details: parsed.error.flatten() })
  }

  const { data, error } = await supabaseAdminClient
    .from("resource_requests")
    .insert({
      requester_id: req.user.id,
      title: parsed.data.title,
      subject: parsed.data.subject,
      semester: parsed.data.semester,
      description: parsed.data.description,
    })
    .select("*, profiles:requester_id (id, name)")
    .single()

  if (error || !data) return res.status(500).json({ error: error?.message ?? "Failed to create request" })

  return res.status(201).json({
    request: {
      id: data.id,
      title: data.title,
      subject: data.subject,
      semester: data.semester,
      description: data.description,
      requesterId: data.requester_id,
      requesterName: data.profiles?.name ?? "Unknown",
      status: data.status,
      fulfilledResourceId: data.fulfilled_resource_id,
      createdAt: data.created_at,
    },
  })
}

// Marks a request as fulfilled by a resource upload.
export async function fulfillRequest(req: Request, res: Response) {
  if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" })
  const { resourceId } = req.body as { resourceId?: string }
  if (!resourceId) return res.status(400).json({ error: "resourceId is required" })

  const { error } = await supabaseAdminClient
    .from("resource_requests")
    .update({ status: "fulfilled", fulfilled_resource_id: resourceId })
    .eq("id", req.params.id)
  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ message: "Request fulfilled" })
}
