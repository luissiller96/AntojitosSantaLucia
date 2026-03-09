<?php
// Esta sola línea reemplaza toda tu lógica de verificación anterior.
require_once("../includes/auth_check.php");

// Puedes incluir la conexión a la BD después si la página la necesita.
require_once("../config/conexion.php");
?>

<!DOCTYPE html>
<html lang="es">

<head>
  <?php include("../includes/head.php"); ?>
  <title>Devoluciones - SnackRocket</title>
  <?php include("../includes/style.php"); ?>
  <link rel="stylesheet" href="../css/devoluciones.css?v=<?php echo filemtime('../css/devoluciones.css'); ?> ">
</head>

<body>

  <?php include("../includes/bottom_nav_bar.php"); ?>

  <div class="scroll-container <?= $modo_oscuro ? 'dark-mode' : '' ?>">
    <div class="container-fluid py-4">
      <h4 class="card-title text-center mb-4">Módulo de Devoluciones 🔄</h4>

      <div class="row g-4">
        <!-- Columna de Búsqueda -->
        <div class="col-lg-4 col-md-12">
          <div class="card card-search h-100">
            <div class="card-body">
              <h5 class="card-title-section">Buscar Venta</h5>
              <form id="form-buscar-ticket">
                <div class="mb-3">
                  <label for="ticket_id" class="form-label">Número de Ticket:</label>
                  <input type="number" class="form-control form-control-lg" id="ticket_id" name="ticket_id"
                    placeholder="Ej: 123" required>
                </div>
                <div class="d-grid">
                  <button type="submit" class="btn btn-ios btn-primary">
                    <i class="fa fa-search me-2"></i>Buscar Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Columna de Detalles de la Venta -->
        <div class="col-lg-8 col-md-12">
          <div class="card card-details h-100">
            <div class="card-body">
              <div id="ticket-details-placeholder" class="placeholder-content">
                <i class="fa fa-receipt placeholder-icon"></i>
                <p class="placeholder-text">Seleccione un ticket para ver los detalles de la venta.</p>
              </div>

              <div id="ticket-details-content" class="d-none">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="card-title-section mb-0">Detalles del Ticket #<span id="ticket-number-display"></span></h5>
                  <span class="badge bg-success" id="ticket-status-badge">Completado</span>
                </div>

                <div class="ticket-info-grid mb-4">
                  <div><strong>Fecha:</strong> <span id="ticket-fecha"></span></div>
                  <div><strong>Vendedor:</strong> <span id="ticket-vendedor"></span></div>
                  <div><strong>Método Pago:</strong> <span id="ticket-pago"></span></div>
                  <div class="total-display"><strong>Total:</strong> <span id="ticket-total"></span></div>
                </div>

                <h6 class="mt-4">Productos en la Venta:</h6>
                <ul class="list-group list-group-flush" id="ticket-items-list">
                  <!-- Los items se insertarán aquí con JS -->
                </ul>

                <hr class="my-4">

                <div class="row g-3 align-items-end">
                  <div class="col-lg-9 col-md-8">
                    <label for="motivo_devolucion" class="form-label">Motivo de la Devolución:</label>
                    <textarea class="form-control" id="motivo_devolucion" rows="2"
                      placeholder="Ej: Pedido equivocado, error en el cobro..."></textarea>
                  </div>

                  <div class="col-lg-3 col-md-4 d-grid">
                    <button id="btn-confirmar-devolucion" class="btn btn-ios btn-danger" disabled>Confirmar
                      Devolución</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>

  <?php include("../includes/scripts.php"); ?>
  <script src="../js/devoluciones.js?v=<?php echo filemtime('../js/devoluciones.js'); ?>"></script>
</body>

</html>