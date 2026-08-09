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

## Commands

`/testpoll` (development helper)

## Dependencies

`ox_lib`

---

Part of [SPiceZ-Core](../README.md) · GPL-3.0
