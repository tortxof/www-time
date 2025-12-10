import { serve } from "bun";
import html from "./index.html";

const server = serve({
  port: 3000,
  routes: {
    "/": html,
  },
  // Adding fetch() here is just a workaround for this issue:
  // https://github.com/oven-sh/bun/issues/20589
  // fetch() can be removed once this issue is fixed.
  fetch(request) {
    const url = new URL(request.url);
    // Normalize and validate the path
    const pathname = url.pathname;
    if (pathname.includes("..") || !pathname.startsWith("/")) {
      return new Response("Invalid path", { status: 400 });
    }
    // Try to serve from the bundled filesystem
    const bunfsPath = `/$bunfs/root${pathname}`;
    try {
      const file = Bun.file(bunfsPath);
      return new Response(file);
    } catch {
      return new Response("Not found", { status: 404 });
    }
  },
});

process.on("SIGINT", () => {
  server.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  server.stop();
  process.exit(0);
});
