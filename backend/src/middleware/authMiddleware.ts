import type { Request, Response, NextFunction } from "express"
import { supabaseAuthClient } from "../config/supabaseClient.js"
import type { AuthenticatedUser } from "../types/index.js"

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
      token?: string
    }
  }
}

// Validates Supabase JWT and attaches authenticated user to request.
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" })
  }

  const token = authHeader.slice("Bearer ".length)
  const { data, error } = await supabaseAuthClient.auth.getUser(token)

  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid or expired token" })
  }

  req.token = token
  req.user = {
    id: data.user.id,
    email: data.user.email,
  }

  return next()
}
