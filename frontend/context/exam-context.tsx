/*
  ExamContext – manages the exam mode toggle state.
  When exam mode is ON, only top-rated and exam-important resources are shown.
  Shared between navbar (toggle) and home page (filter).
*/

"use client"

import React, { createContext, useContext, useState } from "react"

interface ExamContextType {
  examMode: boolean
  setExamMode: (value: boolean) => void
}

const ExamContext = createContext<ExamContextType>({
  examMode: false,
  setExamMode: () => {},
})

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [examMode, setExamMode] = useState(false)

  return (
    <ExamContext.Provider value={{ examMode, setExamMode }}>
      {children}
    </ExamContext.Provider>
  )
}

export function useExamMode() {
  return useContext(ExamContext)
}
