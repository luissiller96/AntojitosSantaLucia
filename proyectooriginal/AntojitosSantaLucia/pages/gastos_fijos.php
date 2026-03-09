<?php
require_once("../includes/auth_check.php");
require_once("../config/conexion.php");
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <?php include("../includes/head.php"); ?>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gastos Fijos - Antojitos Santa Lucía</title>

    <!-- DataTables CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css">
    
    <!-- CSS de Gastos Fijos -->
    <link rel="stylesheet" href="../css/gastos_fijos.css?v=<?php echo time(); ?>">

    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">

    <?php include("../includes/style.php"); ?>
</head>

<body>
    <div class="container-fluid gastos-fijos-container">
        
        <!-- Header -->
        <div class="header-section">
            <h1 class="page-title">
                <i class="fas fa-file-invoice-dollar"></i>
                Gastos Fijos
            </h1>
            <p class="page-subtitle">Gestión de gastos fijos mensuales y plantillas</p>
        </div>

        <!-- Tabs -->
        <ul class="nav nav-tabs mb-4" id="gastosTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="mensual-tab" data-bs-toggle="tab" 
                        data-bs-target="#mensual" type="button" role="tab">
                    <i class="fas fa-calendar-check"></i> Gastos Mensuales
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="plantillas-tab" data-bs-toggle="tab" 
                        data-bs-target="#plantillas" type="button" role="tab">
                    <i class="fas fa-layer-group"></i> Plantillas
                </button>
            </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content" id="gastosTabContent">
            
            <!-- TAB: Gastos Mensuales -->
            <div class="tab-pane fade show active" id="mensual" role="tabpanel">
                
                <!-- Selector de Mes/Año -->
                <div class="card month-selector">
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <label class="form-label">Mes</label>
                            <select class="form-select" id="select-mes">
                                <option value="1">Enero</option>
                                <option value="2">Febrero</option>
                                <option value="3">Marzo</option>
                                <option value="4">Abril</option>
                                <option value="5">Mayo</option>
                                <option value="6">Junio</option>
                                <option value="7">Julio</option>
                                <option value="8">Agosto</option>
                                <option value="9">Septiembre</option>
                                <option value="10">Octubre</option>
                                <option value="11">Noviembre</option>
                                <option value="12">Diciembre</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Año</label>
                            <select class="form-select" id="select-anio">
                                <?php 
                                $anio_actual = date('Y');
                                for ($i = $anio_actual - 2; $i <= $anio_actual + 1; $i++) {
                                    $selected = ($i == $anio_actual) ? 'selected' : '';
                                    echo "<option value='$i' $selected>$i</option>";
                                }
                                ?>
                            </select>
                        </div>
                        <div class="col-md-6 text-end">
                            <label class="form-label d-block">&nbsp;</label>
                            <button class="btn btn-primary" id="btn-generar-mes">
                                <i class="fas fa-magic"></i> Generar desde Plantillas
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Resumen por Categorías -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5>
                            <i class="fas fa-chart-pie"></i>
                            Resumen: <span id="mes-anio-actual">-</span>
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row resumen-container" id="resumen-container">
                            <!-- Resumen se carga dinámicamente -->
                        </div>
                    </div>
                </div>

                <!-- Tabla de Gastos -->
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-list"></i> Gastos del Mes</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover" id="tabla-gastos">
                                <thead>
                                    <tr>
                                        <th>Categoría</th>
                                        <th>Concepto</th>
                                        <th class="text-end">Monto</th>
                                        <th class="text-center">Método Pago</th>
                                        <th class="text-center">Fecha Pago</th>
                                        <th class="text-center">Estatus</th>
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

            <!-- TAB: Plantillas -->
            <div class="tab-pane fade" id="plantillas" role="tabpanel">
                
                <!-- Botón Nueva Plantilla -->
                <div class="text-end mb-3">
                    <button class="btn btn-primary" id="btn-nueva-plantilla">
                        <i class="fas fa-plus"></i> Nueva Plantilla
                    </button>
                </div>

                <!-- Tabla de Plantillas -->
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-layer-group"></i> Plantillas de Gastos Fijos</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover" id="tabla-plantillas">
                                <thead>
                                    <tr>
                                        <th>Categoría</th>
                                        <th>Concepto</th>
                                        <th>Descripción</th>
                                        <th class="text-end">Monto Base</th>
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

        </div>

    </div>

    <!-- Modal: Nueva/Editar Plantilla -->
    <div class="modal fade" id="modalPlantilla" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modal-plantilla-title">Nueva Plantilla</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form id="form-plantilla">
                    <div class="modal-body">
                        <input type="hidden" id="plantilla-id" name="id">
                        
                        <div class="mb-3">
                            <label class="form-label">Categoría *</label>
                            <select class="form-select" id="plantilla-categoria" name="categoria" required>
                                <option value="Renta">Renta</option>
                                <option value="Sueldos">Sueldos</option>
                                <option value="Servicios">Servicios</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Concepto *</label>
                            <input type="text" class="form-control" id="plantilla-concepto" 
                                   name="concepto" placeholder="Ej: Renta Local, Luz, Sueldo Gerente" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Monto Base Mensual *</label>
                            <input type="number" class="form-control" id="plantilla-monto" 
                                   name="monto_base" step="0.01" min="0" placeholder="0.00" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Descripción</label>
                            <textarea class="form-control" id="plantilla-descripcion" 
                                      name="descripcion" rows="3" placeholder="Descripción opcional"></textarea>
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

    <!-- Modal: Editar Gasto -->
    <div class="modal fade" id="modalEditarGasto" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Editar Gasto</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form id="form-editar-gasto">
                    <div class="modal-body">
                        <input type="hidden" id="gasto-id" name="id">
                        
                        <div class="mb-3">
                            <label class="form-label">Concepto</label>
                            <input type="text" class="form-control" id="gasto-concepto" disabled>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Monto *</label>
                            <input type="number" class="form-control" id="gasto-monto" 
                                   name="monto" step="0.01" min="0" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Fecha de Pago</label>
                            <input type="date" class="form-control" id="gasto-fecha" name="fecha_pago">
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Método de Pago</label>
                            <select class="form-select" id="gasto-metodo" name="metodo_pago">
                                <option value="transferencia">Transferencia</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="tarjeta">Tarjeta</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Estatus</label>
                            <select class="form-select" id="gasto-estatus" name="estatus">
                                <option value="pendiente">Pendiente</option>
                                <option value="pagado">Pagado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Notas</label>
                            <textarea class="form-control" id="gasto-notas" name="notas" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Guardar Cambios
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

    <!-- Gastos Fijos JS -->
    <script src="../js/gastos_fijos.js?v=<?php echo time(); ?>"></script>

    <!-- Footer y Bottom Nav -->
    <?php include("../includes/footer.php"); ?>
    <?php include("../includes/bottom_nav_bar.php"); ?>
</body>

</html>