/**
 * layout.js - Navbar superior + Bottom Navigation Bar
 * Reemplaza: includes/header.php + includes/bottom_nav_bar.php
 */

// Inyectar CSS del bottom nav una sola vez
function injectLayoutStyles() {
  if (document.getElementById('bottom-nav-css')) return;
  const link = document.createElement('link');
  link.id = 'bottom-nav-css';
  link.rel = 'stylesheet';
  link.href = '/assets/css/bottom_nav_bar.css';
  document.head.appendChild(link);
}

/**
 * Renderiza el navbar superior + bottom nav bar dentro del contenedor dado.
 * Envuelve el contenido de la página en el layout completo.
 * @param {string} currentPage - 'dashboard' | 'caja' | 'reportes' | 'comanda' | etc.
 * @param {string} pageContent - HTML del contenido de la página
 */
export function renderLayout(container, currentPage, pageContent) {
  injectLayoutStyles();

  const session = window._session || {};
  const puesto = session.puesto || 'Admin';
  const nombre = session.emp_nombre || session.nombre || 'Usuario';

  const isAdmin = puesto === 'Admin' || puesto === 'Administrativo' || puesto === 'administrador';
  const isCajero = puesto === 'Cajero' || isAdmin;
  const isCocinero = puesto === 'Cocinero' || isAdmin;

  container.innerHTML = `
    <!-- Contenido de la página -->
    <div class="main-content-wrapper-bottom-nav">
      ${pageContent}
    </div>

    <!-- Bottom Navigation Bar -->
    <nav class="bottom-nav-bar" id="bottom-nav-bar">
      <a href="#" class="nav-item ${currentPage === 'dashboard' ? 'active' : ''}" 
        onclick="window.navigateTo('/dashboard'); return false;">
        <i class="fas fa-home"></i>
        <span>Inicio</span>
      </a>
      ${isCajero ? `
      <a href="#" class="nav-item ${currentPage === 'caja' ? 'active' : ''}"
        onclick="window.navigateTo('/caja'); return false;">
        <i class="fas fa-cash-register"></i>
        <span>Caja</span>
      </a>` : ''}
      ${isAdmin ? `
      <a href="#" class="nav-item ${currentPage === 'reportes' ? 'active' : ''}"
        onclick="window.navigateTo('/reportes'); return false;">
        <i class="fas fa-chart-line"></i>
        <span>Reportes</span>
      </a>` : ''}
      <a href="#" class="nav-item" id="settings-nav-item">
        <i class="fas fa-bars"></i>
        <span>Más</span>
      </a>
    </nav>

    <!-- Drawer lateral -->
    <div class="settings-drawer" id="settings-drawer">
      <div class="drawer-header">
        <h3>Menú</h3>
        <button class="close-drawer-button" id="close-drawer-button">&times;</button>
      </div>
      <div class="drawer-content">
        <div class="drawer-grid">
          ${isCocinero ? `
          <a href="#" class="drawer-card" onclick="closeDrawer(); window.navigateTo('/comanda'); return false;">
            <div class="drawer-card-icon icon-comanda"><i class="fas fa-kitchen-set"></i></div>
            <span>Comanda</span>
          </a>` : ''}
          ${isCajero ? `
          <a href="#" class="drawer-card" onclick="closeDrawer(); window.navigateTo('/productos'); return false;">
            <div class="drawer-card-icon icon-productos"><i class="fas fa-box-open"></i></div>
            <span>Productos</span>
          </a>` : ''}
          ${isCocinero ? `
          <a href="#" class="drawer-card" onclick="closeDrawer(); window.navigateTo('/display'); return false;">
            <div class="drawer-card-icon icon-clientes"><i class="fas fa-users"></i></div>
            <span>Clientes</span>
          </a>` : ''}
          ${isCajero ? `
          <a href="#" class="drawer-card" onclick="closeDrawer(); window.navigateTo('/cierre_caja'); return false;">
            <div class="drawer-card-icon icon-caja"><i class="fas fa-store"></i></div>
            <span>Apertura/Cierre</span>
          </a>
          <a href="#" class="drawer-card" onclick="closeDrawer(); window.navigateTo('/devoluciones'); return false;">
            <div class="drawer-card-icon icon-devoluciones"><i class="fas fa-undo"></i></div>
            <span>Devoluciones</span>
          </a>` : ''}
          ${isAdmin ? `
          <a href="#" class="drawer-card" onclick="closeDrawer(); window.navigateTo('/token'); return false;">
            <div class="drawer-card-icon icon-token"><i class="fas fa-key"></i></div>
            <span>Ver Token</span>
          </a>
          <a href="#" class="drawer-card" onclick="closeDrawer(); window.navigateTo('/empleados'); return false;">
            <div class="drawer-card-icon icon-empleados"><i class="fas fa-user-cog"></i></div>
            <span>Empleados</span>
          </a>
          <a href="#" class="drawer-card" onclick="closeDrawer(); window.navigateTo('/sincronizacion'); return false;">
            <div class="drawer-card-icon icon-sync"><i class="fas fa-cloud-upload-alt"></i></div>
            <span>Sincronización</span>
          </a>` : ''}
        </div>
        <hr class="drawer-divider">
        <ul class="drawer-list">
          <li>
            <a href="#" id="toggleDarkMode">
              <div class="list-icon"><i class="fas fa-moon"></i></div>
              <span>Modo Oscuro</span>
              <i class="fas fa-chevron-right arrow-icon"></i>
            </a>
          </li>
          <li>
            <a href="#" onclick="closeDrawer(); window.navigateTo('/ayuda'); return false;">
              <div class="list-icon"><i class="fas fa-question-circle"></i></div>
              <span>Ayuda y soporte técnico</span>
              <i class="fas fa-chevron-right arrow-icon"></i>
            </a>
          </li>
          <li>
            <a href="#" onclick="closeDrawer(); window.navigateTo('/login'); return false;">
              <div class="list-icon"><i class="fas fa-sign-out-alt"></i></div>
              <span>Cerrar Sesión</span>
              <i class="fas fa-chevron-right arrow-icon"></i>
            </a>
          </li>
        </ul>
      </div>
      <div class="drawer-user-profile">
        <div class="user-info">
          <span class="user-name">${nombre}</span>
        </div>
      </div>
    </div>
    <div class="drawer-overlay" id="drawer-overlay"></div>
  `;

  initLayoutEvents();
}

function initLayoutEvents() {
  // Abrir drawer
  const settingsBtn = document.getElementById('settings-nav-item');
  if (settingsBtn) settingsBtn.addEventListener('click', (e) => { e.preventDefault(); openDrawer(); });

  // Cerrar drawer
  const closeBtn = document.getElementById('close-drawer-button');
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  const overlay = document.getElementById('drawer-overlay');
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // Dark mode toggle
  const darkBtn = document.getElementById('toggleDarkMode');
  if (darkBtn) {
    darkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.toggle('dark-mode');
    });
  }
}

function openDrawer() {
  document.getElementById('settings-drawer')?.classList.add('is-open');
  document.getElementById('drawer-overlay')?.classList.add('is-open');
}

function closeDrawer() {
  document.getElementById('settings-drawer')?.classList.remove('is-open');
  document.getElementById('drawer-overlay')?.classList.remove('is-open');
}

// Exponer closeDrawer globalmente para los onclick del drawer
window.closeDrawer = closeDrawer;
