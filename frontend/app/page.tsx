/*
  HomePage – shows landing page for guests, resource browser for logged-in users.
  Includes search bar, advanced filters (with dynamic branches), sorting, and exam mode filtering.
  Resources are filtered and sorted based on user selections.
*/

"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, SlidersHorizontal, X, BookOpen, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ResourceCard } from "@/components/resources/resource-card"
import { useResources } from "@/context/resource-context"
import { useAuth } from "@/context/auth-context"
import { useExamMode } from "@/context/exam-context"
import { useAppChrome } from "@/components/layout/app-shell"
import LandingPage from "@/components/landing-page"
import {
  COURSES,
  SEMESTERS,
  RESOURCE_TYPES,
  YEARS,
  getBranchesForCourse,
} from "@/lib/academic-data"

export default function HomePage() {
  const { resources } = useResources()
  const { user, isLoading } = useAuth()
  const { examMode } = useExamMode()
  const { setHideChrome } = useAppChrome()

  /* Hide the app navbar when showing the landing page */
  const showLanding = !isLoading && !user
  useEffect(() => {
    setHideChrome(showLanding)
    return () => setHideChrome(false)
  }, [showLanding, setHideChrome])

  /* Search and filter state */
  const [search, setSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("latest")
  const [filters, setFilters] = useState({
    course: "",
    branch: "",
    semester: "",
    resourceType: "",
    year: "",
    privacy: "",
  })

  /* Dynamic branches based on selected course filter */
  const branchOptions = useMemo(
    () => (filters.course ? getBranchesForCourse(filters.course) : []),
    [filters.course]
  )

  /* Count active filters for the badge */
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  /* Reset all filters */
  const clearFilters = () => {
    setFilters({ course: "", branch: "", semester: "", resourceType: "", year: "", privacy: "" })
    setSearch("")
  }

  /* Filter and sort resources */
  const filteredResources = useMemo(() => {
    let result = [...resources]

    /* Exam mode: only show top-rated and exam-important resources */
    if (examMode) {
      result = result.filter((r) => r.isExamImportant || r.averageRating >= 4.5)
    }

    /* Search by title, subject, or tags */
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    /* Apply filters */
    if (filters.course) result = result.filter((r) => r.course === filters.course)
    if (filters.branch) result = result.filter((r) => r.branch === filters.branch)
    if (filters.semester) result = result.filter((r) => r.semester === filters.semester)
    if (filters.resourceType) result = result.filter((r) => r.resourceType === filters.resourceType)
    if (filters.year) result = result.filter((r) => r.year === filters.year)
    if (filters.privacy) result = result.filter((r) => r.privacy === filters.privacy)

    /* Sort */
    switch (sortBy) {
      case "latest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "highest-rated":
        result.sort((a, b) => b.averageRating - a.averageRating)
        break
      case "most-popular":
        result.sort((a, b) => b.downloads - a.downloads)
        break
    }

    return result
  }, [resources, search, filters, sortBy, examMode])

  /* ---------- Guest: show landing page ---------- */
  if (showLanding) return <LandingPage />

  /* ---------- Loading skeleton ---------- */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8 space-y-3">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
          <div className="h-5 w-80 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  /* ---------- Authenticated: resource browser ---------- */
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          {examMode && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700"
            >
              <Sparkles className="h-4 w-4" />
              Exam Mode Active
            </motion.div>
          )}
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
          {examMode ? "Exam Essentials" : "Discover Resources"}
        </h1>
        <p className="mt-2 max-w-lg text-pretty text-muted-foreground">
          {examMode
            ? "Showing top-rated and exam-important resources only."
            : "Browse and share academic resources with your campus community."}
        </p>
      </motion.div>

      {/* Search & filter bar */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, subject, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="highest-rated">Highest Rated</SelectItem>
              <SelectItem value="most-popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter toggle button */}
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="relative btn-press"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-xs font-bold text-primary">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Advanced filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-border/50 bg-card/80 p-4 shadow-sm backdrop-blur-sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                  {/* Course */}
                  <Select
                    value={filters.course}
                    onValueChange={(v) =>
                      setFilters((p) => ({ ...p, course: v, branch: "" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Course" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Branch (dynamic) */}
                  <Select
                    value={filters.branch}
                    onValueChange={(v) => setFilters((p) => ({ ...p, branch: v }))}
                    disabled={!filters.course}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={filters.course ? "Branch" : "Select course"} />
                    </SelectTrigger>
                    <SelectContent>
                      {branchOptions.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Semester */}
                  <Select
                    value={filters.semester}
                    onValueChange={(v) => setFilters((p) => ({ ...p, semester: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEMESTERS.map((s) => (
                        <SelectItem key={s} value={s}>Sem {s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Resource Type */}
                  <Select
                    value={filters.resourceType}
                    onValueChange={(v) => setFilters((p) => ({ ...p, resourceType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Year */}
                  <Select
                    value={filters.year}
                    onValueChange={(v) => setFilters((p) => ({ ...p, year: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Privacy */}
                  <Select
                    value={filters.privacy}
                    onValueChange={(v) => setFilters((p) => ({ ...p, privacy: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Privacy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {activeFilterCount > 0 && (
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(filters).map(
                        ([key, value]) =>
                          value && (
                            <Badge
                              key={key}
                              variant="secondary"
                              className="cursor-pointer pr-1.5"
                              onClick={() =>
                                setFilters((p) => ({
                                  ...p,
                                  [key]: "",
                                  /* Clear branch when clearing course */
                                  ...(key === "course" ? { branch: "" } : {}),
                                }))
                              }
                            >
                              {value}
                              <X className="ml-1 h-3 w-3" />
                            </Badge>
                          )
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {filteredResources.length} resource{filteredResources.length !== 1 ? "s" : ""} found
      </div>

      {/* Resource grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredResources.map((resource, i) => (
              <ResourceCard key={resource.id} resource={resource} index={i} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 py-20"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/80">
            <BookOpen className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">
            No resources found
          </h3>
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            {search || activeFilterCount > 0
              ? "Try adjusting your search or filters to find what you need."
              : "Be the first to share a resource with the community!"}
          </p>
          {(search || activeFilterCount > 0) && (
            <Button variant="outline" className="mt-4 btn-press" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </motion.div>
      )}
    </div>
  )
}
