import * as THREE from "three"

/**
 * Maps the official Minecraft player skin (64x64) onto box-shaped body parts
 * with the correct per-face UV layout. Pixels -> world units at 16px = 1 block.
 */

const TEX = 64 // skin is 64x64

export interface PartSpec {
  w: number // pixel dims of the cuboid
  h: number
  d: number
  u: number // top-left of the part block in the skin
  v: number
}

// Base layer parts (wide / "Steve" arm model).
export const PARTS = {
  head: { w: 8, h: 8, d: 8, u: 0, v: 0 },
  body: { w: 8, h: 12, d: 4, u: 16, v: 16 },
  armR: { w: 4, h: 12, d: 4, u: 40, v: 16 },
  armL: { w: 4, h: 12, d: 4, u: 32, v: 48 },
  legR: { w: 4, h: 12, d: 4, u: 0, v: 16 },
  legL: { w: 4, h: 12, d: 4, u: 16, v: 48 },
} satisfies Record<string, PartSpec>

// Second (overlay) layer — hat, jacket, sleeves, pants.
export const OVERLAYS = {
  head: { w: 8, h: 8, d: 8, u: 32, v: 0 },
  body: { w: 8, h: 12, d: 4, u: 16, v: 32 },
  armR: { w: 4, h: 12, d: 4, u: 40, v: 32 },
  armL: { w: 4, h: 12, d: 4, u: 48, v: 48 },
  legR: { w: 4, h: 12, d: 4, u: 0, v: 32 },
  legL: { w: 4, h: 12, d: 4, u: 0, v: 48 },
} satisfies Record<string, PartSpec>

// BoxGeometry face order is [+x, -x, +y, -y, +z, -z]. For a skin cuboid the
// horizontal band unwraps as [rightSide, front, leftSide, back] and the row
// above holds [top, bottom]. The player's local +z is the face (front).
function faceRects(p: PartSpec) {
  const { w, h, d, u, v } = p
  return {
    // +x is the player's left side (when facing +z)
    px: { x: u + d + w, y: v + d, w: d, h },
    // -x is the player's right side
    nx: { x: u, y: v + d, w: d, h },
    py: { x: u + d, y: v, w, h: d }, // top
    ny: { x: u + d + w, y: v, w, h: d }, // bottom
    pz: { x: u + d, y: v + d, w, h }, // front (face)
    nz: { x: u + d + w + d, y: v + d, w, h }, // back
  }
}

function setFaceUV(
  uv: THREE.BufferAttribute,
  faceIndex: number,
  r: { x: number; y: number; w: number; h: number },
  flipX = false
) {
  let u0 = r.x / TEX
  let u1 = (r.x + r.w) / TEX
  const v0 = 1 - r.y / TEX // top edge
  const v1 = 1 - (r.y + r.h) / TEX // bottom edge
  if (flipX) [u0, u1] = [u1, u0]
  const base = faceIndex * 4
  // vertex order per face: TL, TR, BL, BR
  uv.setXY(base + 0, u0, v0)
  uv.setXY(base + 1, u1, v0)
  uv.setXY(base + 2, u0, v1)
  uv.setXY(base + 3, u1, v1)
}

export function makePartGeometry(p: PartSpec): THREE.BoxGeometry {
  const geo = new THREE.BoxGeometry(p.w / 16, p.h / 16, p.d / 16)
  const uv = geo.attributes.uv as THREE.BufferAttribute
  const f = faceRects(p)
  // side faces are mirrored relative to each other so the texture wraps cleanly
  setFaceUV(uv, 0, f.px) // +x
  setFaceUV(uv, 1, f.nx) // -x
  setFaceUV(uv, 2, f.py, true) // +y top (flip so it reads correctly)
  setFaceUV(uv, 3, f.ny, true) // -y bottom
  setFaceUV(uv, 4, f.pz) // +z front
  setFaceUV(uv, 5, f.nz) // -z back
  uv.needsUpdate = true
  return geo
}

export function configureSkin(tex: THREE.Texture) {
  tex.magFilter = THREE.NearestFilter
  tex.minFilter = THREE.NearestFilter
  tex.generateMipmaps = false
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}
