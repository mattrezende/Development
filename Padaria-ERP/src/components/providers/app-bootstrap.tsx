"use client"

import { useEffect } from "react"
import { seedDatabase } from "@/lib/db/seed"

export function AppBootstrap() {
  useEffect(() => {
    seedDatabase()
  }, [])

  return null
}
