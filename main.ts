// HTMHGR Mini App — static server for Deno Deploy.
// Serves the interface page (htmhgr/index.html) as text/html, plus the
// animated emoji set under /emoji/<name>.webp. The emoji files are stored
// in this repo as base64 text (the GitHub MCP write path is text-only),
// so they are decoded once at startup and served as binary image/webp.
const html = await Deno.readTextFile(new URL("./htmhgr/index.html", import.meta.url));

const EMOJI: Record<string, Uint8Array> = {};
for (
  const name of [
    "house",
    "sparkles",
    "robot",
    "newspaper",
    "person",
    "speech",
    "star",
    "fire",
  ]
) {
  try {
    const b64 = await Deno.readTextFile(
      new URL("./htmhgr/emoji/min/" + name + ".webp", import.meta.url),
    );
    const bin = atob(b64.trim());
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    EMOJI[name] = bytes;
  } catch {
    // missing asset: requests for it will 404
  }
}

Deno.serve((req) => {
  const url = new URL(req.url);
  if (url.pathname.startsWith("/emoji/")) {
    const name = url.pathname.slice("/emoji/".length).replace(/\.webp$/, "");
    const data = EMOJI[name];
    if (data) {
      return new Response(data, {
        headers: {
          "content-type": "image/webp",
          "cache-control": "public, max-age=604800, immutable",
        },
      });
    }
    return new Response("not found", { status: 404 });
  }
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
});
