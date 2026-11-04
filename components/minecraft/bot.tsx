"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import * as THREE from "three"
import { PARTS, OVERLAYS, makePartGeometry, configureSkin, type PartSpec } from "./skin"
import { asset } from "@/lib/site"

/* ------------------------------------------------------------------ *
 * Shared "Steve" rig — one body and pickaxe for every scene,
 * but driven by a plain mutable BotState ref so any scene can puppet it.
 * Set fields on the ref each frame; <Bot> reads them in its own useFrame.
 * ------------------------------------------------------------------ */

export interface Vec3 {
  x: number
  y: number
  z?: number
}

export type BotPhase = "idle" | "gaze" | "wave" | "fall"

export interface BotState {
  x: number
  y: number
  z: number
  facing: number // target yaw (radians). 0 faces +z (camera), +PI/2 faces +x.
  run: number // 0..1 run-cycle weight
  mining: boolean
  swing: number // 0..1 chop progress
  phase: BotPhase
  target: Vec3 | null // block being struck (drives arm reach + head aim)
  lookAt: Vec3 | null // point to gaze at
}

export function makeBotState(init: Partial<BotState> = {}): BotState {
  return {
    x: 0, y: 0, z: 0, facing: Math.PI, run: 0,
    mining: false, swing: 0, phase: "idle", target: null, lookAt: null,
    ...init,
  }
}

// frame-rate independent damping toward an angle, shortest path
export function dampAngle(cur: number, target: number, lambda: number, dt: number) {
  const d = Math.atan2(Math.sin(target - cur), Math.cos(target - cur))
  return cur + d * (1 - Math.exp(-lambda * dt))
}

const WAVE_Z = Math.PI + 0.42
const WAVE_X = 0.3

function SkinMesh({
  spec, overlay, mat, matOverlay,
}: {
  spec: PartSpec
  overlay?: PartSpec
  mat: THREE.Material
  matOverlay: THREE.Material
}) {
  const geo = useMemo(() => makePartGeometry(spec), [spec])
  const geoO = useMemo(() => (overlay ? makePartGeometry(overlay) : null), [overlay])
  return (
    <group>
      <mesh geometry={geo} material={mat} />
      {geoO && <mesh geometry={geoO} material={matOverlay} scale={1.08} />}
    </group>
  )
}

function Pickaxe() {
  const tex = useLoader(THREE.TextureLoader, asset("/minecraft/diamond_pickaxe.png"))
  const ref = useRef<THREE.InstancedMesh>(null!)

  const voxels = useMemo(() => {
    const img = tex.image as HTMLImageElement
    const cv = document.createElement("canvas")
    cv.width = cv.height = 16
    const g = cv.getContext("2d")!
    g.drawImage(img, 0, 0)
    const data = g.getImageData(0, 0, 16, 16).data
    const out: { x: number; y: number; c: THREE.Color }[] = []
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = (y * 16 + x) * 4
        if (data[i + 3] > 128) {
          const c = new THREE.Color()
          c.setRGB(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255, THREE.SRGBColorSpace)
          out.push({ x: x - 7.5, y: 7.5 - y, c })
        }
      }
    }
    return out
  }, [tex])

  useEffect(() => {
    const m = ref.current
    const d = new THREE.Object3D()
    voxels.forEach((v, i) => {
      d.position.set(v.x / 16, v.y / 16, 0)
      d.updateMatrix()
      m.setMatrixAt(i, d.matrix)
      m.setColorAt(i, v.c)
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [voxels])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, voxels.length]}>
      <boxGeometry args={[1 / 16, 1 / 16, 2 / 16]} />
      <meshStandardMaterial roughness={0.55} metalness={0.15} />
    </instancedMesh>
  )
}

export function Bot({
  stateRef, onClick,
}: {
  stateRef: React.MutableRefObject<BotState>
  onClick?: () => void
}) {
  const skin = useLoader(THREE.TextureLoader, asset("/minecraft/jnbot-skin.png"))
  useMemo(() => configureSkin(skin), [skin])

  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: skin, roughness: 0.9, metalness: 0 }),
    [skin]
  )
  const matO = useMemo(
    () => new THREE.MeshStandardMaterial({ map: skin, roughness: 0.9, metalness: 0, transparent: true, alphaTest: 0.5 }),
    [skin]
  )

  const root = useRef<THREE.Group>(null!)
  const yaw = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const armR = useRef<THREE.Group>(null!)
  const armL = useRef<THREE.Group>(null!)
  const legR = useRef<THREE.Group>(null!)
  const legL = useRef<THREE.Group>(null!)
  const head = useRef<THREE.Group>(null!)

  useFrame((state, dtRaw) => {
    const d = Math.min(dtRaw, 0.05)
    const P = stateRef.current
    const t = state.clock.elapsedTime

    const bob = P.run ? Math.abs(Math.sin(t * 14)) * 0.06 : Math.sin(t * 2) * 0.012
    root.current.position.set(P.x, P.y + bob, P.z)
    yaw.current.rotation.y = dampAngle(yaw.current.rotation.y, P.facing, 9, d)

    // head aim
    let headPitch = 0
    let headYaw = 0
    const look = P.lookAt || P.target
    if (look && P.phase !== "fall") {
      const dy = look.y - (P.y + 1.5)
      const horiz = Math.hypot(look.x - P.x, (look.z ?? P.z) - P.z) || 0.001
      headPitch = -Math.atan2(dy, horiz)
    } else if (P.phase === "gaze") {
      headYaw = Math.sin(t * 0.6) * 0.3
      headPitch = Math.sin(t * 0.4) * 0.08
    }
    head.current.rotation.x = dampAngle(head.current.rotation.x, headPitch, 8, d)
    head.current.rotation.y = dampAngle(head.current.rotation.y, headYaw, 8, d)

    const cyc = Math.sin(t * 14)

    // falling: flail and bail out before the rest
    if (P.phase === "fall") {
      armR.current.rotation.z = -2.5 + Math.sin(t * 22) * 0.5
      armL.current.rotation.z = 2.5 + Math.sin(t * 22 + 1) * 0.5
      armR.current.rotation.x = Math.sin(t * 20) * 0.5
      armL.current.rotation.x = Math.sin(t * 20 + 1.5) * 0.5
      legR.current.rotation.x = Math.sin(t * 18) * 0.7
      legL.current.rotation.x = Math.sin(t * 18 + 2) * 0.7
      body.current.rotation.x += (0 - body.current.rotation.x) * Math.min(1, d * 6)
      return
    }

    legR.current.rotation.x = cyc * 0.9 * P.run
    legL.current.rotation.x = -cyc * 0.9 * P.run

    if (P.phase === "wave") {
      armL.current.rotation.z = WAVE_Z + Math.sin(t * 10) * 0.22
      armL.current.rotation.x = WAVE_X
    } else {
      armL.current.rotation.z = 0
      armL.current.rotation.x = -cyc * 0.6 * P.run
    }

    let bodyLean = 0
    if (P.mining && P.swing > 0) bodyLean = -0.05 - Math.sin(P.swing * Math.PI) * 0.06
    else if (P.run) bodyLean = 0.14
    body.current.rotation.x += (bodyLean - body.current.rotation.x) * Math.min(1, d * 12)

    const reach = P.target ? THREE.MathUtils.clamp((P.target.y - 1) / 4, 0, 1) : 0
    const baseLift = -0.5 - reach * 1.5
    if (P.mining && P.swing > 0) {
      const chop = Math.sin(P.swing * Math.PI)
      armR.current.rotation.x = baseLift - chop * 1.9
      armR.current.rotation.z = -0.1
    } else if (P.run) {
      armR.current.rotation.x = -0.2 + cyc * 0.5
      armR.current.rotation.z = 0
    } else {
      const rest = P.phase === "gaze" || P.phase === "wave" ? -0.12 : baseLift
      armR.current.rotation.x += (rest - armR.current.rotation.x) * Math.min(1, d * 12)
      armR.current.rotation.z += (0 - armR.current.rotation.z) * Math.min(1, d * 12)
    }
  })

  return (
    <group
      ref={root}
      onClick={onClick ? (e: { stopPropagation: () => void }) => { e.stopPropagation(); onClick() } : undefined}
    >
      <group ref={yaw}>
        <group ref={body}>
          <group ref={legR} position={[0.125, 0.75, 0]}>
            <group position={[0, -0.375, 0]}>
              <SkinMesh spec={PARTS.legR} overlay={OVERLAYS.legR} mat={mat} matOverlay={matO} />
            </group>
          </group>
          <group ref={legL} position={[-0.125, 0.75, 0]}>
            <group position={[0, -0.375, 0]}>
              <SkinMesh spec={PARTS.legL} overlay={OVERLAYS.legL} mat={mat} matOverlay={matO} />
            </group>
          </group>
          <group position={[0, 1.125, 0]}>
            <SkinMesh spec={PARTS.body} overlay={OVERLAYS.body} mat={mat} matOverlay={matO} />
          </group>
          <group ref={armR} position={[0.375, 1.5, 0]}>
            <group position={[0, -0.375, 0]}>
              <SkinMesh spec={PARTS.armR} overlay={OVERLAYS.armR} mat={mat} matOverlay={matO} />
            </group>
            <group position={[0, -0.7, 0]} rotation={[Math.PI - 1.15, Math.PI / 2, 0]} scale={0.8}>
              <group position={[0.35, 0.4, 0]}>
                <Pickaxe />
              </group>
            </group>
          </group>
          <group ref={armL} position={[-0.375, 1.5, 0]}>
            <group position={[0, -0.375, 0]}>
              <SkinMesh spec={PARTS.armL} overlay={OVERLAYS.armL} mat={mat} matOverlay={matO} />
            </group>
          </group>
          <group ref={head} position={[0, 1.75, 0]}>
            <SkinMesh spec={PARTS.head} overlay={OVERLAYS.head} mat={mat} matOverlay={matO} />
          </group>
        </group>
      </group>
    </group>
  )
}
