/*
  ResourceDetailPage -- shows full details of a single resource.
  Proper file + Drive preview logic, polished badges, 24h edit locks,
  review system, and smooth animations.
*/

"use client"

import { useState, use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Download,
  Globe,
  Lock,
  Star,
  Calendar,
  FileText,
  Trash2,
  Pencil,
  ShieldAlert,
  BookOpen,
  Award,
  Flame,
  User,
  ExternalLink,
  Image as ImageIcon,
  FileSpreadsheet,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { StarRating } from "@/components/resources/star-rating"
import { useAuth } from "@/context/auth-context"
import { useResources } from "@/context/resource-context"
import { isWithinEditWindow, formatFileSize } from "@/lib/academic-data"
import { toast } from "sonner"

/* Determine preview type from file name */
function getPreviewType(fileName: string): "pdf" | "image" | "doc" | "none" {
  const ext = fileName.split(".").pop()?.toLowerCase() || ""
  if (ext === "pdf") return "pdf"
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image"
  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) return "doc"
  return "none"
}

/* Preview icon based on file type */
function PreviewIcon({ type }: { type: "pdf" | "image" | "doc" | "none" }) {
  const map = {
    pdf: <FileText className="h-10 w-10 text-primary/40" />,
    image: <ImageIcon className="h-10 w-10 text-emerald-500/40" />,
    doc: <FileSpreadsheet className="h-10 w-10 text-blue-500/40" />,
    none: <FileText className="h-10 w-10 text-muted-foreground/30" />,
  }
  return map[type]
}

export default function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const {
    resources,
    deleteResource,
    addReview,
    updateReview,
    deleteReview,
    getReviewsForResource,
    getUserReviewForResource,
    updateResource,
    loadReviewsForResource,
  } = useResources()

  const resource = resources.find((r) => r.id === id)
  const reviews = resource ? getReviewsForResource(resource.id) : []
  const userReview =
    resource && user ? getUserReviewForResource(resource.id, user.id) : undefined

  const [reviewRating, setReviewRating] = useState(userReview?.rating || 0)
  const [reviewComment, setReviewComment] = useState(userReview?.comment || "")
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")

  useEffect(() => {
    void loadReviewsForResource(id)
  }, [id, loadReviewsForResource])

  /* Resource not found */
  if (!resource) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Resource not found</h2>
          <p className="mb-6 text-muted-foreground">
            This resource may have been removed or the link is invalid.
          </p>
          <Button onClick={() => router.push("/")} className="btn-press">
            Go Home
          </Button>
        </motion.div>
      </div>
    )
  }

  const isOwner = user?.id === resource.contributorId
  const canEditResource = isOwner && isWithinEditWindow(resource.createdAt)
  const resourceLocked = isOwner && !isWithinEditWindow(resource.createdAt)

  /* Access control: block private resources for users from other colleges */
  const isBlocked =
    resource.privacy === "private" &&
    user &&
    user.college !== resource.contributorCollege

  if (isBlocked) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="mb-6 text-muted-foreground">
            This resource is private and only available to{" "}
            <span className="font-semibold text-foreground">
              {resource.contributorCollege}
            </span>{" "}
            students.
          </p>
          <Button variant="outline" onClick={() => router.push("/")} className="btn-press">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resources
          </Button>
        </motion.div>
      </div>
    )
  }

  const handleDelete = async () => {
    try {
      await deleteResource(resource.id)
      toast.success("Resource deleted successfully.")
      router.push("/")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed")
    }
  }

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please sign in to leave a review.")
      return
    }
    if (reviewRating === 0) {
      toast.error("Please select a rating.")
      return
    }

    if (userReview) {
      await updateReview(userReview.id, { rating: reviewRating, comment: reviewComment })
      toast.success("Review updated!")
    } else {
      await addReview({
        resourceId: resource.id,
        userId: user.id,
        userName: user.name,
        rating: reviewRating,
        comment: reviewComment,
      })
      toast.success("Review submitted!")
    }
  }

  const handleSaveEdit = async () => {
    try {
      await updateResource(resource.id, {
        title: editTitle,
        description: editDescription,
      })
      setIsEditing(false)
      toast.success("Resource updated!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed")
    }
  }

  const startEditing = () => {
    setEditTitle(resource.title)
    setEditDescription(resource.description)
    setIsEditing(true)
  }

  /* Rating breakdown calculation */
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
        : 0,
  }))

  const isTopRated = resource.averageRating >= 4.7
  const isTrending = resource.downloads >= 100
  const previewType = getPreviewType(resource.fileName)
  const hasDriveLink = Boolean(resource.driveLink)
  const hasFile = resource.fileName && resource.fileName !== "drive-linked-resource"

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId)
      toast.success("Review deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete review")
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6 btn-press"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resources
        </Button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card className="border-border/40 shadow-lg">
              <CardContent className="p-6">
                {/* Badges */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {isTopRated && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 ring-1 ring-amber-200/50">
                      <Award className="h-3 w-3" /> Top Rated
                    </span>
                  )}
                  {isTrending && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 ring-1 ring-rose-200/50">
                      <Flame className="h-3 w-3" /> Trending
                    </span>
                  )}
                  {resource.isExamImportant && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15">
                      <BookOpen className="h-3 w-3" /> Exam Important
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                      resource.privacy === "public"
                        ? "bg-emerald-50 text-emerald-600 ring-emerald-200/50"
                        : "bg-amber-50 text-amber-600 ring-amber-200/50"
                    }`}
                  >
                    {resource.privacy === "public" ? (
                      <Globe className="h-3 w-3" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                    {resource.privacy === "public" ? "Public" : "Private"}
                  </span>
                </div>

                {/* Title (editable) */}
                {isEditing ? (
                  <div className="mb-4 flex flex-col gap-2">
                    <Label className="text-foreground">Title</Label>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>
                ) : (
                  <h1 className="mb-2 text-balance text-2xl font-bold text-foreground lg:text-3xl">
                    {resource.title}
                  </h1>
                )}

                {/* Meta info */}
                <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" /> {resource.contributorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {resource.averageRating > 0
                      ? resource.averageRating
                      : "No ratings"}
                    {resource.totalRatings > 0 && (
                      <span className="text-muted-foreground">
                        ({resource.totalRatings})
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="h-4 w-4" /> {resource.downloads} downloads
                  </span>
                </div>

                {/* Info grid */}
                <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {[
                    { label: "Subject", value: resource.subject },
                    { label: "Course", value: resource.course },
                    { label: "Semester", value: `Sem ${resource.semester}` },
                    { label: "Year", value: resource.year },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl bg-muted/40 p-3 ring-1 ring-border/30"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {isEditing ? (
                  <div className="mb-4 flex flex-col gap-2">
                    <Label className="text-foreground">Description</Label>
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                ) : (
                  resource.description && (
                    <div className="mb-4">
                      <h3 className="mb-1.5 text-sm font-semibold text-foreground">
                        Description
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {resource.description}
                      </p>
                    </div>
                  )
                )}

                {/* Tags */}
                {resource.tags.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-1.5">
                    {resource.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-muted/60 text-xs font-normal"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* File preview section */}
                <div className="mb-5">
                  <h3 className="mb-2 text-sm font-semibold text-foreground">
                    Preview
                  </h3>

                  {/* Priority: if both file and drive link, show file preview first with drive link secondary */}
                  {hasDriveLink ? (
                    <div className="overflow-hidden rounded-xl border border-border/60">
                      <div className="relative bg-muted/20">
                        <iframe
                          src={resource.driveLink!.replace("/view", "/preview")}
                          className="h-80 w-full sm:h-96"
                          title="Google Drive preview"
                          sandbox="allow-scripts allow-same-origin"
                        />
                        {/* Fallback overlay if embed fails */}
                        <noscript>
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-6 text-center">
                            <ExternalLink className="mb-2 h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Preview not available. Open in Google Drive.
                            </p>
                          </div>
                        </noscript>
                      </div>
                      <div className="flex items-center gap-2 border-t border-border/40 bg-muted/30 px-4 py-2.5">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={resource.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                        >
                          Open in Google Drive
                        </a>
                      </div>
                    </div>
                  ) : hasFile ? (
                    <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                      <div className="flex flex-col items-center justify-center p-10 text-center">
                        <PreviewIcon type={previewType} />
                        <p className="mt-3 text-sm font-medium text-foreground">
                          {resource.fileName}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatFileSize(resource.fileSize)}
                          {previewType !== "none" &&
                            ` -- ${previewType.toUpperCase()} file`}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Preview available after download
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border-2 border-dashed border-border/50 bg-muted/10">
                      <div className="flex flex-col items-center justify-center p-10 text-center">
                        <FileText className="h-10 w-10 text-muted-foreground/30" />
                        <p className="mt-3 text-sm text-muted-foreground">
                          No preview available
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => {
                      if (resource.fileUrl) {
                        window.open(resource.fileUrl, "_blank", "noopener,noreferrer")
                      } else if (resource.driveLink) {
                        window.open(resource.driveLink, "_blank", "noopener,noreferrer")
                      } else {
                        toast.error("No download link available.")
                      }
                    }}
                    className="btn-press"
                  >
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  {hasDriveLink && (
                    <Button variant="outline" asChild className="btn-press">
                      <a
                        href={resource.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" /> View on Google
                        Drive
                      </a>
                    </Button>
                  )}
                  {isOwner && !isEditing && canEditResource && (
                    <>
                      <Button variant="outline" onClick={startEditing} className="btn-press">
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10 btn-press"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this resource?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently
                              remove the resource and all its reviews.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                  {resourceLocked && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> Locked after 24 hours
                    </div>
                  )}
                  {isEditing && (
                    <>
                      <Button onClick={handleSaveEdit} className="btn-press">Save Changes</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="btn-press">
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: ratings & reviews */}
          <div className="flex flex-col gap-6">
            {/* Rating summary */}
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">
                  Rating Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">
                      {resource.averageRating > 0 ? resource.averageRating : "--"}
                    </div>
                    <StarRating
                      rating={Math.round(resource.averageRating)}
                      size="sm"
                      readonly
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {resource.totalRatings} rating
                      {resource.totalRatings !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex-1">
                    {ratingBreakdown.map(({ star, count, percentage }) => (
                      <div
                        key={star}
                        className="flex items-center gap-2 py-0.5 text-xs"
                      >
                        <span className="w-2 text-muted-foreground">{star}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            className="h-1.5 rounded-full bg-amber-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{
                              duration: 0.6,
                              delay: 0.1 * star,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          />
                        </div>
                        <span className="w-4 text-right text-muted-foreground">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Write/Edit review */}
            {user && !isOwner && (
              <Card className="border-border/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground">
                    {userReview ? "Edit Your Review" : "Write a Review"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {/* Check 24h review lock for editing */}
                  {userReview && !isWithinEditWindow(userReview.createdAt) ? (
                    <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Review locked after 24 hours
                    </div>
                  ) : (
                    <>
                      <StarRating rating={reviewRating} onRate={setReviewRating} />
                      <Textarea
                        placeholder="Share your thoughts..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={handleSubmitReview} className="w-full btn-press">
                        {userReview ? "Update Review" : "Submit Review"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reviews list */}
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">
                  Reviews ({reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    <AnimatePresence>
                      {reviews.map((review, i) => {
                        const reviewEditable = isWithinEditWindow(
                          review.createdAt
                        )
                        return (
                          <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-border/30 pb-4 last:border-0 last:pb-0"
                          >
                            <div className="mb-1 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                                  {review.userName[0]}
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                  {review.userName}
                                </span>
                              </div>
                              <StarRating
                                rating={review.rating}
                                size="sm"
                                readonly
                              />
                            </div>
                            {review.comment && (
                              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                {review.comment}
                              </p>
                            )}
                            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground/70">
                              <span>
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                              {!reviewEditable && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Locked
                                </span>
                              )}
                              {user?.id === review.userId && reviewEditable && (
                                <button
                                  onClick={() => void handleDeleteReview(review.id)}
                                  className="text-destructive hover:underline"
                                  type="button"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <Star className="mx-auto mb-2 h-8 w-8 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">
                      No reviews yet. Be the first!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
