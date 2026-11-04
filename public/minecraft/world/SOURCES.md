# Textures

Every texture, item sprite and skin under `public/minecraft/` is original pixel art drawn for JNbot by `scripts/minecraft-textures.py`. None of it is copied from Minecraft's assets. File names follow the scene's existing references (`grass_block_top`, `oak_log`, …) so the scenes load them unchanged.

To change a texture, edit its function in the script and run:

```sh
python3 scripts/minecraft-textures.py
```

Grass, leaves, tufts and water are drawn in grayscale; the scene tints them. The player skin (`jnbot-skin.png`) is the JNbot bot: yellow shirt after the app icon. `../scene/` holds pre-tinted copies for the CSS demos and the 404 scene, which cannot tint textures themselves.

After changing world textures, refresh `public/minecraft/world-poster.png`: it is a still of the hero scene, shown while the scene loads.
