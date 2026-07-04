import { serveDir } from "jsr:@std/http/file-server";

Deno.serve({ port: 3000 }, (request) =>
  serveDir(request, {
    fsRoot: new URL(".", import.meta.url).pathname,
  }),
);
