# spz-poll
> Track & vehicle vote poll · `v1.1.1`

## Scripts

| Side   | File              | Purpose                                          |
| ------ | ----------------- | ------------------------------------------------ |
| Client | `client/main.lua` | Poll UI display, vote submission, NUI bridge     |
| Server | `server/main.lua` | Poll lifecycle management, vote tallying         |

## NUI

**Stack:** Vite · Preact · TypeScript · spz-ui

```
ui/
├── src/
│   ├── app.tsx
│   ├── components/       # spz-ui components
│   └── styles/
└── dist/                 # built output (served by FiveM)
    └── index.html
```

Build: `cd ui && npm run build`

## Exports

| Export      | Description                              |
| ----------- | ---------------------------------------- |
| `StartPoll` | Start a new track or vehicle vote poll   |
| `StopPoll`  | End the active poll and return results   |

## CI
Built and released via `.github/workflows/release.yml` on push to `main`.
