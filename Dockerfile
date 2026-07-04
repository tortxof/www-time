FROM denoland/deno:2.9.1 AS base

WORKDIR /app

COPY src/ ./src/

RUN deno compile --allow-net --include ./src/ --output server ./src/index.js

FROM debian:bookworm-slim

WORKDIR /app

COPY --from=base /app/server .

CMD ["./server"]
