/*
  AppShell – wraps the entire app with navbar, exam mode context, and toaster.
  Provides the ExamProvider so both navbar and home page can share exam mode state.
  Hides the app navbar on the landing page (unauthenticated home) via context flag.
*/

"use client"

import { createContext, useContext, useState } from "react"
import { Navbar } from "./navbar"
import { Toaster } from "sonner"
import { ExamProvider } from "@/context/exam-context"

/* Context to let child pages hide the app chrome (navbar) */
interface AppChromeContextType {
  hideChrome: boolean
  setHideChrome: (v: boolean) => void
}
const AppChromeContext = createContext<AppChromeContextType>({
  hideChrome: false,
  setHideChrome: () => {},
})
export function useAppChrome() {
  return useContext(AppChromeContext)
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [hideChrome, setHideChrome] = useState(false)

  return (
    <AppChromeContext.Provider value={{ hideChrome, setHideChrome }}>
      <ExamProvider>
        <div className="min-h-screen bg-background">
          {!hideChrome && <Navbar />}
          <main>{children}</main>
          <Toaster position="bottom-right" richColors closeButton />
        </div>
      </ExamProvider>
    </AppChromeContext.Provider>
  )
}
