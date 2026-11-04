import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  alternates: { canonical: "/faq" },
}

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
