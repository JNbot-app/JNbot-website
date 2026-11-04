import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageHero from "@/components/page-hero"
import Link from "next/link"
import { Download } from "lucide-react"

const sections: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "s1",
    title: "License Grant",
    body: (
      <>
        <p>
          Licensor grants you a limited, non-exclusive, non-transferable, non-sublicensable license to use the
          Software for <strong>personal and non-commercial purposes</strong>, unless explicitly authorized
          otherwise.
        </p>
        <p>All rights not expressly granted are reserved.</p>
      </>
    ),
  },
  {
    id: "s2",
    title: "Commercial Use and Future Licensing",
    body: (
      <>
        <p>Use of the Software for commercial purposes is prohibited unless expressly authorized.</p>
        <p>Licensor reserves the right to:</p>
        <ul>
          <li>introduce paid plans or commercial licenses in the future</li>
          <li>offer separate agreements permitting commercial use</li>
        </ul>
        <p>Nothing in this Agreement grants you any right to commercially exploit the Software.</p>
      </>
    ),
  },
  {
    id: "s3",
    title: "Restrictions",
    body: (
      <>
        <p>
          Except where permitted by applicable law, you may <strong>not</strong>:
        </p>
        <ul>
          <li>copy, reproduce, distribute, or make the Software available to third parties</li>
          <li>sell, resell, rent, lease, sublicense, or commercially exploit the Software</li>
          <li>modify or create derivative works of the Software</li>
          <li>circumvent or interfere with security, licensing, or access controls</li>
          <li>
            use the Software to provide services to third parties (including automation services, bot hosting,
            or resale access)
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "s4",
    title: "Reverse Engineering (EU Compliance)",
    body: (
      <>
        <p>
          You may not reverse engineer, decompile, or disassemble the Software{" "}
          <strong>except to the limited extent permitted under applicable EU law</strong>, including
          interoperability rights under Directive 2009/24/EC.
        </p>
        <p>Any information obtained through such lawful actions may not be used to:</p>
        <ul>
          <li>create a competing product</li>
          <li>enable redistribution of the Software</li>
          <li>bypass licensing or security mechanisms</li>
        </ul>
      </>
    ),
  },
  {
    id: "s5",
    title: "Plugins and Extensions",
    body: (
      <>
        <p>The Software may allow user-created plugins.</p>
        <ul>
          <li>You retain ownership of your plugins.</li>
          <li>Plugins must not replicate core functionality for commercial purposes.</li>
          <li>Plugins must not enable redistribution or unauthorized access to the Software.</li>
          <li>Plugins must not bypass restrictions or security mechanisms.</li>
        </ul>
        <p>Licensor may restrict or disable plugins that violate this Agreement.</p>
      </>
    ),
  },
  {
    id: "s6",
    title: "Third-Party Services and Use",
    body: (
      <>
        <p>
          You are responsible for ensuring your use of the Software complies with third-party terms (for
          example, game servers).
        </p>
        <p>Licensor is not responsible for:</p>
        <ul>
          <li>account bans</li>
          <li>service restrictions</li>
          <li>losses resulting from use of automation features</li>
        </ul>
      </>
    ),
  },
  {
    id: "s7",
    title: "Intellectual Property",
    body: (
      <p>
        The Software is protected under Copyright Law and EU directives. All rights, title, and interest
        remain with Licensor.
      </p>
    ),
  },
  {
    id: "s8",
    title: "Termination",
    body: (
      <>
        <p>This license terminates automatically if you violate this Agreement.</p>
        <p>Upon termination, you must:</p>
        <ul>
          <li>cease all use</li>
          <li>delete all copies of the Software</li>
        </ul>
      </>
    ),
  },
  {
    id: "s9",
    title: "Disclaimer of Warranty",
    body: (
      <p>
        To the extent permitted by law, the Software is provided <strong>“AS IS”</strong> without warranties
        of any kind.
      </p>
    ),
  },
  {
    id: "s10",
    title: "Limitation of Liability",
    body: (
      <>
        <p>To the maximum extent permitted under applicable law, Licensor shall not be liable for:</p>
        <ul>
          <li>indirect or consequential damages</li>
          <li>loss of data or accounts</li>
          <li>third-party actions (including bans)</li>
        </ul>
        <p>Nothing in this Agreement excludes liability where prohibited under EU or Belgian law.</p>
      </>
    ),
  },
  {
    id: "s11",
    title: "Enforcement",
    body: (
      <>
        <p>Unauthorized copying, redistribution, or resale may result in:</p>
        <ul>
          <li>termination of your license</li>
          <li>legal action</li>
          <li>enforcement measures such as a DMCA Takedown or equivalent EU procedures</li>
        </ul>
      </>
    ),
  },
  {
    id: "s12",
    title: "Governing Law",
    body: (
      <>
        <p>This Agreement is governed by the laws of Belgium.</p>
        <p>
          If you are a consumer in the EU, you may also benefit from mandatory protections under the laws of
          your country of residence.
        </p>
      </>
    ),
  },
  {
    id: "s13-purchases",
    title: "Mobile In-App Purchases",
    body: (
      <>
        <p>
          The mobile edition may offer a one-time purchase to remove ads. Payments are processed by Apple or
          Google through the store where you obtained the app, and refunds and payment disputes are handled
          under that store&apos;s rules. You can restore an eligible purchase from within the app.
        </p>
      </>
    ),
  },
  {
    id: "s14-contact",
    title: "Contact",
    body: (
      <p>
        <a href="mailto:usserwout@gmail.com">usserwout@gmail.com</a>
      </p>
    ),
  },
]

export default function EulaPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <main id="main-content">
        <PageHero
          eyebrow="Legal"
          title={
            <>
              The terms of <span className="text-gold">using JNbot.</span>
            </>
          }
        >
          The terms you agree to when you download and use JNbot.
        </PageHero>

        <div className="wrap pb-28 pt-16">
          <div className="legal-layout">
            <aside className="max-h-[65vh] overflow-y-auto">
              <h4 className="mono mb-3.5 text-[11px] uppercase tracking-[0.14em] text-ink-dim">Contents</h4>
              {sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block rounded-md  px-2.5 py-1.5 text-[13px] leading-snug text-ink-muted transition-colors hover:bg-white/[0.02] hover:text-ink"
                >
                  <span className="mono mr-2 text-[11px] text-ink-dim">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </a>
              ))}
            </aside>

            <div className="rich legal-content">
              <div className="mb-12 flex flex-wrap items-center gap-3.5 border-b border-line pb-6">
                <span className="mono rounded-full border border-gold-line bg-gold-soft px-2.5 py-1.5 text-[11px] tracking-[0.06em] text-gold">
                  JNBOT EULA v1
                </span>
                <span className="mono text-xs text-ink-dim">Last updated: 22 / 08 / 2026</span>
              </div>

              <p className="mb-12 border-y border-line py-7 text-base leading-relaxed text-ink">
                This End User License Agreement (“Agreement”) is a legal agreement between you (“User”) and{" "}
                <strong>usserwout</strong>, based in Belgium (“Licensor”), governing your use of the JNbot
                software, including its client, plugins, APIs, and related services (together, the
                “Software”). By downloading, installing, or using the Software, you agree to be bound by this
                Agreement.
              </p>

              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="mb-10 scroll-mt-24">
                  <h2 className="mb-3.5 flex items-baseline gap-3.5 text-xl font-semibold tracking-[-0.01em]">
                    <span className="mono rounded border border-gold-line bg-gold-soft px-2 py-[3px] text-[13px] tracking-[0.06em] text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.title}
                  </h2>
                  <div className="space-y-3 text-[15px] leading-[1.75] text-ink-muted [&_li]:mb-1.5 [&_li::marker]:text-gold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6">
                    {s.body}
                  </div>
                </section>
              ))}

              <div className="mt-16 border-t border-line pt-8">
                <h3 className="display mb-2.5 text-[22px]">By using JNbot, you agree to this Agreement.</h3>
                <p className="mx-auto mb-5 max-w-[480px] text-ink-muted">
                  Confirm your acceptance on the download page before installing.
                </p>
                <Link href="/download" className="btn btn-primary btn-lg">
                  <Download className="h-4 w-4" strokeWidth={2.2} />
                  Continue to download
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
