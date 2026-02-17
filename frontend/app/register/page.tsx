/*
  RegisterPage – allows new users to create an account.
  Collects name, course, college, branch (dynamic based on course), semester, email, and password.
  Supports "Others" option for college and branch with custom input fallback.
  After registration, redirects to home.
*/

"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { COURSES, COLLEGES, SEMESTERS, getBranchesForCourse } from "@/lib/academic-data"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    course: "",
    college: "",
    customCollege: "",
    branch: "",
    customBranch: "",
    semester: "",
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      /* Reset branch when course changes */
      if (field === "course") {
        next.branch = ""
        next.customBranch = ""
      }
      /* Reset custom college if selecting a real college */
      if (field === "college" && value !== "Others") {
        next.customCollege = ""
      }
      /* Reset custom branch if selecting a real branch */
      if (field === "branch" && value !== "Other") {
        next.customBranch = ""
      }
      return next
    })
  }

  /* Dynamic branches based on selected course */
  const branchOptions = useMemo(() => getBranchesForCourse(form.course), [form.course])

  /* Resolved values (using custom inputs when "Others"/"Other" is selected) */
  const resolvedCollege = form.college === "Others" ? form.customCollege : form.college
  const resolvedBranch = form.branch === "Other" ? form.customBranch : form.branch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !resolvedCollege || !resolvedBranch || !form.semester || !form.course) {
      toast.error("Please fill in all fields.")
      return
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.")
      return
    }

    setLoading(true)
    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      college: resolvedCollege,
      course: form.course,
      branch: resolvedBranch,
      semester: form.semester,
    })
    if (result.success) {
      toast.success(result.message)
      router.push("/")
    } else {
      toast.error(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card className="border-border/40 shadow-xl shadow-foreground/[0.03] glow-hover">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-md shadow-primary/20">
              <UserPlus className="h-7 w-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Create your account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Join ACADEX and start sharing resources with your campus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@college.ac.in"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
              </div>

              {/* College */}
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">College</Label>
                <Select value={form.college} onValueChange={(v) => handleChange("college", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLEGES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.college === "Others" && (
                  <Input
                    placeholder="Enter your college name"
                    value={form.customCollege}
                    onChange={(e) => handleChange("customCollege", e.target.value)}
                    className="mt-1"
                  />
                )}
              </div>

              {/* Course & Semester */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Course</Label>
                  <Select value={form.course} onValueChange={(v) => handleChange("course", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Course" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Semester</Label>
                  <Select value={form.semester} onValueChange={(v) => handleChange("semester", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sem" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEMESTERS.map((s) => (
                        <SelectItem key={s} value={s}>
                          Semester {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Branch (dynamic based on course) */}
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Branch</Label>
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

              <Button type="submit" className="mt-2 w-full btn-press" disabled={loading}>
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent"
                  />
                ) : (
                  <>
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
