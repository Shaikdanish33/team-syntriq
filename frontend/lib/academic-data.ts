/*
  Single source of truth for all academic constants.
  All course, branch, college, resource type, semester, and year data
  must come from this file only.
*/

export const COURSES = [
  "BCA",
  "MCA",
  "BSC",
  "MSC",
  "BCOM",
  "MCOM",
  "BBA",
  "MBA",
] as const

export type Course = (typeof COURSES)[number]

/* Dynamic branch mapping: branches update based on selected course */
export const COURSE_BRANCHES: Record<Course, string[]> = {
  BCA: ["General", "Computer Science", "Data Science", "Cloud Computing", "Other"],
  MCA: ["General", "Computer Science", "AI & ML", "Cyber Security", "Other"],
  BSC: ["General", "Physics", "Chemistry", "Mathematics", "Computer Science", "Other"],
  MSC: ["General", "Physics", "Chemistry", "Mathematics", "Data Science", "Other"],
  BCOM: ["General", "Accounting & Finance", "Taxation", "Other"],
  MCOM: ["General", "Finance", "Marketing", "International Business", "Other"],
  BBA: ["General", "Finance", "Marketing", "HR", "Other"],
  MBA: ["General", "Finance", "Marketing", "HR", "Business Analytics", "Other"],
}

/* Returns the branch options for a given course, or a flat list of all branches */
export function getBranchesForCourse(course: string): string[] {
  return COURSE_BRANCHES[course as Course] ?? []
}

export const COLLEGES = [
  "MS Ramaiah College of Arts Science and Commerce",
  "St. Claret College",
  "Jain University",
  "Christ University",
  "Others",
] as const

export const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const

export const RESOURCE_TYPES = [
  "Notes",
  "Question Papers",
  "Solutions",
  "Project Reports",
  "Study Material",
  "Others",
] as const

export const YEARS = ["2026", "2025", "2024", "2023", "2022", "2021"] as const

/* Points awarded per upload type */
export const POINTS = {
  PUBLIC_UPLOAD: 10,
  PRIVATE_UPLOAD: 5,
} as const

/* 24-hour lock window in ms */
export const LOCK_WINDOW_MS = 24 * 60 * 60 * 1000

/* Max file size in bytes (30 MB) */
export const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024
export const MAX_FILE_SIZE_LABEL = "30MB"

/* Helper: checks if an item is still within the 24-hour edit window */
export function isWithinEditWindow(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < LOCK_WINDOW_MS
}

/* Helper: formats bytes into a human-readable string */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
