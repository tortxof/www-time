FROM oven/bun:1 AS base

WORKDIR /app

COPY src/ .

RUN bun build --compile --outfile=server ./index.js

FROM debian:bookworm-slim

WORKDIR /app

COPY --from=base /app/server .

CMD ["./server"]
