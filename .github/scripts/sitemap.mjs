// Genera sitemap.xml de Mi Mercadito con las tiendas y productos públicos (los mismos que muestra la página).
// Usa la clave pública (anon) que ya está en index.html; no usa secretos.
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
const SB_URL = 'https://owtweebqlmoarbsvtiau.supabase.co';
const SB_KEY = 'sb_publishable_YvFAhbXHG1UxlXDnUny5Uw_sRVWE0Wv';
const SITE = 'https://logrin.flexgogroup.com/';
const esDemo = t => /^demo[-_]/i.test(t.id || '') || /\bdemo\b/i.test(t.nombre || '');
const xml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const r = await fetch(SB_URL + '/rest/v1/rpc/mercadito_publico', { method: 'POST', headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' }, body: '{}' });
if (!r.ok) { console.log('La base no respondió (' + r.status + '); se deja el sitemap anterior.'); process.exit(0); }
const d = await r.json();
const tiendas = (d.tiendas || []).filter(t => t && t.id && !esDemo(t));
const ids = new Set(tiendas.map(t => t.id));
const productos = (d.productos || []).filter(p => p && p.id && ids.has(p.n) && p.web !== false && Number(p.precio) > 0);
if (!tiendas.length) { console.log('Sin tiendas públicas; se deja el sitemap anterior.'); process.exit(0); }
const urls = [
  { loc: SITE, prioridad: '1.0' },
  { loc: SITE + '?mercadito', prioridad: '0.9' },
  ...tiendas.map(t => ({ loc: SITE + '?mercadito&tienda=' + encodeURIComponent(t.id), prioridad: '0.8' })),
  ...productos.map(p => ({ loc: SITE + '?mercadito&producto=' + encodeURIComponent(p.n) + '/' + encodeURIComponent(p.id), prioridad: '0.6' })),
];
const out = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => '  <url><loc>' + xml(u.loc) + '</loc><priority>' + u.prioridad + '</priority></url>').join('\n') + '\n</urlset>\n';
const antes = existsSync('sitemap.xml') ? readFileSync('sitemap.xml', 'utf8') : '';
if (antes === out) { console.log('Sin cambios: ' + urls.length + ' direcciones.'); process.exit(0); }
writeFileSync('sitemap.xml', out);
console.log('sitemap.xml: ' + tiendas.length + ' tiendas y ' + productos.length + ' productos (' + urls.length + ' direcciones).');
