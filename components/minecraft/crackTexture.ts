import * as THREE from "three"

/**
 * Procedural Minecraft-style "destroy_stage" crack overlays.
 *
 * Mojang ships 10 crack stages (destroy_stage_0..9). We can't redistribute
 * their PNGs on a public site, so we author the classic crack pattern in code
 * on a 16x16 canvas and reveal it progressively. Transparent background, dark
 * crack lines, nearest-neighbour filtering -> reads as authentic pixel cracks.
 */

const SIZE = 16
const STAGES = 10

// Crack polylines in 0..16 pixel space. They are revealed cumulatively so the
// block looks like it is fracturing apart the longer it is mined.
const CRACKS: [number, number][][] = [
  [[8, 1], [8, 4], [7, 6], [9, 8], [8, 11], [9, 15]], // main spine
  [[8, 6], [5, 7], [3, 6], [1, 7]], // left branch
  [[9, 8], [11, 8], [13, 9], [15, 8]], // right branch
  [[8, 4], [10, 3], [12, 1]], // up-right hair
  [[8, 11], [6, 12], [4, 14]], // down-left hair
  [[3, 6], [2, 3]], // top-left fleck
  [[13, 9], [14, 12]], // bottom-right fleck
  [[5, 7], [5, 10]], // mid fleck
  [[9, 15], [12, 14]], // bottom spur
  [[1, 7], [0, 10]], // edge spur
]

let cache: THREE.CanvasTexture[] | null = null

export function getCrackStages(): THREE.CanvasTexture[] {
  if (cache) return cache

  cache = Array.from({ length: STAGES }, (_, stage) => {
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = SIZE
    const ctx = canvas.getContext("2d")!
    ctx.clearRect(0, 0, SIZE, SIZE)

    // How many cracks are visible at this stage (always at least the spine).
    const visible = Math.max(1, Math.ceil(((stage + 1) / STAGES) * CRACKS.length))
    // Subtle gray cracks, like Minecraft's destroy_stage overlay. The wall front
    // is page-bg (near-black) so the gray needs to sit a touch above it to read,
    // but kept low-contrast so it stays understated.
    ctx.lineWidth = 1
    ctx.lineCap = "square"
    ctx.strokeStyle = `rgba(124,124,130,${0.22 + stage * 0.028})`

    for (let i = 0; i < visible; i++) {
      const pts = CRACKS[i]
      ctx.beginPath()
      ctx.moveTo(pts[0][0], pts[0][1])
      for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j][0], pts[j][1])
      ctx.stroke()
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.magFilter = THREE.NearestFilter
    tex.minFilter = THREE.NearestFilter
    tex.generateMipmaps = false
    tex.needsUpdate = true
    return tex
  })

  return cache
}
