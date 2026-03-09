<?php
require_once("../includes/auth_check.php");
require_once("../config/conexion.php");
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <?php include("../includes/head.php"); ?>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gastos Operativos - Antojitos Santa Lucía</title>

    <!-- DataTables CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css">

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <!-- CSS de Gastos Operativos -->
    <link rel="stylesheet" href="../css/gastos_operativos.css?v=<?php echo time(); ?>">

    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">

    <?php include("../includes/style.php"); ?>
</head>

<body>
    <div class="container-fluid gastos-operativos-container">

        <!-- Header -->
        <div class="header-section">
            <h1 class="page-title">
                <i class="fas fa-receipt"></i>
                Gastos Operativos
            </h1>
            <p class="page-subtitle">Gestión de gastos diarios del negocio</p>
        </div>

        <!-- KPIs -->
        <div class="kpi-container">
            
            <div class="kpi-card danger">
                <div class="kpi-content">
                    <div class="kpi-icon danger">
                        <i class="fas fa-cash-register"></i>
                    </div>
                    <div class="kpi-info">
                        <div class="kpi-label">Gastos de Hoy</div>
                        <div class="kpi-value" id="kpi-gastos-hoy">$0.00</div>
                    </div>
                </div>
            </div>

            <div class="kpi-card warning">
                <div class="kpi-content">
                    <div class="kpi-icon warning">
                        <i class="fas fa-list-ol"></i>
                    </div>
                    <div class="kpi-info">
                        <div class="kpi-label">Cantidad de Gastos</div>
                        <div class="kpi-value" id="kpi-cantidad-gastos">0</div>
                    </div>
                </div>
            </div>

            <div class="kpi-card success">
                <div class="kpi-content">
                    <div class="kpi-icon success">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="kpi-info">
                        <div class="kpi-label">Efectivo</div>
                        <div class="kpi-value" id="kpi-efectivo">$0.00</div>
                    </div>
                </div>
            </div>

            <div class="kpi-card info">
                <div class="kpi-content">
                    <div class="kpi-icon info">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <div class="kpi-info">
                        <div class="kpi-label">Tarjeta</div>
                        <div class="kpi-value" id="kpi-tarjeta">$0.00</div>
                    </div>
                </div>
            </div>

        </div>

        <!-- Gráfica de Gastos -->
        <div class="card mb-4">
            <div class="card-header">
                <h5>
                    <i class="fas fa-chart-line"></i>
                    Gastos de los Últimos 30 Días
                </h5>
            </div>
            <div class="card-body">
                <div class="chart-container">
                    <canvas id="chartGastos"></canvas>
                </div>
            </div>
        </div>

        <!-- Filtros y Botón Nuevo -->
        <div class="card filtros-section">
            <div class="row align-items-end">
                <div class="col-md-3">
                    <label class="form-label">Fecha Inicio</label>
                    <input type="date" class="form-control" id="filtro-fecha-inicio">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Fecha Fin</label>
                    <input type="date" class="form-control" id="filtro-fecha-fin">
                </div>
                <div class="col-md-6 text-end">
                    <button class="btn btn-secondary" id="btn-limpiar-filtros">
                        <i class="fas fa-eraser"></i> Limpiar
                    </button>
                    <button class="btn btn-primary" id="btn-nuevo-gasto">
                        <i class="fas fa-plus"></i> Nuevo Gasto
                    </button>
                </div>
            </div>
        </div>

        <!-- Tabla de Gastos -->
        <div class="card">
            <div class="card-header">
                <h5><i class="fas fa-list"></i> Registro de Gastos Operativos</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover" id="tabla-gastos">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Descripción</th>
                                <th class="text-center">Método Pago</th>
                                <th class="text-end">Monto</th>
                                <th class="text-center">Usuario</th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Se llena dinámicamente -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>

    <!-- Modal: Nuevo/Editar Gasto -->
    <div class="modal fade" id="modalGasto" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modal-title">Nuevo Gasto Operativo</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form id="form-gasto">
                    <div class="modal-body">
                        <input type="hidden" id="gasto-id" name="id">

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Tipo de Gasto</label>
                                <input type="text" class="form-control" id="gasto-tipo" name="tipo_gasto"
                                    value="operativo" readonly>
                            </div>

                            <div class="col-md-6 mb-3">
                                <label class="form-label">Fecha y Hora *</label>
                                <input type="datetime-local" class="form-control" id="gasto-fecha" name="fecha"
                                    required>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Descripción / Concepto *</label>
                            <input type="text" class="form-control" id="gasto-descripcion" name="descripcion"
                                placeholder="Ej: Compra de servilletas, Pago a proveedor" required>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Monto Total *</label>
                                <input type="number" class="form-control form-control-lg" id="gasto-precio"
                                    name="precio_unitario" placeholder="0.00" min="0.01" step="0.01" required>
                                <small class="text-muted">El monto total del gasto</small>
                            </div>

                            <div class="col-md-6 mb-3">
                                <label class="form-label">Método de Pago *</label>
                                <select class="form-select form-select-lg" id="gasto-metodo" name="metodo_pago"
                                    required>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="tarjeta">Tarjeta</option>
                                    <option value="transferencia">Transferencia</option>
                                </select>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">
                                <i class="fas fa-box"></i>
                                ¿Compraste un Producto o Insumo? (Opcional)
                            </label>
                            <select class="form-select" id="gasto-item" name="item_seleccionado">
                                <option value="">-- Gasto sin producto/insumo --</option>
                            </select>
                            <small class="text-muted">
                                <i class="fas fa-info-circle"></i>
                                Si compraste un producto o insumo, selecciónalo para actualizar el stock automáticamente
                            </small>
                        </div>

                        <div class="mb-3 d-none" id="campo-cantidad-comprada">
                            <label class="form-label">Cantidad Comprada *</label>
                            <input type="number" class="form-control" id="gasto-cantidad-comprada"
                                name="cantidad_comprada" placeholder="Cantidad" min="0.01" step="0.01">
                            <small class="text-muted">Especifica cuánto compraste</small>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Comentarios</label>
                            <textarea class="form-control" id="gasto-comentario" name="comentario" rows="3"
                                placeholder="Notas adicionales..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <?php include("../includes/scripts.php"); ?>

    <!-- DataTables JS -->
    <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>

    <!-- Gastos Operativos JS -->
    <script src="../js/gastos_operativos.js?v=<?php echo time(); ?>"></script>

    <!-- Footer y Bottom Nav -->
    <?php include("../includes/footer.php"); ?>
    <?php include("../includes/bottom_nav_bar.php"); ?>
</body>

</html>