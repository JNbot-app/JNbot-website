import type React from "react"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — JNbot",
  description: "How JNbot handles local app data, crash diagnostics, advertising, purchases, and QR scanning.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
