import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="page-hero">
      <div className="wrap">
        <Link href="/" className="back-link">
          <ArrowLeft size={14} /> JNbot <span>/ {eyebrow}</span>
        </Link>
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
    </section>
  )
}
