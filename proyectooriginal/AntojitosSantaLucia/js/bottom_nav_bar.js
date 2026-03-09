document.addEventListener('DOMContentLoaded', () => {
  const settingsNavItem = document.getElementById('settings-nav-item');
  const settingsDrawer = document.getElementById('settings-drawer');
  const closeDrawerButton = document.getElementById('close-drawer-button');
  const drawerOverlay = document.getElementById('drawer-overlay');
  
  // Función para abrir el menú
  function openDrawer() {
    if (settingsDrawer && drawerOverlay) {
      settingsDrawer.classList.add('is-open'); // <-- Se usa 'is-open'
      drawerOverlay.classList.add('is-open'); // <-- Se usa 'is-open'
    }
  }

  // Función para cerrar el menú
  function closeDrawer() {
    if (settingsDrawer && drawerOverlay) {
      settingsDrawer.classList.remove('is-open'); // <-- Se usa 'is-open'
      drawerOverlay.classList.remove('is-open'); // <-- Se usa 'is-open'
    }
  }

  // Asignar eventos
  if (settingsNavItem) {
    settingsNavItem.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer();
    });
  }
  if (closeDrawerButton) {
    closeDrawerButton.addEventListener('click', closeDrawer);
  }
  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeDrawer);
  }

  // Lógica para marcar el ítem activo de la barra de navegación
  (function setActiveNavItem() {
    const navItems = document.querySelectorAll('.bottom-nav-bar .nav-item');
    const currentPage = window.location.pathname.split('/').pop();
    const subPagesOfSettings = ['comanda.php', 'clientes.php', 'productos.php', 'caja_cierre.php'];

    navItems.forEach(item => {
      item.classList.remove('active');
      const itemPage = item.getAttribute('href');
      if (itemPage === currentPage) {
        item.classList.add('active');
      }
    });

    if (subPagesOfSettings.includes(currentPage) && settingsNavItem) {
      settingsNavItem.classList.add('active');
    }
  })();

  const toggleDarkModeBtn = document.getElementById("toggleDarkMode");
  if (toggleDarkModeBtn) {
    toggleDarkModeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      document.body.classList.toggle("dark-mode");

      // Guardar preferencia en cookie (1 año)
      const isDark = document.body.classList.contains("dark-mode");
      document.cookie = `modo_oscuro=${isDark ? 1 : 0}; path=/; max-age=31536000`;
    });
  }
});