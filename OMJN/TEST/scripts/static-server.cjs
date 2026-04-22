const fs = require("fs");
const http = require("http");
const path = require("path");

// Root at the parent OMJN folder so /TEST/operator.html maps to OMJN/TEST/operator.html.
const root = path.resolve(__dirname, "..", "..");
const testRoot = path.join(root, "TEST");
const args = process.argv.slice(2);
const portArg = args[args.indexOf("--port") + 1];
const port = Number(process.env.PORT || portArg || 3000);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function send(res, status, body, headers = {}){
  res.writeHead(status, headers);
  res.end(body);
}

function safeFilePath(urlPath){
  if(urlPath === "/") return null;
  if(urlPath === "/TEST") return null;
  if(urlPath === "/TEST/") return path.join(testRoot, "operator.html");
  if(!urlPath.startsWith("/TEST/")) return false;

  const relative = decodeURIComponent(urlPath.slice("/TEST/".length));
  const resolved = path.resolve(testRoot, relative);
  if(resolved !== testRoot && !resolved.startsWith(testRoot + path.sep)) return false;
  return resolved;
}

const server = http.createServer((req, res) => {
  try{
    const parsed = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
    if(parsed.pathname === "/" || parsed.pathname === "/TEST"){
      send(res, 302, "", { Location: "/TEST/operator.html" });
      return;
    }

    const filePath = safeFilePath(parsed.pathname);
    if(!filePath){
      send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
      return;
    }

    fs.stat(filePath, (statErr, stat) => {
      if(statErr || !stat.isFile()){
        send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      fs.createReadStream(filePath).pipe(res);
    });
  }catch(err){
    send(res, 500, "Server error", { "Content-Type": "text/plain; charset=utf-8" });
  }
});

server.on("error", (err) => {
  if(err && err.code === "EADDRINUSE"){
    console.error(`Port ${port} is already in use. Stop the existing local server, then run this command again.`);
  }else{
    console.error(err);
  }
  process.exit(1);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`OMJN TEST server running at http://127.0.0.1:${port}/TEST/`);
});
