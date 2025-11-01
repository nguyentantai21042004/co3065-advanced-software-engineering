"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // const user = localStorage.getItem("user")
    // if (user) {
    //   router.push("/dashboard/upload")
    // } else {
    //   router.push("/auth/login")
    // }

    // Temporary: Go directly to dashboard for testing
    router.push("/dashboard/upload")
  }, [router])

  return null
}
