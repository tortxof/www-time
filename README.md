# ⌚ www-time

A lightweight web client that displays the current time synchronized with a
remote server so it remains accurate even when the local system clock drifts or
is misconfigured. It renders both digital and analog clocks, highlights offset
information, and displays upcoming clock changes. The frontend is framework-free
vanilla HTML/CSS/JS and can be deployed as a static asset bundle or inside the
provided Bun-based Docker image.

## Features

- **High-precision sync** – Polls a backend time service, measures round-trip
  latency, and maintains a rolling median offset between `performance.now()` and
  the server timestamp so the displayed clock stays correct regardless of the
  local system clock.

- **Status at a glance** – Shows a green-red indicator plus the precise offset
  between local and remote time.

- **Dual clock display** – Combines a monospace digital readout with an SVG
  analog clock, including a sub-second hand driven by `requestAnimationFrame`
  for smooth motion.

- **Responsive layout** – Uses CSS `clamp()` sizing and Google Fonts to stay
  readable on phones, tablets, and desktops.

## Architecture

- **Frontend** (`src/index.html`, `src/main.css`, `src/main.js`): Static assets
  that fetch server time, compute offsets, and render the UI.

- **Backend**: Requires the companion project
  [tortxof/gotime](https://github.com/tortxof/gotime) which exposes a `/time`
  endpoint returning current server time plus offset data.

- **Local origin detection**: When the frontend is loaded from `localhost`, it
  targets `http://localhost:8080/time`. Otherwise it defaults to
  `https://time.djones.co/time`.

- **Optional Bun server** (`src/index.js` + `Dockerfile`): Builds to a
  standalone binary that serves the static files without needing Node or npm in
  production.

## Prerequisites

- JavaScript runtime. Bun is preferred. Serve `/src` with any HTTP server, or
  run `bun run src/index.js`.

- The [gotime](https://github.com/tortxof/gotime) backend running locally on
  port `8080` for development.

- Modern browser with `performance.now()` support (all evergreen browsers
  satisfy this).

## Local Development

1. Clone and start the backend:

  ```bash
  git clone https://github.com/tortxof/gotime.git
  cd gotime
  go run main.go
  # serves http://localhost:8080/time
  ```

2. In another terminal, serve this frontend:

  ```bash
  bun run src/index.js
  ```

3. Visit `http://localhost:3000` (or the port reported by your server of
   choice). The status indicator should turn green once the first `/time`
   response arrives.

## Deployment

### Static hosting

The contents of `src/` are fully static. Upload them to any static host or CDN.
Ensure the backend URL `https://time.djones.co/time` is reachable from clients,
or adjust `timeOrigin` in `main.js` if you host your own backend.

### Docker image

A multi-stage Docker build compiles the Bun server and ships a single binary:

```bash
docker build -t www-time .
docker run -p 3000:3000 www-time
```

The resulting container serves the compiled bundle on port 3000.

## License

See [LICENSE](LICENSE) for details.
