/*
  RequestsPage – community board for urgent resource requests.
  Users can create new requests and view all existing ones.
  Requests show status (OPEN / FULFILLED) with appropriate styling.
*/

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertCircle,
  Plus,
  CheckCircle2,
  Clock,
  BookOpen,
  X,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { useResources } from "@/context/resource-context"
import { SEMESTERS } from "@/lib/academic-data"
import { toast } from "sonner"

export default function RequestsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { requests, addRequest } = useResources()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    title: "",
    subject: "",
    semester: "",
    description: "",
  })

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to create a request.")
      return
    }
    if (!form.title || !form.subject || !form.semester) {
      toast.error("Please fill in all required fields.")
      return
    }

    try {
      await addRequest({
        title: form.title,
        subject: form.subject,
        semester: form.semester,
        description: form.description,
        requesterId: user.id,
        requesterName: user.name,
      })
      toast.success("Request posted! The community will help you.")
      setForm({ title: "", subject: "", semester: "", description: "" })
      setDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to post request")
    }
  }

  const openRequests = requests.filter((r) => r.status === "open")
  const fulfilledRequests = requests.filter((r) => r.status === "fulfilled")

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Resource Requests
            </h1>
            <p className="mt-2 text-muted-foreground">
              {"Can't find what you need? Request it from the community."}
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request a Resource</DialogTitle>
                <DialogDescription>
                  Describe what you need and the community will help.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="req-title" className="text-foreground">Title *</Label>
                  <Input
                    id="req-title"
                    placeholder="e.g., Need CN End-Sem Notes"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Subject *</Label>
                    <Input
                      placeholder="e.g., Computer Networks"
                      value={form.subject}
                      onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Semester *</Label>
                    <Select
                      value={form.semester}
                      onValueChange={(v) => setForm((p) => ({ ...p, semester: v }))}
                    >
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
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Description</Label>
                  <Textarea
                    placeholder="Describe what you need in detail..."
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Post Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Open Requests */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          <h2 className="text-lg font-semibold text-foreground">
            Open Requests ({openRequests.length})
          </h2>
        </div>

        {openRequests.length > 0 ? (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {openRequests.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-amber-200/50 bg-amber-50/30">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Badge className="bg-amber-100 text-amber-700 border-0 hover:bg-amber-100">
                              <Clock className="mr-1 h-3 w-3" /> OPEN
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Sem {req.semester}
                            </span>
                          </div>
                          <h3 className="mb-1 text-base font-semibold text-foreground">
                            {req.title}
                          </h3>
                          <p className="mb-2 text-sm text-muted-foreground">
                            {req.subject}
                          </p>
                          {req.description && (
                            <p className="text-sm text-muted-foreground">
                              {req.description}
                            </p>
                          )}
                          <p className="mt-2 text-xs text-muted-foreground">
                            Requested by {req.requesterName} on{" "}
                            {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push("/upload")}
                          className="ml-4 shrink-0"
                        >
                          <BookOpen className="mr-1 h-3.5 w-3.5" /> Fulfill
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Card className="border-dashed border-border">
            <CardContent className="py-10 text-center">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No open requests right now.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fulfilled Requests */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <h2 className="text-lg font-semibold text-foreground">
            Fulfilled ({fulfilledRequests.length})
          </h2>
        </div>

        {fulfilledRequests.length > 0 ? (
          <div className="flex flex-col gap-3">
            {fulfilledRequests.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-emerald-200/50 bg-emerald-50/30">
                  <CardContent className="p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700 border-0 hover:bg-emerald-100">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> FULFILLED
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Sem {req.semester}
                      </span>
                    </div>
                    <h3 className="mb-1 text-base font-semibold text-foreground">
                      {req.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{req.subject}</p>
                    {req.fulfilledResourceId && (
                      <Link
                        href={`/resource/${req.fulfilledResourceId}`}
                        className="mt-2 inline-flex items-center text-xs font-medium text-primary hover:underline"
                      >
                        View resource
                      </Link>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Requested by {req.requesterName}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-border">
            <CardContent className="py-10 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No fulfilled requests yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
