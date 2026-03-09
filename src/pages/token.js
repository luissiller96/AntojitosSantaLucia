/**
 * token.js - Visualización del Token Global Original
 */

import { dbSelect } from '../db/database.js';
import { renderLayout } from './layout.js';

export async function renderToken(container) {
    injectCSS('token-css', '/assets/css/token.css');
    renderLayout(container, 'token', getTokenHTML());
    TokenApp.init();
}

function injectCSS(id, href) {
    if (document.getElementById(id)) return;
    const l = document.createElement('link');
    l.id = id; l.rel = 'stylesheet'; l.href = href;
    document.head.appendChild(l);
}

function getTokenHTML() {
    return `
<div class="tk-container">
  <div class="tk-header">
    <h1 class="tk-title">🔑 Token de Autorización Global</h1>
    <p class="tk-subtitle">Utiliza este código para autorizar devoluciones y cancelaciones en el sistema.</p>
  </div>

  <div class="tk-card">
    <p class="tk-muted">El token de 4 dígitos cambia automáticamente cada vez que un Administrador inicia sesión. Compártelo únicamente con el personal autorizado.</p>
    
    <div class="tk-display-box" id="tk-display">
      <div class="tk-loader">Cargando...</div>
    </div>
    
    <button class="tk-btn" id="btn-refresh-token">
      <i class="fas fa-sync-alt"></i> Refrescar Token
    </button>
  </div>
</div>`;
}

const TokenApp = {
    async init() {
        await this.cargarToken();
        document.getElementById('btn-refresh-token')?.addEventListener('click', () => {
            this.cargarToken();
        });
    },

    async cargarToken() {
        const display = document.getElementById('tk-display');
        display.innerHTML = '<div class="tk-loader">Buscando...</div>';

        try {
            const rows = await dbSelect(`SELECT token FROM token_global WHERE id = 1`, []);
            if (rows.length > 0) {
                display.innerHTML = `<span class="tk-number">${rows[0].token}</span>`;
            } else {
                display.innerHTML = `<span style="color:#dc3545; font-size:1.5rem;">No hay token activo. <br>Inicia sesión como Administrador.</span>`;
            }
        } catch (e) {
            display.innerHTML = `<span style="color:#dc3545;">Error cargando token.</span>`;
        }
    }
};
