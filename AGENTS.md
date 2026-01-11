# Agent Guide for www-time Repository

This document provides essential information for agents working with this
codebase.

## Project Overview

This is a simple web application that displays synchronized time from a remote
server so the UI stays accurate even when the local system clock is wrong. The
frontend is built with vanilla HTML, CSS, and JavaScript, and served using a
Node.js Docker container.

## Codebase Structure

- `Dockerfile` - Defines the container image for serving the application
- `src/` - Contains all frontend source files
  - `index.html` - Main HTML structure
  - `main.css` - Styling for the application
  - `main.js` - JavaScript logic for time synchronization and display
  - `clock.svg` - Favicon

## Key Components

### Time Synchronization (main.js)

The application synchronizes time with a remote server at
https://time.djones.co/time (or a locally running instance of
https://github.com/tortxof/gotime on http://localhost:8080/time) using the
following approach:

1. It makes periodic requests to fetch the server time
2. It calculates network latency by measuring round-trip time
3. It estimates the server time at the moment the response was generated
4. It maintains an offset between server and client time
5. It uses an averaging algorithm to smooth out time differences
6. It updates the display using requestAnimationFrame for smooth rendering

Key variables:
- `offset` - The calculated difference between server and client time
- `offsets` - An array storing recent offset values for averaging
- `localRequestTime` - Estimated local time when the server response was
  generated

### Analog Clock (main.js & main.css & index.html)

The application now includes an SVG-based analog clock with the following features:

1. Dynamic hour markers generated with JavaScript on page load
2. Three separate clock hands (hour, minute, second) with precise rotation calculations
3. Hour, minute, and second hands update once per second in lockstep with the
digital display, while the dedicated sub-second hand animates via
requestAnimationFrame for continuous motion
4. Responsive design with viewport-based sizing
5. Visual distinction with a red second hand
6. Center cap for a finished look

Key functions:
- `createHourMarkers()` - Dynamically generates the 12 hour markers as SVG lines
- `updateClockHands(now)` - Calculates and applies rotation to all three clock hands based on current time

### Display (main.js & main.css)

The time and date are displayed in a responsive layout using:
- Roboto Mono font for time display
- Roboto font for date display
- CSS clamp() for responsive font sizing
- requestAnimationFrame for smooth time updates

Status indicators show whether the time is synchronized (green) or stale (red).

## Development Workflow

### Running the Application

1. Start the companion backend from https://github.com/tortxof/gotime so it
   serves `http://localhost:8080/time` (the frontend assumes this when loaded
   from `localhost`).

2. Prefer Bun for local development. From the repo root run:

```
bun run src/index.js
```

   This Bun entry bundles the static assets and serves them on port 3000.

3. Alternatively, any static server that can host `src/` will work, but Bun is
   the default tooling for this repository.

Access the application at http://localhost:3000

### Code Conventions

- Uses vanilla JavaScript (no frameworks)
- Follows functional programming patterns
- Responsive design with clamp() for font sizing
- Uses requestAnimationFrame for smooth UI updates

### Testing

Manual testing is recommended:
1. Check that time updates correctly
2. Verify date formatting is appropriate
3. Confirm status indicators change appropriately
4. Test responsive design on different screen sizes
5. Verify time synchronization works properly
6. Confirm the display stays accurate even if the local system clock is
   intentionally offset.

## Deployment

The application is designed to be deployed as a Docker container. The current
multi-stage Dockerfile compiles the Bun server into a single binary and runs it
inside a slim Debian image.

## Gotchas

1. Time synchronization depends on network requests to an external service
2. The application uses performance.now() for high-precision timing
3. Font loading is done via Google Fonts CDN
4. The status indicator changes color based on synchronization state
5. Time differences are displayed in the top-right corner with three decimal
   places
6. The UI intentionally relies on server time so it remains correct even if the
   host system clock is misconfigured
