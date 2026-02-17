"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useInView, useAnimation } from "framer-motion"
import {
  GraduationCap,
  Search,
  Shield,
  Star,
  Trophy,
  Eye,
  Upload,
  Filter,
  Download,
  MessageSquareX,
  FolderSearch,
  Clock,
  AlertTriangle,
  BookOpen,
  Users,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

/* ------------------------------------------------------------------ */
/*  Scroll-triggered section wrapper                                   */
/* ------------------------------------------------------------------ */

function Section({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) controls.start("visible")
  }, [isInView, controls])

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/* ------------------------------------------------------------------ */
/*  Sticky landing navbar (separate from app navbar)                   */
/* ------------------------------------------------------------------ */

function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-card/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/25 transition-transform duration-200 group-hover:scale-105">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            ACAD<span className="text-primary">EX</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="btn-press">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild className="btn-press shadow-sm shadow-primary/20">
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const PROBLEMS = [
  {
    icon: MessageSquareX,
    title: "Scattered Notes",
    description:
      "Important notes buried in WhatsApp groups, emails, and random drives with no organization.",
  },
  {
    icon: AlertTriangle,
    title: "Lost Before Exams",
    description:
      "Crucial study material disappears right when you need it most -- during exam prep.",
  },
  {
    icon: FolderSearch,
    title: "No Central Repository",
    description:
      "No single, organized place for your campus to store and share academic resources.",
  },
  {
    icon: Clock,
    title: "Wasted Time Searching",
    description:
      "Hours wasted hunting for trusted notes instead of actually studying.",
  },
]

const FEATURES = [
  {
    icon: BookOpen,
    title: "Organized by Course & Semester",
    description: "Resources are structured by course, branch, semester, and year for easy navigation.",
  },
  {
    icon: Search,
    title: "Advanced Search & Filters",
    description: "Find exactly what you need with powerful search, tags, and multi-level filters.",
  },
  {
    icon: Shield,
    title: "College-Based Privacy",
    description: "Control who can see your uploads -- share publicly or restrict to your college.",
  },
  {
    icon: Star,
    title: "Rating & Review System",
    description: "Quality-checked by the community. Top-rated resources rise to the top.",
  },
  {
    icon: Trophy,
    title: "Contribution Leaderboard",
    description: "Earn points for sharing. Compete with peers and build your academic reputation.",
  },
  {
    icon: Eye,
    title: "Preview Before Download",
    description: "Preview PDFs, images, and documents before downloading to save time.",
  },
]

const STEPS = [
  {
    icon: Upload,
    step: "01",
    title: "Upload",
    description: "Share notes, question papers, project reports, and study materials with your campus.",
  },
  {
    icon: Filter,
    step: "02",
    title: "Discover",
    description: "Search using advanced filters, tags, and course-specific categories.",
  },
  {
    icon: Download,
    step: "03",
    title: "Prepare",
    description: "Preview, download, rate resources, and ace your exams with the best materials.",
  },
]

/* ------------------------------------------------------------------ */
/*  Landing Page Component                                             */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        {/* Soft gradient background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.545 0.175 262 / 0.08), transparent 70%)",
          }}
        />

        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 pb-16 pt-20 text-center lg:px-8 lg:pb-24 lg:pt-28">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
          >
            <Users className="h-3.5 w-3.5" />
            Free & community-driven
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Your Campus Academic
            <br />
            <span className="text-primary">Resource Hub</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
          >
            Upload, discover, and access organized study materials shared by
            students from your campus. Notes, papers, slides, and more -- all in
            one place.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button size="lg" asChild className="btn-press shadow-md shadow-primary/20 px-8">
              <Link href="/register">
                Sign Up Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="btn-press px-8">
              <Link href="/login">Sign In</Link>
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground sm:gap-12"
          >
            {[
              { value: "500+", label: "Resources Shared" },
              { value: "120+", label: "Active Students" },
              { value: "15+", label: "Colleges" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                <span className="mt-0.5">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------- PROBLEM ---------- */}
      <Section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              The Problem Students Face
            </h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              Every semester, the same struggle repeats -- scattered materials
              and no reliable way to find what you need.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2">
            {PROBLEMS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10">
                  <item.icon className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------- FEATURES / SOLUTION ---------- */}
      <Section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
              <GraduationCap className="h-4 w-4" />
              The Solution
            </div>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Meet ACADEX
            </h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              A structured, community-driven platform where students share,
              discover, and rate academic resources.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="group rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 transition-colors group-hover:bg-primary/12">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------- HOW IT WORKS ---------- */}
      <Section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              Three simple steps to start sharing and discovering resources.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Connecting line (desktop only) */}
                {i < STEPS.length - 1 && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute left-[calc(50%+44px)] top-9 hidden h-px w-[calc(100%-88px)] bg-border/60 md:block"
                    style={{ transform: "translateX(44px)" }}
                  />
                )}

                {/* Step number circle */}
                <div className="relative mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/5">
                  <step.icon className="h-7 w-7 text-primary" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                    {step.step}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------- COMMUNITY ---------- */}
      <Section className="relative overflow-hidden py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 110%, oklch(0.68 0.19 155 / 0.06), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <Users className="h-7 w-7 text-accent" />
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for students, by students.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
            ACADEX is a collaborative academic space where knowledge is shared,
            resources are organized, and nothing gets lost. Your campus
            community, together.
          </p>
        </div>
      </Section>

      {/* ---------- FINAL CTA ---------- */}
      <Section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-3xl border border-primary/15 bg-primary/[0.03] px-6 py-16 text-center sm:px-12">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Join Your Campus Learning
              <br className="hidden sm:block" /> Community Today
            </h2>
            <p className="mx-auto mt-4 max-w-md text-pretty text-muted-foreground">
              Start sharing and discovering organized academic resources with
              students from your campus. Completely free.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="btn-press shadow-md shadow-primary/20 px-8">
                <Link href="/register">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="btn-press px-8">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t border-border/40 bg-muted/20 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">
              ACAD<span className="text-primary">EX</span>
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">
            A student community project. Share knowledge, ace exams.
          </p>
        </div>
      </footer>
    </div>
  )
}
