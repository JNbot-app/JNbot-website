import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AltStore Source",
  description: "AltStore source repository JSON for JNbot",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AltStoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
