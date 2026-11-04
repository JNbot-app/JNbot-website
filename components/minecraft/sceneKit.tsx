"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/* ------------------------------------------------------------------ *
 * Shared scene helpers for the Minecraft mini-scenes.
 * ------------------------------------------------------------------ */

/**
 * A block whose front (+z) face is left pure white so a per-instance color
 * (setColorAt) shows through unmodified, while the four sides + back are baked
 * to a depth gradient — giving carved holes / placed blocks a real 3D read.
 * Use with a MeshBasicMaterial({ vertexColors: true }) on an InstancedMesh and
 * tint each block via setColorAt().
 */
export function makeBlockGeometry(pageBg: string, litSide: string) {
  const g = new THREE.BoxGeometry(1, 1, 1)
  const bgc = new THREE.Color(pageBg)
  const lit = new THREE.Color(litSide)
  const pos = g.attributes.position
  const nrm = g.attributes.normal
  const c = new THREE.Color()
  const colors: number[] = []
  for (let i = 0; i < pos.count; i++) {
    if (nrm.getZ(i) > 0.5) {
      colors.push(1, 1, 1) // front face: full tint passes through
      continue
    }
    const z = pos.getZ(i)
    let f = THREE.MathUtils.mapLinear(z, 0.5, -0.5, 0.35, 1)
    f *= 0.7 + nrm.getY(i) * 0.3
    c.copy(bgc).lerp(lit, THREE.MathUtils.clamp(f, 0, 1))
    colors.push(c.r, c.g, c.b)
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
  return g
}

/* ---- block-break / placement debris burst ---- */

const MAX_PARTS = 100
const PART_SIZE = 0.16

interface Part {
  px: number; py: number; pz: number
  vx: number; vy: number; vz: number
  rx: number; ry: number
  life: number; max: number
  col: THREE.Color
}

export function useDebris(palette: number[]) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const pool = useRef<Part[]>([])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colors = useMemo(() => palette.map((c) => new THREE.Color(c)), [palette])

  const spawn = (x: number, y: number, z = 0.35) => {
    for (let n = 0; n < 12; n++) {
      if (pool.current.length >= MAX_PARTS) break
      const a = Math.random() * Math.PI * 2
      const sp = 1 + Math.random() * 2
      pool.current.push({
        px: x + (Math.random() - 0.5) * 0.6,
        py: y + (Math.random() - 0.5) * 0.6,
        pz: z + Math.random() * 0.3,
        vx: Math.cos(a) * sp * 0.6,
        vy: 1.8 + Math.random() * 2.8,
        vz: Math.sin(a) * sp * 0.5 + 1.9,
        rx: (Math.random() - 0.5) * 9,
        ry: (Math.random() - 0.5) * 9,
        life: 0,
        max: 0.55 + Math.random() * 0.4,
        col: colors[(Math.random() * colors.length) | 0],
      })
    }
  }

  const clear = () => { pool.current.length = 0 }

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const m = ref.current
    if (!m) return
    const parts = pool.current
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]
      p.life += dt
      if (p.life >= p.max) { parts.splice(i, 1); continue }
      p.vy -= 9 * dt
      p.px += p.vx * dt; p.py += p.vy * dt; p.pz += p.vz * dt
    }
    for (let i = 0; i < MAX_PARTS; i++) {
      const p = parts[i]
      if (p) {
        const k = 1 - p.life / p.max
        dummy.position.set(p.px, p.py, p.pz)
        dummy.rotation.set(p.rx * p.life, p.ry * p.life, 0)
        dummy.scale.setScalar(PART_SIZE * (0.5 + k * 0.5))
        m.setColorAt(i, p.col)
      } else {
        dummy.position.set(0, -999, 0)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.setScalar(0)
      }
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  })

  const node = (
    <instancedMesh ref={ref} args={[undefined, undefined, MAX_PARTS]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )

  return { node, spawn, clear }
}
