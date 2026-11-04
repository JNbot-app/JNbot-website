import * as THREE from "three"
import { makePartGeometry, PARTS } from "../minecraft/skin"
import { asset } from "@/lib/site"

// One sky of floating islands. Each island is a JNbot capability with bots at
// work; the page camera travels between them as the visitor scrolls.

const W = asset("/minecraft/world/")
export const DIORAMA_TEXTURES = {
  grassTop: W + "grass_block_top.png",
  grassSide: W + "grass_block_side.png",
  grassOverlay: W + "grass_block_side_overlay.png",
  dirt: W + "dirt.png",
  stone: W + "stone.png",
  log: W + "oak_log.png",
  logTop: W + "oak_log_top.png",
  leaves: W + "oak_leaves.png",
  sapling: W + "oak_sapling.png",
  farmland: W + "farmland_moist.png",
  water: W + "water_still.png",
  poppy: W + "poppy.png",
  tuft: W + "short_grass.png",
  axe: W + "diamond_axe.png",
  seeds: W + "wheat_seeds.png",
  planks: asset("/minecraft/scene/planks.png"),
  ore: asset("/minecraft/scene/diamond_ore.png"),
  pickaxe: asset("/minecraft/diamond_pickaxe.png"),
  diamond: asset("/minecraft/items/diamond.png"),
  book: asset("/minecraft/items/book.png"),
  star: asset("/minecraft/items/star.png"),
  skin: asset("/minecraft/jnbot-skin.png"),
  ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`wheat${i}`, W + `wheat_stage${i}.png`])),
} as Record<string, string>
export type TextureName = keyof typeof DIORAMA_TEXTURES

// Screen axes of the isometric camera, which looks along -(12, 10, 14).
export const CAMERA_DIRECTION = new THREE.Vector3(12, 10, 14).normalize()
export const SCREEN_RIGHT = new THREE.Vector3(14, 0, -12).normalize()
export const SCREEN_UP = new THREE.Vector3().crossVectors(SCREEN_RIGHT, CAMERA_DIRECTION.clone().negate()).normalize()

export const STATION_COUNT = 5
/** The last station: every island gathers around a beacon hub. */
export const FINALE = STATION_COUNT
/** World-space centre of each island, descending down the screen in a gentle zigzag. */
export const STATION_CENTRES = Array.from({ length: STATION_COUNT }, (_, i) =>
  SCREEN_UP.clone().multiplyScalar(-17 * i).add(SCREEN_RIGHT.clone().multiplyScalar(i % 2 ? 4 : -1.5 * Math.min(i, 1))),
)

interface Rig {
  body: THREE.Group; head: THREE.Mesh; right: THREE.Group; left: THREE.Group
  legR: THREE.Group; legL: THREE.Group; tool: THREE.Mesh; tag?: THREE.Sprite
}
// The finale: islands gather into one archipelago, laid out in screen space
// around a hub (right, up), so none sits in the path of the beacon's beam.
export const ARCHIPELAGO_CENTRE = STATION_CENTRES[STATION_COUNT - 1].clone().addScaledVector(SCREEN_UP, 4)
const GATHERED: [number, number][] = [[-18, 6], [-17, -9], [18, 6], [0, -14], [17, -8]]
/** Screen-space extent of the gathered archipelago, in world units, including island bodies. */
export const ARCHIPELAGO_SPAN = { width: 50, height: 36 }
const gatheredAt = (i: number) =>
  ARCHIPELAGO_CENTRE.clone().addScaledVector(SCREEN_RIGHT, GATHERED[i][0]).addScaledVector(SCREEN_UP, GATHERED[i][1])

/** Features named on tags along the beacon beam, in the order the page lists them. */
export const FEATURE_TAGS = ["Proxies", "Phone & browser", "Stays on your device", "JNbot Client", "Minecraft servers", "AI via MCP"]

type Kit = ReturnType<typeof createKit>

function hash(x: number, z: number, seed = 0) {
  const s = Math.sin(x * 127.1 + z * 311.7 + seed * 74.7) * 43758.5453
  return s - Math.floor(s)
}

function createKit(maps: Map<string, THREE.Texture>) {
  const geometries: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []
  const owned: THREE.Texture[] = []
  const ownGeometry = <T extends THREE.BufferGeometry>(g: T) => { geometries.push(g); return g }
  const ownMaterial = <T extends THREE.Material>(m: T) => { materials.push(m); return m }
  const box = ownGeometry(new THREE.BoxGeometry())
  const plane = ownGeometry(new THREE.PlaneGeometry())
  const material = (name: string, color = "#ffffff", cutout = false) => ownMaterial(new THREE.MeshLambertMaterial({
    map: maps.get(name), color, alphaTest: cutout ? 0.5 : 0, side: cutout ? THREE.DoubleSide : THREE.FrontSide,
  }))
  const dirt = material("dirt")
  const stone = material("stone")
  const grassTop = material("grassTop", "#91bd59")
  const grassSide = material("grassSide")
  const m = {
    dirt, stone,
    grass: [grassSide, grassSide, grassTop, dirt, grassSide, grassSide],
    grassOverlay: material("grassOverlay", "#91bd59", true),
    log: [material("log"), material("log"), material("logTop"), material("logTop"), material("log"), material("log")],
    leaves: material("leaves", "#77ab39", true),
    soil: [dirt, dirt, material("farmland"), dirt, dirt, dirt],
    crops: Array.from({ length: 8 }, (_, i) => material(`wheat${i}`, "#ffffff", true)),
    water: material("water", "#3e76db"),
    sapling: material("sapling", "#ffffff", true),
    poppy: material("poppy", "#ffffff", true),
    tuft: material("tuft", "#91bd59", true),
    axe: material("axe", "#ffffff", true),
    seeds: material("seeds", "#ffffff", true),
    pickaxe: material("pickaxe", "#ffffff", true),
    diamond: material("diamond", "#ffffff", true),
    book: material("book", "#ffffff", true),
    star: material("star", "#ffffff", true),
    puff: ownMaterial(new THREE.MeshBasicMaterial({ color: "#e9e9e6" })),
    iron: material("stone", "#eef1f4"),
    beacon: ownMaterial(new THREE.MeshLambertMaterial({ color: "#c9f3ff", emissive: "#3aa9c4" })),
    beam: ownMaterial(new THREE.MeshBasicMaterial({ color: "#f5b506", transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false })),
    halo: ownMaterial(new THREE.MeshBasicMaterial({ color: "#f5b506", transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false })),
    planks: material("planks"),
    plankDark: material("planks", "#9a7a52"),
    ore: material("ore"),
    trail: ownMaterial(new THREE.MeshBasicMaterial({ color: "#f5b506", transparent: true, opacity: 0.9 })),
    skin: ownMaterial(new THREE.MeshLambertMaterial({ map: maps.get("skin") })),
    player: ownMaterial(new THREE.MeshLambertMaterial({ map: playerSkin(maps.get("skin")) })),
    footprint: ownMaterial(new THREE.MeshBasicMaterial({ color: "#f7f7f5", transparent: true, opacity: 0.85 })),
    torch: ownMaterial(new THREE.MeshBasicMaterial({ color: "#ffd060" })),
    stick: ownMaterial(new THREE.MeshLambertMaterial({ color: "#a8783f", emissive: "#4a2e12" })),
  }
  // "You" is the player, not a bot: same skin, white shirt instead of JNbot yellow.
  function playerSkin(source?: THREE.Texture) {
    const image = source?.image as HTMLImageElement | undefined
    if (!source || !image) return source
    const canvas = document.createElement("canvas")
    canvas.width = image.width; canvas.height = image.height
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(image, 0, 0)
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < data.data.length; i += 4) {
      const [r, g, b] = [data.data[i], data.data[i + 1], data.data[i + 2]]
      if (r > 150 && g > 100 && b < 110 && r - b > 90) {
        const shade = (r + g) / 2 / 255
        data.data[i] = data.data[i + 1] = Math.round(150 + shade * 100)
        data.data[i + 2] = Math.round(155 + shade * 100)
      }
    }
    ctx.putImageData(data, 0, 0)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    texture.generateMipmaps = false
    owned.push(texture)
    return texture
  }
  const waterMap = maps.get("water")
  if (waterMap) waterMap.repeat.y = 1 / 32

  const cube = (parent: THREE.Object3D, x: number, y: number, z: number, mat: THREE.Material | THREE.Material[], scale: [number, number, number] = [1, 1, 1]) => {
    const mesh = new THREE.Mesh(box, mat)
    mesh.position.set(x, y, z)
    mesh.scale.set(...scale)
    parent.add(mesh)
    return mesh
  }
  const cross = (parent: THREE.Object3D, x: number, y: number, z: number, mat: THREE.Material, size = 1) => {
    const group = new THREE.Group()
    group.position.set(x, y, z)
    for (const angle of [Math.PI / 4, -Math.PI / 4]) {
      const mesh = new THREE.Mesh(plane, mat)
      mesh.position.y = size / 2
      mesh.rotation.y = angle
      mesh.scale.setScalar(size)
      group.add(mesh)
    }
    parent.add(group)
    return group
  }
  // An item lying flat in the air, facing the camera, as dropped items do.
  const item = (parent: THREE.Object3D, mat: THREE.Material, size = 0.5) => {
    const mesh = new THREE.Mesh(plane, mat)
    mesh.scale.setScalar(size)
    mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(CAMERA_DIRECTION, new THREE.Vector3(), new THREE.Vector3(0, 1, 0)))
    parent.add(mesh)
    return mesh
  }

  /**
   * Terrain for one island: a grass or custom top, a dirt layer, and a ragged
   * stone underside that tapers to a point. Instanced per material.
   */
  const terrain = (parent: THREE.Object3D, cells: [number, number][], topFor: (x: number, z: number) => THREE.Material | THREE.Material[] | null, seed: number) => {
    const batches = new Map<THREE.Material | THREE.Material[], [number, number, number][]>()
    const add = (mat: THREE.Material | THREE.Material[], x: number, y: number, z: number) => {
      const list = batches.get(mat) ?? []
      list.push([x, y, z]); batches.set(mat, list)
    }
    const key = new Set(cells.map(([x, z]) => `${x},${z}`))
    const cx = cells.reduce((s, [x]) => s + x, 0) / cells.length
    const cz = cells.reduce((s, [, z]) => s + z, 0) / cells.length
    const reach = Math.max(...cells.map(([x, z]) => Math.hypot(x - cx, z - cz)))
    for (const [x, z] of cells) {
      const top = topFor(x, z)
      if (top) add(top, x, -0.5, z)
      add(dirt, x, -1.5, z)
      const r = Math.hypot(x - cx, z - cz) / reach
      const depth = Math.round((1 - r) * 5.5 + hash(x, z, seed) * 1.6)
      for (let d = 0; d < depth; d++) add(d === 0 && r > 0.75 ? dirt : stone, x, -2.5 - d, z)
      if (Array.isArray(top) && top === m.grass) {
        for (const [dx, dz, angle] of [[1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2], [0, 1, 0], [0, -1, Math.PI]] as const) {
          if (key.has(`${x + dx},${z + dz}`)) continue
          const overlay = new THREE.Mesh(plane, m.grassOverlay)
          overlay.position.set(x + dx * 0.501, -0.5, z + dz * 0.501)
          overlay.rotation.y = angle
          parent.add(overlay)
        }
      }
    }
    const matrix = new THREE.Matrix4()
    for (const [mat, list] of batches) {
      const mesh = new THREE.InstancedMesh(box, mat, list.length)
      list.forEach(([x, y, z], i) => mesh.setMatrixAt(i, matrix.makeTranslation(x, y, z)))
      mesh.instanceMatrix.needsUpdate = true
      parent.add(mesh)
    }
  }
  const rect = (x0: number, x1: number, z0: number, z1: number, cut = true) => {
    const cells: [number, number][] = []
    for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
      if (cut && (x === x0 || x === x1) && (z === z0 || z === z1)) continue
      cells.push([x, z])
    }
    return cells
  }

  const disc = (radius: number) => {
    const cells: [number, number][] = []
    for (let x = -radius; x <= radius; x++) for (let z = -radius; z <= radius; z++) {
      if (Math.hypot(x, z) <= radius + 0.3) cells.push([x, z])
    }
    return cells
  }
  // Torches are the islands' warm light: the icon's amber, lit inside the world.
  const torch = (parent: THREE.Object3D, x: number, z: number) => {
    cube(parent, x, 0.3, z, m.stick, [0.13, 0.6, 0.13])
    cube(parent, x, 0.66, z, m.torch, [0.16, 0.16, 0.16])
    const light = new THREE.PointLight("#ffb347", 9, 9, 1.4)
    light.position.set(x, 1.2, z)
    parent.add(light)
  }

  // The grey puff a player leaves when joining or leaving, as in the game.
  const puff = (parent: THREE.Object3D) => {
    const bits = Array.from({ length: 9 }, (_, i) => {
      const mesh = cube(parent, 0, 0, 0, m.puff, [0.16, 0.16, 0.16])
      mesh.visible = false
      return { mesh, angle: i * 2.39, lift: 0.3 + (i % 3) * 0.5 }
    })
    /** `life` runs 0..1 over the puff; outside that range it is hidden. */
    return (x: number, z: number, life: number) => bits.forEach(({ mesh, angle, lift }) => {
      mesh.visible = life > 0 && life < 1
      const spread = 0.25 + life * 0.6
      mesh.position.set(x + Math.cos(angle) * spread, lift + life * 0.5, z + Math.sin(angle) * spread)
      mesh.scale.setScalar(0.2 * (1 - life))
    })
  }

  // Minecraft's name tag: white text on a translucent black plate, always on top.
  const nameTag = (text: string, accent = false) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const font = "600 44px ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace"
    ctx.font = font
    const width = Math.ceil(ctx.measureText(text).width) + 36
    canvas.width = width; canvas.height = 68
    ctx.font = font
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)"
    ctx.fillRect(0, 0, width, 68)
    ctx.fillStyle = accent ? "#f5b506" : "#ffffff"
    ctx.textBaseline = "middle"
    ctx.fillText(text, 18, 36)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    owned.push(texture)
    const sprite = new THREE.Sprite(ownMaterial(new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true })))
    sprite.renderOrder = 10
    sprite.scale.set((width / 68) * 0.42, 0.42, 1)
    sprite.userData.width = (width / 68) * 0.42
    return sprite
  }

  function bot(parent: THREE.Object3D, name?: string, skin: THREE.Material = m.skin): Rig {
    const body = new THREE.Group()
    parent.add(body)
    const part = (key: keyof typeof PARTS, x: number, y: number) => {
      const mesh = new THREE.Mesh(ownGeometry(makePartGeometry(PARTS[key])), skin)
      mesh.position.set(x, y, 0)
      body.add(mesh)
      return mesh
    }
    part("body", 0, 1.125)
    const head = part("head", 0, 1.75)
    const limb = (key: keyof typeof PARTS, x: number, y: number) => {
      const pivot = new THREE.Group()
      pivot.position.set(x, y, 0)
      const mesh = new THREE.Mesh(ownGeometry(makePartGeometry(PARTS[key])), skin)
      mesh.position.y = -0.375
      pivot.add(mesh); body.add(pivot)
      return pivot
    }
    const right = limb("armR", -0.375, 1.5)
    const left = limb("armL", 0.375, 1.5)
    const legR = limb("legR", -0.125, 0.75)
    const legL = limb("legL", 0.125, 0.75)
    const tool = new THREE.Mesh(plane, m.axe)
    tool.position.set(0, -0.65, 0.24)
    tool.rotation.y = Math.PI / 2
    tool.rotation.x = Math.PI * 3 / 4
    tool.scale.setScalar(0.8)
    tool.visible = false
    right.add(tool)
    let tag: THREE.Sprite | undefined
    if (name) {
      tag = nameTag(name)
      tag.position.y = 2.46
      body.add(tag)
    }
    return { body, head, right, left, legR, legL, tool, tag }
  }

  const pose = (rig: Rig, time: number, work: boolean, walking: boolean) => {
    const stride = walking ? Math.sin(time * Math.PI * 4) * 0.65 : 0
    rig.legR.rotation.x = stride
    rig.legL.rotation.x = -stride
    rig.left.rotation.x = -stride * 0.65
    rig.right.rotation.x = work ? -0.8 - Math.max(0, Math.sin(time * Math.PI * 4)) * 1.4 : stride * 0.65 - 0.12
    rig.head.rotation.x = work ? 0.25 : 0
  }

  const chest = (parent: THREE.Object3D, x: number, z: number, yaw = 0) => {
    const group = new THREE.Group()
    group.position.set(x, 0, z)
    group.rotation.y = yaw
    parent.add(group)
    cube(group, 0, 0.3, 0, m.planks, [0.875, 0.6, 0.875])
    const hinge = new THREE.Group()
    hinge.position.set(0, 0.6, -0.4375)
    group.add(hinge)
    cube(hinge, 0, 0.13, 0.4375, m.plankDark, [0.9, 0.26, 0.9])
    cube(hinge, 0, 0.0, 0.89, m.stone, [0.14, 0.24, 0.06])
    return hinge
  }

  return {
    m, cube, cross, item, terrain, rect, disc, torch, puff, bot, pose, chest, nameTag, waterMap,
    dispose: () => { geometries.forEach((g) => g.dispose()); materials.forEach((mat) => mat.dispose()); owned.forEach((t) => t.dispose()) },
  }
}

const smooth = (a: number, b: number, t: number) => {
  const x = THREE.MathUtils.clamp((t - a) / (b - a), 0, 1)
  return x * x * (3 - 2 * x)
}
const yawToward = (dx: number, dz: number) => Math.atan2(dx, dz)

/** Walk along waypoints at a constant speed. Returns position, heading and whether moving. */
function along(points: [number, number][], distance: number) {
  let left = distance
  for (let i = 1; i < points.length; i++) {
    const [ax, az] = points[i - 1]
    const [bx, bz] = points[i]
    const length = Math.hypot(bx - ax, bz - az)
    if (left <= length) {
      const k = left / length
      return { x: ax + (bx - ax) * k, z: az + (bz - az) * k, yaw: yawToward(bx - ax, bz - az), moving: true }
    }
    left -= length
  }
  const [ax, az] = points[points.length - 2]
  const [bx, bz] = points[points.length - 1]
  return { x: bx, z: bz, yaw: yawToward(bx - ax, bz - az), moving: false }
}
const pathLength = (points: [number, number][]) =>
  points.slice(1).reduce((sum, [x, z], i) => sum + Math.hypot(x - points[i][0], z - points[i][1]), 0)

// ---------------------------------------------------------------- islands

/** Home: a lumberjack fells and replants an oak; a farmer harvests wheat. 24s loop. */
function homeIsland(kit: Kit, parent: THREE.Object3D) {
  const { m } = kit
  // The irrigation channel is a gap in the top layer, filled with water just below the grass.
  kit.terrain(parent, kit.rect(-4, 4, -3, 3), (x, z) => (x >= 0 && x <= 3 && z === 1 ? m.soil : x >= 0 && x <= 3 && z === 0 ? null : m.grass), 1)
  kit.cube(parent, 1.5, -0.56, 0, m.water, [4, 0.88, 1])
  const tree = new THREE.Group()
  tree.position.set(-2, 0, -1)
  parent.add(tree)
  const logs = Array.from({ length: 4 }, (_, i) => kit.cube(tree, 0, i + 0.5, 0, m.log))
  const canopy = new THREE.Group()
  tree.add(canopy)
  for (let y = 3; y <= 5; y++) {
    const radius = y === 5 ? 1 : 2
    for (let x = -radius; x <= radius; x++) for (let z = -radius; z <= radius; z++) {
      if (Math.abs(x) === radius && Math.abs(z) === radius) continue
      if (x === 0 && z === 0 && y === 3) continue
      kit.cube(canopy, x, y + 0.5, z, m.leaves)
    }
  }
  const sapling = kit.cross(parent, -2, 0.01, -1, m.sapling)
  const crops = Array.from({ length: 4 }, (_, x) => {
    const group = new THREE.Group()
    parent.add(group)
    for (const dx of [-0.22, 0.22]) for (const dz of [-0.22, 0.22]) kit.cross(group, x + dx, 0.015, 1 + dz, m.crops[7], 0.95)
    return group
  })
  for (const [x, z] of [[-3, 2], [-4, 0], [4, -2], [-1, -3], [3, -2]]) kit.cross(parent, x, 0, z, m.tuft, 0.75)
  for (const [x, z] of [[-3, 1], [4, 2], [-1, 3]]) kit.cross(parent, x, 0, z, m.poppy, 0.75)
  kit.torch(parent, 4, 0)
  kit.torch(parent, -4, -2)

  const lumberjack = kit.bot(parent, "Oak_Bot")
  lumberjack.body.position.set(-2, 0, 0.4)
  lumberjack.body.rotation.y = Math.PI
  const farmer = kit.bot(parent, "Farm_Bot")
  farmer.tool.material = m.seeds
  const debris = Array.from({ length: 10 }, () => kit.cube(parent, 0, 0, 0, m.log, [0.12, 0.12, 0.12]))

  return (seconds: number) => {
    const t = seconds % 24
    logs.forEach((mesh, i) => { mesh.visible = t < 3 + i || t >= 17 })
    canopy.visible = t < 6.5 || t >= 17
    sapling.visible = t >= 9 && t < 17
    const planting = t >= 8.5 && t < 9.5
    lumberjack.tool.material = planting ? m.sapling : m.axe
    lumberjack.tool.visible = t < 7 || planting || t >= 20
    kit.pose(lumberjack, t, t < 6 || planting || t >= 23, false)
    lumberjack.head.rotation.x = planting ? 0.65 : t < 6 ? -(Math.max(0, t - 3) * 0.23) : 0
    lumberjack.right.rotation.x -= t >= 3 && t < 6 ? (t - 3) * 0.28 : 0

    const slot = Math.floor(t / 6)
    const local = t % 6
    const previous = slot === 0 ? 3 : slot - 1
    const travel = Math.min(1, local / 1.5)
    farmer.body.position.set(THREE.MathUtils.lerp(previous, slot, travel), 0, 2.35)
    const walkingYaw = slot === 0 ? Math.PI * 1.5 : Math.PI / 2
    const turn = Math.min(1, local / 0.2, Math.max(0, (1.5 - local) / 0.2))
    farmer.body.rotation.y = THREE.MathUtils.lerp(Math.PI, walkingYaw, turn)
    kit.pose(farmer, t, local >= 2 && local < 4.5, travel < 1)
    farmer.head.rotation.x = 0.6 * (1 - turn)
    farmer.tool.visible = local >= 3.5 && local < 4.5
    crops.forEach((group, i) => {
      const age = (t - (i * 6 + 3) + 24) % 24
      const stage = age < 1 ? -1 : Math.min(7, Math.floor((age - 1) / 1.8))
      group.visible = stage >= 0
      if (stage >= 0) group.traverse((node) => { if (node instanceof THREE.Mesh) node.material = m.crops[stage] })
    })
    debris.forEach((mesh, i) => {
      const burst = t >= 3 && t < 6.35 ? (t - 3) % 1 : 1
      mesh.visible = burst < 0.35
      const angle = i * 2.4
      mesh.position.set(-2 + Math.cos(angle) * burst * 2, Math.floor(t - 3) + 0.6 + burst * 2 - burst * burst * 8, -1 + Math.sin(angle) * burst * 2)
    })
  }
}

/** The built-in scripts the scripts island can play, in the order the page lists them. */
export const SCRIPTS = ["kit", "gkit", "upgrade", "afk", "scanner", "books"] as const
export type ScriptName = (typeof SCRIPTS)[number]

/**
 * Scripts: JNbot runs whichever built-in script the visitor picks, on a pier
 * with three chests and you (the main account) waiting at the end.
 */
function kitsIsland(kit: Kit, parent: THREE.Object3D, state: { script: ScriptName; since: number }) {
  const { m } = kit
  // A long, narrow pier with a plank walkway, unlike the square home island.
  kit.terrain(parent, kit.rect(-5, 5, -3, 1), (x, z) => (z === -1 && x >= -4 && x <= 4 ? m.planks : m.grass), 2)
  kit.torch(parent, -4, -2)
  kit.torch(parent, 5, 0)
  for (const [x, z] of [[-4, 0], [-1, 1], [4, -2]]) kit.cross(parent, x, 0, z, m.tuft, 0.75)
  kit.cross(parent, -2, 0, 1, m.poppy, 0.75)
  const chestX = [-3, -1, 1]
  const lids = chestX.map((x) => kit.chest(parent, x, -2))
  const loot = chestX.map(() => kit.item(parent, m.diamond, 0.42))
  const handed = [0, 1, 2].map(() => kit.item(parent, m.diamond, 0.36))
  const runner = kit.bot(parent, "JNbot")
  const you = kit.bot(parent, "You", m.player)
  you.body.position.set(3.4, 0, -1)
  you.body.rotation.y = -Math.PI / 2
  // Two alts only the alt scanner needs.
  const alts = [kit.bot(parent, "alt_1"), kit.bot(parent, "alt_2")]
  alts[0].body.position.set(-2, 0, 0.2)
  alts[1].body.position.set(0, 0, 0.2)
  const ranks = alts.map(() => kit.item(parent, m.star, 0.38))

  /** Piecewise-linear walk along the walkway (z = -1) through [time, x] keys. */
  const walk = (keys: [number, number][], t: number) => {
    for (let i = 1; i < keys.length; i++) {
      const [t0, x0] = keys[i - 1]
      const [t1, x1] = keys[i]
      if (t <= t1) {
        const k = THREE.MathUtils.clamp((t - t0) / (t1 - t0), 0, 1)
        return { x: x0 + (x1 - x0) * k, moving: x0 !== x1 && k > 0 && k < 1, dir: Math.sign(x1 - x0) }
      }
    }
    return { x: keys[keys.length - 1][1], moving: false, dir: 0 }
  }
  const face = (rig: Rig, w: { moving: boolean; dir: number }, still: number) => {
    rig.body.rotation.y = w.moving ? (w.dir > 0 ? Math.PI / 2 : -Math.PI / 2) : still
  }
  const reset = () => {
    lids.forEach((lid) => { lid.rotation.x = 0 })
    ;[...loot, ...handed, ...ranks].forEach((mesh) => { mesh.visible = false })
    alts.forEach((rig) => { rig.body.visible = false })
    runner.tool.visible = false
    runner.body.position.y = 0
    runner.head.rotation.set(0, 0, 0)
  }
  const openChest = (i: number, t: number, from: number, item: THREE.Material) => {
    const open = smooth(from, from + 0.25, t) * (1 - smooth(from + 1, from + 1.3, t))
    lids[i].rotation.x = Math.min(lids[i].rotation.x, -open * 1.25)
    const life = t - from - 0.2
    if (life > 0 && life < 1.1) {
      loot[i].visible = true
      loot[i].material = item
      loot[i].position.set(chestX[i], 0.9 + life * 0.8, -2)
      loot[i].scale.setScalar(0.42 * Math.min(1, life * 4))
    }
  }

  // Collect from each chest, then hand everything to you.
  const collect = (t: number, seconds: number, item: THREE.Material) => {
    const w = walk([[0, -3], [1.3, -3], [2, -1], [3.3, -1], [4, 1], [5.3, 1], [6, 2.4], [7.6, 2.4], [9.2, -3], [10, -3]], t)
    runner.body.position.set(w.x, 0, -1)
    face(runner, w, t > 5.9 && t < 7.7 ? Math.PI / 2 : Math.PI)
    chestX.forEach((_, i) => openChest(i, t, i * 2, item))
    kit.pose(runner, seconds, (t % 2 > 0.1 && t % 2 < 0.5) && t < 6, w.moving)
    handed.forEach((mesh, i) => {
      const life = t - 6.1 - i * 0.35
      mesh.visible = life > 0 && life < 0.7
      mesh.material = item
      const k = THREE.MathUtils.clamp(life / 0.7, 0, 1)
      mesh.position.set(2.6 + k * 0.8, 1.2 + Math.sin(k * Math.PI) * 0.6, -1)
    })
  }

  const LOOP: Record<ScriptName, number> = { kit: 10, gkit: 10, upgrade: 9, afk: 6, scanner: 8, books: 9 }
  const play: Record<ScriptName, (t: number, seconds: number) => void> = {
    kit: (t, seconds) => collect(t, seconds, m.diamond),
    gkit: (t, seconds) => collect(t, seconds, m.star),
    // Upgrade each gkit in turn: the star rises, turns and grows.
    upgrade: (t, seconds) => {
      const slot = Math.floor(t / 3) % 3
      const local = t % 3
      const prev = (slot + 2) % 3
      const w = walk([[0, chestX[prev]], [0.7, chestX[slot]]], local)
      runner.body.position.set(w.x, 0, -1)
      face(runner, w, Math.PI)
      kit.pose(runner, seconds, local > 0.8 && local < 1.2, w.moving)
      openChest(slot, local, 0.8, m.star)
      const life = local - 1.1
      if (life > 0 && life < 1.8) {
        const mesh = loot[slot]
        mesh.visible = true
        mesh.position.set(chestX[slot], 1.5 + Math.min(life, 0.6) * 0.5, -2)
        mesh.scale.setScalar(0.42 + smooth(0.5, 1.2, life) * 0.3)
      }
    },
    // Stand in place and keep the session alive: a hop and a look around now and then.
    afk: (t, seconds) => {
      const w = walk([[0, -1], [0.1, -1]], t)
      runner.body.position.set(w.x, Math.max(0, Math.sin(((t % 3) / 0.45) * Math.PI)) * 0.5 * (t % 3 < 0.45 ? 1 : 0), -1)
      runner.body.rotation.y = Math.PI / 2 + Math.sin(seconds * 0.5) * 0.4
      runner.head.rotation.y = Math.sin(seconds * 0.9) * 0.5
      kit.pose(runner, seconds, false, false)
    },
    // Walk past each alt; a star pops over each one as its rank is found.
    scanner: (t, seconds) => {
      alts.forEach((rig) => { rig.body.visible = true; kit.pose(rig, seconds, false, false); rig.body.rotation.y = 0.3 })
      const w = walk([[0, -4], [1, -2], [2.2, -2], [3, 0], [4.2, 0], [5, 2.4], [6.5, 2.4], [8, -4]], t)
      runner.body.position.set(w.x, 0, -1)
      face(runner, w, 0)
      runner.head.rotation.x = 0.3
      kit.pose(runner, seconds, false, w.moving)
      ranks.forEach((mesh, i) => {
        const life = t - (1.1 + i * 2)
        mesh.visible = life > 0 && t < 7.8
        mesh.position.set(alts[i].body.position.x, 2.95 + Math.min(life, 0.4) * 0.5, 0.2)
      })
    },
    // Carry books from the first chest into the other two, one at a time.
    books: (t, seconds) => {
      const local = t % 4.5
      const target = Math.floor(t / 4.5) % 2 === 0 ? 1 : 2
      const w = walk([[0, -3], [1.2, -3], [2.4, chestX[target]], [3.5, chestX[target]], [4.5, -3]], local)
      runner.body.position.set(w.x, 0, -1)
      face(runner, w, Math.PI)
      kit.pose(runner, seconds, false, w.moving)
      openChest(0, local, 0.1, m.book)
      runner.tool.visible = local > 1 && local < 2.6
      runner.tool.material = m.book
      const open = smooth(2.4, 2.6, local) * (1 - smooth(3.2, 3.5, local))
      lids[target].rotation.x = -open * 1.25
    },
  }

  return (seconds: number) => {
    reset()
    const t = Math.max(0, seconds - state.since)
    play[state.script](t % LOOP[state.script], seconds)
    you.head.rotation.y = Math.sin(seconds * 0.6) * 0.3
  }
}

/** Accounts: six accounts drop in and line up, each under its own name tag. 12s loop. */
function accountsIsland(kit: Kit, parent: THREE.Object3D) {
  const { m } = kit
  kit.terrain(parent, kit.disc(4), () => m.grass, 3)
  for (const [x, z] of [[-4, -1], [3, 2], [-1, 3], [2, -3]]) kit.cross(parent, x, 0, z, m.tuft, 0.75)
  kit.torch(parent, 0, 3)
  kit.torch(parent, -3, -2)
  const names = ["Zola", "usserwout", "EnisTV", "MuliGG", "MoudTage_", "LogicielX"]
  const spots: [number, number][] = [[-2.4, -1.2], [0, -1.2], [2.4, -1.2], [-2.4, 1.4], [0, 1.4], [2.4, 1.4]]
  const crew = names.map((name, i) => {
    const rig = kit.bot(parent, name)
    rig.body.position.set(spots[i][0], 0, spots[i][1])
    return { rig, puff: kit.puff(parent) }
  })
  return (seconds: number) => {
    const t = seconds % 12
    crew.forEach(({ rig, puff }, i) => {
      // Join and leave the way players do: appear in a puff, vanish in a puff.
      const arrive = 0.4 + i * 0.55
      const leave = 10.6 + i * 0.15
      rig.body.visible = t >= arrive && t < leave
      const [x, , z] = rig.body.position.toArray()
      puff(x, z, t < 6 ? (t - arrive) / 0.6 : (t - leave) / 0.6)
      rig.body.rotation.y = Math.sin(seconds * 0.35 + i * 1.7) * 0.35
      rig.head.rotation.y = Math.sin(seconds * 0.6 + i * 2.3) * 0.4
      kit.pose(rig, seconds, false, false)
    })
  }
}

/** Record and replay: you walk a route and open a chest; the bot repeats it exactly. 14s loop. */
const ROUTE: [number, number][] = [[-3, 2], [-3, -1], [0, -1], [0, 1], [2.6, 1], [2.6, -1.1]]
export const REPLAY_PERIOD = 14
function replayIsland(kit: Kit, parent: THREE.Object3D) {
  const { m } = kit
  kit.terrain(parent, kit.rect(-4, 4, -3, 3).filter(([x, z]) => !(x <= -2 && z <= -2) && !(x >= 3 && z >= 2)), () => m.grass, 4)
  for (const [x, z] of [[-1, -3], [4, 0], [-4, 0], [1, 3]]) kit.cross(parent, x, 0, z, m.tuft, 0.75)
  kit.cross(parent, -1, 0, 3, m.poppy, 0.75)
  kit.torch(parent, 4, -2)
  kit.torch(parent, -4, 3)
  const lid = kit.chest(parent, 2.6, -2.1)
  // Footprints along the route, dropped while recording and lit while replaying.
  const length = pathLength(ROUTE)
  const steps = Array.from({ length: Math.floor(length / 0.5) }, (_, i) => {
    const spot = along(ROUTE, i * 0.5 + 0.25)
    const mark = kit.cube(parent, spot.x, 0.01, spot.z, m.footprint, [0.16, 0.02, 0.16])
    return { mark, at: i * 0.5 + 0.25 }
  })
  const you = kit.bot(parent, "You", m.player)
  const bot = kit.bot(parent, "JNbot")
  const speed = 2.6
  const walk = length / speed
  const act = (rig: Rig, local: number, seconds: number) => {
    const spot = along(ROUTE, Math.max(0, local) * speed)
    rig.body.position.set(spot.x, 0, spot.z)
    rig.body.rotation.y = spot.yaw
    kit.pose(rig, seconds, local > walk && local < walk + 0.6, spot.moving && local >= 0)
    rig.head.rotation.x = local > walk ? 0.4 : 0
    return local > walk + 0.2 && local < walk + 1.6
  }
  return (seconds: number) => {
    const t = seconds % REPLAY_PERIOD
    const recording = t < 7
    you.body.visible = recording
    bot.body.visible = !recording
    const open = act(recording ? you : bot, recording ? t - 0.5 : t - 7.5, seconds)
    lid.rotation.x = open ? -1.2 : 0
    const travelled = (recording ? t - 0.5 : t - 7.5) * speed
    steps.forEach(({ mark, at }) => {
      const replayed = !recording && at <= travelled
      mark.visible = recording ? at <= travelled : true
      mark.material = replayed ? m.trail : m.footprint
      const size = replayed ? 0.22 : 0.16
      mark.scale.set(size, 0.02, size)
    })
  }
}

/** Plugins: a bot mines a seam of diamond ore with a pickaxe. 10s loop. */
function mineIsland(kit: Kit, parent: THREE.Object3D) {
  const { m } = kit
  const cells = kit.rect(-4, 4, -3, 3)
  kit.terrain(parent, cells, (x, z) => (z <= -2 || x <= -3 ? m.stone : m.grass), 5)
  // A stone outcrop with a seam of ore facing the camera.
  const ores: THREE.Mesh[] = []
  for (let x = -3; x <= 3; x++) for (let y = 0; y < (x === 3 || x === -3 ? 2 : 3); y++) {
    const isOre = (x === 0 && y === 0) || (x === 1 && y === 1) || (x === -1 && y === 0)
    const mesh = kit.cube(parent, x, y + 0.5, -2, isOre ? m.ore : m.stone)
    if (isOre) ores.push(mesh)
  }
  for (let z = -1; z <= 1; z++) for (let y = 0; y < 2 - Math.abs(z); y++) kit.cube(parent, -3, y + 0.5, z, m.stone)
  for (const [x, z] of [[3, 2], [4, 0], [1, 3]]) kit.cross(parent, x, 0, z, m.tuft, 0.75)
  kit.torch(parent, 2, -1)
  kit.torch(parent, -2, 2)
  const miner = kit.bot(parent, "Miner")
  miner.tool.material = m.pickaxe
  miner.tool.visible = true
  const drops = ores.map(() => kit.item(parent, m.diamond, 0.4))
  const order = [2, 0, 1] // left, centre, upper
  return (seconds: number) => {
    const t = seconds % 10
    const turn = Math.min(Math.floor(t / 3), 2)
    const local = t - turn * 3
    const target = ores[order[turn]]
    const standX = target.position.x
    const prevX = turn === 0 ? ores[order[2]].position.x : ores[order[turn - 1]].position.x
    const travel = smooth(0, 0.7, local)
    miner.body.position.set(THREE.MathUtils.lerp(prevX, standX, travel), 0, -0.85)
    miner.body.rotation.y = local < 0.7 && standX !== prevX ? (standX > prevX ? Math.PI / 2 : -Math.PI / 2) : Math.PI
    const mining = local > 0.8 && local < 2.2
    kit.pose(miner, seconds, mining, local < 0.7 && standX !== prevX)
    miner.head.rotation.x = target.position.y > 1 ? -0.25 : 0.35
    ores.forEach((ore, i) => {
      const step = order.indexOf(i)
      ore.visible = t > 9.6 || step > turn || (step === turn && local < 2.2)
      const shake = step === turn && mining ? Math.sin(seconds * 40) * 0.02 : 0
      ore.scale.setScalar(1 - shake)
    })
    drops.forEach((mesh, i) => {
      const step = order.indexOf(i)
      const life = step === turn ? local - 2.2 : step < turn ? 3 : -1
      mesh.visible = life > 0 && life < 0.8 && t < 9.6
      const ore = ores[i]
      mesh.position.set(ore.position.x, ore.position.y - 0.2 + Math.sin(life * 4) * 0.2, -1.4)
    })
  }
}

// Feature tags are read from the pulled-back camera, so they are drawn much larger than bot tags.
const TAG_SIZE = 2.5

/** The hub: an iron pedestal and a beacon whose amber beam carries the feature tags. */
function hubIsland(kit: Kit, parent: THREE.Object3D) {
  const { m } = kit
  kit.terrain(parent, kit.disc(2), () => m.grass, 6)
  for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) kit.cube(parent, x, 0.5, z, m.iron)
  kit.cube(parent, 0, 1.5, 0, m.beacon, [0.92, 0.92, 0.92])
  const beam = kit.cube(parent, 0, 2, 0, m.beam, [0.36, 1, 0.36])
  const halo = kit.cube(parent, 0, 2, 0, m.halo, [0.8, 1, 0.8])
  const tags = FEATURE_TAGS.map((text, i) => {
    const tag = kit.nameTag(text)
    const side = i % 2 ? 1 : -1
    tag.position.copy(SCREEN_RIGHT).multiplyScalar(side * (0.9 + tag.userData.width * TAG_SIZE * 0.5))
    tag.position.y = 4.4 + i * 1.75
    tag.scale.multiplyScalar(TAG_SIZE)
    parent.add(tag)
    return tag
  })
  /** `rise` 0..1 grows the beam; `lit` is the highlighted feature, or -1. Tags are hidden when `labels` is off. */
  return (rise: number, lit: number, labels: boolean) => {
    const height = 60 * smooth(0, 1, rise)
    for (const mesh of [beam, halo]) {
      mesh.visible = height > 0.05
      mesh.scale.y = Math.max(height, 0.01)
      mesh.position.y = 2 + height / 2
    }
    tags.forEach((tag, i) => {
      const shown = smooth(0.35 + i * 0.08, 0.55 + i * 0.08, rise)
      tag.visible = labels && shown > 0.01
      tag.material.opacity = shown * (lit < 0 || lit === i ? 1 : 0.35)
      const grow = lit === i ? 1.12 : 1
      tag.scale.y = 0.42 * TAG_SIZE * grow
      tag.scale.x = tag.userData.width * TAG_SIZE * grow
    })
  }
}

export const STATIONS = [homeIsland, kitsIsland, accountsIsland, replayIsland, mineIsland]

export function createDiorama(maps: Map<string, THREE.Texture>) {
  const kit = createKit(maps)
  const root = new THREE.Group()
  const script = { script: "kit" as ScriptName, since: 0 }
  const islands = STATIONS.map((build, i) => {
    const group = new THREE.Group()
    group.position.copy(STATION_CENTRES[i])
    root.add(group)
    return { group, update: build(kit, group, script), base: STATION_CENTRES[i].y }
  })
  const hub = new THREE.Group()
  hub.position.copy(ARCHIPELAGO_CENTRE)
  root.add(hub)
  const updateHub = hubIsland(kit, hub)

  /**
   * `focus` is the fractional station in view (up to FINALE); islands further than
   * `reach` stations away are not drawn. Past the last island they gather around
   * the hub. `lit` highlights one feature tag on the beam; `labels` turns the tags off
   * where they would be too small to read.
   */
  function update(seconds: number, focus = 0, reach = 0.98, lit = -1, labels = true) {
    const gather = smooth(0, 0.8, focus - (STATION_COUNT - 1))
    islands.forEach(({ group, update }, i) => {
      group.visible = gather > 0 || Math.abs(i - focus) < reach
      if (!group.visible) return
      group.position.lerpVectors(STATION_CENTRES[i], gatheredAt(i), gather)
      group.position.y += Math.sin(seconds * 0.6 + i * 1.3) * 0.12
      update(seconds)
    })
    hub.visible = gather > 0.4
    hub.scale.setScalar(smooth(0.4, 0.8, gather))
    hub.position.y = ARCHIPELAGO_CENTRE.y + Math.sin(seconds * 0.6 + 5) * 0.12
    updateHub(smooth(0.75, 1, gather), lit, labels)
    if (kit.waterMap) kit.waterMap.offset.y = (Math.floor(seconds * 8) % 32) / 32
  }
  update(0)
  /** Start a built-in script on the scripts island from its first step. */
  const setScript = (name: ScriptName, seconds: number) => { script.script = name; script.since = seconds }
  return { root, update, setScript, dispose: kit.dispose }
}
