// Puerta de reserva de Deejay Party: reenvía todo (web, salas por WebSocket, admin…) al juego de Cloudflare.
// Sirve para los días de partido, cuando LaLiga hace que algunas compañías bloqueen Cloudflare en España.
const http = require("http");
const httpProxy = require("http-proxy");
const DESTINO = process.env.DESTINO || "https://deejay-party.deejayparty.workers.dev";
const proxy = httpProxy.createProxyServer({ target: DESTINO, changeOrigin: true, ws: true, secure: process.env.INSEGURO ? false : true, xfwd: true });
proxy.on("error", (e, req, res) => {
  try {
    if (res && res.writeHead && !res.headersSent) { res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" }); res.end("La puerta de reserva no llega al juego ahora mismo. Prueba en unos segundos."); }
    else if (res && res.destroy) res.destroy();
  } catch { /* ya cerrado */ }
});
const servidor = http.createServer((req, res) => {
  if (req.url === "/salud") { res.writeHead(200); return res.end("ok"); }
  proxy.web(req, res);
});
servidor.on("upgrade", (req, socket, head) => proxy.ws(req, socket, head));
servidor.listen(process.env.PORT || 3000, () => console.log("Puerta de reserva lista →", DESTINO));
