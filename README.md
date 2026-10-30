# spz-poll

> The track and car-class vote between races.

![version](https://img.shields.io/badge/version-1.6.0-ff6200) ![SPiceZ-Core](https://img.shields.io/badge/SPiceZ--Core-beta-18181b)

## Overview

Shows the vote screen between races: three track cards with route previews and car-class options, live vote counts, re-roll votes and a countdown. Driven entirely by spz-races through exports.

## Features

- Track cards with route outline
- Car-class voting
- Re-roll votes
- Live tallies

## Requirements

| Resource | Type |
|---|---|
| `spz-core` | SPiceZ module |

## Installation

Included in the [txAdmin recipe](https://github.com/SPiceZ21/spz-txrecipe). Manual install:

1. Download `spz-poll` from GitHub (latest release, or the repository) into your `resources` folder.
2. Add to `server.cfg`, after its requirements:

```cfg
ensure spz-poll
```

## Exports

| Export | Side |
|---|---|
| `StartPoll` | client |
| `StopPoll` | client |
| `UpdatePoll` | client |

```lua
exports["spz-poll"]:StartPoll(...)
```

---

Part of **SPiceZ-Core** — [documentation](https://github.com/SPiceZ21/Docs) · [all modules](https://github.com/SPiceZ21/Docs/blob/main/modules/README.md)
