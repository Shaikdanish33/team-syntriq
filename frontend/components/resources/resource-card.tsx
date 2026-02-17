/*
  ResourceCard -- displays a single resource as a polished card in the grid.
  Glass background, smooth hover lift with glow, modern badge styling,
  improved privacy indicators, and smart badges.
*/

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Star, Download, Globe, Lock, Flame, Award, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Resource } from "@/lib/types"

interface ResourceCardProps {
  resource: Resource
  index?: number
}

export function ResourceCard({ resource, index = 0 }: ResourceCardProps) {
  const isTopRated = resource.averageRating >= 4.7
  const isTrending = resource.downloads >= 100
  const isExamImportant = resource.isExamImportant

  /* Color coding for different resource types */
  const typeColors: Record<string, string> = {
    Notes: "bg-blue-50 text-blue-600 ring-1 ring-blue-200/60",
    "Question Papers": "bg-amber-50 text-amber-600 ring-1 ring-amber-200/60",
    Solutions: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60",
    "Project Reports": "bg-rose-50 text-rose-600 ring-1 ring-rose-200/60",
    "Study Material": "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/60",
    Others: "bg-secondary text-secondary-foreground ring-1 ring-border",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/resource/${resource.id}`} className="block">
        <Card className="group relative cursor-pointer overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm transition-all duration-350 ease-out hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/[0.06] glow-hover">
          {/* Subtle top accent line */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <CardContent className="p-5">
            {/* Smart badges row */}
            {(isTopRated || isTrending || isExamImportant) && (
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                {isTopRated && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-600 ring-1 ring-amber-200/50">
                    <Award className="h-3 w-3" /> Top Rated
                  </span>
                )}
                {isTrending && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-rose-600 ring-1 ring-rose-200/50">
                    <Flame className="h-3 w-3" /> Trending
                  </span>
                )}
                {isExamImportant && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-primary ring-1 ring-primary/15">
                    <BookOpen className="h-3 w-3" /> Exam Important
                  </span>
                )}
              </div>
            )}

            {/* Title and subject */}
            <h3 className="mb-1 line-clamp-2 text-[15px] font-semibold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
              {resource.title}
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">{resource.subject}</p>

            {/* Resource type, semester, year pills */}
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  typeColors[resource.resourceType] || typeColors.Others
                }`}
              >
                {resource.resourceType}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                Sem {resource.semester}
              </span>
              <span className="text-[11px] text-muted-foreground">{resource.year}</span>
            </div>

            {/* Tags */}
            {resource.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {resource.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="border-0 bg-muted/70 px-2 py-0 text-[11px] font-normal text-muted-foreground"
                  >
                    {tag}
                  </Badge>
                ))}
                {resource.tags.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="border-0 bg-muted/70 px-2 py-0 text-[11px] font-normal text-muted-foreground"
                  >
                    +{resource.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Footer: contributor, rating, privacy */}
            <div className="flex items-center justify-between border-t border-border/40 pt-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {resource.contributorName[0]}
                </div>
                <span className="max-w-[100px] truncate text-xs text-muted-foreground">
                  {resource.contributorName}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold text-foreground">
                    {resource.averageRating > 0
                      ? resource.averageRating.toFixed(1)
                      : "New"}
                  </span>
                </div>

                {/* Downloads */}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Download className="h-3.5 w-3.5" />
                  <span className="text-[11px]">{resource.downloads}</span>
                </div>

                {/* Privacy badge */}
                {resource.privacy === "public" ? (
                  <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 ring-1 ring-emerald-200/50" title="Public">
                    <Globe className="h-3 w-3" />
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 ring-1 ring-amber-200/50" title="Private">
                    <Lock className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
