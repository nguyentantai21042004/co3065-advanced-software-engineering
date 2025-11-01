"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Temporary: Go directly to dashboard for testing
    router.push("/dashboard/upload")
  }, [router])

  return null
}
