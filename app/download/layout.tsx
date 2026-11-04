import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  alternates: { canonical: "/download" },
}

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
