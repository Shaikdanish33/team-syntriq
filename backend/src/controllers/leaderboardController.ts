import type { Request, Response } from "express"
import { supabaseAdminClient } from "../config/supabaseClient.js"

// Returns users ranked by points from resource privacy-based scoring.
export async function getLeaderboard(_req: Request, res: Response) {
  try {
    const { data: profiles, error: profilesError } = await supabaseAdminClient
      .from("profiles")
      .select("id, name, college, branch")

    if (profilesError) return res.status(500).json({ error: profilesError.message })

    const { data: resources, error: resourcesError } = await supabaseAdminClient
      .from("resources")
      .select("uploader_id, privacy")

    if (resourcesError) return res.status(500).json({ error: resourcesError.message })

    const pointsByUser = new Map<string, number>()

    for (const item of resources ?? []) {
      const points = item.privacy === "public" ? 10 : 5
      pointsByUser.set(item.uploader_id, (pointsByUser.get(item.uploader_id) ?? 0) + points)
    }

    const leaderboard = (profiles ?? [])
      .map((profile) => ({
        id: profile.id,
        name: profile.name,
        college: profile.college,
        branch: profile.branch,
        points: pointsByUser.get(profile.id) ?? 0,
      }))
      .sort((a, b) => b.points - a.points)

    return res.status(200).json({ leaderboard })
  } catch {
    return res.status(500).json({ error: "Unexpected leaderboard error" })
  }
}
