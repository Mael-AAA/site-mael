// Petit serveur local pour prévisualiser le site pendant le développement.
//
//   node serve.js
//
// Il affiche deux adresses : une pour ce PC, une pour le téléphone
// (les deux appareils doivent être sur le même réseau Wi-Fi).

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = Number(process.argv[2]) || 8080;
const ROOT = __dirname;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

http
  .createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel.endsWith('/')) rel += 'index.html';

    // On ne sert que les fichiers situés dans le dossier du site
    const file = path.join(ROOT, path.normalize(rel));
    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end('Interdit');
      return;
    }

    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404</h1><p>Fichier introuvable : ' + rel + '</p>');
        return;
      }
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
        // Pas de cache : on voit ses modifications dès le rafraîchissement
        'Cache-Control': 'no-store',
      });
      res.end(data);
    });
  })
  // 0.0.0.0 : le serveur écoute aussi sur le réseau local, donc le téléphone peut s'y connecter
  .listen(PORT, '0.0.0.0', () => {
    const nets = os.networkInterfaces();
    const lan = Object.values(nets)
      .flat()
      .filter((n) => n && n.family === 'IPv4' && !n.internal)
      .map((n) => n.address);

    console.log('\n  Site servi depuis : ' + ROOT + '\n');
    console.log('  Sur cet ordinateur : http://localhost:' + PORT);
    lan.forEach((ip) => console.log('  Sur le téléphone   : http://' + ip + ':' + PORT));
    console.log('\n  (Ctrl+C pour arrêter)\n');
  });
