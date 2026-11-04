import Link from "next/link"
import { Home } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import DigToVoid from "@/components/minecraft/DigToVoid"

export default function NotFound() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <main
        id="main-content"
        className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 pb-20 pt-24 text-center"
      >
        <div className="grid-bg" />
        <div className="death-vignette" aria-hidden="true" />

        <DigToVoid />

        <div className="max-w-[560px]">
          <h1 className="death-title display mt-2 text-[clamp(40px,6vw,64px)] leading-[1.05]">
            You died!
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-muted">
            This page fell out of the world. It may have moved, or it never existed.
          </p>
          <p className="death-score mt-3">
            Score: <span>404</span>
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn btn-primary btn-lg">
              <Home className="h-4 w-4" strokeWidth={2.2} />
              Respawn
            </Link>
            <Link href="/faq" className="btn btn-secondary btn-lg">
              Browse the FAQ →
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {[
              { href: "/download", label: "/download" },
              { href: "/join", label: "/connect" },
              { href: "/faq", label: "/faq" },
              { href: "https://discord.gg/JNbGgypERe", label: "/discord", ext: true },
            ].map((l) =>
              l.ext ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono rounded-full border border-line px-3.5 py-[7px] text-[12px] text-ink-muted transition-colors hover:border-gold-line hover:bg-gold-soft hover:text-gold"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  className="mono rounded-full border border-line px-3.5 py-[7px] text-[12px] text-ink-muted transition-colors hover:border-gold-line hover:bg-gold-soft hover:text-gold"
                >
                  {l.label}
                </Link>
              ),
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
