# spz-poll

> Track and vehicle vote between race cycles · `v1.1.2`

## Overview

`spz-poll` runs the vote that decides the next track and vehicle class. `spz-races` starts
it during the poll phase, players pick from the options, and the tally is returned when the
window closes.

## Structure

| Side | File | Purpose |
|---|---|---|
| Client | `client/main.lua` | Poll display, vote submission, NUI bridge |
| Server | `server/main.lua` | Poll lifecycle and vote tallying |

## Exports

| Export | Description |
|---|---|
| `StartPoll` | Open a poll with a set of options |
| `UpdatePoll` | Push updated tallies to open clients |
| `StopPoll` | Close the poll and return the winner |

## NUI

Vite · Preact · TypeScript on the [spz-ui](../spz-ui/README.md) component set.

```bash
cd ui && npm install && npm run build   # → ui/dist/index.html
```

### Track map

Track cards plot the route over Rockstar's own Social Club map tiles, fetched at
runtime — nothing is shipped in the resource. Tiles are 256px, zoom 2-6, doubling
each level (z4 = 8x12 tiles = 2048x3072 px). Each card requests only the tiles it
shows, at the zoom nearest its own resolution: typically 2-6 tiles per card. If the
tiles fail (no connectivity, server moved) the plot falls back to a 200 m grid.

World-to-tile calibration was fitted against the 6428 checkpoints in `tracks/` —
the affine putting the most checkpoints on road pixels:

```
z4 px = 0.2428 * worldX + 780.13        (1 z4 pixel = 4.12 m)
z4 py = 1945.38 - 0.2428 * worldY
```

Override the tile set or the calibration from the `StartPoll` payload — no UI rebuild:

```lua
map = {
  url = 'https://s.rsg.sc/sc/images/games/GTAV/map/game/{z}/{x}/{y}.jpg',
  s = 0.2428, ox = 780.13, oy = 1945.38, minZ = 2, maxZ = 6
}
```

Game minimap textures cannot be used: NUI is a CEF browser with no access to `.ytd`
assets or render targets. Remote tiles or a shipped image file are the only options.

## Commands

`/testpoll` (development helper)

## Dependencies

`ox_lib`

---

Part of [SPiceZ-Core](../README.md) · GPL-3.0
