import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "End User License Agreement — JNbot",
  description: "The JNbot software license, mobile purchase terms, limitations, and contact details.",
  alternates: { canonical: "/eula" },
}

export default function EulaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
