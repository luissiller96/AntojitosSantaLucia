<?php
if (session_status() == PHP_SESSION_NONE) {
  session_start();
}
// Usamos 'Invitado' como rol por defecto si no hay sesión
$puesto = $_SESSION["emp_puesto"] ?? 'Invitado';
?>

<nav class="bottom-nav-bar" id="bottom-nav-bar">
  <a href="dashboard.php" class="nav-item active" data-page="dashboard">
    <i class="fas fa-home"></i>
    <span>Inicio</span>
  </a>

  <?php if ($puesto == 'Admin' || $puesto == 'Cajero'): ?>
    <a href="caja.php" class="nav-item" data-page="caja">
      <i class="fas fa-cash-register"></i>
      <span>Caja</span>
    </a>
  <?php endif; ?>

  <?php if ($puesto == 'Admin'): ?>
    <a href="reportes.php" class="nav-item" data-page="reportes">
      <i class="fas fa-chart-line"></i>
      <span>Reportes</span>
    </a>
  <?php endif; ?>

  <a href="#" class="nav-item" id="settings-nav-item" data-page="configuracion">
    <i class="fas fa-bars"></i>
    <span>Más</span>
  </a>
</nav>

<div class="settings-drawer" id="settings-drawer">
  <div class="drawer-header">
    <h3>Menú</h3>
    <button class="close-drawer-button" id="close-drawer-button">&times;</button>
  </div>

  <div class="drawer-content">
    <div class="drawer-grid">

      <?php if ($puesto == 'Admin' || $puesto == 'Cocinero'): ?>
        <a href="comanda.php" class="drawer-card">
          <div class="drawer-card-icon icon-comanda"><i class="fas fa-kitchen-set"></i></div>
          <span>Comanda</span>
        </a>
      <?php endif; ?>

      <?php if ($puesto == 'Admin' || $puesto == 'Cajero'): ?>
        <a href="productos.php" class="drawer-card">
          <div class="drawer-card-icon icon-productos"><i class="fas fa-box-open"></i></div>
          <span>Productos</span>
        </a>
      <?php endif; ?>

      <?php if ($puesto == 'Admin' || $puesto == 'Cocinero'): ?>
        <a href="display.php" class="drawer-card">
          <div class="drawer-card-icon icon-clientes"><i class="fas fa-users"></i></div>
          <span>Clientes</span>
        </a>
      <?php endif; ?>

      <?php if ($puesto == 'Admin' || $puesto == 'Cajero'): ?>
        <a href="cierre_caja.php" class="drawer-card">
          <div class="drawer-card-icon icon-caja"><i class="fas fa-store"></i></div>
          <span>Apertura/Cierre</span>
        </a>

      <?php endif; ?>
      <?php if ($puesto == 'Admin' || $puesto == 'Cajero'): ?>
        <a href="devoluciones.php" class="drawer-card">
          <div class="drawer-card-icon icon-devoluciones"><i class="fas fa-undo"></i></div>
          <span>Devoluciones</span>
        </a>
      <?php endif; ?>


    <?php /* if ($puesto == 'Admin'): ?>
  <a href="gastos_fijos.php" class="drawer-card">
    <div class="drawer-card-icon icon-gastos-fijos"><i class="fas fa-file-invoice-dollar"></i></div>
    <span>Gastos Fijos</span>
  </a>
<?php endif; */ ?>

<?php /* if ($puesto == 'Admin'): ?>
  <a href="gastos_operativos.php" class="drawer-card">
    <div class="drawer-card-icon icon-gastos-operativos"><i class="fas fa-receipt"></i></div>
    <span>Gastos Operativos</span>
  </a>
<?php endif; */ ?>

<?php /* if ($puesto == 'Admin'): ?>
  <a href="gastos_operativos_movil.php" class="drawer-card">
    <div class="drawer-card-icon icon-gastos-movil"><i class="fas fa-mobile-alt"></i></div>
    <span>Gastos Móvil</span>
  </a>
<?php endif; */ ?>

      <?php if ($puesto == 'Admin'): ?>
        <a href="token.php" class="drawer-card">
          <div class="drawer-card-icon icon-token"><i class="fas fa-key"></i></div>
          <span>Ver Token</span>
        </a>
      <?php endif; ?>


      <?php if ($puesto == 'Admin'): ?>
        <a href="empleados.php" class="drawer-card">
          <div class="drawer-card-icon icon-empleados"><i class="fas fa-user-cog"></i></div>
          <span>Empleados</span>
        </a>
      <?php endif; ?>


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
        <a href="ayuda.php">
          <div class="list-icon"><i class="fas fa-question-circle"></i></div>
          <span>Ayuda y soporte técnico</span>
          <i class="fas fa-chevron-right arrow-icon"></i>
        </a>
      </li>
      <li>
        <a href="../logout.php">
          <div class="list-icon"><i class="fas fa-sign-out-alt"></i></div>
          <span>Cerrar Sesión</span>
          <i class="fas fa-chevron-right arrow-icon"></i>
        </a>
      </li>
    </ul>
  </div>

  <div class="drawer-user-profile">

    <div class="user-info">
      <span class="user-name"><?php echo htmlspecialchars($_SESSION['emp_nombre'] ?? 'Usuario'); ?></span>

    </div>
  </div>
</div>

<div class="drawer-overlay" id="drawer-overlay"></div>