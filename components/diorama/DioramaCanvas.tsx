"use client"

import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react"
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"
import * as THREE from "three"
import {
  ARCHIPELAGO_CENTRE, ARCHIPELAGO_SPAN, CAMERA_DIRECTION, DIORAMA_TEXTURES, FINALE, SCREEN_RIGHT, SCREEN_UP,
  STATION_CENTRES, STATION_COUNT, createDiorama,
  type ScriptName,
} from "./world"

const NAMES = Object.keys(DIORAMA_TEXTURES)
const ISLAND_SPAN = 12.5
// Each stop is framed a little differently, so the five read as five places.
const STATION_SCALE = [1, 0.92, 1.2, 1.08, 0.9]

const ease = (f: number) => {
  const x = THREE.MathUtils.clamp((f - 0.12) / 0.76, 0, 1)
  return x * x * (3 - 2 * x)
}

/** Frame a point at a given zoom: right of the copy on desktop, above it on phones. */
function frame(point: THREE.Vector3, zoom: number, width: number, height: number, out: THREE.Vector3) {
  out.copy(point)
  if (width >= 900) out.addScaledVector(SCREEN_RIGHT, -(width * 0.21) / zoom).addScaledVector(SCREEN_UP, -(height * 0.05) / zoom)
  else out.addScaledVector(SCREEN_UP, -(height * 0.21) / zoom)
  return zoom
}

const islandPoint = new THREE.Vector3()
const islandLook = new THREE.Vector3()
const overviewLook = new THREE.Vector3()
// The archipelago's mass sits a little below the hub (the beam and tags rise above it).
const OVERVIEW_POINT = ARCHIPELAGO_CENTRE.clone().addScaledVector(SCREEN_UP, -1.5)

/**
 * Where the camera looks for a fractional station index, and at what zoom.
 * Between the last island and the finale it pulls back to the whole archipelago.
 */
function focus(progress: number, width: number, height: number, out: THREE.Vector3) {
  const wide = width >= 900
  const p = THREE.MathUtils.clamp(progress, 0, STATION_COUNT - 1)
  const i = Math.min(Math.floor(p), STATION_COUNT - 2)
  islandPoint.lerpVectors(STATION_CENTRES[i], STATION_CENTRES[i + 1], ease(p - i))
  const scale = THREE.MathUtils.lerp(STATION_SCALE[i], STATION_SCALE[i + 1], ease(p - i))
  const islandZoom = frame(islandPoint, scale * (wide
    ? Math.min((width * 0.5) / ISLAND_SPAN, (height * 0.82) / ISLAND_SPAN)
    : Math.min((width * 0.88) / ISLAND_SPAN, (height * 0.42) / ISLAND_SPAN)), width, height, islandLook)

  const pull = ease(THREE.MathUtils.clamp(progress - (FINALE - 1), 0, 1))
  if (pull <= 0) { out.copy(islandLook); return islandZoom }
  const { width: w, height: h } = ARCHIPELAGO_SPAN
  const overviewZoom = frame(OVERVIEW_POINT, wide
    ? Math.min((width * 0.56) / w, (height * 0.84) / h)
    : Math.min((width * 0.98) / w, (height * 0.5) / h), width, height, overviewLook)
  out.lerpVectors(islandLook, overviewLook, pull)
  // Zoom out geometrically so the pull-back feels even.
  return islandZoom * Math.pow(overviewZoom / islandZoom, pull)
}

function World({ progress, script, lit, running, reduced, onReady }: {
  progress: MutableRefObject<number>; script: MutableRefObject<ScriptName>; lit: MutableRefObject<number>
  running: boolean; reduced: boolean; onReady: () => void
}) {
  const loaded = useLoader(THREE.TextureLoader, NAMES.map((name) => DIORAMA_TEXTURES[name]))
  const world = useMemo(() => {
    const textures = loaded.map((source) => {
      const texture = source.clone()
      texture.colorSpace = THREE.SRGBColorSpace
      texture.magFilter = THREE.NearestFilter
      texture.minFilter = THREE.NearestFilter
      texture.generateMipmaps = false
      texture.needsUpdate = true
      return texture
    })
    const scene = createDiorama(new Map(NAMES.map((name, i) => [name, textures[i]])))
    return { ...scene, dispose: () => { scene.dispose(); textures.forEach((t) => t.dispose()) } }
  }, [loaded])
  const { camera, size, invalidate } = useThree()
  const seconds = useRef(reduced ? 4 : 0)
  const previous = useRef<number | null>(null)
  const look = useRef<THREE.Vector3 | null>(null)
  const playing = useRef<ScriptName>("kit")
  const goal = useMemo(() => new THREE.Vector3(), [])

  const shown = useRef(false)
  useEffect(() => {
    invalidate()
    return () => world.dispose()
  }, [world, invalidate])

  useEffect(() => {
    const onScroll = () => invalidate()
    window.addEventListener("scroll", onScroll, { passive: true })
    previous.current = null
    const timer = running ? window.setInterval(invalidate, 1000 / 30) : undefined
    invalidate()
    return () => { window.removeEventListener("scroll", onScroll); window.clearInterval(timer) }
  }, [running, invalidate])

  useFrame(() => {
    const now = performance.now()
    const dt = previous.current === null ? 0 : Math.min((now - previous.current) / 1000, 0.1)
    previous.current = now
    if (running) seconds.current += dt
    if (script.current !== playing.current) {
      playing.current = script.current
      world.setScript(script.current, seconds.current)
    }
    const wide = size.width >= 900
    world.update(seconds.current, progress.current, wide ? 1.6 : 0.98, lit.current, wide)

    const zoom = focus(progress.current, size.width, size.height, goal)
    if (!look.current || reduced) look.current = goal.clone()
    else look.current.lerp(goal, 1 - Math.exp(-dt * 7))
    // Keep easing towards the goal even when the scene itself is paused.
    if (look.current.distanceToSquared(goal) > 1e-4) window.requestAnimationFrame(() => invalidate())
    const cam = camera as THREE.OrthographicCamera
    cam.position.copy(look.current).addScaledVector(CAMERA_DIRECTION, 40)
    cam.lookAt(look.current)
    if (cam.zoom !== zoom) { cam.zoom = zoom; cam.updateProjectionMatrix() }
    // Reveal only once a real frame has been drawn, so nothing pops in after the fade.
    if (!shown.current) { shown.current = true; window.requestAnimationFrame(onReady) }
  })
  return <primitive object={world.root} dispose={null} />
}

export default function DioramaCanvas({ progress, script, lit, running, reduced, onReady, onFailure }: {
  progress: MutableRefObject<number>; script: MutableRefObject<ScriptName>; lit: MutableRefObject<number>
  running: boolean; reduced: boolean
  onReady: () => void; onFailure: () => void
}) {
  return (
    <Canvas
      orthographic flat frameloop="demand" dpr={[1, 1.5]}
      camera={{ position: [12, 10, 14], zoom: 40, near: 0.1, far: 120 }}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      onCreated={({ gl }) => { gl.domElement.addEventListener("webglcontextlost", onFailure, { once: true }) }}
    >
      {/* Moonlight from above; the torches on each island carry the warmth. */}
      <hemisphereLight args={["#c8d2f0", "#3a3550", 1.7]} />
      <directionalLight position={[-3, 10, 5]} intensity={1.7} color="#dfe5ff" />
      <Suspense fallback={null}>
        <World progress={progress} script={script} lit={lit} running={running} reduced={reduced} onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
