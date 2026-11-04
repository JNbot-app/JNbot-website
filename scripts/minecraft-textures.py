"""Draws JNbot's own Minecraft-style textures.

Every sprite here is original pixel art, so the site does not ship Mojang's
assets. File names match what the scenes already load, so regenerating is all
it takes to change a texture:

    python3 scripts/minecraft-textures.py

Textures that the scene tints (grass, leaves, tufts, water) are drawn in
grayscale; the scene multiplies them by a biome colour.
"""

import math
import random
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "public" / "minecraft"
WORLD = ROOT / "world"
ITEMS = ROOT / "items"
CLEAR = (0, 0, 0, 0)


def hexc(value, alpha=255):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def canvas(w=16, h=16):
    return Image.new("RGBA", (w, h), CLEAR)


def sprite(rows, palette):
    """Hand-drawn sprite: one character per pixel, '.' is transparent."""
    assert len(rows) == 16 and all(len(r) == 16 for r in rows), rows
    img = canvas()
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch != ".":
                img.putpixel((x, y), hexc(palette[ch]))
    return img


def noise_tile(seed, shades, cluster=2, weights=None):
    """Chunky noise: picks a shade per cell, then breaks the grid up a little."""
    rnd = random.Random(seed)
    img = canvas()
    cells = {}
    for y in range(16):
        for x in range(16):
            key = (x // cluster, y // cluster)
            if key not in cells or rnd.random() < 0.28:
                cells[key] = rnd.choices(shades, weights=weights)[0]
            img.putpixel((x, y), hexc(cells[key]))
    return img


def gray(v, alpha=255):
    v = max(0, min(255, int(v)))
    return (v, v, v, alpha)


def save(img, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)


# ---------------------------------------------------------------- blocks

def dirt(seed=11):
    img = noise_tile(seed, ["#86603f", "#795536", "#6c4a2e", "#916b48"], weights=[4, 4, 2, 1])
    rnd = random.Random(seed + 1)
    for _ in range(7):  # pebbles
        x, y = rnd.randrange(16), rnd.randrange(16)
        img.putpixel((x, y), hexc(rnd.choice(["#a3845f", "#54391f"])))
    return img


def stone(seed=21):
    rnd = random.Random(seed)
    img = canvas()
    for y in range(16):
        for x in range(16):
            img.putpixel((x, y), gray(124 + rnd.choice([-10, -4, 0, 0, 6, 10])))
    # a few hairline cracks give it structure without copying any layout
    for sx, sy, length in [(2, 3, 5), (9, 1, 4), (5, 10, 6), (12, 8, 4), (1, 13, 3)]:
        for i in range(length):
            img.putpixel(((sx + i) % 16, (sy + (i // 2)) % 16), gray(96))
            img.putpixel(((sx + i) % 16, (sy + (i // 2) + 1) % 16), gray(146))
    return img


def grass_top(seed=31):
    rnd = random.Random(seed)
    img = canvas()
    for y in range(16):
        for x in range(16):
            v = 168 + 22 * math.sin(x * 1.3 + y * 0.7) * math.cos(y * 1.1 - x * 0.4)
            img.putpixel((x, y), gray(v + rnd.choice([-14, -6, 0, 6, 12])))
    return img


def grass_side_overlay(seed=41):
    rnd = random.Random(seed)
    img = canvas()
    for x in range(16):
        depth = 3 + rnd.choice([0, 0, 1, 1, 2]) + (1 if x % 5 == 2 else 0)
        for y in range(depth):
            img.putpixel((x, y), gray(176 + rnd.choice([-16, -8, 0, 8])))
    return img


def grass_side():
    img = dirt(seed=12)
    overlay = grass_side_overlay()
    # under the fringe, darken the dirt so the edge reads as soil meeting turf
    for x in range(16):
        for y in range(16):
            if overlay.getpixel((x, y))[3]:
                img.putpixel((x, y), hexc("#5b3f25"))
    return img


def farmland(seed=51):
    img = noise_tile(seed, ["#4f3520", "#5a3d25", "#46301c"], cluster=1)
    for y in (1, 5, 9, 13):  # furrows
        for x in range(16):
            img.putpixel((x, y), hexc("#2f1f11"))
            img.putpixel((x, y + 1), hexc("#3a2716"))
    return img


def oak_log(seed=61):
    rnd = random.Random(seed)
    img = canvas()
    bark = ["#6a4e2c", "#5c4326", "#4c371f", "#735630"]
    for x in range(16):
        base = bark[(x * 7 + seed) % len(bark)]
        for y in range(16):
            c = base if rnd.random() > 0.18 else rnd.choice(bark)
            img.putpixel((x, y), hexc(c))
    for x in (3, 8, 13):  # deep grooves
        for y in range(16):
            if (y + x) % 7 != 0:
                img.putpixel((x, y), hexc("#3b2a17"))
    return img


def oak_log_top():
    img = canvas()
    for y in range(16):
        for x in range(16):
            r = max(abs(x - 7.5), abs(y - 7.5))
            if r > 6.5:
                c = "#5c4326"
            elif int(r) % 2 == 0:
                c = "#b8925a"
            else:
                c = "#9e7a45"
            img.putpixel((x, y), hexc(c))
    return img


def oak_leaves(seed=71):
    rnd = random.Random(seed)
    img = canvas()
    for y in range(16):
        for x in range(16):
            if rnd.random() < 0.14:
                continue  # holes, cut out by the scene's alpha test
            img.putpixel((x, y), gray(rnd.choice([118, 136, 150, 164, 180])))
    return img


def water_strip(frames=32):
    img = canvas(16, 16 * frames)
    for f in range(frames):
        t = f / frames * math.tau
        for y in range(16):
            for x in range(16):
                wave = math.sin(x * 0.55 + y * 0.35 + t) + math.sin(y * 0.8 - x * 0.2 - t * 2)
                v = 196 + 18 * wave
                if wave > 1.45:
                    v = 236  # glints
                img.putpixel((x, f * 16 + y), gray(v))
    return img


# ---------------------------------------------------------------- plants

def short_grass():
    img = canvas()
    blades = [(2, 9), (4, 12), (6, 7), (8, 11), (10, 8), (12, 13), (14, 6)]
    for i, (x, h) in enumerate(blades):
        lean = 1 if i % 2 else -1
        for k in range(h):
            px = x + (lean if k > h * 0.6 else 0)
            img.putpixel((max(0, min(15, px)), 15 - k), gray(140 + k * 5))
    return img


def poppy():
    return sprite(
        [
            "................",
            "................",
            "................",
            "......RR.R......",
            ".....RrrRrR.....",
            "....RrrkkrrR....",
            ".....RrkkrR.....",
            "......RRrR......",
            ".......gg.......",
            ".......g........",
            ".....llg........",
            "......lgg.......",
            ".......g.ll.....",
            ".......gl.......",
            ".......g........",
            ".......g........",
        ],
        {"R": "#9e2a22", "r": "#d8463a", "k": "#2a1a12", "g": "#3f7a2a", "l": "#5a9a38"},
    )


def oak_sapling():
    return sprite(
        [
            "................",
            "................",
            "......llL.......",
            "....lLLgLll.....",
            "...lLggLLgLl....",
            "...LgLLlgLLg....",
            "....LLgLLgL.....",
            "...lgL.b.LLl....",
            "....Ll.b.lL.....",
            ".......b........",
            ".......bb.......",
            "......lb........",
            "......Lb........",
            ".......b........",
            ".......b........",
            ".......b........",
        ],
        {"l": "#6fae3c", "L": "#4f8f2c", "g": "#36701f", "b": "#6a4e2c"},
    )


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(4))


def wheat_stage(stage):
    img = canvas()
    green, ripe = hexc("#4f9a2a"), hexc("#d8b23a")
    tone = lerp(green, ripe, max(0, stage - 3) / 4)
    dark = lerp(tone, hexc("#2b2a12"), 0.35)
    height = 2 + round(stage * 1.6)
    for i, x in enumerate((1, 4, 7, 10, 13)):
        h = max(1, height - (i % 2) * 2)
        for k in range(h):
            img.putpixel((x, 15 - k), tone)
            if k % 3 == 1 and x + 1 < 16:
                img.putpixel((x + 1, 15 - k), dark)
        if stage >= 5:  # grain heads
            for k in range(min(4, h)):
                img.putpixel((x - 1 if x else x, 16 - h + k), lerp(tone, hexc("#f2d27a"), 0.4))
    return img


def wheat_seeds():
    img = canvas()
    for x, y in [(5, 8), (8, 6), (10, 9), (7, 10), (4, 11), (9, 12), (11, 7)]:
        img.putpixel((x, y), hexc("#7da23a"))
        img.putpixel((x + 1, y), hexc("#4c6e22"))
    return img


# ---------------------------------------------------------------- items

GEM = {"o": "#103a3a", "a": "#a8fff0", "b": "#55e0cc", "c": "#2fb3a6", "d": "#2a8f88"}


def tool(head_rows):
    handle = {"h": "#8a5d2e", "H": "#5c3b1a"}
    rows = [list(r) for r in head_rows]
    for i in range(10):  # diagonal handle, bottom-left to centre
        x, y = 2 + i, 13 - i
        if rows[y][x] == ".":
            rows[y][x] = "h"
        if rows[y + 1][x] == ".":
            rows[y + 1][x] = "H"
    return sprite(["".join(r) for r in rows], {**GEM, **handle})


def pickaxe():
    return tool(
        [
            "................",
            "....oooooo......",
            "...oabbbbbco....",
            "....oooooobbo...",
            "..........obco..",
            "..........ocbo..",
            "...........obco.",
            "...........ocdo.",
            "...........ocdo.",
            "............oo..",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
        ]
    )


def axe():
    return tool(
        [
            "................",
            "........ooo.....",
            ".......oabbo....",
            "......oabbbco...",
            "......obbbbcco..",
            ".......obbccdo..",
            "........occdo...",
            ".........ooo....",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
        ]
    )


def diamond():
    return sprite(
        [
            "................",
            "................",
            "................",
            "....oooooooo....",
            "...oaabbbbcco...",
            "..oaabbbbbbcco..",
            ".oaaabbbbbbccco.",
            ".oooooooooooooo.",
            "..oddbbbbbbcco..",
            "...oddbbbbcco...",
            "....oddbbcco....",
            ".....odbbco.....",
            "......odco......",
            ".......oo.......",
            "................",
            "................",
        ],
        GEM,
    )


def chest():
    return sprite(
        [
            "................",
            "................",
            ".##############.",
            ".#oooooooooooo#.",
            ".#oLLLLLLLLLLo#.",
            ".#oLLLLLLLLLLo#.",
            ".#oLLLLyyLLLLo#.",
            ".######yY######.",
            ".#oDDDDyYDDDDo#.",
            ".#oDDDDDDDDDDo#.",
            ".#oDDDDDDDDDDo#.",
            ".#oDDDDDDDDDDo#.",
            ".#oDDDDDDDDDDo#.",
            ".#oooooooooooo#.",
            ".##############.",
            "................",
        ],
        {"#": "#2a1a0c", "o": "#6b4423", "L": "#b07a3c", "D": "#965f2c", "y": "#f6bd00", "Y": "#a57e00"},
    )


def book():
    return sprite(
        [
            "................",
            "................",
            "...###########..",
            "..#cccccccccc#w.",
            "..#cCCCCCCCCc#w.",
            "..#cCyyyyyyCc#w.",
            "..#cCCCCCCCCc#w.",
            "..#cCyyyyCCCc#w.",
            "..#cCCCCCCCCc#w.",
            "..#cCCCCCCCCc#w.",
            "..#cCCCCCCCCc#w.",
            "..#cCCCCCCCCc#w.",
            "..#cccccccccc#w.",
            "..###########ww.",
            "...wwwwwwwwwwww.",
            "................",
        ],
        {"#": "#24140d", "c": "#6a2a22", "C": "#8c3a2c", "y": "#f6bd00", "w": "#e8e0c8"},
    )


def star():
    img = canvas()
    for y in range(16):
        for x in range(16):
            dx, dy = abs(x - 7.5), abs(y - 7.5)
            arm = min(dx + dy * 3.2, dy + dx * 3.2)
            if arm <= 8.2:
                t = arm / 8.2
                c = lerp(hexc("#fffbe8"), hexc("#f6bd00"), min(1, t * 1.4))
                img.putpixel((x, y), c)
            elif arm <= 9.6:
                img.putpixel((x, y), hexc("#5c4600"))
    return img


def clock():
    img = canvas()
    for y in range(16):
        for x in range(16):
            r = math.hypot(x - 7.5, y - 7.5)
            if r > 7.4:
                continue
            if r > 6.4:
                c = "#4a3600"
            elif r > 5.2:
                c = "#f6bd00" if (x + y) % 5 else "#ffd34a"
            else:
                c = "#f3ead2"
            img.putpixel((x, y), hexc(c))
    for k in range(4):  # hands at ten past
        img.putpixel((7, 7 - k), hexc("#2a2a2a"))
    for k in range(3):
        img.putpixel((8 + k, 8), hexc("#2a2a2a"))
    return img


def wheat_bundle():
    img = canvas()
    stalk, grain, dark = hexc("#b08d3a"), hexc("#e4c25a"), hexc("#6e5420")
    for tip_x, tip_y in [(9, 2), (12, 4), (6, 4)]:
        for i in range(11):
            t = i / 10
            x = round(4 + (tip_x - 4) * t)
            y = round(14 + (tip_y - 14) * t)
            img.putpixel((x, y), grain if t > 0.62 else stalk)
            if t > 0.62 and x + 1 < 16:
                img.putpixel((x + 1, y), dark)
    for x in range(3, 7):  # tie
        img.putpixel((x, 11), hexc("#f6bd00"))
    return img


# ---------------------------------------------------------------- scenes
# Pre-tinted variants for scenes that cannot tint textures themselves (the
# 2D demos in CSS and the 404 scene).

def tint(img, colour):
    r0, g0, b0, _ = hexc(colour)
    out = img.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            px[x, y] = (r * r0 // 255, g * g0 // 255, b * b0 // 255, a)
    return out


def grass_side_tinted():
    img = grass_side()
    img.alpha_composite(tint(grass_side_overlay(), "#91bd59"))
    return img


def oak_planks(seed=81):
    rnd = random.Random(seed)
    img = canvas()
    for y in range(16):
        for x in range(16):
            v = rnd.choice(["#a07a45", "#9a7441", "#a8824b"])
            img.putpixel((x, y), hexc(v))
    for y in (3, 7, 11, 15):  # board seams
        for x in range(16):
            img.putpixel((x, y), hexc("#6b4f2b"))
    for y, x in [(0, 5), (1, 5), (2, 5), (4, 12), (5, 12), (6, 12), (8, 3), (9, 3), (10, 3), (12, 9), (13, 9), (14, 9)]:
        img.putpixel((x, y), hexc("#6b4f2b"))
    return img


def diamond_ore():
    img = stone(seed=22).convert("RGBA")
    gems = [(3, 3), (10, 2), (6, 7), (12, 9), (2, 11), (8, 12)]
    for x, y in gems:
        img.putpixel((x, y), hexc("#a8fff0"))
        img.putpixel((x + 1, y), hexc("#55e0cc"))
        img.putpixel((x, y + 1), hexc("#2fb3a6"))
        img.putpixel((x + 1, y + 1), hexc("#1d6f68"))
    return img


# ---------------------------------------------------------------- skin

def skin():
    """The JNbot bot: yellow shirt after the app icon, slate trousers."""
    img = Image.new("RGBA", (64, 64), CLEAR)

    def fill(u, v, w, h, d, colour):
        # paints all six faces of a cuboid in the 64x64 player-skin layout
        for x in range(u + d, u + d + w * 2):
            for y in range(v, v + d):
                face = "top" if x - u - d < w else "bottom"
                img.putpixel((x, y), colour(x - u - d, y - v, face))
        for x in range(u, u + 2 * (w + d)):
            for y in range(v + d, v + d + h):
                img.putpixel((x, y), colour(x - u, y - v - d, "side"))

    face, hair = hexc("#c49772"), hexc("#3a2a1e")
    shirt, shirt_dark = hexc("#d2a418"), hexc("#a97f13")
    pants, shoes = hexc("#424f63"), hexc("#23282f")

    def head(x, y, side):
        if side != "side":
            return hair
        front = 8 <= x < 16
        if not front or y < 2:
            return hair
        if y == 4 and x - 8 in (1, 2, 5, 6):
            return hexc("#ffffff") if x - 8 in (1, 5) else hexc("#22262c")
        if y == 6 and 3 <= x - 8 <= 4:
            return hexc("#9c6d4f")
        return face

    def body(x, y, side):
        if side != "side":
            return shirt_dark
        return shirt_dark if y == 0 or (4 <= x < 12 and y >= 10) else shirt

    def arm(x, y, side):
        if side == "bottom":
            return face
        if side == "top":
            return shirt
        return face if y >= 8 else (shirt_dark if x % 4 == 3 else shirt)

    def leg(x, y, side):
        return shoes if side != "side" or y >= 10 else pants

    fill(0, 0, 8, 8, 8, head)
    fill(16, 16, 8, 12, 4, body)
    fill(40, 16, 4, 12, 4, arm)
    fill(32, 48, 4, 12, 4, arm)
    fill(0, 16, 4, 12, 4, leg)
    fill(16, 48, 4, 12, 4, leg)
    return img


def main():
    blocks = {
        "dirt": dirt(),
        "stone": stone(),
        "grass_block_top": grass_top(),
        "grass_block_side": grass_side(),
        "grass_block_side_overlay": grass_side_overlay(),
        "farmland_moist": farmland(),
        "oak_log": oak_log(),
        "oak_log_top": oak_log_top(),
        "oak_leaves": oak_leaves(),
        "water_still": water_strip(),
        "short_grass": short_grass(),
        "poppy": poppy(),
        "oak_sapling": oak_sapling(),
        "wheat_seeds": wheat_seeds(),
        "diamond_axe": axe(),
    }
    blocks.update({f"wheat_stage{i}": wheat_stage(i) for i in range(8)})
    for name, img in blocks.items():
        save(img, WORLD / f"{name}.png")

    items = {
        "chest": chest(),
        "star": star(),
        "clock": clock(),
        "book": book(),
        "diamond": diamond(),
        "wheat": wheat_bundle(),
    }
    for name, img in items.items():
        save(img, ITEMS / f"{name}.png")

    scenes = {
        "grass_side": grass_side_tinted(),
        "grass_top": tint(grass_top(), "#91bd59"),
        "leaves": tint(oak_leaves(), "#77ab39"),
        "planks": oak_planks(),
        "diamond_ore": diamond_ore(),
    }
    for name, img in scenes.items():
        save(img, ROOT / "scene" / f"{name}.png")

    save(pickaxe(), ROOT / "diamond_pickaxe.png")
    save(skin(), ROOT / "jnbot-skin.png")


if __name__ == "__main__":
    main()
