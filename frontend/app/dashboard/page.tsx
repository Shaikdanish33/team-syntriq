/*
  DashboardPage – shows the logged-in user's profile, uploaded resources, and points.
  Allows editing profile details with dynamic branches and standardized colleges.
*/

"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  User,
  BookOpen,
  Star,
  Trophy,
  Pencil,
  Save,
  X,
  Upload,
  FileText,
  Building2,
  GraduationCap,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { useResources } from "@/context/resource-context"
import { COLLEGES, SEMESTERS, COURSES, getBranchesForCourse } from "@/lib/academic-data"
import { toast } from "sonner"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading, updateProfile } = useAuth()
  const { resources } = useResources()

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    college: "",
    customCollege: "",
    course: "",
    branch: "",
    customBranch: "",
    semester: "",
  })

  /* Dynamic branches in the edit form */
  const editBranchOptions = useMemo(
    () => getBranchesForCourse(editForm.course),
    [editForm.course]
  )

  /* Filter resources uploaded by the current user */
  const myResources = useMemo(
    () => (user ? resources.filter((r) => r.contributorId === user.id) : []),
    [user, resources]
  )

  const totalDownloads = myResources.reduce((sum, r) => sum + r.downloads, 0)
  const avgRating =
    myResources.length > 0
      ? myResources.reduce((sum, r) => sum + r.averageRating, 0) / myResources.length
      : 0

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : ""

  /* Show loading state */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-pulse rounded-2xl bg-muted" />
        <div className="mx-auto mb-2 h-5 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="mx-auto h-4 w-64 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  /* Redirect if not logged in */
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Sign in to view dashboard</h2>
          <p className="mb-6 text-muted-foreground">
            Access your profile, uploads, and statistics.
          </p>
          <Button onClick={() => router.push("/login")} className="btn-press">Sign In</Button>
        </motion.div>
      </div>
    )
  }

  const startEditing = () => {
    /* Determine if current college is in the standard list */
    const isStandardCollege = (COLLEGES as readonly string[]).includes(user.college)
    setEditForm({
      name: user.name,
      college: isStandardCollege ? user.college : "Others",
      customCollege: isStandardCollege ? "" : user.college,
      course: "",
      branch: user.branch || "",
      customBranch: "",
      semester: user.semester,
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!editForm.name.trim()) {
      toast.error("Name cannot be empty.")
      return
    }
    const resolvedCollege = editForm.college === "Others" ? editForm.customCollege : editForm.college
    const resolvedBranch = editForm.branch === "Other" ? editForm.customBranch : editForm.branch
    if (!resolvedCollege) {
      toast.error("Please select or enter a college.")
      return
    }
    updateProfile({
      name: editForm.name,
      college: resolvedCollege,
      branch: resolvedBranch,
      semester: editForm.semester,
    })
    setIsEditing(false)
    toast.success("Profile updated!")
  }

  const pointsFromUploads = myResources.reduce(
    (sum, r) => sum + (r.privacy === "public" ? 10 : 5),
    0,
  )

  const stats = [
    {
      label: "Resources",
      value: myResources.length,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Points",
      value: pointsFromUploads,
      icon: Trophy,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Downloads",
      value: totalDownloads,
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "Avg Rating",
      value: avgRating > 0 ? avgRating.toFixed(1) : "--",
      icon: Star,
      color: "text-rose-600",
      bg: "bg-rose-100",
    },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Profile header card */}
        <Card className="mb-6 border-border/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {isEditing ? (
                <div className="flex-1">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-foreground text-xs">Name</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                    </div>
                    {/* College */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-foreground text-xs">College</Label>
                      <Select
                        value={editForm.college}
                        onValueChange={(v) => setEditForm((p) => ({ ...p, college: v, customCollege: "" }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COLLEGES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {editForm.college === "Others" && (
                        <Input
                          placeholder="Enter your college name"
                          value={editForm.customCollege}
                          onChange={(e) => setEditForm((p) => ({ ...p, customCollege: e.target.value }))}
                          className="mt-1"
                        />
                      )}
                    </div>
                    {/* Course (for branch selection) */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-foreground text-xs">Course (for branch)</Label>
                      <Select
                        value={editForm.course}
                        onValueChange={(v) =>
                          setEditForm((p) => ({ ...p, course: v, branch: "", customBranch: "" }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {COURSES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Branch (dynamic) */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-foreground text-xs">Branch</Label>
                      {editForm.course ? (
                        <>
                          <Select
                            value={editForm.branch}
                            onValueChange={(v) => setEditForm((p) => ({ ...p, branch: v, customBranch: "" }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                              {editBranchOptions.map((b) => (
                                <SelectItem key={b} value={b}>{b}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {editForm.branch === "Other" && (
                            <Input
                              placeholder="Enter your branch"
                              value={editForm.customBranch}
                              onChange={(e) => setEditForm((p) => ({ ...p, customBranch: e.target.value }))}
                              className="mt-1"
                            />
                          )}
                        </>
                      ) : (
                        <Input
                          value={editForm.branch}
                          onChange={(e) => setEditForm((p) => ({ ...p, branch: e.target.value }))}
                          placeholder="Select course first or type branch"
                        />
                      )}
                    </div>
                    {/* Semester */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-foreground text-xs">Semester</Label>
                      <Select
                        value={editForm.semester}
                        onValueChange={(v) => setEditForm((p) => ({ ...p, semester: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SEMESTERS.map((s) => (
                            <SelectItem key={s} value={s}>Semester {s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={handleSave}>
                      <Save className="mr-1 h-3.5 w-3.5" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="mr-1 h-3.5 w-3.5" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                    <Button variant="ghost" size="sm" onClick={startEditing}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" /> {user.college || "Not set"}
                    </span>
                    {user.branch && (
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5" /> {user.branch}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" /> Sem {user.semester}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-border/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* My uploads */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-foreground">My Uploads</CardTitle>
            <Button size="sm" asChild>
              <Link href="/upload">
                <Upload className="mr-1 h-3.5 w-3.5" /> New Upload
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {myResources.length > 0 ? (
              <div className="flex flex-col gap-3">
                {myResources.map((resource, i) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/resource/${resource.id}`}>
                      <div className="flex items-center justify-between rounded-xl border border-border/50 p-4 transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-foreground">
                              {resource.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {resource.subject} - Sem {resource.semester}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {resource.averageRating || "--"}
                          </span>
                          <Badge variant="secondary">{resource.resourceType}</Badge>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  You have not uploaded any resources yet.
                </p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/upload">Upload your first resource</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
