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
      <div class="nav-item route-link ${currentPage === 'dashboard' ? 'active' : ''}" style="cursor:pointer;" data-path="/dashboard">
        <i class="fas fa-home"></i>
        <span>Inicio</span>
      </div>
      ${isCajero ? `
      <div class="nav-item route-link ${currentPage === 'caja' ? 'active' : ''}" style="cursor:pointer;" data-path="/caja">
        <i class="fas fa-cash-register"></i>
        <span>Caja</span>
      </div>` : ''}
      ${isAdmin ? `
      <div class="nav-item route-link ${currentPage === 'reportes' ? 'active' : ''}" style="cursor:pointer;" data-path="/reportes">
        <i class="fas fa-chart-line"></i>
        <span>Reportes</span>
      </div>` : ''}
      <div class="nav-item" id="settings-nav-item" style="cursor:pointer;">
        <i class="fas fa-bars"></i>
        <span>Más</span>
      </div>
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
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/comanda">
            <div class="drawer-card-icon icon-comanda"><i class="fas fa-kitchen-set"></i></div>
            <span>Comanda</span>
          </div>` : ''}
          ${isCajero ? `
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/productos">
            <div class="drawer-card-icon icon-productos"><i class="fas fa-box-open"></i></div>
            <span>Productos</span>
          </div>` : ''}
          ${isCocinero ? `
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/display">
            <div class="drawer-card-icon icon-clientes"><i class="fas fa-users"></i></div>
            <span>Clientes</span>
          </div>` : ''}
          ${isCajero ? `
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/cierre_caja">
            <div class="drawer-card-icon icon-caja"><i class="fas fa-store"></i></div>
            <span>Apertura/Cierre</span>
          </div>
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/devoluciones">
            <div class="drawer-card-icon icon-devoluciones"><i class="fas fa-undo"></i></div>
            <span>Devoluciones</span>
          </div>` : ''}
          ${isAdmin ? `
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/token">
            <div class="drawer-card-icon icon-token"><i class="fas fa-key"></i></div>
            <span>Ver Token</span>
          </div>
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/empleados">
            <div class="drawer-card-icon icon-empleados"><i class="fas fa-user-cog"></i></div>
            <span>Empleados</span>
          </div>
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/sincronizacion">
            <div class="drawer-card-icon icon-sync"><i class="fas fa-cloud-upload-alt"></i></div>
            <span>Sincronización</span>
          </div>` : ''}
        </div>
        <hr class="drawer-divider">
        <ul class="drawer-list">
          <li>
            <div id="toggleDarkMode" style="cursor:pointer; display:flex; align-items:center; width:100%; padding: 12px 0;">
              <div class="list-icon"><i class="fas fa-moon"></i></div>
              <span>Modo Oscuro</span>
              <i class="fas fa-chevron-right arrow-icon" style="margin-left:auto;"></i>
            </div>
          </li>
          <li>
            <div class="route-link" style="cursor:pointer; display:flex; align-items:center; width:100%; padding: 12px 0;" data-path="/ayuda">
              <div class="list-icon"><i class="fas fa-question-circle"></i></div>
              <span>Ayuda y soporte técnico</span>
              <i class="fas fa-chevron-right arrow-icon" style="margin-left:auto;"></i>
            </div>
          </li>
          <li>
            <div class="route-link" style="cursor:pointer; display:flex; align-items:center; width:100%; padding: 12px 0;" data-path="/login">
              <div class="list-icon"><i class="fas fa-sign-out-alt"></i></div>
              <span>Cerrar Sesión</span>
              <i class="fas fa-chevron-right arrow-icon" style="margin-left:auto;"></i>
            </div>
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

  // Navegación formal por rutas
  document.querySelectorAll('.route-link').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const path = el.getAttribute('data-path');
      if (path) {
        if (el.closest('#settings-drawer')) {
          closeDrawer();
        }
        window.navigateTo(path);
      }
    });
  });

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
