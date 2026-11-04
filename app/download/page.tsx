"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Download, Copy, Check, ArrowUpRight } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageHero from "@/components/page-hero"
import { DESKTOP_REPO, mainSite } from "@/lib/site"

type Asset = { name: string; browser_download_url: string }

// Some networks/regions block github.com and its asset host (objects.githubusercontent.com).
// gh-proxy mirrors any GitHub URL when prefixed, e.g.
//   https://gh-proxy.com/https://github.com/owner/repo/releases/download/v1/app.dmg
// jsDelivr can't be used here: it only serves the git tree (not release assets) and caps files at ~50MB.
const GH_MIRROR = "https://gh-proxy.com/"
const RELEASE_API = "https://api.github.com/repos/usserwout/JNbot-updater/releases/latest"
const RELEASES_PAGE = "https://github.com/usserwout/JNbot-updater/releases/latest"

const requirements = [
  { os: "Windows", items: ["Windows 10 or newer", "4GB RAM minimum", "500MB disk space"] },
  { os: "macOS", items: ["macOS 10.15 or newer", "4GB RAM minimum", "500MB disk space"] },
  { os: "Linux", items: ["Ubuntu 18.04 or equivalent", "4GB RAM minimum", "500MB disk space"] },
]

export default function DownloadPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [userOS, setUserOS] = useState("")
  const [userArch, setUserArch] = useState("")
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState("")
  const [version, setVersion] = useState("")
  const [eulaAccepted, setEulaAccepted] = useState(true)
  const [showEulaNotice, setShowEulaNotice] = useState(false)
  // When true, downloads are routed through the gh-proxy mirror instead of github.com.
  const [mirror, setMirror] = useState(false)

  useEffect(() => {
    detectOS()
    window.localStorage.setItem("jnbot-eula-accepted", "true")
    loadRelease()
  }, [])

  // Try GitHub directly first; if that's blocked, retry through the mirror. If we
  // only got the release info via the mirror, default downloads to the mirror too.
  async function loadRelease() {
    for (const url of [RELEASE_API, GH_MIRROR + RELEASE_API]) {
      try {
        const r = await fetch(url)
        if (!r.ok) continue
        const d = await r.json()
        if (d.name) setVersion("v" + String(d.name).replace(/^v/, ""))
        setAssets(d.assets || [])
        if (url !== RELEASE_API) setMirror(true)
        return
      } catch {
        /* try next source */
      }
    }
  }

  // Route a github.com URL through the mirror when mirror mode is active.
  const ghUrl = (url: string) => (mirror ? GH_MIRROR + url : url)

  // Macs report "Intel Mac OS X" in their user agent even on Apple Silicon,
  // so sniff the GPU renderer through WebGL to tell the two apart.
  function detectMacArch(): "arm64" | "intel" {
    try {
      const canvas = document.createElement("canvas")
      const gl = (canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null
      if (gl) {
        const dbg = gl.getExtension("WEBGL_debug_renderer_info")
        const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : ""
        if (/apple/i.test(renderer) && !/intel/i.test(renderer)) return "arm64"
        if (/intel/i.test(renderer)) return "intel"
      }
    } catch {
      /* ignore */
    }
    // Modern Macs are overwhelmingly Apple Silicon, so default to arm64.
    return "arm64"
  }

  function detectOS() {
    const platform = window.navigator.platform || ""
    if (/Mac/.test(platform)) {
      setUserOS("Mac")
      setUserArch(detectMacArch())
    } else if (/Win/.test(platform)) {
      setUserOS("Windows")
    } else if (/Linux/.test(platform)) {
      setUserOS("Linux")
      setUserArch(/arm|aarch64/i.test(window.navigator.userAgent) ? "arm" : "x64")
    }
  }

  const cliUrl =
    assets.find((asset) => asset.name === "cli.zip")?.browser_download_url ||
    "https://github.com/usserwout/JNbot-updater/releases/latest/download/cli.zip"
  const installCmd = `wget ${ghUrl(cliUrl)} -O cli.zip && unzip cli.zip && chmod +x ./jnbot && ./jnbot`

  const ensureEula = () => {
    if (eulaAccepted) return true
    setShowEulaNotice(true)
    document.getElementById("eula")?.scrollIntoView({ behavior: "smooth", block: "center" })
    return false
  }

  const onEulaChange = (checked: boolean) => {
    setEulaAccepted(checked)
    setShowEulaNotice(false)
    window.localStorage.setItem("jnbot-eula-accepted", checked ? "true" : "false")
  }

  const downloadHandler = (type: string) => {
    if (!ensureEula()) return
    const file = assets.find(
      (a) => a.name.endsWith(type) && (type !== ".AppImage" || !a.name.includes("arm64")),
    )
    if (file) {
      const a = document.createElement("a")
      a.href = ghUrl(file.browser_download_url)
      a.download = "JNbot"
      document.body.appendChild(a)
      a.click()
      setTimeout(() => a.remove(), 800)
    } else {
      window.open(ghUrl(RELEASES_PAGE), "_blank")
    }
  }

  const downloadCLI = () => {
    if (!ensureEula()) return
    window.location.href = ghUrl(cliUrl)
  }

  const copyCmd = () => {
    if (!ensureEula()) return
    navigator.clipboard
      .writeText(installCmd)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => setCopyError("Copy failed. Select and copy the command below."))
  }

  const isRecommended = (os: string) => os === userOS

  const osConfig = [
    {
      os: "Windows",
      label: "Windows",
      buttons: [{ type: ".exe", label: "Download .exe", arch: "Win 10+", best: () => userOS === "Windows" }],
    },
    {
      os: "Mac",
      label: "macOS",
      buttons: [
        {
          type: "x64.dmg",
          label: "Intel",
          arch: ".dmg",
          best: () => userOS === "Mac" && userArch === "intel",
        },
        {
          type: "-arm64.dmg",
          label: "Apple Silicon",
          arch: "arm64",
          best: () => userOS === "Mac" && userArch === "arm64",
        },
      ],
    },
    {
      os: "Linux",
      label: "Linux",
      buttons: [
        {
          type: ".AppImage",
          label: "x64",
          arch: ".AppImage",
          best: () => userOS === "Linux" && userArch !== "arm",
        },
        {
          type: "-arm64.AppImage",
          label: "ARM",
          arch: "arm64",
          best: () => userOS === "Linux" && userArch === "arm",
        },
      ],
    },
  ]

  return (
    <>
      <Navbar />
      <main id="main-content">
        <PageHero
          eyebrow="Download"
          title={
            <>
              Put your bots <span className="text-gold">to work.</span>
            </>
          }
        >
          Start with the free, open-source desktop app. Connect from your phone, or use the CLI on a machine that stays
          online.
        </PageHero>
        <div className="wrap download-layout">
          <aside className="download-aside">
            <h2>Find your setup.</h2>
            <p>Windows, macOS, and Linux. Your Minecraft accounts, managed your way.</p>
            <nav aria-label="Download sections">
              <a href="#desktop">Desktop app</a>
              <a href="#mobile">Mobile access</a>
              <a href="#cli">Headless CLI</a>
            </nav>
          </aside>
          <div className="download-content">
            <div className="release-tools">
              <span>{version ? `Latest release · ${version}` : "Latest builds from GitHub"}</span>
              <button onClick={() => setMirror(!mirror)} aria-pressed={mirror}>
                {mirror ? "Download mirror enabled" : "Downloads blocked? Use mirror"}
              </button>
            </div>
            <div id="eula" className="eula-check">
              <input
                id="eula-check"
                type="checkbox"
                checked={eulaAccepted}
                onChange={(e) => onEulaChange(e.target.checked)}
              />
              <label htmlFor="eula-check">
                I agree to the <Link href="/eula">End User License Agreement</Link>.
                <small>Required before downloading JNbot or the CLI.</small>
                {showEulaNotice && (
                  <span className="form-error" role="alert">
                    Accept the agreement to continue.
                  </span>
                )}
              </label>
            </div>
            <section id="desktop">
              <h2>Desktop app</h2>
              <p className="section-note">
                The full workspace for your bots, accounts, recordings, and plugins. Prefer to compile it
                yourself? <a href={`${DESKTOP_REPO}#building-from-source`}>Build from source</a>.
              </p>
              {osConfig.map((card) => (
                <div key={card.os} className="platform-row">
                  <div>
                    <h3>
                      {card.label}
                      {isRecommended(card.os) && <span className="recommended">Your platform</span>}
                    </h3>
                    <p>{requirements.find((req) => req.os === card.label)?.items.join(" · ")}</p>
                  </div>
                  <div className="platform-buttons">
                    {card.buttons.map((b) => (
                      <button
                        key={b.type}
                        className={`btn ${isRecommended(card.os) && b.best() ? "btn-primary" : "btn-secondary"}`}
                        disabled={!eulaAccepted}
                        onClick={() => downloadHandler(b.type)}
                      >
                        <Download size={14} />
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </section>
            <section id="mobile">
              <h2>Take the controls with you.</h2>
              <p className="section-note">The mobile app connects to your running JNbot instance.</p>
              <div className="platform-row">
                <div>
                  <h3>iOS</h3>
                  <p>Available through AltStore or SideStore.</p>
                </div>
                <a className="btn btn-secondary" href={mainSite("/altstore")}>
                  Get the sideload source <Download size={14} />
                </a>
              </div>
              <div className="platform-row">
                <div>
                  <h3>Android</h3>
                  <p>Available now on Google Play.</p>
                </div>
                <a
                  href="https://play.google.com/store/apps/details?id=com.jnbot.app"
                  className="btn btn-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get it on Google Play <ArrowUpRight size={14} />
                </a>
              </div>
              <p className="section-note">
                Already have JNbot running?{" "}
                <Link className="text-gold underline" href="/join">
                  Connect in your browser
                </Link>
                .
              </p>
            </section>
            <section id="cli">
              <h2>Keep running. Headless.</h2>
              <p className="section-note">
                For a VPS, Raspberry Pi, or another machine you keep online. Requires Node.js 18 or newer.
                Most players should start with the desktop app.
              </p>
              <div className="cli-command">
                <code>{installCmd}</code>
                <button
                  onClick={copyCmd}
                  disabled={!eulaAccepted}
                  aria-label={copied ? "Command copied" : "Copy install command"}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              {copyError && (
                <p role="alert" className="form-error">
                  {copyError}
                </p>
              )}
              <button onClick={downloadCLI} disabled={!eulaAccepted} className="btn btn-secondary">
                <Download size={15} /> Download CLI
              </button>
            </section>
            <section className="download-help">
              Need a hand installing?{" "}
              <a href="https://discord.gg/JNbGgypERe" target="_blank" rel="noopener noreferrer">
                Ask the community on Discord.
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
