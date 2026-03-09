<?php
require_once("../includes/auth_check.php");
require_once("../config/conexion.php");
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <?php include("../includes/head.php"); ?>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cierre de Caja - Antojitos Santa Lucía</title>

    <!-- CSS de Cierre de Caja -->
    <link rel="stylesheet" href="../css/cierre_caja.css?v=<?php echo time(); ?>">

    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">

    <?php include("../includes/style.php"); ?>
</head>

<body>
    <div class="container-fluid cierre-caja-container">

        <!-- Header -->
        <div class="header-section">
            <h1 class="page-title">
                <i class="fas fa-cash-register"></i>
                Cierre de Caja
            </h1>
            <p class="page-subtitle">Control y gestión de apertura y cierre de caja</p>
        </div>

        <!-- Estado de Caja -->
        <div class="estado-caja-card">
            <div class="caja-status-indicator closed" id="caja-status-indicator">
                <i class="fas fa-lock"></i>
            </div>
            <div class="status-text" id="status-text">Caja Cerrada</div>
            <div class="apertura-time" id="apertura-time" style="display: none;">Desde: --:--</div>

          <div class="action-buttons">
    <button class="btn-action btn-abrir" id="btn-abrir-caja">
        <i class="fas fa-lock-open"></i> Abrir Caja
    </button>
    <button class="btn-action btn-cerrar" id="btn-cerrar-caja" disabled>
        <i class="fas fa-lock"></i> Cerrar Caja
    </button>
</div>

<!-- ✅ NUEVO: Botón de prueba -->
<div class="action-buttons" style="margin-top: 10px;">
    <button class="btn-action" id="btn-test-email" style="background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);">
        <i class="fas fa-envelope"></i>Envío de Correo
    </button>
</div>
        </div>

        <!-- KPIs Section -->
        <div class="kpis-grid">

            <div class="kpi-card ventas">
                <div class="kpi-content">
                    <div class="kpi-icon ventas">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="kpi-info">
                        <div class="kpi-label">Ventas Total</div>
                        <div class="kpi-value" id="kpi-ventas-total">$0.00</div>
                    </div>
                </div>
            </div>

            <div class="kpi-card efectivo">
                <div class="kpi-content">
                    <div class="kpi-icon efectivo">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="kpi-info">
                        <div class="kpi-label">Ventas Efectivo</div>
                        <div class="kpi-value" id="kpi-efectivo">$0.00</div>
                    </div>
                </div>
            </div>

            <div class="kpi-card tarjeta">
                <div class="kpi-content">
                    <div class="kpi-icon tarjeta">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <div class="kpi-info">
                        <div class="kpi-label">Ventas Tarjeta</div>
                        <div class="kpi-value" id="kpi-tarjeta">$0.00</div>
                    </div>
                </div>
            </div>

            <div class="kpi-card" style="border-left: 4px solid #8b5cf6;">
                <div class="kpi-content">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <div class="kpi-info">
                        <div class="kpi-label">Ventas Transferencia</div>
                        <div class="kpi-value" id="kpi-transferencia">$0.00</div>
                    </div>
                </div>
            </div>

            <div class="kpi-card diferencia">
                <div class="kpi-content">
                    <div class="kpi-icon diferencia">
                        <i class="fas fa-calculator"></i>
                    </div>
                    <div class="kpi-info">
                        <div class="kpi-label">Efectivo Esperado</div>
                        <div class="kpi-value" id="kpi-efectivo-esperado">$0.00</div>
                    </div>
                </div>
            </div>

        </div>

        <!-- Resumen Detallado y Cortes Preventivos -->
        <div class="row" id="resumen-section" style="display: none;">
            
            <div class="col-lg-8 mb-4">
                <div class="resumen-section h-100 m-0">
                    <div class="resumen-title">
                        <i class="fas fa-chart-pie"></i>
                        Resumen Detallado del Turno
                    </div>
                    <div class="resumen-grid">
                        <div class="resumen-item">
                            <span class="resumen-item-label">Monto de Apertura</span>
                            <span class="resumen-item-value" id="resumen-apertura">$0.00</span>
                        </div>
                        <div class="resumen-item">
                            <span class="resumen-item-label">Ventas en Efectivo</span>
                            <span class="resumen-item-value" id="resumen-ventas-efectivo">$0.00</span>
                        </div>
                        <div class="resumen-item">
                            <span class="resumen-item-label">Ventas con Tarjeta</span>
                            <span class="resumen-item-value" id="resumen-ventas-tarjeta">$0.00</span>
                        </div>
                        <div class="resumen-item">
                            <span class="resumen-item-label">Ventas con Transferencia</span>
                            <span class="resumen-item-value" id="resumen-ventas-transferencia">$0.00</span>
                        </div>
                        <div class="resumen-item">
                            <span class="resumen-item-label">Total Ventas</span>
                            <span class="resumen-item-value" id="resumen-ventas-total">$0.00</span>
                        </div>
                        <div class="resumen-item"
                            style="background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: white;">
                            <span class="resumen-item-label" style="color: white;">Efectivo Esperado en Caja</span>
                            <span class="resumen-item-value" style="color: white;" id="resumen-esperado">$0.00</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Panel de Cortes Preventivos -->
            <div class="col-lg-4 mb-4">
                <div class="resumen-section h-100 m-0">
                    <div class="resumen-title d-flex justify-content-between align-items-center mb-0">
                        <div><i class="fas fa-cut"></i> Cortes Preventivos</div>
                        <span class="badge bg-warning text-dark border fs-6" id="badge-total-cortes">$0.00</span>
                    </div>
                    <div id="lista-cortes-preventivos" class="mt-3 pb-2" style="max-height: 250px; overflow-y: auto;">
                        <div class="text-muted text-center py-4">Cargando cortes...</div>
                    </div>
                </div>
            </div>

        </div>

    </div>

   <!-- Modal: Apertura de Caja -->
<div class="modal fade" id="modalAperturaCaja" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Apertura de Caja</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="numpad-container">
                    <div class="display">
                        <div class="display-label">Monto Inicial</div>
                        <div class="display-value" id="inputMontoInicial">
                            $0.00
                        </div>
                    </div>
                    <div class="numpad">
                        <button type="button" class="btn-num" data-num="1">1</button>
                        <button type="button" class="btn-num" data-num="2">2</button>
                        <button type="button" class="btn-num" data-num="3">3</button>
                        <button type="button" class="btn-num" data-num="4">4</button>
                        <button type="button" class="btn-num" data-num="5">5</button>
                        <button type="button" class="btn-num" data-num="6">6</button>
                        <button type="button" class="btn-num" data-num="7">7</button>
                        <button type="button" class="btn-num" data-num="8">8</button>
                        <button type="button" class="btn-num" data-num="9">9</button>
                        <button type="button" class="btn-num" data-num=".">.</button>
                        <button type="button" class="btn-num" data-num="0">0</button>
                        <button type="button" class="btn-num" data-num="00">00</button>
                        <button type="button" class="btn-num" id="btn-borrar">
                            <i class="fas fa-backspace"></i> Borrar
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-success" id="btnConfirmarApertura">
                    <i class="fas fa-check"></i> Confirmar Apertura
                </button>
            </div>
        </div>
    </div>
</div>

    <!-- Modal: Cierre de Caja -->
    <div class="modal fade" id="modalCierreCaja" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header modal-cerrar">
                    <h5 class="modal-title">Cierre de Caja</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="numpad-container">
                        <div class="display">
                            <div class="display-label">Conteo Físico de Efectivo</div>
                            <div class="display-value">
                                $<input type="text" id="inputMontoFinalConfirmacion" value="0.00" readonly style="border: none; background: transparent; width: 100%; text-align: left; 
                       font-size: 2.5rem; font-weight: 700; color: #dc3545; 
                       font-family: 'Courier New', monospace;">
                            </div>
                        </div>
                        <div class="numpad">
                            <button type="button" class="btn-num" data-num="1">1</button>
                            <button type="button" class="btn-num" data-num="2">2</button>
                            <button type="button" class="btn-num" data-num="3">3</button>
                            <button type="button" class="btn-num" data-num="4">4</button>
                            <button type="button" class="btn-num" data-num="5">5</button>
                            <button type="button" class="btn-num" data-num="6">6</button>
                            <button type="button" class="btn-num" data-num="7">7</button>
                            <button type="button" class="btn-num" data-num="8">8</button>
                            <button type="button" class="btn-num" data-num="9">9</button>
                            <button type="button" class="btn-num" data-num=".">.</button>
                            <button type="button" class="btn-num" data-num="0">0</button>
                            <button type="button" class="btn-num" data-num="00">00</button>
                            <button type="button" class="btn-num" id="btn-borrar-cierre">
                                <i class="fas fa-backspace"></i> Borrar
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-danger" id="btnConfirmarCierre">
                        <i class="fas fa-lock"></i> Cerrar Caja
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <?php include("../includes/scripts.php"); ?>

    <!-- Cierre de Caja JS -->
    <script src="../js/cierre_caja.js?v=<?php echo time(); ?>"></script>

    <!-- Footer y Bottom Nav -->
    <?php include("../includes/footer.php"); ?>
    <?php include("../includes/bottom_nav_bar.php"); ?>
</body>

</html>