"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import * as THREE from "three"
import { getCrackStages } from "./crackTexture"
import { makeBlockGeometry, useDebris } from "./sceneKit"
import { Bot, makeBotState, type BotState } from "./bot"
import { asset } from "@/lib/site"

/* ------------------------------------------------------------------ *
 * 404 scene — Steve runs in, digs a shaft straight down, breaks into
 * the void and falls in, then climbs back up beside the hole and waves.
 * Click anywhere on the scene to make him dig again.
 * ------------------------------------------------------------------ */

const PAGE_BG = "#0b0b0d"
const X_MIN = -15, X_MAX = 15
const Y_TOP = 2, Y_BOT = -4 // solid rows; below Y_BOT is void
const SHAFT_X = 0
const PLAYER_Z = 1.35
const MINE_T = 0.5, MINE_GAP = 0.14, ENTER_SPEED = 6, ENTER_FROM_X = -10

// Same generated textures as the hero world: grass on top, then dirt, then stone.
const TEXTURES = [
  asset("/minecraft/scene/grass_side.png"), asset("/minecraft/scene/grass_top.png"),
  asset("/minecraft/world/dirt.png"), asset("/minecraft/world/stone.png"),
]
type Kind = 0 | 1 | 2 // grass, dirt, stone
const kindOf = (y: number): Kind => (y === Y_TOP ? 0 : y >= Y_TOP - 2 ? 1 : 2)

type DigPhase = "enter" | "ready" | "dig" | "fall" | "void" | "wave" | "gaze"
interface DigBlock { x: number; y: number; removed: boolean; kind: Kind; slot: number }

function DigScene({
  botState, apiRef,
}: {
  botState: React.MutableRefObject<BotState>
  apiRef: React.MutableRefObject<{ reset: () => void } | null>
}) {
  const meshRefs = [useRef<THREE.InstancedMesh>(null!), useRef<THREE.InstancedMesh>(null!), useRef<THREE.InstancedMesh>(null!)]
  const crackRef = useRef<THREE.Mesh>(null!)
  const crackMat = useRef<THREE.MeshBasicMaterial>(null!)
  const stages = useMemo(() => getCrackStages(), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const geo = useMemo(() => makeBlockGeometry(PAGE_BG, "#ffffff"), [])
  const loaded = useLoader(THREE.TextureLoader, TEXTURES)
  // One material list per kind; the grass block gets its own top face.
  // BoxGeometry face order: +x, -x, +y, -y, +z, -z.
  const materials = useMemo(() => {
    const [side, top, dirt, stone] = loaded.map((source) => {
      const texture = source.clone()
      texture.colorSpace = THREE.SRGBColorSpace
      texture.magFilter = THREE.NearestFilter
      texture.minFilter = THREE.NearestFilter
      texture.generateMipmaps = false
      texture.needsUpdate = true
      return new THREE.MeshBasicMaterial({ vertexColors: true, map: texture })
    })
    return [[side, side, top, dirt, side, side], dirt, stone]
  }, [loaded])
  const { node: debris, spawn, clear } = useDebris([0x7a5436, 0x6b6b73, 0x8a6244, 0x55555c, 0x9a7a4a])

  const blocks = useMemo<DigBlock[]>(() => {
    const a: DigBlock[] = []
    const slots = [0, 0, 0]
    for (let y = Y_TOP; y >= Y_BOT; y--)
      for (let x = X_MIN; x <= X_MAX; x++) {
        const kind = kindOf(y)
        a.push({ x, y, removed: false, kind, slot: slots[kind]++ })
      }
    return a
  }, [])

  const ctrl = useRef<{ phase: DigPhase; t: number; curY: number; vy: number }>({
    phase: "enter", t: 0, curY: Y_TOP, vy: 0,
  })

  const counts = useMemo(() => [0, 1, 2].map((k) => blocks.filter((b) => b.kind === k).length), [blocks])

  const paint = () => {
    blocks.forEach((b) => {
      dummy.position.set(b.x, b.y, 0)
      dummy.scale.setScalar(b.removed ? 0 : 1)
      dummy.updateMatrix()
      meshRefs[b.kind].current.setMatrixAt(b.slot, dummy.matrix)
    })
    meshRefs.forEach((ref) => (ref.current.instanceMatrix.needsUpdate = true))
  }

  const removeBlock = (x: number, y: number) => {
    const block = blocks.find((b) => b.x === x && b.y === y && !b.removed)
    if (!block) return
    block.removed = true
    dummy.position.set(x, y, 0)
    dummy.scale.setScalar(0)
    dummy.updateMatrix()
    const mesh = meshRefs[block.kind].current
    mesh.setMatrixAt(block.slot, dummy.matrix)
    mesh.instanceMatrix.needsUpdate = true
  }

  const reset = () => {
    blocks.forEach((b) => (b.removed = false))
    paint()
    clear()
    crackRef.current.visible = false
    Object.assign(botState.current, makeBotState({
      x: ENTER_FROM_X, y: Y_TOP + 0.5, z: PLAYER_Z, facing: Math.PI / 2, run: 1, phase: "idle",
    }))
    ctrl.current = { phase: "enter", t: 0, curY: Y_TOP, vy: 0 }
  }

  useEffect(() => {
    paint()
    reset()
    apiRef.current = { reset }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const P = botState.current
    const c = ctrl.current
    c.t += dt

    if (c.phase === "enter") {
      P.run = 1; P.facing = Math.PI / 2; P.phase = "idle"
      P.x = Math.min(SHAFT_X, P.x + ENTER_SPEED * dt)
      if (P.x >= SHAFT_X - 0.001) { P.x = SHAFT_X; P.run = 0; c.phase = "ready"; c.t = 0 }
    } else if (c.phase === "ready") {
      P.run = 0; P.facing = 0; P.phase = "idle"
      P.target = { x: SHAFT_X, y: c.curY, z: 0 }; P.lookAt = P.target
      if (c.t >= 0.5) { c.phase = "dig"; c.t = 0 }
    } else if (c.phase === "dig") {
      P.facing = 0; P.phase = "idle"
      P.target = { x: SHAFT_X, y: c.curY, z: 0 }; P.lookAt = P.target
      P.y += (c.curY + 0.5 - P.y) * Math.min(1, dt * 9) // sink with the shaft
      if (c.t < 0) {
        P.mining = false; P.swing = 0; crackRef.current.visible = false
      } else {
        P.mining = true
        const frac = Math.min(1, c.t / MINE_T)
        P.swing = (c.t % 0.4) / 0.4
        const stg = Math.min(stages.length - 1, Math.floor(frac * stages.length))
        crackMat.current.map = stages[stg]
        crackMat.current.needsUpdate = true
        crackRef.current.visible = true
        crackRef.current.position.set(SHAFT_X, c.curY, 0.51)
        if (frac >= 1) {
          removeBlock(SHAFT_X, c.curY)
          spawn(SHAFT_X, c.curY)
          crackRef.current.visible = false
          c.curY--; c.t = -MINE_GAP
          if (c.curY < Y_BOT) {
            c.phase = "fall"; c.t = 0; c.vy = -1.5
            P.mining = false; P.swing = 0; P.target = null; P.lookAt = null; P.phase = "fall"
          }
        }
      }
    } else if (c.phase === "fall") {
      P.phase = "fall"; P.mining = false
      c.vy -= 26 * dt; P.y += c.vy * dt
      if (P.y < -9) { c.phase = "void"; c.t = 0 }
    } else if (c.phase === "void") {
      if (c.t >= 0.9) {
        Object.assign(P, makeBotState({
          x: 1.7, y: Y_TOP + 0.5, z: PLAYER_Z, facing: 0, phase: "wave",
        }))
        P.lookAt = { x: 0.4, y: 2.9, z: 12 }
        c.phase = "wave"; c.t = 0
      }
    } else if (c.phase === "wave") {
      P.phase = "wave"
      if (c.t >= 3.5) { P.phase = "gaze"; P.lookAt = null; c.phase = "gaze"; c.t = 0 }
    } else {
      P.phase = "gaze"
    }
  })

  return (
    <group>
      {meshRefs.map((ref, kind) => (
        <instancedMesh key={kind} ref={ref} args={[geo, materials[kind], counts[kind]]} />
      ))}
      <mesh ref={crackRef} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={crackMat} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-2} toneMapped={false} />
      </mesh>
      {debris}
    </group>
  )
}

export default function DigToVoid() {
  const wrap = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [active, setActive] = useState(true)
  const botState = useRef<BotState>(makeBotState())
  const api = useRef<{ reset: () => void } | null>(null)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const io = new IntersectionObserver(([e]) => setActive(!reduce && e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [mounted])

  const maskStyle = {
    WebkitMaskImage: "radial-gradient(ellipse 52% 85% at 50% 40%, #000 42%, transparent 100%)",
    maskImage: "radial-gradient(ellipse 52% 85% at 50% 40%, #000 42%, transparent 100%)",
  } as const

  if (!mounted) return <div className="mx-auto aspect-[16/9] w-full max-w-[880px]" />

  return (
    <div
      ref={wrap}
      onClick={() => api.current?.reset()}
      className="relative mx-auto aspect-[16/9] w-full max-w-[880px] cursor-pointer"
      style={maskStyle}
    >
      <Canvas
        flat
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 38, position: [0.4, 3.4, 15], near: 0.1, far: 100 }}
        onCreated={({ camera }) => camera.lookAt(0, 1, 0)}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.78} />
          <hemisphereLight args={["#dbe7ff", "#3a3326", 0.55]} />
          <directionalLight position={[5, 9, 7]} intensity={1.1} />
          <mesh position={[0, 0, -1.2]}>
            <planeGeometry args={[40, 40]} />
            <meshBasicMaterial color={0x090a0c} toneMapped={false} />
          </mesh>
          <DigScene botState={botState} apiRef={api} />
          <Bot stateRef={botState} />
        </Suspense>
      </Canvas>
      {/* Fades the slab into the page; a CSS mask alone leaves the canvas sides hard. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 50% 80% at 50% 40%, transparent 45%, #090a0c 100%)" }}
      />
    </div>
  )
}
