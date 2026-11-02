// HTMHGR Mini App — static server for Deno Deploy.
// Serves the folk-style interface page (htmhgr/index.html in this repo)
// with a proper text/html content type, from Deno's edge network.
const html = await Deno.readTextFile(new URL("./htmhgr/index.html", import.meta.url));

Deno.serve(() =>
  new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  })
);
