/**
 * main.js - Router principal
 */

import { initDB } from './db/database.js';
import { renderLogin } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderCierreCaja } from './pages/cierre_caja.js';
import { renderCaja } from './pages/caja.js';
import { renderProductos } from './pages/productos.js';
import { renderComanda } from './pages/comanda.js';
import { renderReportes } from './pages/reportes.js';
import { renderDevoluciones } from './pages/devoluciones.js';
import { renderToken } from './pages/token.js';
import { renderEmpleados } from './pages/empleados.js';
import { renderSincronizacion } from './pages/sincronizacion.js';

const app = document.getElementById('app');

const routes = {
  '/login': () => renderLogin(app),
  '/dashboard': () => renderDashboard(app),
  '/cierre_caja': () => renderCierreCaja(app),
  '/caja': () => renderCaja(app),
  '/productos': () => renderProductos(app),
  '/comanda': () => renderComanda(app),
  '/reportes': () => renderReportes(app),
  '/devoluciones': () => renderDevoluciones(app),
  '/token': () => renderToken(app),
  '/empleados': () => renderEmpleados(app),
  '/sincronizacion': () => renderSincronizacion(app),
  // próximos módulos se agregan aquí
};

async function navigate(path) {
  console.log('[Router] navigate →', path, '| session:', !!window._session);

  // Sin sesión fuera del login → redirigir
  if (path !== '/login' && !window._session) {
    console.warn('[Router] Sin sesión, redirigiendo a login');
    renderLogin(app);
    return;
  }

  const handler = routes[path];
  if (!handler) {
    console.warn('[Router] Ruta no encontrada:', path, '→ login');
    renderLogin(app);
    return;
  }

  try {
    await handler();
  } catch (err) {
    console.error('[Router] Error al renderizar:', path, err);
    app.innerHTML = `
      <div style="padding:40px;font-family:monospace;background:#1e293b;color:#f87171;min-height:100vh;">
        <h2 style="color:#fb923c;">❌ Error al cargar: ${path}</h2>
        <pre style="background:#0f172a;padding:20px;border-radius:8px;overflow:auto;color:#fca5a5;">${err?.stack || err?.message || String(err)}</pre>
        <button id="btn-err-login"
          style="margin-top:20px;padding:10px 24px;background:#3b82f6;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;">
          ← Volver al Login
        </button>
      </div>`;
    document.getElementById('btn-err-login')?.addEventListener('click', () => window.navigateTo('/login'));
  }
}

// Navegación global — llamada directamente desde login.js, layout.js, etc.
let _ignoreNextHashChange = false;
window.navigateTo = async (path) => {
  _ignoreNextHashChange = true;   // evitar que hashchange dispare doble
  location.hash = path;
  await navigate(path);
};

// Escuchar hashchange solo para back/forward del navegador
window.addEventListener('hashchange', () => {
  if (_ignoreNextHashChange) {
    _ignoreNextHashChange = false;
    return;
  }
  const path = location.hash.slice(1) || '/login';
  console.log('[Router] hashchange →', path);
  navigate(path);
});

// Arranque inicial
(async () => {
  console.log('[Router] Iniciando app...');
  await initDB();
  console.log('[Router] DB lista');
  const startPath = location.hash.slice(1) || '/login';
  await navigate(startPath);
})();
