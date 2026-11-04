# Diorama

The homepage is one sky of floating islands. `Diorama.tsx` renders a sticky full-viewport stage and five station sections that scroll over it; `DioramaCanvas.tsx` moves an orthographic camera to the island of the station in view; `world.ts` builds every island and animates it from a single clock.

| Station | Island | Loop |
| --- | --- | --- |
| `#top` | Lumberjack fells and replants an oak, farmer harvests wheat | 24s |
| `#scripts` | JNbot runs the script picked on the page (kit, GKit, GKit upgrader, AFK, alt scanner, book sorter) and hands loot to "You" | 6–10s per script |
| `#accounts` | Six named accounts appear and leave in a puff, as players do | 12s |
| `#replay` | "You" walks a route and opens a chest; JNbot repeats it on the lit footprints | 14s |
| `#plugins` | Miner digs three diamond ores | 10s |

A sixth station, `#more`, is the finale: the camera pulls back while the five islands gather around a beacon hub (`GATHERED` offsets in screen space), and the beam carries the feature names as tags. Hovering a feature row on the page lights its tag through the `lit` ref.

Islands sit on `STATION_CENTRES`, stepping down the screen. Scroll progress is measured from each section's real position, so a tall section holds its island longer. On desktop the island sits right of the copy; under 900px it sits above it.

All bots are illustrations; no scene shows a real server. Name tags are canvas sprites drawn on top of the world, like the game's.

The canvas loads when the stage nears the viewport, renders on demand at 30Hz while visible, and stops when hidden, paused or under reduced motion (the camera then jumps between islands without easing). `public/minecraft/world-poster.png` shows until the first frame and returns if WebGL fails.

Textures are the original set from `scripts/minecraft-textures.py`; see `public/minecraft/world/SOURCES.md`.
