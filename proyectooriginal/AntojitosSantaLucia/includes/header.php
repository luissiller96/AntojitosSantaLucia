<nav class="navbar navbar-expand-lg sticky-top shadow-sm" style="background: linear-gradient(90deg, #007bff, #0056b3);">
  <div class="container-fluid py-2">
    <?php $pagina = basename($_SERVER['PHP_SELF']); ?>
    <!-- Logo -->
    <a class="navbar-brand d-flex align-items-center fw-bold text-white" href="dashboard.php"
      style="font-size: 1.25rem;">
      <i class="fa fa-chart-line me-2"></i>Antojitos Santa Lucía
    </a>

    <!-- Botón hamburguesa -->
    <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent"
      aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Menú de navegación -->
    <div class="collapse navbar-collapse" id="navbarContent">
      <ul class="navbar-nav ms-auto mb-2 mb-lg-0 text-center align-items-lg-center">
        <li class="nav-item">
          <a class="nav-link <?= ($pagina == 'dashboard.php') ? 'active text-warning fw-semibold' : 'text-white'; ?>"
            href="dashboard.php">Inicio</a>
        </li>
        <li class="nav-item">
          <a class="nav-link <?= ($pagina == 'caja_cierre.php') ? 'active text-warning fw-semibold' : 'text-white'; ?>"
            href="caja_cierre.php">Apertura/Cierre</a>
        </li>
        <li class="nav-item">
          <a class="nav-link <?= ($pagina == 'caja.php') ? 'active text-warning fw-semibold' : 'text-white'; ?>"
            href="caja.php">Caja</a>
        </li>
        <li class="nav-item">
          <a class="nav-link <?= ($pagina == 'productos.php') ? 'active text-warning fw-semibold' : 'text-white'; ?>"
            href="productos.php">Productos</a>
        </li>
        <li class="nav-item">
          <a class="nav-link <?= ($pagina == 'reportes.php') ? 'active text-warning fw-semibold' : 'text-white'; ?>"
            href="reportes.php">Reportes</a>
        </li>
        <li class="nav-item">
          <a class="nav-link <?= ($pagina == 'comanda.php') ? 'active text-warning fw-semibold' : 'text-white'; ?>"
            href="comanda.php">Comanda</a>
        </li>
        <li class="nav-item">
          <a class="nav-link <?= ($pagina == 'display.php') ? 'active text-warning fw-semibold' : 'text-white'; ?>"
            href="display.php">Cliente</a>
        </li>
        <li class="nav-item">
          <a class="btn btn-light text-primary fw-semibold rounded-pill ms-lg-3 px-4" href="../logout.php">Cerrar
            Sesión</a>
        </li>
      </ul>
    </div>
  </div>
</nav>