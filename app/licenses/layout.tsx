import React from "react"
import { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageHero from "@/components/page-hero"

export const metadata: Metadata = {
  title: "JNbot · Licenses",
  description: "Third-party licenses for packages used in JNbot",
  alternates: { canonical: "/licenses" },
}

export default function LicensesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <main id="main-content">
        <PageHero
          eyebrow="Legal"
          title={
            <>
              Third-party <span className="text-gold">licenses.</span>
            </>
          }
        >
          Every open-source package JNbot is built on, along with its license.
        </PageHero>
        <div className="wrap pb-28 pt-12">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
