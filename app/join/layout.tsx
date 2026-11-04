import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  alternates: { canonical: "/join" },
}

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
