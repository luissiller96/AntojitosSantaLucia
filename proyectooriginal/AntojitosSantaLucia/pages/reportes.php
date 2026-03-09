<?php
require_once("../includes/auth_check.php");
require_once("../config/conexion.php");
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <?php include("../includes/head.php"); ?>
  <title>Reportes - Moderno</title>

  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <script src="https://unpkg.com/gridjs/dist/gridjs.umd.js"></script>
  <link href="https://unpkg.com/gridjs/dist/theme/mermaid.min.css" rel="stylesheet" />

  <?php include("../includes/style.php"); ?>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-1ycn6IcaQQ40/J6MdGSt2F7b1bJ5r3S2e6y4GZ7V6NQmD1r5JkqYkqZ1ZrKqQ4l7bX6Qd2sJk2K2a2X2V9M8w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  
  <link rel="stylesheet" href="../css/reportes_modern.css?v=<?php echo filemtime('../css/reportes_modern.css'); ?> ">
</head>

<body>

  <?php include("../includes/bottom_nav_bar.php"); ?>

  <div class="reportes-container <?= $modo_oscuro ? 'dark-mode' : '' ?>">
    <div class="container-fluid">

      <div class="reportes-header">
        <h1 class="reportes-title">Reportes 📊</h1>
        <p class="reportes-subtitle">Análisis y visualización de datos del negocio</p>
      </div>
      <!-- KPIs resumen -->
      <div class="row g-3 mt-3" id="kpisResumen">
        <div class="col-md-3">
          <div class="stats-card success">
            <div class="stats-icon"><i class="fas fa-dollar-sign"></i></div>
            <p class="stats-value" id="totalVentasHoy">$0.00</p>
            <h6 class="stats-label">VENTAS HOY</h6>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stats-card info">
            <div class="stats-icon"><i class="fas fa-receipt"></i></div>
            <p class="stats-value" id="totalTicketsHoy">0</p>
            <h6 class="stats-label">TICKETS HOY</h6>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stats-card warning">
            <div class="stats-icon"><i class="fas fa-users"></i></div>
            <p class="stats-value" id="totalClientesHoy">0</p>
            <h6 class="stats-label">CLIENTES HOY</h6>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stats-card">
            <div class="stats-icon"><i class="fas fa-chart-line"></i></div>
            <p class="stats-value" id="promedioVenta">$0.00</p>
            <h6 class="stats-label">PROMEDIO VENTA</h6>
          </div>
        </div>
      </div>

      <ul class="nav nav-tabs" id="reportesTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <a class="nav-link active" id="graficaVentas-tab" data-bs-toggle="tab" href="#graficaVentas" role="tab" aria-controls="graficaVentas" aria-selected="true">📊 Reporte Gráfico</a>
        </li>
        <li class="nav-item" role="presentation">
          <a class="nav-link" id="productosMasVendidos-tab" data-bs-toggle="tab" href="#productosMasVendidos" role="tab" aria-controls="productosMasVendidos" aria-selected="false">🏆 Más Vendidos</a>
        </li>
        <li class="nav-item" role="presentation">
          <a class="nav-link" id="ventas-tab" data-bs-toggle="tab" href="#ventas" role="tab">🛒 Ventas</a>
        </li>
        <li class="nav-item" role="presentation">
          <a class="nav-link" id="utilidades-tab" data-bs-toggle="tab" href="#utilidades" role="tab" aria-controls="utilidades" aria-selected="false">💰 Utilidades</a>
        </li>
        <li class="nav-item" role="presentation">
          <a class="nav-link" id="compras-tab" data-bs-toggle="tab" href="#compras" role="tab" aria-controls="compras" aria-selected="false">🪙 Compras</a>
        </li>
        <li class="nav-item" role="presentation">
          <a class="nav-link" id="devoluciones-tab" data-bs-toggle="tab" href="#devoluciones" role="tab" aria-controls="devoluciones" aria-selected="false">↩️ Devoluciones</a>
        </li>
        <li class="nav-item" role="presentation">
          <a class="nav-link" id="cierreCaja-tab" data-bs-toggle="tab" href="#cierreCaja" role="tab" aria-controls="cierreCaja" aria-selected="false">💵 Cierre de Caja</a>
        </li>
        <li class="nav-item" role="presentation">
          <a class="nav-link" id="ventasPDF-tab" data-bs-toggle="tab" href="#ventasPDF" role="tab" aria-controls="ventasPDF" aria-selected="false">📈 Exportar</a>
        </li>
      </ul>

      <div class="tab-content pt-4">

        <div id="graficaVentas" class="tab-pane fade show active" role="tabpanel">
          <div class="filtros-container">
            <div class="filtro-group">
              <div class="filtro-item">
                <label for="tipoReporte" class="filtro-label">Tipo de Reporte:</label>
                <select class="form-control" id="tipoReporte">
                  <option value="ventas_fecha">Ventas por Fecha</option>
                </select>
              </div>
              <div class="filtro-item">
                <label for="fechaInicio" class="filtro-label">Fecha de Inicio:</label>
                <input type="date" class="form-control" id="fechaInicio">
              </div>
              <div class="filtro-item">
                <label for="fechaFin" class="filtro-label">Fecha de Fin:</label>
                <input type="date" class="form-control" id="fechaFin">
              </div>
              <div class="filtro-item">
                <button class="btn-modern btn-primary-modern w-100" id="generarReporte">
                  <i class="fa fa-chart-line me-2"></i> Generar Reporte
                </button>
              </div>
            </div>
          </div>
          <div class="modern-card chart-container mt-4">
            <div class="chart-header d-flex justify-content-between align-items-center">
              <h3 class="chart-title mb-0">Ventas por Fecha</h3>
              <span class="badge bg-secondary" id="rangoSeleccionado"></span>
            </div>
            <div id="totalVentasTexto" class="fw-bold text-success text-center mb-3" style="font-size: 1.6rem;"></div>
            <div id="ventasPorTicketChart" style="height: 400px;"></div>
          </div>
        </div>

        <div id="productosMasVendidos" class="tab-pane fade" role="tabpanel">
            <div class="modern-card tabla-container">
                <div class="tabla-header">Ranking de Productos Más Vendidos</div>
                <div id="tablaProductosMasVendidos" class="p-3"></div>
            </div>
        </div>

        <div id="ventas" class="tab-pane fade" role="tabpanel">
          <div class="filtros-container">
            <div class="row g-3 align-items-end">
              <div class="col-md-3"><label for="fechaInicioVentas" class="filtro-label">Fecha Inicio:</label><input type="date" id="fechaInicioVentas" class="form-control"></div>
              <div class="col-md-3"><label for="fechaFinVentas" class="filtro-label">Fecha Fin:</label><input type="date" id="fechaFinVentas" class="form-control"></div>
              <div class="col-md-6 d-flex justify-content-center align-items-center gap-2">
                <button class="btn btn-sm btn-outline-danger btn-modern filtro-ventas active" data-filtro="todas" data-color-class="btn-danger">Todas</button>
                <button class="btn btn-sm btn-outline-success btn-modern filtro-ventas" data-filtro="efectivo" data-color-class="btn-success">Efectivo</button>
                <button class="btn btn-sm btn-outline-info btn-modern filtro-ventas" data-filtro="tarjeta" data-color-class="btn-info">Tarjeta</button>
                <button class="btn btn-sm btn-outline-warning btn-modern filtro-ventas" data-filtro="transferencia" data-color-class="btn-warning">Transferencia</button>
              </div>
            </div>
          </div>
          <div class="modern-card tabla-container mt-4">
            <div class="tabla-header d-flex justify-content-between align-items-center">
                <span>Detalle de Ventas</span>
                <div><strong class="me-2">Total Filtrado:</strong><span class="badge bg-primary fs-6" id="totalVentasFiltradas">$0.00</span></div>
            </div>
            <div id="tablaVentas" class="p-3"></div>
          </div>
        </div>

        <div id="utilidades" class="tab-pane fade" role="tabpanel">
          <div class="filtros-container">
            <div class="row g-3 align-items-end">
              <div class="col-md-4"><label for="fechaInicioUtilidad" class="filtro-label">Fecha Inicio:</label><input type="date" id="fechaInicioUtilidad" class="form-control"></div>
              <div class="col-md-4"><label for="fechaFinUtilidad" class="filtro-label">Fecha Fin:</label><input type="date" id="fechaFinUtilidad" class="form-control"></div>
            </div>
          </div>
           <div class="modern-card tabla-container mt-4">
            <div class="tabla-header d-flex justify-content-between align-items-center">
                <span>Detalle de Utilidades por Producto</span>
                <div><strong class="me-2">Utilidad Total:</strong><span class="badge bg-success fs-6" id="totalUtilidades">$0.00</span></div>
            </div>
            <div id="tablaUtilidades" class="p-3"></div>
          </div>
        </div>

        <div id="compras" class="tab-pane fade" role="tabpanel">
           <div class="filtros-container">
            <div class="row g-3 align-items-end">
                <div class="col-md-4"><label for="fechaInicioCompras" class="filtro-label">Fecha Inicio:</label><input type="date" id="fechaInicioCompras" class="form-control"></div>
                <div class="col-md-4"><label for="fechaFinCompras" class="filtro-label">Fecha Fin:</label><input type="date" id="fechaFinCompras" class="form-control"></div>
            </div>
           </div>
           <div class="modern-card tabla-container mt-4">
            <div class="tabla-header d-flex justify-content-between align-items-center">
                <span>Detalle de Compras y Gastos</span>
                <div><strong class="me-2">Total en Compras:</strong><span class="badge bg-danger fs-6" id="totalCompras">$0.00</span></div>
            </div>
            <div id="tablaCompras" class="p-3"></div>
          </div>
        </div>

        <div id="devoluciones" class="tab-pane fade" role="tabpanel">
             <div class="modern-card tabla-container">
                <div class="tabla-header">Historial de Devoluciones</div>
                <div id="tablaDevoluciones" class="p-3"></div>
            </div>
        </div>

        <div id="cierreCaja" class="tab-pane fade" role="tabpanel">
          <div class="filtros-container">
            <div class="filtro-group">
              <div class="filtro-item"><label for="fechaInicioCierre" class="filtro-label">Fecha de Inicio:</label><input type="date" id="fechaInicioCierre" class="form-control"></div>
              <div class="filtro-item"><label for="fechaFinCierre" class="filtro-label">Fecha de Fin:</label><input type="date" id="fechaFinCierre" class="form-control"></div>
              <div class="filtro-item"><button id="btnFiltrarCierre" class="btn-modern btn-primary-modern w-100"><i class="fas fa-filter me-2"></i>Aplicar Filtros</button></div>
            </div>
          </div>
          <div class="row mt-4">
            <div class="col mb-3"><div class="stats-card success"><div class="stats-icon"><i class="fas fa-money-bill-wave"></i></div><p class="stats-value" id="resumenEfectivo">$0.00</p><h6 class="stats-label">TOTAL EFECTIVO</h6></div></div>
            <div class="col mb-3"><div class="stats-card info"><div class="stats-icon"><i class="fas fa-credit-card"></i></div><p class="stats-value" id="resumenTarjeta">$0.00</p><h6 class="stats-label">TOTAL TARJETA</h6></div></div>
            <div class="col mb-3"><div class="stats-card warning"><div class="stats-icon"><i class="fas fa-mobile-alt"></i></div><p class="stats-value" id="resumenTransferencia">$0.00</p><h6 class="stats-label">TOTAL TRANSFERENCIA</h6></div></div>
            <div class="col mb-3"><div class="stats-card danger"><div class="stats-icon"><i class="fas fa-balance-scale-right"></i></div><p class="stats-value" id="resumenDiferencias">$0.00</p><h6 class="stats-label">TOTAL DIFERENCIAS</h6></div></div>
            <div class="col mb-3"><div class="stats-card" style="border-left-color: #343a40;"><div class="stats-icon"><i class="fas fa-coins"></i></div><p class="stats-value" id="resumenTotal">$0.00</p><h6 class="stats-label">TOTAL CAJA</h6></div></div>
          </div>
          <div class="modern-card tabla-container mt-2">
            <div class="tabla-header d-flex justify-content-between align-items-center"><span>Detalle de Cierres de Caja</span><span class="badge bg-secondary"><span id="totalCierresEncontrados">0</span> cierres encontrados</span></div>
            <div id="tablaCierreCaja" class="p-3"></div>
          </div>
        </div>

        <div id="ventasPDF" class="tab-pane fade" role="tabpanel">
            <div class="modern-card">
                <div class="card-header">Exportar Reportes a PDF</div>
                <div class="card-body">
                    <div class="filtros-container mb-4">
                        <p class="filtro-label text-center"><strong>Reporte de Ventas</strong></p>
                        <div class="filtro-group">
                            <div class="filtro-item"><label for="fechaInicioPDF" class="form-label">Fecha Inicio:</label><input type="date" class="form-control" id="fechaInicioPDF"></div>
                            <div class="filtro-item"><label for="fechaFinPDF" class="form-label">Fecha Fin:</label><input type="date" class="form-control" id="fechaFinPDF"></div>
                        </div>
                        <div class="text-center mt-3"><button id="btnGenerarPDF" class="btn-modern btn-danger"><i class="fa fa-file-pdf me-2"></i>Descargar PDF de Ventas</button></div>
                    </div>
                    <hr>
                    <div class="text-center mt-4">
                        <p class="filtro-label text-center"><strong>Reporte de Productos y Stock</strong></p>
                        <button id="btnGenerarProductosPDF" class="btn-modern btn-danger"><i class="fa fa-file-pdf me-2"></i>Descargar PDF de Productos</button>
                    </div>
                </div>
            </div>
        </div>
      </div> </div> </div> <?php include("../includes/scripts.php"); ?>
  <?php include("../includes/footer.php"); ?>
  
  <script src="../js/reportes.js?v=<?php echo filemtime('../js/reportes.js'); ?>"></script>

</body>
</html>