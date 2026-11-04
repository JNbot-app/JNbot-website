"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowDown, ArrowUpRight, Bot, HardDrive, Network, Pause, Play, Server, Smartphone, SquareCode } from "lucide-react"
import type { ScriptName } from "./world"
import { asset, mainSite } from "@/lib/site"

const DioramaCanvas = dynamic(() => import("./DioramaCanvas"), { ssr: false })

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}

const SLOTS = [
  { id: "top", name: "Home", icon: asset("/minecraft/items/wheat.png") },
  { id: "scripts", name: "Scripts", icon: asset("/minecraft/items/chest.png") },
  { id: "accounts", name: "Accounts", icon: null },
  { id: "replay", name: "Record & replay", icon: asset("/minecraft/items/clock.png") },
  { id: "plugins", name: "Plugins", icon: asset("/minecraft/diamond_pickaxe.png") },
  { id: "more", name: "Everything", icon: asset("/minecraft/items/star.png") },
]

const SCRIPT_LIST: { id: ScriptName; name: string; icon: string | null }[] = [
  { id: "kit", name: "Kit collector", icon: asset("/minecraft/items/chest.png") },
  { id: "gkit", name: "GKit collector", icon: asset("/minecraft/items/star.png") },
  { id: "upgrade", name: "GKit upgrader", icon: asset("/minecraft/items/diamond.png") },
  { id: "afk", name: "AFK", icon: asset("/minecraft/items/clock.png") },
  { id: "scanner", name: "Alt scanner", icon: null },
  { id: "books", name: "Book sorter", icon: asset("/minecraft/items/book.png") },
]

// Same order as FEATURE_TAGS in world.ts: each row lights its tag on the beacon beam.
const FEATURES = [
  { icon: Network, name: "Proxies", line: "Give every account its own proxy." },
  { icon: Smartphone, name: "Phone & browser", line: "Control your bots from anywhere." },
  { icon: HardDrive, name: "Stays on your device", line: "Accounts and settings are stored locally." },
  { icon: SquareCode, name: "JNbot Client", line: "Script your own Minecraft client." },
  { icon: Server, name: "Minecraft servers", line: "Host a world. No port forwarding." },
  { icon: Bot, name: "AI via MCP", line: "Let AI tools work with your bots." },
]

const code: ReactNode[] = [
  <><K>const</K> {"{ Bot }"} = <F>require</F>(<S>"JNbot"</S>);</>,
  <><K>const</K> bot = <K>await</K> Bot.<F>join</F>({"{"} username: <S>"Miner"</S> {"}"});</>,
  <><K>const</K> ore = bot.<F>findBlock</F>({"{"}</>,
  <>{"  "}matching: b {"=>"} b.name === <S>"diamond_ore"</S></>,
  <>{"}"});</>,
  <><K>await</K> bot.<F>dig</F>(ore);</>,
  <><K>await</K> bot.<F>chat</F>(<S>"DIAMONDS"</S>);</>,
]
function K({ children }: { children: ReactNode }) { return <span className="tok-k">{children}</span> }
function F({ children }: { children: ReactNode }) { return <span className="tok-f">{children}</span> }
function S({ children }: { children: ReactNode }) { return <span className="tok-s">{children}</span> }

export default function Diorama() {
  const root = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const script = useRef<ScriptName>("kit")
  const lit = useRef(-1)
  const [litRow, setLitRow] = useState(-1)
  const light = (i: number) => { lit.current = i; setLitRow(i) }
  const [activeScript, setActiveScript] = useState<ScriptName>("kit")
  const [active, setActive] = useState(0)
  const [flash, setFlash] = useState(0)
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(true)
  const [pageVisible, setPageVisible] = useState(true)
  const [reduced, setReduced] = useState(false)
  const [paused, setPaused] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const onFailure = useCallback(() => setFailed(true), [])

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const motion = () => setReduced(media.matches)
    const visibility = () => setPageVisible(!document.hidden)
    motion(); visibility()
    media.addEventListener("change", motion)
    document.addEventListener("visibilitychange", visibility)
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting)
      if (entry.isIntersecting) setNear(true)
    }, { rootMargin: "200px 0px" })
    if (root.current) observer.observe(root.current)
    // Progress is measured against each station's real position, so a tall
    // station holds its island for longer instead of drifting out of step.
    const onScroll = () => {
      const tops = SLOTS.map(({ id }) => document.getElementById(id)?.getBoundingClientRect().top ?? 0)
      let p = 0
      for (let i = 0; i < tops.length - 1; i++) {
        if (tops[i + 1] > 0) { p = i + Math.max(0, -tops[i]) / (tops[i + 1] - tops[i]); break }
        p = i + 1
      }
      progress.current = Math.max(0, Math.min(SLOTS.length - 1, p))
      root.current?.style.setProperty("--progress", progress.current.toFixed(3))
      setActive(Math.round(progress.current))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      observer.disconnect()
      media.removeEventListener("change", motion)
      document.removeEventListener("visibilitychange", visibility)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  // Like the game, the selected item's name appears above the hotbar for a moment.
  useEffect(() => { setFlash((n) => n + 1) }, [active])

  const runScript = (id: ScriptName) => {
    script.current = id
    setActiveScript(id)
    setPaused(false)
  }

  const go = (id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: reduced ? "auto" : "smooth" })
  }

  const running = visible && pageVisible && !reduced && !paused
  return (
    <div ref={root} className="diorama" data-ready={ready && !failed ? "" : undefined} data-failed={failed ? "" : undefined}>
      <div className="diorama-stage">
        <div className="diorama-sky" aria-hidden="true">
          <span className="stars stars-far" />
          <span className="stars stars-near" />
        </div>
        {failed ? (
          <img className="diorama-poster" src={asset("/minecraft/world-poster.png")} alt="" width={840} height={750} />
        ) : (
          <p className="diorama-loading" aria-hidden="true">Building terrain</p>
        )}
        <div className="diorama-canvas" aria-hidden="true">
          {near && !failed && (
            <SceneBoundary onFailure={onFailure}>
              <DioramaCanvas progress={progress} script={script} lit={lit} running={running} reduced={reduced} onReady={onReady} onFailure={onFailure} />
            </SceneBoundary>
          )}
        </div>
        <nav className="hotbar" aria-label="Sections">
          <span key={flash} className="hotbar-name" aria-hidden="true">{SLOTS[active].name}</span>
          <ol>
            {SLOTS.map((slot, i) => (
              <li key={slot.id}>
                <button
                  type="button"
                  className="hotbar-slot"
                  aria-current={active === i ? "true" : undefined}
                  aria-label={slot.name}
                  onClick={() => go(slot.id)}
                >
                  {slot.icon ? <img src={slot.icon} width={16} height={16} alt="" /> : <span className="hotbar-face" />}
                  <span className="hotbar-key" aria-hidden="true">{i + 1}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        {ready && !failed && !reduced && (
          <button
            type="button"
            className="diorama-pause"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? "Play the world animation" : "Pause the world animation"}
            aria-pressed={paused}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        )}
      </div>

      <p className="sr-only">
        Illustration: floating Minecraft islands where JNbot bots chop trees, farm wheat, run the chosen built-in
        script, line up as accounts, repeat a recorded walk and mine diamond ore. At the end every island gathers
        around a beacon whose beam carries the names of JNbot's other features.
      </p>

      <section id="top" className="station station-home">
        <div className="wrap station-inner">
          <div className="station-copy">
            <h1>
              <span>Let bots do the</span> <span>Minecraft grind.</span>
            </h1>
            <p className="lede">Run scripts on all your accounts from one free, open-source desktop app.</p>
            <div className="actions">
              <Link href="/download" className="btn btn-primary btn-lg">
                Download JNbot <ArrowUpRight size={18} />
              </Link>
              <button type="button" className="text-link" onClick={() => go("scripts")}>
                See it work <ArrowDown size={16} />
              </button>
            </div>
            <dl className="home-stats">
              <div><dt>9,000,000</dt><dd>bots joined servers</dd></div>
              <div><dt>33,000</dt><dd>accounts</dd></div>
              <div><dt>Free</dt><dd>Windows · macOS · Linux</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section id="scripts" className="station">
        <div className="wrap station-inner">
          <div className="station-copy">
            <h2>Ready-made scripts.</h2>
            <p className="lede">Pick one. Press start. Walk away.</p>
            <ul className="tag-list script-list" aria-label="Built-in scripts. Choose one to run it on the island.">
              {SCRIPT_LIST.map((item) => (
                <li key={item.id}>
                  <button type="button" aria-pressed={activeScript === item.id} onClick={() => runScript(item.id)}>
                    {item.icon ? <img src={item.icon} width={16} height={16} alt="" /> : <span className="tag-face" />}
                    {item.name}
                    {activeScript === item.id && <Play className="script-running" size={12} fill="currentColor" aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="accounts" className="station">
        <div className="wrap station-inner">
          <div className="station-copy">
            <h2>Every account. One window.</h2>
            <p className="lede">See who is online and what each bot is doing.</p>
          </div>
        </div>
      </section>

      <section id="replay" className="station">
        <div className="wrap station-inner">
          <div className="station-copy">
            <h2>Show it once. It repeats it.</h2>
            <p className="lede">Record what you do in-game. Any bot can replay it.</p>
            <ul className="tag-list legend" aria-label="In the illustration">
              <li><span className="swatch swatch-you" />You walk it</li>
              <li><span className="swatch swatch-bot" />JNbot repeats it</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="plugins" className="station">
        <div className="wrap station-inner">
          <div className="station-copy">
            <h2>Or write your own.</h2>
            <p className="lede">Plugins in JavaScript or TypeScript.</p>
            <figure className="code">
              <figcaption><span>miner.js</span><span>JavaScript</span></figcaption>
              <pre><code>{code.map((line, i) => <span key={i} className="code-line">{line}</span>)}</code></pre>
            </figure>
            <a href={mainSite("/docs/plugins")} className="text-link">Build your first plugin <ArrowUpRight size={16} /></a>
          </div>
        </div>
      </section>

      <section id="more" className="station station-more">
        <div className="wrap station-inner">
          <div className="station-copy">
            <h2>And a lot more.</h2>
            <ul className="feature-list" onMouseLeave={() => light(-1)}>
              {FEATURES.map(({ icon: Icon, name, line }, i) => (
                <li key={name} data-lit={litRow === i ? "" : undefined} onMouseEnter={() => light(i)}>
                  <Icon size={20} aria-hidden="true" />
                  <span>
                    <strong>{name}</strong>
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
