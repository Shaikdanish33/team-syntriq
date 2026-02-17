"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { User } from "@/lib/types"
import { authApi, leaderboardApi, setStoredToken } from "@/lib/api"

interface AuthContextType {
  user: User | null
  users: User[]
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (userData: {
    name: string
    email: string
    password: string
    college: string
    course: string
    branch: string
    semester: string
  }) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapUser(user: any): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    college: user.college,
    course: user.course,
    branch: user.branch,
    semester: user.semester,
    avatarUrl: user.avatarUrl ?? undefined,
    points: user.points ?? 0,
    createdAt: user.createdAt ?? new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const hydrateLeaderboard = useCallback(async (currentUserId?: string) => {
    try {
      const data = await leaderboardApi.list()
      const mappedUsers = data.leaderboard.map((entry: any) => ({
        id: entry.id,
        name: entry.name,
        email: "",
        college: entry.college,
        branch: entry.branch,
        semester: "",
        points: entry.points,
        createdAt: "",
      }))
      setUsers(mappedUsers)

      if (currentUserId) {
        const me = mappedUsers.find((u) => u.id === currentUserId)
        if (me) {
          setUser((prev) => (prev ? { ...prev, points: me.points } : prev))
        }
      }
    } catch {
      setUsers([])
    }
  }, [])

  // Loads session from backend when token exists.
  const refreshSession = useCallback(async () => {
    try {
      const data = await authApi.session()
      const mapped = mapUser(data.user)
      setUser(mapped)
      await hydrateLeaderboard(mapped.id)
    } catch {
      setStoredToken(null)
      setUser(null)
      await hydrateLeaderboard()
    } finally {
      setIsLoading(false)
    }
  }, [hydrateLeaderboard])

  useEffect(() => {
    void refreshSession()
  }, [refreshSession])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await authApi.login({ email, password })
      setStoredToken(data.token)
      const mapped = mapUser(data.user)
      setUser(mapped)
      await hydrateLeaderboard(mapped.id)
      return { success: true, message: data.message }
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Login failed" }
    }
  }, [hydrateLeaderboard])

  const register = useCallback(async (userData: {
    name: string
    email: string
    password: string
    college: string
    course: string
    branch: string
    semester: string
  }) => {
    try {
      const data = await authApi.signup(userData)
      if (data.token) setStoredToken(data.token)
      const mapped = mapUser(data.user)
      setUser(mapped)
      await hydrateLeaderboard(mapped.id)
      return { success: true, message: data.message }
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Registration failed" }
    }
  }, [hydrateLeaderboard])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore logout network failures; token is removed locally anyway.
    }
    setStoredToken(null)
    setUser(null)
    await hydrateLeaderboard()
  }, [hydrateLeaderboard])

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    const payload = {
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.college !== undefined ? { college: updates.college } : {}),
      ...(updates.course !== undefined ? { course: updates.course } : {}),
      ...(updates.branch !== undefined ? { branch: updates.branch } : {}),
      ...(updates.semester !== undefined ? { semester: updates.semester } : {}),
      ...(updates.avatarUrl !== undefined ? { profileImageUrl: updates.avatarUrl } : {}),
    }
    const data = await authApi.updateProfile(payload)
    const mapped = mapUser(data.user)
    setUser((prev) => ({ ...(prev ?? mapped), ...mapped }))
    await hydrateLeaderboard(mapped.id)
  }, [hydrateLeaderboard])

  const value = useMemo(
    () => ({ user, users, isLoading, login, register, logout, updateProfile, refreshSession }),
    [user, users, isLoading, login, register, logout, updateProfile, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
