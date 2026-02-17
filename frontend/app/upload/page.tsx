/*
  UploadPage -- lets logged-in users upload a new academic resource.
  File upload with 30MB limit, optional Google Drive link (always visible),
  dynamic branches, privacy toggle, and points logic (+10 public, +5 private).
  At least one of file or drive link must be provided.
*/

"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Upload,
  FileText,
  X,
  Globe,
  Lock,
  AlertTriangle,
  Link2,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { useResources } from "@/context/resource-context"
import {
  COURSES,
  SEMESTERS,
  RESOURCE_TYPES,
  YEARS,
  getBranchesForCourse,
  POINTS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
  formatFileSize,
} from "@/lib/academic-data"
import { toast } from "sonner"

export default function UploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addResource, requests, fulfillRequest } = useResources()

  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [form, setForm] = useState({
    title: "",
    subject: "",
    semester: "",
    course: "",
    branch: "",
    customBranch: "",
    resourceType: "",
    year: "",
    tags: [] as string[],
    description: "",
    privacy: "public" as "public" | "private",
    fileName: "",
    fileSize: 0,
    driveLink: "",
    fulfillRequestId: "",
  })

  /* Dynamic branches based on selected course */
  const branchOptions = useMemo(() => getBranchesForCourse(form.course), [form.course])
  const resolvedBranch = form.branch === "Other" ? form.customBranch : form.branch

  /* Derived state */
  const hasFile = form.fileName.length > 0
  const hasValidFile = hasFile && form.fileSize <= MAX_FILE_SIZE_BYTES
  const fileOversized = hasFile && form.fileSize > MAX_FILE_SIZE_BYTES
  const hasDriveLink = form.driveLink.trim().length > 0
  const hasAtLeastOne = hasValidFile || hasDriveLink

  /* Redirect if not logged in */
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Sign in to upload</h2>
          <p className="mb-6 text-muted-foreground">You need to be signed in to upload resources.</p>
          <Button onClick={() => router.push("/login")} className="btn-press">Sign In</Button>
        </motion.div>
      </div>
    )
  }

  const handleChange = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "course") {
        next.branch = ""
        next.customBranch = ""
      }
      if (field === "branch" && value !== "Other") {
        next.customBranch = ""
      }
      return next
    })
  }

  /* Add tag when user presses comma or enter */
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "," || e.key === "Enter") && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().replace(",", "")
      if (newTag && !form.tags.includes(newTag)) {
        setForm((prev) => ({ ...prev, tags: [...prev.tags, newTag] }))
      }
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  /* File selection with 30MB limit */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setForm((prev) => ({ ...prev, fileName: file.name, fileSize: file.size }))
    }
  }

  const clearFile = () => {
    setForm((prev) => ({ ...prev, fileName: "", fileSize: 0 }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.subject || !form.semester || !form.course || !form.resourceType || !form.year) {
      toast.error("Please fill in all required fields.")
      return
    }
    if (!hasAtLeastOne) {
      toast.error("Please upload a file or provide a Google Drive link.")
      return
    }
    if (fileOversized && !hasDriveLink) {
      toast.error(`File exceeds ${MAX_FILE_SIZE_LABEL}. Please reduce file size or provide a Google Drive link.`)
      return
    }

    setLoading(true)
    try {
      const { resource, pointsAwarded } = await addResource({
        title: form.title,
        subject: form.subject,
        semester: form.semester,
        course: form.course,
        branch: resolvedBranch || undefined,
        resourceType: form.resourceType,
        year: form.year,
        tags: form.tags,
        description: form.description,
        privacy: form.privacy,
        fileName: form.fileName || "drive-linked-resource",
        fileSize: form.fileSize || 0,
        fileUrl: hasFile ? form.fileName : undefined,
        driveLink: hasDriveLink ? form.driveLink.trim() : undefined,
        contributorId: user.id,
        contributorName: user.name,
        contributorCollege: user.college,
        isExamImportant: false,
      })

      if (form.fulfillRequestId) {
        await fulfillRequest(form.fulfillRequestId, resource.id)
      }

      toast.success(`Resource uploaded successfully! +${pointsAwarded} points`)
      router.push("/")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  /* Open requests that could be fulfilled */
  const openRequests = requests.filter((r) => r.status === "open")

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="border-border/40 shadow-lg glow-hover">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl text-foreground">Upload Resource</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Earn {POINTS.PUBLIC_UPLOAD} points (public) or {POINTS.PRIVATE_UPLOAD} points (private)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title" className="text-sm font-medium text-foreground">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., DSA Complete Notes"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="subject" className="text-sm font-medium text-foreground">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Data Structures"
                  value={form.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                />
              </div>

              {/* Course & Semester row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-foreground">Course *</Label>
                  <Select value={form.course} onValueChange={(v) => handleChange("course", v)}>
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
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-foreground">Semester *</Label>
                  <Select value={form.semester} onValueChange={(v) => handleChange("semester", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEMESTERS.map((s) => (
                        <SelectItem key={s} value={s}>Semester {s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Branch (dynamic) */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-foreground">Branch</Label>
                <Select
                  value={form.branch}
                  onValueChange={(v) => handleChange("branch", v)}
                  disabled={!form.course}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={form.course ? "Select branch" : "Select course first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {branchOptions.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.branch === "Other" && (
                  <Input
                    placeholder="Enter your branch"
                    value={form.customBranch}
                    onChange={(e) => handleChange("customBranch", e.target.value)}
                    className="mt-1"
                  />
                )}
              </div>

              {/* Type & Year row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-foreground">Resource Type *</Label>
                  <Select value={form.resourceType} onValueChange={(v) => handleChange("resourceType", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-foreground">Year *</Label>
                  <Select value={form.year} onValueChange={(v) => handleChange("year", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-foreground">Tags</Label>
                <Input
                  placeholder="Type a tag and press Enter or comma"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {form.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer pr-1.5 transition-colors hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description" className="text-sm font-medium text-foreground">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Briefly describe the resource..."
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Privacy toggle */}
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4 transition-colors">
                <div className="flex items-center gap-3">
                  {form.privacy === "public" ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                      <Globe className="h-4 w-4 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                      <Lock className="h-4 w-4 text-amber-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {form.privacy === "public" ? "Public Resource" : "Private Resource"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {form.privacy === "public"
                        ? `Anyone can view (+${POINTS.PUBLIC_UPLOAD} points)`
                        : `Only your college (+${POINTS.PRIVATE_UPLOAD} points)`}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={form.privacy === "private"}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, privacy: checked ? "private" : "public" }))
                  }
                />
              </div>

              {/* File upload */}
              <div className="flex flex-col gap-3">
                <Label className="text-sm font-medium text-foreground">File Upload</Label>
                {!hasFile ? (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 p-8 transition-all duration-200 hover:border-primary/40 hover:bg-primary/[0.02]">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Click to choose a file</span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      PDF, PPTX, ZIP up to {MAX_FILE_SIZE_LABEL}
                    </span>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                ) : (
                  <div
                    className={`flex items-center justify-between rounded-xl border p-4 ${
                      fileOversized
                        ? "border-amber-300 bg-amber-50/50"
                        : "border-emerald-300 bg-emerald-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText
                        className={`h-5 w-5 ${
                          fileOversized ? "text-amber-600" : "text-emerald-600"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{form.fileName}</p>
                        <p
                          className={`text-xs ${
                            fileOversized ? "text-amber-600" : "text-muted-foreground"
                          }`}
                        >
                          {formatFileSize(form.fileSize)}
                          {fileOversized && ` -- exceeds ${MAX_FILE_SIZE_LABEL} limit`}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFile}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* File size warning */}
                {fileOversized && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      File exceeds {MAX_FILE_SIZE_LABEL}. Please provide a Google Drive link below
                      to submit, or choose a smaller file.
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Google Drive Link (always visible, optional) */}
              <div className="flex flex-col gap-1.5">
                <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Google Drive Link
                  <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  placeholder="https://drive.google.com/file/d/..."
                  value={form.driveLink}
                  onChange={(e) => handleChange("driveLink", e.target.value)}
                />
                {hasDriveLink && (
                  <p className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Drive link provided
                  </p>
                )}
                {!hasFile && !hasDriveLink && (
                  <p className="text-xs text-muted-foreground">
                    Upload a file, provide a Drive link, or both.
                  </p>
                )}
              </div>

              {/* Fulfill a request (optional) */}
              {openRequests.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                    Fulfill a Request
                    <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                  </Label>
                  <Select
                    value={form.fulfillRequestId}
                    onValueChange={(v) => handleChange("fulfillRequestId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a request to fulfill" />
                    </SelectTrigger>
                    <SelectContent>
                      {openRequests.map((req) => (
                        <SelectItem key={req.id} value={req.id}>
                          {req.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                className="mt-2 w-full btn-press"
                disabled={loading || !hasAtLeastOne}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent"
                  />
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Upload Resource
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
