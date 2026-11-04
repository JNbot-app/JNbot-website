import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageHero from "@/components/page-hero"
const dataRows = [
  {
    what: "Crash diagnostics",
    desc: "Sentry may receive crash reports, stack traces, app/device versions, logs, and default diagnostic metadata so we can fix failures.",
    where: "Sentry",
  },
  {
    what: "Advertising data",
    desc: "AdMob can process advertising identifiers, device/ad information, and consent status to serve and measure ads. EEA consent choices are respected.",
    where: "Google AdMob",
  },
  {
    what: "Purchase history",
    desc: "RevenueCat processes an app user ID, product and entitlement status, and transaction/restore information for the ad-free purchase.",
    where: "RevenueCat + stores",
  },
  {
    what: "Camera QR scanning",
    desc: "The mobile app uses the camera on your device to decode a pairing QR code. Camera frames are processed locally and are not uploaded or retained by JNbot.",
    where: "Local only",
  },
  {
    what: "Profiles and credentials",
    desc: "Minecraft connection details, profiles, settings, and pairing tokens are stored locally on your device. Do not share your credentials with anyone.",
    where: "Local only",
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <main id="main-content">
        <PageHero
          eyebrow="Privacy"
          title={
            <>
              Your data.
              <br />
              <span className="text-gold">The details.</span>
            </>
          }
        >
          JNbot is local-first. Here is what the desktop and mobile apps collect, why, and where it goes.
        </PageHero>

        <div className="wrap legal-reading pb-28 pt-16">
          <div className="mb-12 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5 text-[13px] text-ink-muted">
            <span>JNbot Privacy Policy</span>
            <span className="mono text-[11px] uppercase tracking-[0.1em] text-ink-dim">
              Last updated: 22 / 08 / 2026
            </span>
          </div>

          {/* Detail sections */}
          <div className="space-y-12">
            <div className="border-t border-line pt-8">
              <div>
                <h2 className="display mb-3 text-[22px]">What stays on your device</h2>
                <p className="leading-relaxed text-ink-muted">
                  JNbot is designed to keep account and automation data local. The desktop app stores its
                  configuration, profiles, plugins, and credentials on your computer. The mobile app stores
                  its profiles, settings, and pairing information on your device. The limited third-party
                  processing described in this policy is used for crash reporting, advertising, and purchase
                  management.
                </p>
              </div>
            </div>

            <div className="border-t border-line pt-8">
              <div>
                <h2 className="display mb-3 text-[22px]">Why is JNbot free?</h2>
                <p className="leading-relaxed text-ink-muted">
                  The desktop app is free. The mobile app may show advertising and may offer a one-time
                  purchase to remove ads. We do not sell personal information.
                </p>
              </div>
            </div>

            <div className="border-t border-line pt-8">
              <div>
                <h2 className="display mb-3 text-[22px]">What exactly does JNbot store?</h2>
                <p className="leading-relaxed text-ink-muted">
                  The table below lists the data that can leave the device through the mobile integrations and
                  what remains local. Third-party providers process data under their own policies.
                </p>

                <div className="mt-8 overflow-hidden rounded-xl border border-line bg-white/[0.012]">
                  <div className="mono hidden grid-cols-[1fr_2fr_1fr] gap-4 border-b border-line px-6 py-4 text-[11px] uppercase tracking-[0.12em] text-ink-dim sm:grid">
                    <div>What</div>
                    <div>Why</div>
                    <div className="text-right">Where</div>
                  </div>
                  {dataRows.map((row) => (
                    <div
                      key={row.what}
                      className="grid grid-cols-1 gap-1.5 border-b border-line px-6 py-4 text-sm last:border-b-0 sm:grid-cols-[1fr_2fr_1fr] sm:items-center sm:gap-4"
                    >
                      <div className="font-medium">{row.what}</div>
                      <div className="text-[13.5px] leading-snug text-ink-muted">{row.desc}</div>
                      <div className="mono text-[11px] text-gold sm:text-right">{row.where}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 space-y-8 border-t border-line pt-12">
            <div>
              <h2 className="display mb-3 text-[22px]">Your choices and rights</h2>
              <div className="space-y-3 text-[15px] leading-relaxed text-ink-muted">
                <p>
                  You can disable camera access in your device settings, decline or change advertising consent
                  where the consent dialog is available, and stop using the app at any time. Removing the app
                  deletes local app data, subject to your device&apos;s backup settings.
                </p>
                <p>
                  For access or deletion requests involving Sentry, AdMob, or RevenueCat, we may need to
                  direct you to the relevant provider because that provider controls the corresponding service
                  data.
                </p>
              </div>
            </div>

            <div>
              <h2 className="display mb-3 text-[22px]">Contact</h2>
              <p className="text-[15px] leading-relaxed text-ink-muted">
                Privacy questions and requests can be sent to{" "}
                <a
                  className="text-gold underline decoration-gold/40 underline-offset-4"
                  href="mailto:usserwout@gmail.com"
                >
                  usserwout@gmail.com
                </a>
                .
              </p>
            </div>
          </div>

          {/* Help */}
          <div className="mt-20 flex flex-wrap items-center gap-6 rounded-xl border border-gold-line bg-gold-soft p-8">
            <div className="min-w-[240px] flex-1">
              <h3 className="display mb-1.5 text-[22px]">Privacy questions?</h3>
              <p className="text-ink opacity-80">Contact us about how JNbot handles your data.</p>
            </div>
            <a
              href="https://discord.gg/JNbGgypERe"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
            >
              Join Discord →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
