/*
  LeaderboardPage – displays all users ranked by points.
  Top 3 users get medal icons. Points come from uploading resources (+10 each).
  Animated entry on load for a polished hackathon demo feel.
*/

"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Trophy, Medal, Crown, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/context/auth-context"
import { useResources } from "@/context/resource-context"

export default function LeaderboardPage() {
  const { user: currentUser } = useAuth()
  const { leaderboard } = useResources()

  /* Sort users by points descending */
  const rankedUsers = useMemo(
    () => [...leaderboard].sort((a, b) => b.points - a.points),
    [leaderboard]
  )

  /* Medal icons and colors for top 3 */
  const getMedalDetails = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: Crown, color: "text-amber-500", bg: "bg-amber-100", label: "Gold" }
      case 2:
        return { icon: Medal, color: "text-slate-400", bg: "bg-slate-100", label: "Silver" }
      case 3:
        return { icon: Award, color: "text-amber-700", bg: "bg-amber-50", label: "Bronze" }
      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
            <Trophy className="h-7 w-7 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Leaderboard</h1>
          <p className="mt-2 text-muted-foreground">
            Top contributors ranked by points. Upload resources to climb the ranks!
          </p>
        </div>
      </motion.div>

      {/* Top 3 podium */}
      {rankedUsers.length >= 3 && (
        <div className="mb-8 grid grid-cols-3 gap-3">
          {/* Second place */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <Card className="border-border/50 text-center">
              <CardContent className="p-4">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Medal className="h-5 w-5 text-slate-400" />
                </div>
                <Avatar className="mx-auto mb-2 h-12 w-12">
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-sm font-bold">
                    {rankedUsers[1].name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold text-foreground">{rankedUsers[1].name}</p>
                <p className="text-xl font-bold text-slate-500">{rankedUsers[1].points}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* First place */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-amber-200 bg-amber-50/50 text-center shadow-lg">
              <CardContent className="p-4">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <Crown className="h-5 w-5 text-amber-500" />
                </div>
                <Avatar className="mx-auto mb-2 h-14 w-14">
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-lg font-bold">
                    {rankedUsers[0].name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold text-foreground">{rankedUsers[0].name}</p>
                <p className="text-2xl font-bold text-amber-600">{rankedUsers[0].points}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Third place */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Card className="border-border/50 text-center">
              <CardContent className="p-4">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                  <Award className="h-5 w-5 text-amber-700" />
                </div>
                <Avatar className="mx-auto mb-2 h-12 w-12">
                  <AvatarFallback className="bg-amber-50 text-amber-800 text-sm font-bold">
                    {rankedUsers[2].name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold text-foreground">{rankedUsers[2].name}</p>
                <p className="text-xl font-bold text-amber-700">{rankedUsers[2].points}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Full ranking list */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">All Rankings</CardTitle>
          <CardDescription className="text-muted-foreground">+10 points per public upload, +5 points per private upload</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {rankedUsers.map((rankedUser, i) => {
              const rank = i + 1
              const medal = getMedalDetails(rank)
              const isCurrentUser = currentUser?.id === rankedUser.id

              return (
                <motion.div
                  key={rankedUser.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                    isCurrentUser
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/50 hover:bg-muted/50"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex h-8 w-8 items-center justify-center">
                    {medal ? (
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${medal.bg}`}>
                        <medal.icon className={`h-4 w-4 ${medal.color}`} />
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {rankedUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* User info */}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {rankedUser.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-primary">(You)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rankedUser.college} - {rankedUser.branch}
                    </p>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{rankedUser.points}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
