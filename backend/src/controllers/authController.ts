import type { Request, Response } from "express"
import { z } from "zod"
import { supabaseAdminClient, supabaseAuthClient } from "../config/supabaseClient.js"

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  college: z.string().min(2),
  course: z.string().min(1),
  branch: z.string().min(1),
  semester: z.string().min(1),
  profileImageUrl: z.string().url().optional().nullable(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  college: z.string().min(2).optional(),
  course: z.string().min(1).optional(),
  branch: z.string().min(1).optional(),
  semester: z.string().min(1).optional(),
  profileImageUrl: z.string().url().optional().nullable(),
})

function mapProfile(profile: any, email?: string) {
  return {
    id: profile.id,
    name: profile.name,
    email: email ?? "",
    college: profile.college,
    course: profile.course,
    branch: profile.branch,
    semester: profile.semester,
    avatarUrl: profile.profile_image_url,
    createdAt: profile.created_at,
  }
}

// Creates Supabase auth user and matching profile row.
export async function signUp(req: Request, res: Response) {
  try {
    const parsed = signUpSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid signup data", details: parsed.error.flatten() })
    }

    const { email, password, name, college, course, branch, semester, profileImageUrl } = parsed.data

    const authRes = await supabaseAuthClient.auth.signUp({ email, password })
    if (authRes.error || !authRes.data.user) {
      return res.status(400).json({ error: authRes.error?.message ?? "Signup failed" })
    }

    const { error: profileError } = await supabaseAdminClient.from("profiles").upsert({
      id: authRes.data.user.id,
      name,
      college,
      course,
      branch,
      semester,
      profile_image_url: profileImageUrl ?? null,
    })

    if (profileError) {
      return res.status(500).json({ error: profileError.message })
    }

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: authRes.data.user.id,
        email,
        name,
        college,
        course,
        branch,
        semester,
        avatarUrl: profileImageUrl ?? null,
      },
      token: authRes.data.session?.access_token ?? null,
      session: authRes.data.session,
    })
  } catch {
    return res.status(500).json({ error: "Unexpected signup error" })
  }
}

// Logs user in and returns JWT plus profile data.
export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid login data", details: parsed.error.flatten() })
    }

    const { email, password } = parsed.data
    const loginRes = await supabaseAuthClient.auth.signInWithPassword({ email, password })

    if (loginRes.error || !loginRes.data.user || !loginRes.data.session) {
      return res.status(401).json({ error: loginRes.error?.message ?? "Invalid credentials" })
    }

    const { data: profile, error: profileError } = await supabaseAdminClient
      .from("profiles")
      .select("*")
      .eq("id", loginRes.data.user.id)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({ error: "User profile not found" })
    }

    return res.status(200).json({
      message: "Login successful",
      token: loginRes.data.session.access_token,
      session: loginRes.data.session,
      user: mapProfile(profile, email),
    })
  } catch {
    return res.status(500).json({ error: "Unexpected login error" })
  }
}

// Returns current authenticated user profile.
export async function getSession(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const { data: profile, error } = await supabaseAdminClient
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single()

    if (error || !profile) {
      return res.status(404).json({ error: "Profile not found" })
    }

    return res.status(200).json({ user: mapProfile(profile, req.user.email) })
  } catch {
    return res.status(500).json({ error: "Unexpected session error" })
  }
}

// Stateless logout endpoint for frontend consistency.
export async function logout(_req: Request, res: Response) {
  return res.status(200).json({ message: "Logged out" })
}

// Updates profile fields for current user.
export async function updateProfile(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const parsed = updateProfileSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid profile update", details: parsed.error.flatten() })
    }

    const payload = parsed.data

    const { data: updated, error } = await supabaseAdminClient
      .from("profiles")
      .update({
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.college !== undefined ? { college: payload.college } : {}),
        ...(payload.course !== undefined ? { course: payload.course } : {}),
        ...(payload.branch !== undefined ? { branch: payload.branch } : {}),
        ...(payload.semester !== undefined ? { semester: payload.semester } : {}),
        ...(payload.profileImageUrl !== undefined
          ? { profile_image_url: payload.profileImageUrl }
          : {}),
      })
      .eq("id", req.user.id)
      .select("*")
      .single()

    if (error || !updated) {
      return res.status(500).json({ error: error?.message ?? "Failed to update profile" })
    }

    return res.status(200).json({ user: mapProfile(updated, req.user.email) })
  } catch {
    return res.status(500).json({ error: "Unexpected profile update error" })
  }
}
